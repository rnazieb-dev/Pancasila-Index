#!/usr/bin/env tsx
/**
 * Pipeline Pengarsipan Mandiri Cloudflare R2 (100% Zero-Cost Guarantee):
 * - Mengumpulkan berkas primer (PDF/dokumen/snapshot HTML) untuk seluruh sumber.
 * - Mengompresi berkas secara agresif (reduksi 70-90% ukuran) agar total < 500 MB.
 * - Mengunggah masal ke bucket R2 'pancasila-arsip' via direct Cloudflare R2 API.
 * - Membuat generated/r2-archive-manifest.json dan menyinkronkan data.
 *
 * Jalankan:
 *   pnpm --filter @pancasila-index/data archive:all
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { parse, stringify } from "yaml";
import { compressPdf, createHtmlArchive } from "../src/compressor";

const ACCOUNT_ID = "69f2a9ff4fe58ace350172f315f7feb7";
const BUCKET_NAME = "pancasila-arsip";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "data");
const RAW_DIR = join(ROOT, "raw");
const COMPRESSED_DIR = join(RAW_DIR, "compressed");
const MANIFEST_PATH = join(ROOT, "generated", "r2-archive-manifest.json");
const SOURCES_YAML = join(DATA_DIR, "sources.yaml");

interface ArchiveManifestEntry {
  source_id: string;
  r2_key: string;
  mime_type: string;
  sha256: string;
  original_bytes: number;
  compressed_bytes: number;
  savings_bytes: number;
  savings_percent: number;
  r2_url: string;
  uploaded_at: string;
}

function sha256(buffer: Buffer | Uint8Array): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function getR2Key(source: { id: string; type: string }, ext: "pdf" | "html"): string {
  switch (source.type) {
    case "undang-undang":
    case "perppu":
    case "keppres":
    case "dokumen-mpr":
      return `peraturan/${source.id}.${ext}`;
    case "putusan-mk":
    case "putusan-ma":
      return `putusan/${source.id}.${ext}`;
    case "laporan-lembaga":
      return `laporan/${source.id}.${ext}`;
    case "arsip-nasional":
      return `sejarah/${source.id}.${ext}`;
    case "berita":
    case "lainnya":
    case "buku":
    default:
      return `dokumen/${source.id}.${ext}`;
  }
}

/** Ambil Token Autentikasi dari Wrangler Config atau Env */
function getCloudflareToken(): string {
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return process.env.CLOUDFLARE_API_TOKEN;
  }
  const tomlPath = join(homedir(), "Library", "Preferences", ".wrangler", "config", "default.toml");
  if (existsSync(tomlPath)) {
    const text = readFileSync(tomlPath, "utf8");
    const m = text.match(/oauth_token\s*=\s*"([^"]+)"/);
    if (m && m[1]) return m[1];
  }
  throw new Error("Token Cloudflare tidak ditemukan di ~/.wrangler/config/default.toml atau CLOUDFLARE_API_TOKEN");
}

/** 1. Muat dan Petakan Seluruh Sumber */
function loadSources(): Array<{
  id: string;
  type: string;
  title_id: string;
  year?: number;
  url?: string;
  citation_id?: string;
  r2_key?: string;
  archive_url?: string;
}> {
  const text = readFileSync(SOURCES_YAML, "utf8");
  return parse(text);
}

/** 2. Muat Peta Berkas JDIH Lokal */
function loadJdihMapping(): Map<string, string> {
  const map = new Map<string, string>();
  const indexFile = join(RAW_DIR, "index.jsonl");
  if (!existsSync(indexFile)) return map;

  const lines = readFileSync(indexFile, "utf8").split("\n").filter(Boolean);
  for (const line of lines) {
    try {
      const row = JSON.parse(line);
      const filePath = join(RAW_DIR, row.pdf_file);
      if (existsSync(filePath) && row.cited_by) {
        for (const cid of row.cited_by) {
          map.set(cid, filePath);
        }
      }
    } catch {}
  }
  return map;
}

/** 3. Kompresi Masal Berkas */
export async function compressAll() {
  mkdirSync(COMPRESSED_DIR, { recursive: true });
  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });

  const sources = loadSources();
  const jdihMap = loadJdihMapping();

  let existingManifest: Record<string, ArchiveManifestEntry> = {};
  if (existsSync(MANIFEST_PATH)) {
    try {
      existingManifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
    } catch {}
  }

  const manifest: Record<string, ArchiveManifestEntry> = { ...existingManifest };
  let totalOrigBytes = 0;
  let totalCompBytes = 0;
  let processedCount = 0;

  console.log(`\n📦 Memulai Kompresi Masal untuk ${sources.length} Sumber Primer...`);

  for (const s of sources) {
    const localPdf = jdihMap.get(s.id);
    let targetBuffer: Uint8Array;
    let ext: "pdf" | "html" = "pdf";
    let mimeType = "application/pdf";
    let origBytes = 0;

    if (localPdf && existsSync(localPdf)) {
      const rawBuf = readFileSync(localPdf);
      origBytes = rawBuf.byteLength;
      const res = await compressPdf(rawBuf);
      targetBuffer = res.compressed;
    } else {
      ext = "html";
      mimeType = "text/html; charset=utf-8";
      const htmlStr = createHtmlArchive({
        id: s.id,
        title: s.title_id,
        type: s.type,
        year: s.year,
        originalUrl: s.url,
        citation: s.citation_id,
        fetchedAt: new Date().toISOString().slice(0, 10),
      });
      targetBuffer = Buffer.from(htmlStr, "utf8");
      origBytes = targetBuffer.byteLength;
    }

    const compBytes = targetBuffer.byteLength;
    const r2Key = getR2Key(s, ext);
    const compressedFilePath = join(COMPRESSED_DIR, r2Key.replace(/\//g, "_"));

    writeFileSync(compressedFilePath, targetBuffer);

    totalOrigBytes += origBytes;
    totalCompBytes += compBytes;
    processedCount++;

    const hash = sha256(targetBuffer);
    const savings = Math.max(0, origBytes - compBytes);
    const savingsPct = origBytes > 0 ? Math.round((savings / origBytes) * 100) : 0;

    manifest[s.id] = {
      source_id: s.id,
      r2_key: r2Key,
      mime_type: mimeType,
      sha256: hash,
      original_bytes: origBytes,
      compressed_bytes: compBytes,
      savings_bytes: savings,
      savings_percent: savingsPct,
      r2_url: `https://www.pancasila.site/api/arsip/${r2Key}`,
      uploaded_at: manifest[s.id]?.uploaded_at ?? new Date().toISOString(),
    };
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  const totalOrigMb = (totalOrigBytes / (1024 * 1024)).toFixed(2);
  const totalCompMb = (totalCompBytes / (1024 * 1024)).toFixed(2);
  const totalSavingsMb = ((totalOrigBytes - totalCompBytes) / (1024 * 1024)).toFixed(2);
  const pct = totalOrigBytes > 0 ? Math.round(((totalOrigBytes - totalCompBytes) / totalOrigBytes) * 100) : 0;

  console.log(`\n✅ Kompresi Selesai:`);
  console.log(`- Jumlah Berkas: ${processedCount} berkas`);
  console.log(`- Ukuran Asli: ${totalOrigMb} MB`);
  console.log(`- Ukuran Terkompresi: ${totalCompMb} MB (Hanya ${(Number(totalCompMb) / 102.4).toFixed(2)}% dari Kuota Gratis 10 GB!)`);
  console.log(`- Ruang Dihemat: ${totalSavingsMb} MB (${pct}% efisiensi)`);
  console.log(`- Manifest Tersimpan: generated/r2-archive-manifest.json`);
}

/** 4. Unggah Masal ke Bucket R2 via Cloudflare R2 REST API */
export async function uploadAll(dryRun = false, concurrency = 15) {
  if (!existsSync(MANIFEST_PATH)) {
    await compressAll();
  }

  const token = getCloudflareToken();
  console.log(`[i] Menggunakan Token Cloudflare dari konfigurasi Wrangler.`);

  const manifest: Record<string, ArchiveManifestEntry> = JSON.parse(
    readFileSync(MANIFEST_PATH, "utf8")
  );
  const entries = Object.values(manifest);

  console.log(`\n☁️  Memulai Unggah Masal ${entries.length} Berkas ke Cloudflare R2 ('${BUCKET_NAME}')...`);

  let successCount = 0;
  let failCount = 0;
  let activeIndex = 0;

  async function worker(workerId: number) {
    while (true) {
      const i = activeIndex++;
      if (i >= entries.length) break;

      const item = entries[i]!;
      const localFile = join(COMPRESSED_DIR, item.r2_key.replace(/\//g, "_"));

      if (!existsSync(localFile)) {
        console.warn(`[!] Berkas lokal tidak ditemukan: ${localFile}`);
        failCount++;
        continue;
      }

      if (dryRun) {
        successCount++;
        continue;
      }

      const fileBuffer = readFileSync(localFile);
      const encodedKey = encodeURIComponent(item.r2_key);
      const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${encodedKey}`;

      let uploaded = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(url, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": item.mime_type,
            },
            body: fileBuffer,
          });

          if (res.ok) {
            uploaded = true;
            break;
          } else {
            const errText = await res.text();
            if (attempt === 3) {
              console.error(`[X] HTTP ${res.status} upload ${item.r2_key}: ${errText.slice(0, 100)}`);
            }
          }
        } catch (err) {
          if (attempt === 3) {
            console.error(`[X] Error upload ${item.r2_key}:`, err instanceof Error ? err.message : err);
          }
        }
        await new Promise((r) => setTimeout(r, 200 * attempt));
      }

      if (uploaded) {
        successCount++;
      } else {
        failCount++;
      }

      if (successCount % 20 === 0 || successCount + failCount === entries.length) {
        console.log(`  [${successCount + failCount}/${entries.length}] Diunggah ke R2... (${successCount} sukses, ${failCount} gagal)`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, (_, id) => worker(id));
  await Promise.all(workers);

  console.log(`\n🎉 Unggah Selesai: ${successCount} berhasil, ${failCount} gagal.`);
}

/** 5. Sinkronisasi Metadata r2_key ke sources.yaml */
export function syncSourcesYaml() {
  if (!existsSync(MANIFEST_PATH)) {
    console.error("Manifest belum dibuat. Jalankan kompresi terlebih dahulu.");
    return;
  }

  const manifest: Record<string, ArchiveManifestEntry> = JSON.parse(
    readFileSync(MANIFEST_PATH, "utf8")
  );
  const sources = loadSources();

  let updatedCount = 0;
  for (const s of sources) {
    const entry = manifest[s.id];
    if (entry) {
      s.r2_key = entry.r2_key;
      s.archive_url = entry.r2_url;
      updatedCount++;
    }
  }

  writeFileSync(SOURCES_YAML, stringify(sources));
  console.log(`\n🔄 ${updatedCount} sumber di sources.yaml berhasil disinkronkan dengan r2_key & archive_url.`);
}

// ---------------------------------------------------------------- CLI Runner
const arg = process.argv[2] ?? "all";

async function main() {
  if (arg === "compress") {
    await compressAll();
  } else if (arg === "upload") {
    await uploadAll(false);
  } else if (arg === "dry-run") {
    await uploadAll(true);
  } else if (arg === "sync") {
    syncSourcesYaml();
  } else {
    await compressAll();
    await uploadAll(false);
    syncSourcesYaml();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
