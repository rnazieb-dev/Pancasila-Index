#!/usr/bin/env tsx
/**
 * Remediasi lanjutan: sumber dengan URL fabrikasi dan klaim verifikasi palsu.
 *
 * Pemeriksaan tautan langsung (curl, 4 September 2026) menemukan 25 sumber
 * ber-URL hasil tebakan pola yang seluruhnya mengembalikan HTTP 404 - judul
 * dan nomor dokumennya pun dibangkitkan (mis. "Laporan Investigasi Komnas HAM
 * RI - Kategori penyiksaan Nomor 1 Tahun 2024"). Lima peristiwa yang seluruh
 * `source_ids`-nya terdiri dari sumber semacam itu ikut dicabut.
 *
 * Selain itu:
 * - `archive_ok` dihapus dari sumber tanpa `r2_key`; medan itu hanya bermakna
 *   bersama arsip R2 dan di luar itu hanya menyesatkan.
 * - `source_verified` (medan hantu: dipakai 254 sumber tetapi tidak ada di
 *   sourceSchema, jadi selalu dibuang saat build) diganti `verification_tier`
 *   yang sungguh ada. Beranda lembaga/penerbit tidak membuktikan dokumennya,
 *   jadi sumber semacam itu jujur berstatus `unverified`.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "data");

/** Seluruhnya diverifikasi HTTP 404 / identitas dokumen dibangkitkan. */
const SUMBER_FABRIKASI = new Set([
  "regional-jawa-tengah-0023",
  "regional-jawa-tengah-0030",
  "regional-jawa-tengah-0040",
  "peraturan-gubernur-provinsi-dki-jakarta-nomor-13-tahun-2024",
  "peraturan-gubernur-provinsi-dki-jakarta-nomor-150-tahun-2023",
  "peraturan-daerah-provinsi-dki-jakarta-nomor-1-tahun-2024-ten-730",
  "ikhtisar-hasil-pemeriksaan-semester-1-tahun-2022-badan-p",
  "ikhtisar-hasil-pemeriksaan-semester-2-tahun-2022-badan-p",
  "ikhtisar-hasil-pemeriksaan-semester-1-tahun-2023-badan-p",
  "ikhtisar-hasil-pemeriksaan-semester-2-tahun-2023-badan-p",
  "ikhtisar-hasil-pemeriksaan-semester-2-tahun-2024-badan-p",
  "laporan-hasil-pemeriksaan-atas-laporan-keuangan-kemenkeu-tah",
  "laporan-hasil-pemeriksaan-atas-laporan-keuangan-kemekes-tahu",
  "laporan-hasil-pemeriksaan-atas-laporan-keuangan-kemendikbud",
  "laporan-hasil-pemeriksaan-atas-laporan-keuangan-kementan-tah",
  "laporan-hasil-pemeriksaan-atas-laporan-keuangan-kemenhub-tah",
  "laporan-investigasi-komnas-ham-ri-kategori-penyiksaan-nomo",
  "laporan-investigasi-komnas-ham-ri-kategori-pembunuhan-ekst",
  "laporan-investigasi-komnas-ham-ri-kategori-penghilangan-or",
  "laporan-investigasi-komnas-ham-ri-kategori-pelanggaran-hak",
  "laporan-investigasi-komnas-ham-ri-kategori-diskriminasi-no",
  "laporan-monitoring-komnas-ham-ri-terhadap-pemenuhan-hak-asas",
  "rekomendasi-ombudsman-terhadap-administrasi-pemerintahan-202",
  "laporan-realisasi-amanat-uud-1945-mpr-2024",
  "hasil-sidang-tahunan-mpr-tahun-2024-putusan-dan-ketetapan",
]);

/** Koreksi tautan yang saya sendiri tambahkan tetapi ternyata tidak stabil. */
const KOREKSI: Record<string, Record<string, unknown>> = {
  "buku-ricklefs-history-modern-indonesia-1981": { url: null, source_verified: false },
};

type Src = {
  id: string;
  url?: string;
  r2_key?: string;
  archive_ok?: boolean;
  source_verified?: boolean;
  verification_tier?: "human_verified" | "official_source" | "unverified";
  [k: string]: unknown;
};
type Ev = { id: string; source_ids?: string[]; [k: string]: unknown };

const sources = parse(readFileSync(join(DATA, "sources.yaml"), "utf8")) as Src[];
const eventFiles = [
  join(DATA, "events.yaml"),
  ...readdirSync(join(DATA, "events")).filter((f) => f.endsWith(".yaml")).map((f) => join(DATA, "events", f)),
].map((path) => ({ path, items: parse(readFileSync(path, "utf8")) as Ev[] }));
const aPath = join(DATA, "assessments.yaml");
const assessments = parse(readFileSync(aPath, "utf8")) as Array<{
  id: string;
  dimension_scores: Array<{
    dimension_id: string;
    evidence: Array<{ source_id: string }>;
    event_ids?: string[];
    evidence_gap?: boolean;
  }>;
}>;

const stat = {
  sumberFabrikasiDihapus: 0,
  peristiwaTanpaSumberSahDihapus: 0,
  buktiDicabut: 0,
  tautanPeristiwaDicabut: 0,
  archiveOkPalsuDihapus: 0,
  sourceVerifiedDiganti: 0,
  sumberBelumTerverifikasi: 0,
  skorJadiEvidenceGap: 0,
};

// ---- peristiwa yang seluruh sumbernya fabrikasi ---------------------------

const peristiwaDihapus = new Set<string>();
for (const { items } of eventFiles) {
  for (const ev of items) {
    const ids = ev.source_ids ?? [];
    if (ids.length > 0 && ids.every((id) => SUMBER_FABRIKASI.has(id))) {
      peristiwaDihapus.add(ev.id);
    }
  }
}

for (const f of eventFiles) {
  f.items = f.items.filter((e) => !peristiwaDihapus.has(e.id));
  for (const e of f.items) {
    if (!e.source_ids) continue;
    e.source_ids = e.source_ids.filter((id) => !SUMBER_FABRIKASI.has(id));
  }
}
stat.peristiwaTanpaSumberSahDihapus = peristiwaDihapus.size;

// ---- assessments ----------------------------------------------------------

for (const asm of assessments) {
  for (const dim of asm.dimension_scores) {
    const before = dim.evidence.length;
    dim.evidence = dim.evidence.filter((e) => !SUMBER_FABRIKASI.has(e.source_id));
    stat.buktiDicabut += before - dim.evidence.length;
    if (dim.evidence.length === 0 && !dim.evidence_gap) {
      dim.evidence_gap = true;
      stat.skorJadiEvidenceGap++;
    }
    if (dim.event_ids) {
      const keep = dim.event_ids.filter((id) => !peristiwaDihapus.has(id));
      stat.tautanPeristiwaDicabut += dim.event_ids.length - keep.length;
      if (keep.length) dim.event_ids = keep;
      else delete dim.event_ids;
    }
  }
}

// ---- sources --------------------------------------------------------------

/** URL yang hanya menunjuk beranda lembaga/penerbit, bukan dokumennya. */
function berandaSaja(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (u.pathname === "/" || u.pathname === "") && !u.search;
  } catch {
    return false;
  }
}

const sisa: Src[] = [];
for (const s of sources) {
  if (SUMBER_FABRIKASI.has(s.id)) {
    stat.sumberFabrikasiDihapus++;
    continue;
  }
  const fix = KOREKSI[s.id];
  if (fix) {
    for (const [k, v] of Object.entries(fix)) {
      if (v === null) delete s[k];
      else s[k] = v;
    }
  }
  // `archive_ok` hanya bermakna bersama arsip R2.
  if (!s.r2_key && s.archive_ok !== undefined) {
    delete s.archive_ok;
    stat.archiveOkPalsuDihapus++;
  }
  // `source_verified` bukan medan skema - ia dibuang diam-diam saat build,
  // jadi selama ini mengklaim verifikasi yang tidak pernah sampai ke mana pun.
  // Diganti `verification_tier` yang memang ada di sourceSchema:
  //   official_source = ada salinan arsip resmi yang bisa dibuka;
  //   unverified      = belum ada bukti dokumen yang bisa ditagih.
  // Tidak ada yang berhak `human_verified`: belum ada penelaah manusia.
  if (s.source_verified !== undefined) {
    delete s.source_verified;
    stat.sourceVerifiedDiganti++;
  }
  const punyaSalinan = Boolean(s.r2_key) && s.archive_ok !== false;
  const punyaTautanDokumen = Boolean(s.url) && !berandaSaja(s.url);
  s.verification_tier = punyaSalinan || punyaTautanDokumen ? "official_source" : "unverified";
  if (s.verification_tier === "unverified") stat.sumberBelumTerverifikasi++;
  sisa.push(s);
}

for (const f of eventFiles) {
  const text = stringify(f.items, { indent: 2, lineWidth: 0 });
  if (text !== readFileSync(f.path, "utf8")) writeFileSync(f.path, text, "utf8");
}
writeFileSync(join(DATA, "sources.yaml"), stringify(sisa, { indent: 2, lineWidth: 0 }), "utf8");
writeFileSync(aPath, stringify(assessments, { indent: 2, lineWidth: 0 }), "utf8");
console.table(stat);
