#!/usr/bin/env tsx
/**
 * Build dataset: membaca seluruh YAML di data/, memvalidasi dengan skema
 * @pancasila-index/core, memeriksa referensi silang, lalu menulis
 * generated/dataset.json untuk dikonsumsi aplikasi web.
 *
 * Jalankan: pnpm --filter @pancasila-index/data build
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

import {
  parseDataset,
  rubricSchema,
  uudSchema,
  institutionSchema,
  termSchema,
  eventSchema,
  sourceSchema,
  assessmentSchema,
} from "@pancasila-index/core";

import { applyReviews, reviewStateSchema } from "../src/review";
import { resolveSourceUrl } from "../src/resolvers";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "data");
const OUT = join(ROOT, "generated", "dataset.json");

function readYaml(relPath: string): unknown {
  const text = readFileSync(join(DATA, relPath), "utf8");
  return parse(text);
}

/** Baca satu berkas YAML berisi array entitas, validasi tiap item. */
function loadArray<T>(relPath: string, schema: { parse: (v: unknown) => T }, label: string): T[] {
  const raw = readYaml(relPath);
  if (!Array.isArray(raw)) {
    throw new Error(`${label}: berkas ${relPath} harus berisi array`);
  }
  return raw.map((item, i) => {
    try {
      return schema.parse(item);
    } catch (err) {
      throw new Error(`${label}: item ke-${i} pada ${relPath}\n${err instanceof Error ? err.message : err}`);
    }
  });
}

// ------------------------------------------------------------------ muat

const rubricFiles = readdirSync(join(DATA, "rubric")).filter((f) => f.endsWith(".yaml")).sort();
if (rubricFiles.length === 0) throw new Error("Tidak ada rubrik di data/rubric/");
const rubric = rubricSchema.parse(readYaml(join("rubric", rubricFiles[rubricFiles.length - 1]!)));

const uud = uudSchema.parse(readYaml("uud1945.yaml"));
const institutions = loadArray("institutions.yaml", institutionSchema, "institution");
const terms = loadArray("terms-presiden.yaml", termSchema, "term")
  .concat(loadArray("terms-dpr.yaml", termSchema, "term"))
  .concat(loadArray("terms-mk.yaml", termSchema, "term"));
const sourcesRaw = loadArray("sources.yaml", sourceSchema, "source");
const events = loadArray("events.yaml", eventSchema, "event");
const assessments = loadArray("assessments.yaml", assessmentSchema, "assessment");

// ---- terapkan keputusan kurasi (review-state.json = jejak audit) ----
const REVIEW_FILE = join(ROOT, "generated", "review-state.json");
let reviews: ReturnType<typeof reviewStateSchema.parse>["reviews"] = [];
if (existsSync(REVIEW_FILE)) {
  const rawState = JSON.parse(readFileSync(REVIEW_FILE, "utf8"));
  reviews = reviewStateSchema.parse(rawState).reviews;
}
const reviewed = applyReviews(assessments, reviews);
if (reviews.length > 0) {
  console.log(
    `Kurasi: ${reviewed.publishedIds.length} disetujui, ${reviewed.rejectedIds.length} ditolak dari ${reviews.length} keputusan`
  );
}

// ---- tautan bukti: setiap sumber wajib punya URL yang bisa dibuka ----
const sourcesResolved = sourcesRaw.map((s) => ({
  ...s,
  resolved_url: resolveSourceUrl(s),
}));

// ---- korelasi bukti: sumber dari peristiwa terkait ikut menguatkan ----
const eventsById = new Map(events.map((e) => [e.id, e]));
const assessmentsEnriched = reviewed.assessments.map((a) => ({
  ...a,
  dimension_scores: a.dimension_scores.map((ds) => {
    const extra = new Set<string>();
    for (const eid of ds.event_ids ?? []) {
      for (const sid of eventsById.get(eid)?.source_ids ?? []) extra.add(sid);
    }
    const evidence = [...ds.evidence];
    for (const sid of extra) {
      if (!evidence.some((ev) => ev.source_id === sid)) {
        evidence.push({ source_id: sid });
      }
    }
    // Jangkar normatif dipisah dari bukti empiris: pasal UUD bukan
    // dukungan faktual atas skor, sehingga tidak boleh tampil sebagai "BUKTI".
    const normative_anchors = ds.normative_anchors?.length
      ? ds.normative_anchors
      : ["uud-nri-1945"];
    return { ...ds, evidence, normative_anchors };
  }),
}));
const correlated = assessmentsEnriched.reduce(
  (acc, a) =>
    acc +
    a.dimension_scores.filter((d) => d.evidence.length > 1).length,
  0
);
console.log(
  `Korelasi bukti: ${correlated}/${assessmentsEnriched.reduce(
    (n, a) => n + a.dimension_scores.length,
    0
  )} skor kini multi-bukti`
);

// ------------------------------------------------------- referensi silang

const errors: string[] = [];
const termIds = new Set(terms.map((t) => t.id));
const instIds = new Set(institutions.map((i) => i.id));
const dimIds = new Set(rubric.dimensions.map((d) => d.id));
const groupIds = new Set(rubric.groups.map((g) => g.id));
const srcIds = new Set(sourcesRaw.map((s) => s.id));
const eventIds = new Set(events.map((e) => e.id));

for (const t of terms)
  if (!instIds.has(t.institution_id))
    errors.push(`term ${t.id}: institution_id "${t.institution_id}" tidak ada`);

for (const e of events) {
  if (!termIds.has(e.term_id)) errors.push(`event ${e.id}: term_id "${e.term_id}" tidak ada`);
  for (const s of e.source_ids)
    if (!srcIds.has(s)) errors.push(`event ${e.id}: sumber "${s}" tidak terdaftar`);
  for (const d of e.dimension_ids)
    if (!dimIds.has(d)) errors.push(`event ${e.id}: dimensi "${d}" tidak ada di rubrik`);
}

for (const a of assessments) {
  if (!termIds.has(a.term_id)) errors.push(`assessment ${a.id}: term_id "${a.term_id}" tidak ada`);
  if (a.rubric_version !== rubric.version)
    errors.push(
      `assessment ${a.id}: rubric_version ${a.rubric_version} != rubrik aktif ${rubric.version}`
    );
  for (const ds of a.dimension_scores) {
    if (!dimIds.has(ds.dimension_id))
      errors.push(`assessment ${a.id}: dimensi "${ds.dimension_id}" tidak ada di rubrik`);
    for (const ev of ds.evidence)
      if (!srcIds.has(ev.source_id))
        errors.push(`assessment ${a.id}: bukti sumber "${ev.source_id}" tidak terdaftar`);
    for (const eid of ds.event_ids ?? [])
      if (!eventIds.has(eid))
        errors.push(`assessment ${a.id}: event_id "${eid}" tidak terdaftar`);
  }
}

for (const d of rubric.dimensions)
  if (!groupIds.has(d.group_id))
    errors.push(`dimensi ${d.id}: group_id "${d.group_id}" tidak ada`);

for (const bab of uud.babs)
  for (const p of bab.pasal)
    for (const dimId of p.dimension_ids)
      if (!dimIds.has(dimId))
        errors.push(`pasal ${p.nomor} (bab ${bab.nomor}): dimensi "${dimId}" tidak ada di rubrik`);

if (errors.length > 0) {
  console.error("Referensi silang tidak konsisten:");
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}

// ------------------------------------------------------------------ tulis

const dataset = parseDataset({
  rubric,
  uud,
  institutions,
  terms,
  events,
  sources: sourcesResolved,
  assessments: assessmentsEnriched,
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(dataset, null, 2) + "\n");

console.log(
  `OK: ${institutions.length} lembaga, ${terms.length} masa jabatan, ` +
    `${events.length} peristiwa, ${sourcesResolved.length} sumber, ` +
    `${assessments.length} penilaian, ${uud.babs.length} bab UUD -> generated/dataset.json`
);
