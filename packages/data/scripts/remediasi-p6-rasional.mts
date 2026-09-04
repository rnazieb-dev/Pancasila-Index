#!/usr/bin/env tsx
/**
 * Perbaikan korupsi data pada asm-dpr-1971-1999.
 *
 * Sepuluh dari dua belas skor dimensinya berisi rasional milik DPD RI - kalimat
 * seperti "Menyalurkan aspirasi rakyat daerah secara langsung berbasis mandat
 * perseorangan non-partisan" adalah uraian tugas DPD, lembaga yang baru ada
 * sejak 2004, disalin ke penilaian DPR Orde Baru 1971-1999. Rasional yang sama
 * juga masih terpasang di empat asesmen DPD, dan sebagiannya menyitasi Putusan
 * MK 79/PUU-XII/2014 serta peristiwa 2024-2025 - puluhan tahun setelah masa
 * jabatan yang dinilai berakhir.
 *
 * Yang salah tempat dicabut, bukan ditulis ulang: DPR 1971-1999 lebih jujur
 * dinilai pada dua dimensi yang benar-benar berbukti daripada pada dua belas
 * dimensi dengan bukti milik lembaga lain.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "assessments.yaml");
const assessments = parse(readFileSync(PATH, "utf8")) as any[];

const target = assessments.find((a) => a.id === "asm-dpr-1971-1999");
if (!target) throw new Error("asm-dpr-1971-1999 tidak ditemukan");

/** Rasional yang juga dipakai asesmen DPD = bukan milik DPR 1971-1999. */
const milikDpd = new Set<string>();
for (const a of assessments) {
  if (!a.id.startsWith("asm-dpd-")) continue;
  for (const d of a.dimension_scores) milikDpd.add(d.rationale_id.trim());
}

/**
 * Satu rasional bergaya DPD lolos saringan di atas karena kebetulan tidak
 * kembar persis dengan asesmen DPD mana pun; ditandai eksplisit.
 */
const RASIONAL_SALAH_LEMBAGA = [
  "Menjaga integrasi persatuan bangsa dengan memperjuangkan otonomi daerah yang adil",
];

const sebelum = target.dimension_scores.length;
target.dimension_scores = target.dimension_scores.filter(
  (d: any) =>
    !milikDpd.has(d.rationale_id.trim()) &&
    !RASIONAL_SALAH_LEMBAGA.some((p) => d.rationale_id.startsWith(p))
);
const dicabut = sebelum - target.dimension_scores.length;

// Sisa duplikasi dimension_id apa pun ditutup: satu dimensi satu skor.
const terlihat = new Set<string>();
target.dimension_scores = target.dimension_scores.filter((d: any) => {
  if (terlihat.has(d.dimension_id)) return false;
  terlihat.add(d.dimension_id);
  return true;
});

writeFileSync(PATH, stringify(assessments, { indent: 2, lineWidth: 0 }), "utf8");
console.log(
  `asm-dpr-1971-1999: ${dicabut} skor bermuatan rasional DPD dicabut, ` +
    `tersisa ${target.dimension_scores.length} dimensi (${target.dimension_scores
      .map((d: any) => d.dimension_id)
      .join(", ")})`
);
