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
  actorCaseSchema,
  actorProfileSchema,
  rubricSchema,
  uudSchema,
  institutionSchema,
  termSchema,
  eventSchema,
  sourceSchema,
  assessmentSchema,
  externalIndexSchema,
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

// JEBAKAN: .sort() itu leksikografis per byte, BUKAN semver. Titik (0x2E)
// lebih kecil dari huruf, jadi "v1.1.0.yaml" kalah dari "v1.yaml", dan
// "v10.yaml" kalah dari "v2.yaml". Menambah file rubrik baru bisa diam-diam
// tidak berpengaruh sama sekali. Nama file juga tidak pernah dicocokkan
// dengan field `version:` di dalamnya.
//
// Belum diperbaiki karena rubrik saat ini ditimpa di tempat (belum ada
// penilaian yang dipublikasi, jadi belum ada riwayat yang perlu dijaga).
// WAJIB dibereskan sebelum file rubrik kedua ditambahkan - bareng dukungan
// multi-versi di datasetSchema, karena build.mts juga menolak penilaian yang
// rubric_version-nya bukan versi aktif.
const rubricFiles = readdirSync(join(DATA, "rubric")).filter((f) => f.endsWith(".yaml")).sort();
if (rubricFiles.length === 0) throw new Error("Tidak ada rubrik di data/rubric/");
const rubric = rubricSchema.parse(readYaml(join("rubric", rubricFiles[rubricFiles.length - 1]!)));

const uud = uudSchema.parse(readYaml("uud1945.yaml"));
const institutions = loadArray("institutions.yaml", institutionSchema, "institution");
const termFiles = readdirSync(DATA).filter((f) => f.startsWith("terms-") && f.endsWith(".yaml")).sort();
const terms = termFiles.flatMap((f) => loadArray(f, termSchema, `term (${f})`));
const sourcesRaw = loadArray("sources.yaml", sourceSchema, "source");
const actors = existsSync(join(DATA, "actors.yaml"))
  ? loadArray("actors.yaml", actorProfileSchema, "actor")
  : [];
const actorCases = existsSync(join(DATA, "actor-cases.yaml"))
  ? loadArray("actor-cases.yaml", actorCaseSchema, "actor_case")
  : [];
let events: ReturnType<typeof eventSchema.parse>[] = [];
if (existsSync(join(DATA, "events.yaml"))) {
  events.push(...loadArray("events.yaml", eventSchema, "event (events.yaml)"));
}
if (existsSync(join(DATA, "events"))) {
  const eventFiles = readdirSync(join(DATA, "events")).filter((f) => f.endsWith(".yaml")).sort();
  for (const f of eventFiles) {
    events.push(...loadArray(join("events", f), eventSchema, `event (${f})`));
  }
}
const assessments = loadArray("assessments.yaml", assessmentSchema, "assessment");
const externalIndicesRaw = existsSync(join(DATA, "external-indices.yaml"))
  ? loadArray("external-indices.yaml", externalIndexSchema, "external_index")
  : [];

// Derajat verifikasi indeks eksternal DIHITUNG dari kelengkapan provenance,
// tidak boleh diklaim manual di YAML. Angka tanpa asal-usul harus terbaca
// sebagai belum terverifikasi, bukan sebagai fakta.
const externalIndices = externalIndicesRaw.map((idx) => {
  const withProv = idx.data.filter((d) => d.provenance).length;
  const verification =
    withProv === 0
      ? ("belum-terverifikasi" as const)
      : withProv === idx.data.length
        ? ("terverifikasi" as const)
        : ("sebagian" as const);
  return { ...idx, verification };
});
const unverifiedPoints = externalIndices.reduce(
  (n, idx) => n + idx.data.filter((d) => !d.provenance).length,
  0
);
const totalPoints = externalIndices.reduce((n, idx) => n + idx.data.length, 0);
console.log(
  `Indeks eksternal: ${totalPoints - unverifiedPoints}/${totalPoints} titik data berprovenance ` +
    `(${externalIndices.filter((i) => i.verification === "terverifikasi").length}/${externalIndices.length} indeks terverifikasi penuh)`
);

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
/**
 * Sumber yang merupakan ALAT UKUR rubrik. Tidak boleh muncul di `evidence`:
 * UUD 1945 tidak dapat membuktikan fakta apa pun, ia yang jadi pembanding.
 */
const baselineSrcIds = new Set(
  sourcesRaw.filter((s) => s.normative_baseline === true).map((s) => s.id)
);

// ---- sumber: registri tidak boleh punya id ganda ----
// Tanpa uji ini, `new Set(...)` di atas menelan duplikat tanpa suara dan
// teks kutipan yang menang bergantung urutan iterasi.
const seenSrcIds = new Set<string>();
for (const s of sourcesRaw) {
  if (seenSrcIds.has(s.id)) errors.push(`source ${s.id}: id ganda di sources.yaml`);
  seenSrcIds.add(s.id);
}
const eventIds = new Set(events.map((e) => e.id));
const actorIds = new Set(actors.map((a) => a.id));

// ---- aktor: identitas orang harus utuh dan tertaut ----
const seenActorIds = new Set<string>();
for (const a of actors) {
  if (seenActorIds.has(a.id)) errors.push(`actor ${a.id}: id ganda`);
  seenActorIds.add(a.id);
  for (const r of a.roles) {
    if (r.institution_id && !instIds.has(r.institution_id))
      errors.push(`actor ${a.id}: institution_id "${r.institution_id}" tidak ada`);
    if (r.term_id && !termIds.has(r.term_id))
      errors.push(`actor ${a.id}: term_id "${r.term_id}" tidak ada`);
  }
  for (const sid of a.source_ids)
    if (!srcIds.has(sid)) errors.push(`actor ${a.id}: sumber "${sid}" tidak terdaftar`);
}

for (const t of terms)
  for (const a of t.actors)
    if (a.actor_id && !actorIds.has(a.actor_id))
      errors.push(`term ${t.id}: actor_id "${a.actor_id}" (${a.name}) tidak ada di actors.yaml`);

// ---- perkara: tidak ada nama tanpa dokumen ----
for (const c of actorCases) {
  if (!actorIds.has(c.actor_id))
    errors.push(`actor_case ${c.id}: actor_id "${c.actor_id}" tidak ada di actors.yaml`);
  for (const sid of c.source_ids)
    if (!srcIds.has(sid)) errors.push(`actor_case ${c.id}: sumber "${sid}" tidak terdaftar`);
  for (const eid of c.event_ids)
    if (!eventIds.has(eid)) errors.push(`actor_case ${c.id}: event_id "${eid}" tidak terdaftar`);
}

for (const t of terms)
  if (!instIds.has(t.institution_id))
    errors.push(`term ${t.id}: institution_id "${t.institution_id}" tidak ada`);

for (const e of events) {
  if (!termIds.has(e.term_id)) errors.push(`event ${e.id}: term_id "${e.term_id}" tidak ada`);
  for (const s of e.source_ids)
    if (!srcIds.has(s)) errors.push(`event ${e.id}: sumber "${s}" tidak terdaftar`);
  for (const d of e.dimension_ids)
    if (!dimIds.has(d)) errors.push(`event ${e.id}: dimensi "${d}" tidak ada di rubrik`);
  for (const aid of e.actor_ids)
    if (!actorIds.has(aid)) errors.push(`event ${e.id}: actor_id "${aid}" tidak ada di actors.yaml`);
  if (e.subject_term_id) {
    if (!termIds.has(e.subject_term_id))
      errors.push(`event ${e.id}: subject_term_id "${e.subject_term_id}" tidak ada`);
    if (e.subject_term_id === e.term_id)
      errors.push(
        `event ${e.id}: subject_term_id sama dengan term_id - hapus saja, tidak ada re-atribusi di sini`
      );
    if (!e.subject_basis_id)
      errors.push(
        `event ${e.id}: subject_term_id diisi tanpa subject_basis_id - re-atribusi wajib bisa diaudit`
      );
    if (e.source_ids.length === 0)
      errors.push(
        `event ${e.id}: subject_term_id diisi tanpa sumber - periode yang diperiksa harus bisa ditelusuri`
      );
  }
}

for (const idx of externalIndices) {
  for (const dimId of idx.target_dimensions) {
    if (!dimIds.has(dimId))
      errors.push(`external_index ${idx.id}: target_dimension "${dimId}" tidak ada di rubrik`);
  }
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
    for (const ev of ds.evidence) {
      if (!srcIds.has(ev.source_id))
        errors.push(`assessment ${a.id}: bukti sumber "${ev.source_id}" tidak terdaftar`);
      if (baselineSrcIds.has(ev.source_id))
        errors.push(
          `assessment ${a.id} dim ${ds.dimension_id}: "${ev.source_id}" adalah landasan ` +
            `normatif, bukan bukti empiris - pindahkan ke normative_anchors`
        );
    }
    for (const na of ds.normative_anchors ?? [])
      if (!srcIds.has(na))
        errors.push(`assessment ${a.id}: jangkar normatif "${na}" tidak terdaftar`);
    for (const eid of ds.event_ids ?? [])
      if (!eventIds.has(eid))
        errors.push(`assessment ${a.id}: event_id "${eid}" tidak terdaftar`);
  }
}

for (const d of rubric.dimensions)
  if (!groupIds.has(d.group_id))
    errors.push(`dimensi ${d.id}: group_id "${d.group_id}" tidak ada`);

// ---- audit hak yang tak dapat dikurangi ----
// Penurunan otomatis dari legal_anchors_id dipakai sebagai AUDITOR, bukan
// sumber data: mesin skor hanya membaca `non_derogable`. Kalau penurunan ini
// jadi sumber data, salah tulis ("Pasal 28I ayat 1" tanpa tanda kurung) akan
// menghapus jaminan konstitusional tanpa terlihat. Sebagai auditor, ia
// menangkap kontributor yang menambah indikator penyiksaan lalu lupa flagnya.
const NON_DEROGABLE_PASAL = /28I\s*ayat\s*\(?\s*1\s*\)?/i;
for (const d of rubric.dimensions) {
  const menyebut = d.indicators.some((ind) =>
    ind.legal_anchors_id.some((a) => NON_DEROGABLE_PASAL.test(a))
  );
  if (menyebut && !d.non_derogable)
    errors.push(
      `dimensi ${d.id}: indikatornya menyebut Pasal 28I ayat (1) (hak yang tidak ` +
        `dapat dikurangi) tetapi non_derogable belum true`
    );
}

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
  actors,
  actor_cases: actorCases,
  events,
  sources: sourcesResolved,
  assessments: assessmentsEnriched,
  external_indices: externalIndices,
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(dataset, null, 2) + "\n");

// ---- laporan cakupan aktor: kekosongan harus terlihat, bukan tersembunyi ----
const termActors = terms.flatMap((t) => t.actors);
const unlinked = termActors.filter((a) => !a.actor_id).length;
const reattributed = events.filter((e) => e.subject_term_id).length;
const namedCorruptionEvents = events.filter((e) => e.actor_ids.length > 0).length;
console.log(
  `Aktor: ${actors.length} orang, ${actorCases.length} perkara bersitasi, ` +
    `${termActors.length - unlinked}/${termActors.length} kursi masa jabatan tertaut` +
    (unlinked > 0 ? ` (${unlinked} belum tertaut)` : "")
);
console.log(
  `Atribusi: ${reattributed} peristiwa punya subject_term_id, ` +
    `${namedCorruptionEvents} peristiwa menyebut aktor secara terstruktur`
);

console.log(
  `OK: ${institutions.length} lembaga, ${terms.length} masa jabatan, ` +
    `${events.length} peristiwa, ${sourcesResolved.length} sumber, ` +
    `${assessments.length} penilaian, ${uud.babs.length} bab UUD, ` +
    `${externalIndices.length} indeks eksternal -> generated/dataset.json`
);
