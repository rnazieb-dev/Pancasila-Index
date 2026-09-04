#!/usr/bin/env tsx
/**
 * Remediasi P2: sisa peristiwa sintetis dan tautan salah masa jabatan.
 *
 * 45 peristiwa `ev-rescue-*` bertanggal seragam 2024-01-01 dengan judul
 * bernomor seri dan ringkasan boilerplate identik ("Lembaga negara terkait
 * secara resmi menyampaikan ...") bukan peristiwa ketatanegaraan yang
 * terdokumentasi - itu pengisi metrik. Dicabut beserta sumber yatimnya.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "data");

const BOILERPLATE_LEMBAGA =
  /^Lembaga negara terkait secara resmi menyampaikan .* Laporan komprehensif ini menjadi instrumen akuntabilitas publik dan checks-and-balances dalam pengawasan tata kelola pemerintahan\.$/;

/** Koreksi atribusi masa jabatan & tanggal yang keliru. */
const KOREKSI_PERISTIWA: Record<string, { term_id?: string; date?: string }> = {
  // UU 11/2006 diundangkan 1 Agustus 2006 - masa jabatan SBY I, bukan SBY II.
  "ev-rescue-uu-pemerintahan-aceh-11-2006": { term_id: "presiden-sby-i", date: "2006-08-01" },
};

/** Tautan peristiwa yang tidak nyambung dengan dimensi yang dinilai. */
const LEPAS_TAUTAN: Record<string, string[]> = {
  "asm-sby-ii::checks-balances": ["ev-rescue-uu-pemerintahan-aceh-11-2006"],
};

type Ev = { id: string; summary_id: string; source_ids?: string[]; [k: string]: unknown };

const files = [
  { path: join(DATA, "events.yaml") },
  ...readdirSync(join(DATA, "events"))
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => ({ path: join(DATA, "events", f) })),
].map((f) => ({ ...f, items: parse(readFileSync(f.path, "utf8")) as Ev[] }));

const dihapus = new Set<string>();
for (const { items } of files)
  for (const e of items) if (BOILERPLATE_LEMBAGA.test((e.summary_id ?? "").trim())) dihapus.add(e.id);

const stat = { peristiwaDihapus: dihapus.size, sumberYatimDihapus: 0, peristiwaDikoreksi: 0, tautanDilepas: 0 };

for (const f of files) {
  f.items = f.items.filter((e) => !dihapus.has(e.id));
  for (const e of f.items) {
    const fix = KOREKSI_PERISTIWA[e.id];
    if (fix) {
      Object.assign(e, fix);
      stat.peristiwaDikoreksi++;
    }
  }
}

const aPath = join(DATA, "assessments.yaml");
const assessments = parse(readFileSync(aPath, "utf8")) as Array<{
  id: string;
  dimension_scores: Array<{ dimension_id: string; event_ids?: string[]; evidence: Array<{ source_id: string }> }>;
}>;

const terpakaiSumber = new Set<string>();
for (const { items } of files) for (const e of items) for (const s of e.source_ids ?? []) terpakaiSumber.add(s);

for (const asm of assessments) {
  for (const dim of asm.dimension_scores) {
    for (const e of dim.evidence) terpakaiSumber.add(e.source_id);
    if (!dim.event_ids) continue;
    const lepas = LEPAS_TAUTAN[`${asm.id}::${dim.dimension_id}`] ?? [];
    const keep = dim.event_ids.filter((id) => {
      if (dihapus.has(id)) return false;
      if (lepas.includes(id)) {
        stat.tautanDilepas++;
        return false;
      }
      return true;
    });
    if (keep.length) dim.event_ids = keep;
    else delete dim.event_ids;
  }
}

const sPath = join(DATA, "sources.yaml");
const sources = parse(readFileSync(sPath, "utf8")) as Array<{ id: string }>;
const sisaSumber = sources.filter((s) => {
  const yatimDariSintetis = !terpakaiSumber.has(s.id) && /^(rekomendasi-dpd|laporan-(hasil|investigasi|monitoring|tahunan|operasional)|hasil-sidang)/.test(s.id);
  if (yatimDariSintetis) stat.sumberYatimDihapus++;
  return !yatimDariSintetis;
});

for (const f of files) {
  const text = stringify(f.items, { indent: 2, lineWidth: 0 });
  if (text !== readFileSync(f.path, "utf8")) writeFileSync(f.path, text, "utf8");
}
writeFileSync(aPath, stringify(assessments, { indent: 2, lineWidth: 0 }), "utf8");
writeFileSync(sPath, stringify(sisaSumber, { indent: 2, lineWidth: 0 }), "utf8");
console.table(stat);
