#!/usr/bin/env tsx
/**
 * Remediasi klaster duplikat peristiwa (audit-kritik-total.md bagian 5).
 *
 * Hanya menggabungkan duplikat dalam MASA JABATAN YANG SAMA. Catatan lintas
 * organ atas satu produk hukum (mis. UU MK 2003 dicatat DPR yang mengesahkan
 * dan MK yang lahir darinya) BUKAN duplikat - itu linimasa masing-masing
 * lembaga - sehingga sengaja dipertahankan.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "data");

/** kanonik -> daftar id yang dilebur ke dalamnya. */
const KLASTER: Record<string, string[]> = {
  "ev-mou-helsinki-damai-2005": ["ev-sby-mou-helsinki", "ev-sby1-damai-aceh"],
  "ev-uu-mk-2003": ["ev-dpr-uu-mk-2003"],
  "ev-dpr-revisi-uu-kpk-2019": ["ev-revisi-uu-kpk-pelemahan-independensi-2019"],
  "ev-mk-putusan-hutan-adat-2013": ["ev-mk-putusan-hutan-adat-2012"],
  "ev-tap-mpr-pemisahan-tni-polri-2000": ["ev-mpr-pemisahan-tni-polri-2000"],
  "ev-ma-skandal-zarof-ricar-2024": [
    "ev-ma-skandal-zarof-2024",
    "ev-skandal-mafia-peradilan-zarof-ricar-2024",
  ],
  "ev-uu-3-1975-fusi-partai": ["ev-fusi-partai-politik-1975", "ev-uu-fusi-partai-politik-1975"],
  "ev-bpk-audit-bank-century-2009": [
    "ev-bpk-audit-century-2009",
    // Tanggal 23 Nov 2009 jatuh pada kepemimpinan BPK 2009-2019, bukan
    // 1998-2009; salinan berlabel masa jabatan lama ikut dilebur.
    "ev-audit-investigasi-bpk-bank-century-2009",
  ],
  "ev-dpr-pansus-century-2010": ["ev-dpr-pansus-angket-century-2010", "ev-dpr-angket-century-2010"],
  "ev-persetujuan-linggarjati-1947": ["ev-rescue-anri-perjanjian-linggarjati-1947"],

  // Gelombang kedua: klaster yang tertangkap pagar sidik-jari nomor dokumen
  // hukum di build.mts (kunci lama `source::date` melewatkannya).
  "ev-dpr-uu-kuhp-2022": ["ev-dpr19-rkuhp-final"],
  // Putusan 46/PUU-VIII/2010 diucapkan 17 Februari 2012; salinan bertanggal
  // 2010-10 dan ber-id "narkoba" adalah catatan keliru.
  "ev-mk-putusan-anak-luar-kawin-2012": ["ev-mk2-narkoba-46"],
  "ev-dpd-kemenangan-mk-92-2013": ["ev-dpd-uji-materi-mk-92-2012"],
  "ev-dpd-putusan-mk-79-2015": ["ev-dpd-putusan-mk-79-2014"],
  "ev-mk-putusan-batas-usia-capres-2023": ["ev-mk-putusan-90-capres", "ev-mk-putusan-90-2023"],
  "ev-mk-putusan-ambang-batas-pilkada-2024": [
    "ev-mk-putusan-60-pilkada",
    "ev-putusan-mk-60-demokrasi-lokal-2024",
  ],
  "ev-mk-putusan-netralitas-pilkada-2024": ["ev-putusan-mk-136-netralitas-aparat-2024"],
  "ev-keppres-pembubaran-masyumi-psi-1960": ["ev-pembubaran-masyumi-psi-1960"],
  "ev-mk-putusan-fidusia-2019": [
    "ev-mk-putusan-fidusia-2020",
    "ev-putusan-mk-larangan-tarik-paksa-fidusia-2019",
  ],
  "ev-uu-intervensi-kehakiman-presiden-1964": ["ev-ma-uu-19-1964"],
  "ev-mk-putusan-sda-air-2013": ["ev-mk-putusan-sda-2015"],
  "ev-mk-putusan-bpmigas-2012": ["ev-mk-pembatalan-bp-migas-2012"],
  "ev-mk-putusan-tripartit-dpd-2012-2014": ["ev-mk-putusan-dpd-tripartit-2013"],
  // Putusan 130/PUU-XIII/2015 diucapkan 11 Januari 2017 (mkri.id); salinan
  // bertanggal 2016-01-11 keliru satu tahun.
  "ev-mk-putusan-spdp-7-hari-2015": ["ev-mk-putusan-spdp-2016"],
  "ev-mk-putusan-threshold-2024": ["ev-mk-putusan-parliamentary-threshold-2024"],
  "ev-mk-putusan-pemilu-serentak-2019": ["ev-mk-pemilu-serentak-daerah-2020"],
  "ev-perppu-ormas-pembubaran-hti-2017": ["ev-jokowi-perppu-ormas"],
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

const eventFiles = [
  { path: join(DATA, "events.yaml"), items: parse(readFileSync(join(DATA, "events.yaml"), "utf8")) as Ev[] },
  ...readdirSync(join(DATA, "events"))
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => ({
      path: join(DATA, "events", f),
      items: parse(readFileSync(join(DATA, "events", f), "utf8")) as Ev[],
    })),
];

const byId = new Map<string, Ev>();
for (const { items } of eventFiles) for (const e of items) byId.set(e.id, e);

const remap = new Map<string, string>();
const stat = { klaster: 0, peristiwaDilebur: 0, tautanDiremap: 0 };

for (const [kanonik, lebur] of Object.entries(KLASTER)) {
  const target = byId.get(kanonik);
  if (!target) throw new Error(`kanonik ${kanonik} tidak ada`);
  stat.klaster++;
  for (const id of lebur) {
    const src = byId.get(id);
    if (!src) continue; // sudah dilebur pada jalannya terdahulu (skrip idempoten)
    if (src.term_id !== target.term_id) {
      // Beda masa jabatan hanya boleh dilebur bila memang salah atribusi.
      if (!["ev-audit-investigasi-bpk-bank-century-2009"].includes(id)) {
        throw new Error(`${id} beda term_id dengan ${kanonik} - bukan duplikat`);
      }
    }
    const union = (a: string[] = [], b: string[] = []) => [...new Set([...a, ...b])];
    target.source_ids = union(target.source_ids, src.source_ids);
    target.dimension_ids = union(target.dimension_ids, src.dimension_ids);
    const actors = union(target.actor_ids, src.actor_ids);
    if (actors.length) target.actor_ids = actors;
    // Pertahankan uraian terpanjang dan tanggal terlengkap.
    if ((src.summary_id?.length ?? 0) > (target.summary_id?.length ?? 0)) {
      target.summary_id = src.summary_id;
    }
    if (src.date.length > target.date.length) target.date = src.date;
    remap.set(id, kanonik);
    stat.peristiwaDilebur++;
  }
}

for (const f of eventFiles) {
  const next = f.items.filter((e) => !remap.has(e.id));
  const text = stringify(next, { indent: 2, lineWidth: 0 });
  if (text !== readFileSync(f.path, "utf8")) writeFileSync(f.path, text, "utf8");
}

// ---- remap rujukan di assessments -----------------------------------------

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
