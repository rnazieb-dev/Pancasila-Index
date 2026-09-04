#!/usr/bin/env tsx
/**
 * Terapkan antitesis & sintesis yang ditulis per dimensi ke assessments.yaml.
 *
 * Masukan: berkas JSON `{ "<asm-id>::<dimension-id>": { antithesis_id, synthesis_id } }`.
 * Pemakaian: tsx scripts/dialektika-apply.mts patch.json
 *
 * Pemeriksaan sebelum menulis (menolak seluruh berkas bila ada yang gagal):
 *  - kunci harus menunjuk skor dimensi yang benar-benar ada;
 *  - label skor pada sintesis wajib cocok dengan angka `score`;
 *  - teks tidak boleh terpotong di tengah nomor dokumen hukum;
 *  - tidak boleh ada kalimat yang sama dipakai lebih dari 3 kali di seluruh
 *    dataset - itu batas yang membedakan analisis per dimensi dari template.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const DATA = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const PATH = join(DATA, "assessments.yaml");
const patchFile = process.argv[2];
if (!patchFile) throw new Error("pemakaian: dialektika-apply.mts <patch.json>");

const patch = JSON.parse(readFileSync(patchFile, "utf8")) as Record<
  string,
  { score?: number; rationale_id?: string; antithesis_id?: string; synthesis_id: string }
>;
const assessments = parse(readFileSync(PATH, "utf8")) as any[];

const index = new Map<string, any>();
for (const a of assessments) for (const d of a.dimension_scores) index.set(`${a.id}::${d.dimension_id}`, d);

const LABEL = /\b(?:skor|penilaian)\b[^.]{0,48}?\(([+-][0-2]|0)\)/i;
const TERPOTONG = /\b(No|Nomor|Pasal|UU|TAP|Perppu)\.?$/;
const galat: string[] = [];

for (const [k, v] of Object.entries(patch)) {
  const d = index.get(k);
  if (!d) {
    galat.push(`${k}: skor dimensi tidak ada`);
    continue;
  }
  // antithesis_id boleh dihilangkan pada patch yang hanya menyetel ulang skor;
  // yang lama dipertahankan apa adanya.
  for (const [field, teks] of [
    ["antithesis_id", v.antithesis_id],
    ["synthesis_id", v.synthesis_id],
  ] as const) {
    if (field === "antithesis_id" && teks === undefined) continue;
    if (!teks || teks.trim().length < 40) galat.push(`${k}: ${field} terlalu pendek`);
    else if (TERPOTONG.test(teks.trim())) galat.push(`${k}: ${field} terpotong di nomor dokumen`);
  }
  if (v.rationale_id !== undefined) {
    if (v.rationale_id.trim().length < 40) galat.push(`${k}: rationale_id terlalu pendek`);
    if (TERPOTONG.test(v.rationale_id.trim())) galat.push(`${k}: rationale_id terpotong di nomor dokumen`);
  }
  const skorBaru = v.score ?? d.score;
  if (v.score !== undefined && (!Number.isInteger(v.score) || v.score < -2 || v.score > 2)) {
    galat.push(`${k}: score ${v.score} di luar rentang -2..2`);
  }
  const m = v.synthesis_id?.match(LABEL);
  if (!m) galat.push(`${k}: synthesis_id wajib menyebut label skor, mis. "Skor Baik (+1)"`);
  else if (Number(m[1]) !== skorBaru) galat.push(`${k}: sintesis menulis (${m[1]}), score = ${skorBaru}`);
}

// Ambang pengulangan dihitung terhadap SELURUH dataset, bukan hanya patch ini.
const hitung = new Map<string, number>();
const catat = (t: string | undefined) => {
  if (!t) return;
  const key = t.trim().toLowerCase();
  hitung.set(key, (hitung.get(key) ?? 0) + 1);
};
for (const a of assessments) {
  for (const d of a.dimension_scores) {
    const k = `${a.id}::${d.dimension_id}`;
    const p = patch[k];
    catat(p?.antithesis_id ?? d.antithesis_id);
    catat(p ? p.synthesis_id : d.synthesis_id);
  }
}

// rationale_id tidak boleh kembar sama sekali: satu masa jabatan satu penilaian.
const rasional = new Map<string, string[]>();
for (const a of assessments) {
  for (const d of a.dimension_scores) {
    const k = `${a.id}::${d.dimension_id}`;
    const teks = (patch[k]?.rationale_id ?? d.rationale_id).trim().toLowerCase();
    rasional.set(teks, [...(rasional.get(teks) ?? []), k]);
  }
}
for (const [teks, dipakai] of rasional) {
  if (dipakai.length > 1 && dipakai.some((k) => patch[k]?.rationale_id !== undefined)) {
    galat.push(`rationale_id kembar di ${dipakai.join(", ")}: "${teks.slice(0, 60)}..."`);
  }
}
for (const [t, n] of hitung) {
  if (n > 3) galat.push(`kalimat dipakai ${n}x (ambang 3): "${t.slice(0, 70)}..."`);
}

if (galat.length) {
  console.error(`DITOLAK (${galat.length} galat):`);
  for (const g of galat.slice(0, 30)) console.error("  - " + g);
  process.exit(1);
}

for (const [k, v] of Object.entries(patch)) {
  const d = index.get(k);
  if (v.score !== undefined) d.score = v.score;
  if (v.rationale_id !== undefined) d.rationale_id = v.rationale_id;
  if (v.antithesis_id !== undefined) d.antithesis_id = v.antithesis_id;
  d.synthesis_id = v.synthesis_id;
}
writeFileSync(PATH, stringify(assessments, { indent: 2, lineWidth: 0 }), "utf8");
console.log(`diterapkan: ${Object.keys(patch).length} skor dimensi`);
