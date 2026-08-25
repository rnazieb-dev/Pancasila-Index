#!/usr/bin/env tsx
/**
 * Scraper JDIH Kemenkumham→(cermin) Setneg — fase 6a.
 *
 * Sumber: jdih.setneg.go.id (tanpa Cloudflare; robots.txt mengizinkan
 * pemakaian referensi). Portal BPK & putusan MK/MA diblokir dari jaringan
 * ini (Cloudflare challenge / koneksi gagal) — dicatat jujur sebagai
 * cakupan parsial.
 *
 * Mode:
 *   tsx scripts/scrape-jdih.mts manifest  — buat raw/jdih-manifest.json
 *       dari seluruh produk hukum yang disitasi sources.yaml + tambahan.
 *   tsx scripts/scrape-jdih.mts plan      — cocokkan manifest vs listing
 *       JDIH (baca-saja), laporkan yang tidak ketemu.
 *   tsx scripts/scrape-jdih.mts fetch     — unduh metadata+PDF ke raw/.
 *
 * Kesopanan: jeda antar-permintaan (default 1500 ms), UA identitas,
 * maksimal 2 percobaan ulang, batas ukuran berkas.
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

import {
  JDIH_BASE,
  JDIH_JENIS,
  buildListPayload,
  detailPayload,
  detailSchema,
  isoDate,
  listRowSchema,
  matchRow,
  parseLegalRef,
  pdfUrl,
  type JdihJenis,
  type ListRow,
} from "../src/jdih";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "data");
const RAW = join(ROOT, "raw");
const MANIFEST = join(RAW, "jdih-manifest.json");
const INDEX = join(RAW, "index.jsonl");
const PDF_DIR = join(RAW, "pdf");

const UA =
  "PancasilaIndexBot/0.1 (+https://github.com/pancasila-index; riset akademik; patuh robots.txt)";
const DELAY_MS = Number(process.env.SCRAPE_DELAY_MS ?? 1500);
/** Batas unduh lokal; berkas di atas ini tetap tercatat di index.jsonl
 *  dengan pdf_url, tapi tidak layak dikomit (lihat raw/README.md). */
const MAX_BYTES = Number(process.env.SCRAPE_MAX_BYTES ?? 100_000_000);
/** Batas ukuran berkas yang DIKOMIT ke git (sisanya lokal saja). */
const COMMIT_MAX_BYTES = 15_000_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function politeFetch(
  url: string,
  init: RequestInit,
  tries = 3
): Promise<Response> {
  for (let i = 0; i < tries; i++) {
    await sleep(DELAY_MS);
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          "User-Agent": UA,
          Referer: `${JDIH_BASE}/peraturan`,
          ...(init.headers ?? {}),
        },
      });
      if (res.status < 500) return res;
    } catch {
      /* ulang */
    }
    if (i < tries - 1) await sleep(3000);
  }
  throw new Error(`gagal setelah ${tries} percobaan: ${url}`);
}

async function postJson(url: string, body: unknown): Promise<unknown> {
  const res = await politeFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

/** Ambil seluruh baris satu jenis (paginasi otomatis). */
async function fetchJenis(jns: JdihJenis): Promise<ListRow[]> {
  const rows: ListRow[] = [];
  let start = 0;
  for (;;) {
    const json = (await postJson(
      `${JDIH_BASE}/api/hukumproduk/produkhukum`,
      buildListPayload({ jns: [jns], start, length: 200 })
    )) as { data?: unknown[]; jml?: number };
    const batch = (json.data ?? []).map((r) => listRowSchema.parse(r));
    rows.push(...batch);
    const total = json.jml ?? rows.length;
    process.stderr.write(`  ${jns}: ${rows.length}/${total}\n`);
    if (batch.length === 0 || rows.length >= total) break;
    start += batch.length;
  }
  return rows;
}

interface ManifestItem {
  /** jenis JDIH */
  jns: JdihJenis;
  no: string;
  thn: string;
  /** id sumber di sources.yaml yang menyitasi instrumen ini */
  cited_by: string[];
}

function extractManifest(): ManifestItem[] {
  type Src = { id: string; type?: string; title_id?: string };
  const sources = (parse(
    readFileSync(join(DATA_DIR, "sources.yaml"), "utf8")
  ) as Src[]).filter(Boolean);

  const byKey = new Map<string, ManifestItem>();
  for (const s of sources) {
    if (!s.title_id) continue;
    const ref = parseLegalRef(s.title_id);
    if (!ref) continue;
    const key = `${ref.jns}-${ref.no}-${ref.thn}`;
    const cur = byKey.get(key);
    if (cur) cur.cited_by.push(s.id);
    else byKey.set(key, { ...ref, cited_by: [s.id] });
  }
  // Tambahan kurasi manual: instrumen kunci tata kelola 8 organ yang
  // relevan bagi rubrik namun belum disitasi langsung sources.yaml.
  const extra: Array<[JdihJenis, string, string]> = [
    ["UU", "28", "1999"], // penyelenggaraan negara bebas KKN
    ["UU", "37", "1999"], // keuangan negara (mandat BPK)
    ["UU", "20", "2001"], // perubahan tipikor
    ["UU", "17", "2003"], // keuangan negara
    ["UU", "1", "2004"], // perbendaharaan negara
    ["UU", "15", "2004"], // audit pengelolaan & tanggung jawab keuangan negara
    ["UU", "17", "2011"], // MPR, DPR, DPD, DPRD (MD3)
    ["UU", "5", "2014"], // ASN
    ["UU", "30", "2014"], // administrasi pemerintahan
    ["UU", "25", "1992"], // hubungan luar negeri
  ];
  for (const [jns, no, thn] of extra) {
    const key = `${jns}-${no}-${thn}`;
    if (!byKey.has(key)) byKey.set(key, { jns, no, thn, cited_by: ["kurasi-manual"] });
  }
  return [...byKey.values()].sort((a, b) =>
    `${a.jns}${a.thn}${a.no.padStart(6, "0")}`.localeCompare(
      `${b.jns}${b.thn}${b.no.padStart(6, "0")}`
    )
  );
}

async function loadListing(): Promise<Map<JdihJenis, ListRow[]>> {
  const map = new Map<JdihJenis, ListRow[]>();
  for (const jns of JDIH_JENIS) {
    map.set(jns, await fetchJenis(jns));
  }
  return map;
}

async function cmdPlan(): Promise<void> {
  if (!existsSync(MANIFEST)) throw new Error("manifest belum ada — jalankan `manifest` dulu");
  const items: ManifestItem[] = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const listing = await loadListing();
  let ok = 0;
  for (const it of items) {
    const row = matchRow(listing.get(it.jns) ?? [], it);
    if (row) {
      ok++;
      console.log(`OK   ${it.jns} No.${it.no}/${it.thn} -> ${row.idperaturan} "${row.tentang.slice(0, 50)}"`);
    } else {
      console.log(`MISS ${it.jns} No.${it.no}/${it.thn}`);
    }
  }
  console.log(`\n${ok}/${items.length} ketemu di JDIH Setneg.`);
}

async function cmdFetch(): Promise<void> {
  if (!existsSync(MANIFEST)) throw new Error("manifest belum ada — jalankan `manifest` dulu");
  const items: ManifestItem[] = JSON.parse(readFileSync(MANIFEST, "utf8"));
  mkdirSync(PDF_DIR, { recursive: true });

  const listing = await loadListing();

  // baca index lama agar idempoten
  const existing = new Map<string, string>();
  if (existsSync(INDEX)) {
    for (const line of readFileSync(INDEX, "utf8").split("\n")) {
      if (!line.trim()) continue;
      try {
        const rec = JSON.parse(line) as { key: string; pdf_sha_note?: string };
        existing.set(rec.key, line);
      } catch {
        /* lewati baris rusak */
      }
    }
  }

  let fetched = 0,
    skipped = 0,
    missed = 0,
    failed = 0;

  for (const it of items) {
    const key = `${it.jns}-${it.no}-${it.thn}`;
    const row = matchRow(listing.get(it.jns) ?? [], it);
    if (!row) {
      console.log(`MISS ${key} — tidak ada di JDIH Setneg`);
      missed++;
      continue;
    }

    let detail;
    try {
      detail = detailSchema.parse(
        await postJson(
          `${JDIH_BASE}/api/hukumproduk/detaildata`,
          detailPayload({ jns: it.jns, no: it.no, thn: it.thn })
        )
      );
    } catch (err) {
      console.log(`FAIL ${key}: ${(err as Error).message}`);
      failed++;
      continue;
    }

    const meta = detail.row[0]!;
    const file = detail.file.find((f) => f.realName?.toLowerCase().endsWith(".pdf")) ??
      detail.file[0];

    let pdfPath: string | null = null;
    let pdfSize: number | null = null;
    if (file?.realName) {
      pdfPath = join(PDF_DIR, `${meta.idperaturan}.pdf`);
      if (!existsSync(pdfPath)) {
        const url = pdfUrl(file.realName, meta.idperaturan);
        const res = await politeFetch(url, { method: "GET" });
        if (!res.ok || (file.size && file.size > MAX_BYTES)) {
          console.log(`SKIP ${key}: http ${res.status} / ukuran ${file.size ?? "?"}`);
        } else {
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.subarray(0, 5).toString() !== "%PDF-") {
            console.log(`WARN ${key}: bukan PDF (magic bytes), dilewati`);
          } else {
            writeFileSync(pdfPath, buf);
            pdfSize = buf.byteLength;
            fetched++;
            console.log(`GET  ${key} -> pdf/${meta.idperaturan}.pdf (${pdfSize} B)`);
          }
        }
      } else {
        const st = statSync(pdfPath);
        pdfSize = st.size;
        skipped++;
        console.log(`HAVE ${key} -> pdf/${meta.idperaturan}.pdf (${pdfSize} B)`);
      }
    } else {
      console.log(`NOFILE ${key}: tanpa berkas di JDIH`);
    }

    const record = {
      key,
      idperaturan: meta.idperaturan,
      jns: meta.jns,
      nama_jenis: meta.nama_jenis || row.nama_jenis,
      no_peraturan: meta.no_peraturan,
      tahun: meta.tahun,
      tentang: meta.tentang,
      status: meta.status ?? meta.status_hukum ?? null,
      tanggal_ditetapkan: isoDate(meta.tgl_di),
      tanggal_diundangkan: isoDate(meta.diundangkan),
      mengubah: meta.mengubah || null,
      mencabut: meta.mencabut || null,
      diubah: meta.diubah || null,
      dicabut: meta.dicabut || null,
      sumber_url: `${JDIH_BASE}/detailperaturan?jns=${encodeURIComponent(it.jns)}&no=${encodeURIComponent(it.no)}&thn=${encodeURIComponent(it.thn)}`,
      pdf_url: file?.realName
        ? pdfUrl(file.realName, meta.idperaturan)
        : null,
      pdf_file: pdfPath ? `pdf/${meta.idperaturan}.pdf` : null,
      pdf_bytes: pdfSize,
      /** false = berkas besar, hanya lokal (tidak dikomit); lihat README. */
      pdf_in_repo:
        pdfSize != null && pdfSize <= COMMIT_MAX_BYTES && pdfPath !== null,
      cited_by: it.cited_by,
      fetched_at: new Date().toISOString().slice(0, 10),
      sumber: "JDIH Kementerian Sekretariat Negara (jdih.setneg.go.id)",
    };
    existing.set(key, JSON.stringify(record));
  }

  writeFileSync(
    INDEX,
    [...existing.values()].sort().join("\n") + "\n"
  );
  console.log(
    `\nSelesai: ${fetched} unduh baru, ${skipped} sudah ada, ${missed} tak ketemu, ${failed} gagal. Index: ${INDEX}`
  );
}

async function main(): Promise<void> {
  const mode = process.argv[2];
  if (mode === "manifest") {
    const items = extractManifest();
    mkdirSync(dirname(MANIFEST), { recursive: true });
    writeFileSync(MANIFEST, JSON.stringify(items, null, 2) + "\n");
    console.log(`Manifest: ${items.length} instrumen -> ${MANIFEST}`);
    return;
  }
  if (mode === "plan") return cmdPlan();
  if (mode === "fetch") return cmdFetch();
  console.error("Pemakaian: scrape-jdih.mts manifest|plan|fetch");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
