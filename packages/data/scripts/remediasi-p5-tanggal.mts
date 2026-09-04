#!/usr/bin/env tsx
/**
 * Remediasi lanjutan: tanggal placeholder, atribusi masa jabatan yang keliru,
 * judul/ringkasan berlabel pabrikan, dan satu klaster duplikat tanpa nomor
 * dokumen (lolos dari pagar sidik jari).
 *
 * Sepuluh peristiwa `ev-rescue-*` yang tersisa adalah peristiwa sungguhan,
 * tetapi seluruhnya bertanggal palsu `YYYY-01-01` hasil pembangkitan. Tanggal
 * di bawah ini diverifikasi lewat pencarian web; yang tidak dapat dipastikan
 * diturunkan presisinya menjadi tahun saja - skema mengizinkan `YYYY`, dan
 * tahun yang jujur lebih baik daripada tanggal yang dikarang.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "data");

type Perbaikan = { date?: string; term_id?: string; title_id?: string; summary_id?: string };

const PERBAIKAN: Record<string, Perbaikan> = {
  // UU 23/2014 ditetapkan 30 September dan diundangkan 2 Oktober 2014 -
  // masa jabatan SBY II; Jokowi baru dilantik 20 Oktober 2014.
  "ev-rescue-uu-23-2014": { date: "2014-10-02", term_id: "presiden-sby-ii" },
  // Keppres 181/1998 ditetapkan 9 Oktober 1998 (Komnas Perempuan).
  "ev-rescue-keppres-181-1998": {
    date: "1998-10-09",
    title_id: "Keppres No. 181 Tahun 1998 tentang Komisi Nasional Anti Kekerasan terhadap Perempuan",
    summary_id:
      "Presiden Habibie menetapkan Keppres No. 181 Tahun 1998 yang membentuk Komisi Nasional Anti Kekerasan terhadap Perempuan (Komnas Perempuan) sebagai lembaga independen. Keppres ini merupakan respons negara atas kekerasan seksual massal dalam kerusuhan Mei 1998.",
  },
  // Perpres 83/2024 ditetapkan 14 Agustus dan diundangkan 15 Agustus 2024.
  "ev-rescue-perpres-badan-gizi-2024": {
    date: "2024-08-15",
    title_id: "Peraturan Presiden No. 83 Tahun 2024 tentang Badan Gizi Nasional",
    summary_id:
      "Presiden Joko Widodo menetapkan Perpres No. 83 Tahun 2024 yang membentuk Badan Gizi Nasional sebagai lembaga pemerintah di bawah dan bertanggung jawab kepada Presiden, menjadi landasan kelembagaan program pemenuhan gizi nasional.",
  },
  // Piagam Jakarta dirumuskan Panitia Sembilan 22 Juni 1945.
  "ev-rescue-anri-piagam-jakarta-1945": { date: "1945-06-22" },
  // NII diproklamasikan Kartosoewirjo di Tasikmalaya 7 Agustus 1949.
  "ev-rescue-arsip-nii-proklamasi-1949": { date: "1949-08-07" },
  // Mahadper menjatuhkan vonis mati atas Kartosoewirjo 16 Agustus 1962.
  "ev-rescue-arsip-nii-vonis-mahadper-1962": {
    date: "1962-08-16",
    summary_id:
      "Mahkamah Darurat Perang (Mahadper) menyatakan gerakan Sekarmadji Maridjan Kartosoewirjo menegakkan Negara Islam Indonesia selama 13 tahun sebagai pemberontakan dan menjatuhkan hukuman mati. Eksekusi dilaksanakan 5 September 1962.",
  },
  // FDR/PKI merebut Madiun 18 September 1948.
  "ev-rescue-iisg-pki-musso-djalan-baru-1948": { date: "1948-09-18" },
  // Petisi 50 ditandatangani 52 tokoh pada 5 Mei 1980.
  "ev-rescue-anri-petisi-50-pernyataan-1980": { date: "1980-05-05" },
  // Tanggal pembacaan dakwaan tidak dapat dipastikan - turunkan ke tahun.
  "ev-rescue-dakwaan-kejagung-timah-2024": {
    date: "2024",
    summary_id:
      "Kejaksaan Agung melimpahkan perkara korupsi tata niaga komoditas timah di wilayah IUP PT Timah Tbk ke pengadilan tindak pidana korupsi, dengan dakwaan kerugian negara dan kerugian ekologis yang ditaksir mencapai Rp300 triliun.",
  },
  // Pembahasan Konstituante berlangsung sepanjang 1958 - tanggal tidak pasti.
  "ev-konstituante-ham-1958": { date: "1958" },
};

/** Duplikat tanpa nomor dokumen hukum, lolos dari pagar sidik jari. */
const KLASTER_DUPLIKAT: Record<string, string[]> = {
  "ev-bpk-penetapan-1947": ["ev-bpk-pertama-magelang-1947"],
};

type Ev = {
  id: string;
  term_id: string;
  date: string;
  title_id: string;
  summary_id: string;
  source_ids?: string[];
  dimension_ids?: string[];
  actor_ids?: string[];
  [k: string]: unknown;
};

const files = [
  join(DATA, "events.yaml"),
  ...readdirSync(join(DATA, "events")).filter((f) => f.endsWith(".yaml")).map((f) => join(DATA, "events", f)),
].map((path) => ({ path, items: parse(readFileSync(path, "utf8")) as Ev[] }));

const byId = new Map<string, Ev>();
for (const { items } of files) for (const e of items) byId.set(e.id, e);

const stat = { tanggalDiperbaiki: 0, tanggalDiturunkanKeTahun: 0, atribusiMasaJabatan: 0, judulLabelPabrikan: 0, duplikatDilebur: 0, tautanDiremap: 0 };

for (const [id, fix] of Object.entries(PERBAIKAN)) {
  const ev = byId.get(id);
  if (!ev) throw new Error(`peristiwa ${id} tidak ada`);
  if (fix.term_id && fix.term_id !== ev.term_id) {
    ev.term_id = fix.term_id;
    stat.atribusiMasaJabatan++;
  }
  if (fix.date) {
    if (/^\d{4}$/.test(fix.date)) stat.tanggalDiturunkanKeTahun++;
    else stat.tanggalDiperbaiki++;
    ev.date = fix.date;
  }
  if (fix.title_id) ev.title_id = fix.title_id;
  if (fix.summary_id) ev.summary_id = fix.summary_id;
}

// Label pabrikan pada judul peristiwa.
for (const { items } of files) {
  for (const ev of items) {
    const bersih = ev.title_id.replace(/^(Penerbitan Kebijakan Eksekutif|Dokumentasi Historis|Putusan Peradilan):\s*/, "");
    if (bersih !== ev.title_id) {
      ev.title_id = bersih;
      stat.judulLabelPabrikan++;
    }
  }
}

// Lebur duplikat.
const remap = new Map<string, string>();
for (const [kanonik, lebur] of Object.entries(KLASTER_DUPLIKAT)) {
  const target = byId.get(kanonik)!;
  for (const id of lebur) {
    const src = byId.get(id);
    if (!src) continue;
    if (src.term_id !== target.term_id) throw new Error(`${id} beda masa jabatan dengan ${kanonik}`);
    const union = (a: string[] = [], b: string[] = []) => [...new Set([...a, ...b])];
    target.source_ids = union(target.source_ids, src.source_ids);
    target.dimension_ids = union(target.dimension_ids, src.dimension_ids);
    const actors = union(target.actor_ids, src.actor_ids);
    if (actors.length) target.actor_ids = actors;
    if (src.summary_id.length > target.summary_id.length) target.summary_id = src.summary_id;
    if (src.title_id.length > target.title_id.length) target.title_id = src.title_id;
    remap.set(id, kanonik);
    stat.duplikatDilebur++;
  }
}

for (const f of files) {
  const items = f.items.filter((e) => !remap.has(e.id));
  const text = stringify(items, { indent: 2, lineWidth: 0 });
  if (text !== readFileSync(f.path, "utf8")) writeFileSync(f.path, text, "utf8");
}

const aPath = join(DATA, "assessments.yaml");
const assessments = parse(readFileSync(aPath, "utf8")) as Array<{
  dimension_scores: Array<{ event_ids?: string[] }>;
}>;
for (const asm of assessments) {
  for (const dim of asm.dimension_scores) {
    if (!dim.event_ids) continue;
    const next: string[] = [];
    for (const id of dim.event_ids) {
      const to = remap.get(id);
      if (to) stat.tautanDiremap++;
      const final = to ?? id;
      if (!next.includes(final)) next.push(final);
    }
    dim.event_ids = next;
  }
}
writeFileSync(aPath, stringify(assessments, { indent: 2, lineWidth: 0 }), "utf8");
console.table(stat);
