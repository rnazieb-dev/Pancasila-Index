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
import { compressPdf } from "../src/compressor";

const ACCOUNT_ID = "69f2a9ff4fe58ace350172f315f7feb7";
const BUCKET_NAME = "pancasila-arsip-v3";

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
      return `v2/peraturan/${source.id}.${ext}`;
    case "putusan-mk":
    case "putusan-ma":
      return `v2/putusan/${source.id}.${ext}`;
    case "laporan-lembaga":
      return `v2/laporan/${source.id}.${ext}`;
    case "arsip-nasional":
      return `v2/sejarah/${source.id}.${ext}`;
    case "berita":
    case "lainnya":
    case "buku":
    default:
      return `v2/dokumen/${source.id}.${ext}`;
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
  const skippedNoContent: string[] = [];

  console.log(`\n📦 Memulai Kompresi Masal untuk ${sources.length} Sumber Primer...`);

  for (const s of sources) {
    let localPdf = jdihMap.get(s.id);
    if (!localPdf || !existsSync(localPdf)) {
      const genericPdf = join(ROOT, "raw", "pdf", `${s.id}.pdf`);
      if (existsSync(genericPdf)) {
        localPdf = genericPdf;
      }
    }
    
    if (!localPdf || !existsSync(localPdf)) {
      // Tidak ada PDF asli lokal - JANGAN buat placeholder HTML palsu (ini
      // akar bug yang mencemari R2 dengan dokumen karangan). Lewati sumber
      // ini dan buang entri manifest lama miliknya kalau ada; harus
      // ditandai archive_ok: false di sources.yaml sampai konten asli
      // ditemukan lewat riset manual.
      skippedNoContent.push(s.id);
      delete manifest[s.id];
      continue;
    }

    const rawBuf = readFileSync(localPdf);
    const origBytes = rawBuf.byteLength;
    const res = await compressPdf(rawBuf);
    const targetBuffer = res.compressed;
    const mimeType = "application/pdf";

    const compBytes = targetBuffer.byteLength;
    const r2Key = getR2Key(s, "pdf");
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
  if (skippedNoContent.length > 0) {
    console.log(
      `\n⚠️  ${skippedNoContent.length} sumber dilewati (tidak ada PDF asli lokal, TIDAK dibuatkan placeholder):`,
    );
    console.log(skippedNoContent.join(", "));
  }
}

/** 4. Unggah Masal ke Bucket R2 via Cloudflare R2 REST API */
export async function uploadAll(dryRun = false, concurrency = 1) {
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
        successCount++; await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      const fileBuffer = readFileSync(localFile);
      const encodedKey = encodeURIComponent(item.r2_key);
      const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${encodedKey}`;

      let uploaded = false;
      for (let attempt = 1; attempt <= 5; attempt++) {
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
            const status = res.status;

            // Exponential backoff for rate limiting (429)
            if (status === 429) {
              const backoffMs = Math.min(30000, 1000 * Math.pow(2, attempt - 1));
              if (attempt <= 5) {
                console.warn(`⏱️  Rate limited, retrying in ${backoffMs}ms (attempt ${attempt}/5)...`);
                await new Promise((r) => setTimeout(r, backoffMs));
                continue;
              }
            }

            if (attempt === 5) {
              console.error(`[X] HTTP ${status} upload ${item.r2_key}: ${errText.slice(0, 100)}`);
            }

            // Delay between retries
            if (attempt < 5) {
              await new Promise((r) => setTimeout(r, 3000 * attempt));
            }
          }
        } catch (err) {
          if (attempt === 5) {
            console.error(`[X] Error upload ${item.r2_key}:`, err instanceof Error ? err.message : err);
          }
          if (attempt < 5) {
            await new Promise((r) => setTimeout(r, 3000 * attempt));
          }
        }
      }

      if (uploaded) {
        successCount++; await new Promise(r => setTimeout(r, 1000));
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
