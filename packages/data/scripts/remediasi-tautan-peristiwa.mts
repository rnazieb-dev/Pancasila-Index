#!/usr/bin/env tsx
/**
 * Perbaikan tautan peristiwa yang tidak nyambung dengan dimensi yang dinilai
 * (audit-kritik-total.md bagian 4). Setiap penggantian dipilih agar peristiwa
 * benar-benar merupakan rujukan empiris dari kalimat `rationale_id`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PATH = join(ROOT, "data", "assessments.yaml");

const PERBAIKAN: Record<string, string[]> = {
  // "UU Pengadilan HAM ... konflik komunal Maluku-Poso" - bukan Imlek.
  "asm-gusdur::sila-2": ["ev-gusdur-uu-pengadilan-ham", "ev-gusdur-konflik-komunal"],
  // "Pengadilan HAM ad hoc Timtim ... impunitif".
  "asm-megawati::sila-2": ["ev-megawati-pengadilan-timtim", "ev-uu-otsus-papua-2001"],
  // "Perjanjian Damai Helsinki 2005 ...".
  "asm-sby-i::sila-2": ["ev-mou-helsinki-damai-2005", "ev-uu-kewarganegaraan-anti-diskriminasi-2006"],
  // "Amandemen Pasal 28E dan 28I UUD 1945" - bukan otda & antikorupsi.
  "asm-dpr99::sila-1": ["ev-dpr99-amandemen-uud"],
  // "Pemilu 1955 ... kabinet parlementer tidak stabil" - bukan KAA Bandung.
  "asm-soekarno-i::sila-4": ["ev-soekarno1-pemilu-1955", "ev-presiden-dekrit-5-juli-1959"],
};

const assessments = parse(readFileSync(PATH, "utf8")) as Array<{
  id: string;
  dimension_scores: Array<{ dimension_id: string; event_ids?: string[] }>;
}>;

let n = 0;
for (const asm of assessments) {
  for (const dim of asm.dimension_scores) {
    const fix = PERBAIKAN[`${asm.id}::${dim.dimension_id}`];
    if (!fix) continue;
    dim.event_ids = fix;
    n++;
  }
}
if (n !== Object.keys(PERBAIKAN).length) throw new Error(`hanya ${n} tautan diperbaiki`);
writeFileSync(PATH, stringify(assessments, { indent: 2, lineWidth: 0 }), "utf8");
console.log(`tautan peristiwa diperbaiki: ${n}`);
