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

function parseSemver(v: string): [number, number, number] {
  const match = v.trim().replace(/^v/, "").match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1] ?? "0", 10), parseInt(match[2] ?? "0", 10), parseInt(match[3] ?? "0", 10)];
}

function compareSemver(a: string, b: string): number {
  const [aMaj, aMin, aPat] = parseSemver(a);
  const [bMaj, bMin, bPat] = parseSemver(b);
  if (aMaj !== bMaj) return aMaj - bMaj;
  if (aMin !== bMin) return aMin - bMin;
  return aPat - bPat;
}

const rubricFiles = readdirSync(join(DATA, "rubric")).filter((f) => f.endsWith(".yaml"));
if (rubricFiles.length === 0) throw new Error("Tidak ada rubrik di data/rubric/");

const loadedRubrics = rubricFiles.map((file) => {
  const parsed = rubricSchema.parse(readYaml(join("rubric", file)));
  return { file, rubric: parsed };
});
loadedRubrics.sort((a, b) => compareSemver(a.rubric.version, b.rubric.version));
const rubric = loadedRubrics[loadedRubrics.length - 1]!.rubric;

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
  detail_url: `/arsip/${s.id}`,
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
// ---- peristiwa: id tidak boleh ganda (mencegah duplikat diam-diam ketika
// events.yaml legacy dan events/*.yaml terisi entitas yang sama) ----
const seenEventIds = new Set<string>();
for (const e of events) {
  if (seenEventIds.has(e.id))
    errors.push(`event ${e.id}: id ganda (events.yaml + events/*.yaml)`);
  seenEventIds.add(e.id);
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

// ---- deteksi near-duplikat (peringatan, bukan galat) ----
// Dua peristiwa yang berbagi sumber + tanggal + judul hampir identik hampir
// selalu merupakan duplikat. Dibunyikan agar tidak kembali menggelembung
// hitungan peristiwa secara diam-diam tanpa terlihat.
const normTitle = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const titleSim = (a: string, b: string) => {
  const wa = new Set(normTitle(a).split(" ").filter((w) => w.length > 2));
  const wb = new Set(normTitle(b).split(" ").filter((w) => w.length > 2));
  if (wa.size === 0 || wb.size === 0) return 0;
  let inter = 0;
  for (const w of wa) if (wb.has(w)) inter++;
  return inter / Math.min(wa.size, wb.size);
};
{
  const bySourceDate = new Map<string, typeof events>();
  for (const e of events) {
    const key = `${[...e.source_ids].sort().join("|")}::${e.date}`;
    if (!e.source_ids.length) continue;
    const arr = bySourceDate.get(key) ?? [];
    arr.push(e);
    bySourceDate.set(key, arr);
  }
  const nearDup: string[] = [];
  for (const arr of bySourceDate.values()) {
    if (arr.length < 2) continue;
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (titleSim(arr[i]!.title_id, arr[j]!.title_id) >= 0.85) {
          nearDup.push(`  ${arr[i]!.id} <-> ${arr[j]!.id}  (${arr[i]!.title_id})`);
        }
      }
    }
  }
  if (nearDup.length > 0) {
    console.warn(`\nPeringatan near-duplikat peristiwa (${nearDup.length}):`);
    for (const l of nearDup) console.warn(l);
    console.warn("Pertimbangkan menggabungkannya agar hitungan peristiwa tidak menggelembung.\n");
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
    for (const eq of ds.expert_quotes ?? [])
      if (eq.source_id && !srcIds.has(eq.source_id))
        errors.push(`assessment ${a.id}: expert_quote sumber "${eq.source_id}" (${eq.author}) tidak terdaftar`);
  }
}

let totalExpertQuotes = 0;
let dialecticDimensions = 0;
for (const a of assessments) {
  for (const ds of a.dimension_scores) {
    if (ds.expert_quotes?.length) totalExpertQuotes += ds.expert_quotes.length;
    if (ds.thesis_id || ds.antithesis_id) dialecticDimensions++;
  }
}
console.log(`Analisis ilmiah: ${totalExpertQuotes} kutipan langsung pakar terverifikasi, ${dialecticDimensions} skor berdialektika tesis-antitesis`);

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

// ---------------------------------------------------------------- pagar anti-halusinasi
//
// Audit integritas 4 September 2026 menemukan 554 dari 579 skor dimensi berisi
// dialektika, kutipan pakar, dan sitasi hasil pembangkitan template - termasuk
// tokoh yang telah wafat "mengomentari" peristiwa puluhan tahun setelah
// kematiannya. Pagar di bawah ini membuat pola tersebut mustahil lolos build
// lagi. Ambangnya sengaja ketat: kalimat analitis yang sah tidak akan pernah
// terulang identik di puluhan penilaian berbeda.

/** Satu kalimat analisis boleh dipakai ulang paling banyak sekian kali. */
const AMBANG_PENGULANGAN = 3;

const sourceYearById = new Map(sourcesRaw.map((s) => [s.id, s.year]));

function catatPengulangan(map: Map<string, string[]>, teks: string | undefined, di: string) {
  if (!teks) return;
  const kunci = teks.trim().toLowerCase();
  if (kunci.length < 40) return;
  const list = map.get(kunci) ?? [];
  list.push(di);
  map.set(kunci, list);
}

const antitesisTerpakai = new Map<string, string[]>();
const sintesisTerpakai = new Map<string, string[]>();
const kutipanTerpakai = new Map<string, string[]>();

/** Catatan bukti hasil penempelan massal skrip pengayaan. */
const CATATAN_TEMPLATE = /^Kutipan (analisis )?struktural/i;

/**
 * Label skor kanonik pada teks sintesis, mis. "skor Baik (+1)" atau
 * "Penilaian regresi (-2)". Sengaja ditambatkan pada kata "skor"/"penilaian"
 * agar rujukan pasal seperti "Pasal 28I ayat (1)" tidak salah tangkap.
 */
const LABEL_SKOR = /\b(?:skor|penilaian)\b[^.]{0,48}?\(([+-][0-2]|0)\)/i;

for (const a of assessments) {
  for (const ds of a.dimension_scores) {
    const di = `${a.id}/${ds.dimension_id}`;
    catatPengulangan(antitesisTerpakai, ds.antithesis_id, di);
    catatPengulangan(sintesisTerpakai, ds.synthesis_id, di);
    for (const ev of ds.evidence) {
      if (ev.note_id && CATATAN_TEMPLATE.test(ev.note_id.trim())) {
        errors.push(
          `${di}: evidence "${ev.source_id}" bercatatan template "${ev.note_id.slice(0, 40)}..." - ` +
            `buku ajar umum yang ditempel massal bukan bukti empiris bagi skor spesifik`
        );
      }
    }

    // (1) Label skor pada sintesis wajib cocok dengan angka `score`.
    const label = ds.synthesis_id?.match(LABEL_SKOR);
    if (label && Number(label[1]) !== ds.score) {
      errors.push(
        `${di}: synthesis_id menulis skor (${label[1]}) sedangkan score = ${ds.score}`
      );
    }

    for (const q of ds.expert_quotes ?? []) {
      catatPengulangan(kutipanTerpakai, q.quote, di);

      // (2) Anti-anakronisme: kutipan disitasi DARI sebuah terbitan, maka
      //     tahunnya tidak boleh menyimpang dari tahun terbit sumber itu.
      if (q.source_id && q.year !== undefined) {
        const tahunSumber = sourceYearById.get(q.source_id);
        if (typeof tahunSumber === "number" && q.year !== tahunSumber) {
          errors.push(
            `${di}: expert_quote tahun ${q.year} tidak cocok dengan tahun terbit ` +
              `sumber ${q.source_id} (${tahunSumber}) - kutipan wajib bertahun terbitannya`
          );
        }
      }

      // (3) Penutur kutipan harus orang, bukan nama jurnal atau lembaga.
      if (/^(jurnal|constitutional review|mimbar hukum|masalah-masalah hukum|padjadjaran)/i.test(q.author)) {
        errors.push(
          `${di}: expert_quote beratribusi "${q.author}" - nama terbitan tidak bisa ` +
            `mengucapkan kutipan lisan; isi nama penulisnya`
        );
      }
    }

    // (4) Kalimat tesis tidak boleh terpotong di tengah nomor dokumen hukum.
    for (const [field, teks] of [
      ["thesis_id", ds.thesis_id],
      ["antithesis_id", ds.antithesis_id],
      ["synthesis_id", ds.synthesis_id],
    ] as const) {
      if (teks && /\b(No|Nomor|Pasal|UU|TAP|Perppu)\.?$/.test(teks.trim())) {
        errors.push(`${di}: ${field} terpotong di tengah nomor dokumen ("...${teks.trim().slice(-24)}")`);
      }
    }
  }
}

for (const [label, map] of [
  ["antithesis_id", antitesisTerpakai],
  ["synthesis_id", sintesisTerpakai],
  ["expert_quote", kutipanTerpakai],
] as const) {
  for (const [teks, dipakai] of map) {
    if (dipakai.length <= AMBANG_PENGULANGAN) continue;
    errors.push(
      `${label} identik dipakai ${dipakai.length}x (ambang ${AMBANG_PENGULANGAN}) di ` +
        `${dipakai.slice(0, 4).join(", ")}${dipakai.length > 4 ? ", ..." : ""}: ` +
        `"${teks.slice(0, 70)}..." - kalimat analitis wajib ditulis per dimensi, ` +
        `bukan ditempel massal`
    );
  }
}

// (5) Dokumen administratif daerah tidak boleh jadi bukti peristiwa bagi
//     penilaian organ konstitusional nasional (metric stuffing).
const eventById = new Map(events.map((e) => [e.id, e]));
const POLA_DAERAH = /^ev-rescue-(regional|peraturan-gubernur|peraturan-daerah|keputusan-gubernur)-/;
for (const a of assessments) {
  for (const ds of a.dimension_scores) {
    for (const eid of ds.event_ids ?? []) {
      if (POLA_DAERAH.test(eid)) {
        errors.push(
          `${a.id}/${ds.dimension_id}: peristiwa "${eid}" adalah dokumen administratif ` +
            `daerah dan tidak boleh menjadi bukti penilaian organ nasional`
        );
      }
      const ev = eventById.get(eid);
      if (ev && /^Dokumentasi Historis:/.test(ev.title_id)) {
        errors.push(
          `${a.id}/${ds.dimension_id}: peristiwa "${eid}" masih berboilerplate ` +
            `"Dokumentasi Historis:" - bukan peristiwa ketatanegaraan`
        );
      }
    }
  }
}

// (5b) Ringkasan peristiwa tidak boleh boilerplate massal: satu paragraf yang
//      sama pada puluhan "peristiwa" berbeda adalah pengisi metrik.
const ringkasanTerpakai = new Map<string, string[]>();
for (const e of events) {
  const kunci = e.summary_id.trim().toLowerCase();
  const list = ringkasanTerpakai.get(kunci) ?? [];
  list.push(e.id);
  ringkasanTerpakai.set(kunci, list);
}
for (const [teks, ids] of ringkasanTerpakai) {
  if (ids.length < 2) continue;
  errors.push(
    `ringkasan peristiwa identik dipakai ${ids.length}x (${ids.slice(0, 3).join(", ")}` +
      `${ids.length > 3 ? ", ..." : ""}): "${teks.slice(0, 60)}..." - setiap peristiwa ` +
      `wajib punya uraian sendiri`
  );
}

// (5c) Judul peristiwa yang nyaris sama dalam satu masa jabatan & tanggal
//      adalah duplikat, sekalipun tidak menyebut nomor dokumen hukum.
const judulTerpakai = new Map<string, string[]>();
for (const e of events) {
  const inti = e.title_id
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .sort()
    .join(" ");
  const kunci = `${e.term_id}::${e.date}::${inti}`;
  judulTerpakai.set(kunci, [...(judulTerpakai.get(kunci) ?? []), e.id]);
}
for (const [kunci, ids] of judulTerpakai) {
  if (ids.length < 2) continue;
  errors.push(
    `peristiwa duplikat: ${ids.join(", ")} berjudul sama pada masa jabatan & tanggal ` +
      `yang sama (${kunci.split("::").slice(0, 2).join(" ")}) - gabungkan`
  );
}

// (5d) Label pabrikan pada judul peristiwa.
for (const e of events) {
  if (/^(Dokumentasi Historis|Penerbitan Kebijakan Eksekutif|Putusan Peradilan):/.test(e.title_id)) {
    errors.push(
      `peristiwa ${e.id}: judul berlabel pabrikan "${e.title_id.split(":")[0]}:" - ` +
        `tulis judul peristiwanya, bukan kategori generatornya`
    );
  }
}

// (6) Dua peristiwa dalam satu masa jabatan yang menunjuk nomor dokumen hukum
//     yang sama adalah duplikat - `source::date` saja tidak cukup karena
//     tanggal beda satu hari sudah lolos.
const NOMOR_DOKUMEN = /\b(?:UU|TAP MPR|Perppu|PP|Perpres|Keppres|Putusan(?: MK| MA| MKMK)?)\s*(?:No\.?|Nomor)?\s*(\d{1,3})[\/ ](?:PUU-[A-Z]+\/)?(\d{4})/gi;
const sidikJari = new Map<string, string[]>();
for (const e of events) {
  const cocok = [...e.title_id.matchAll(NOMOR_DOKUMEN)];
  for (const m of cocok) {
    // Tanggal ikut jadi kunci: satu produk hukum yang sah dicatat dua kali
    // pada tanggal berbeda (pengesahan vs perubahan) bukan duplikat.
    const kunci = `${e.term_id}::${e.date}::${m[0].replace(/\s+/g, "").toLowerCase()}`;
    const list = sidikJari.get(kunci) ?? [];
    list.push(e.id);
    sidikJari.set(kunci, list);
  }
}
for (const [kunci, ids] of sidikJari) {
  if (ids.length < 2) continue;
  errors.push(
    `peristiwa duplikat: ${ids.join(", ")} sama-sama menunjuk dokumen "${kunci.split("::")[1]}" ` +
      `pada masa jabatan yang sama - gabungkan menjadi satu catatan kanonik`
  );
}

// (6b) Klaim provenance sumber harus dapat ditagih.
//      `archive_ok` hanya bermakna bersama `r2_key`; dan beranda lembaga atau
//      penerbit tidak membuktikan keberadaan dokumen yang disitasi.
function hanyaBeranda(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (u.pathname === "/" || u.pathname === "") && !u.search;
  } catch {
    return false;
  }
}
for (const s of sourcesRaw) {
  if (s.archive_ok !== undefined && !s.r2_key) {
    errors.push(
      `sumber ${s.id}: menyatakan archive_ok tanpa r2_key - medan itu hanya bermakna ` +
        `bila ada salinan arsip R2`
    );
  }
  if (
    s.verification_tier === "official_source" &&
    !s.r2_key &&
    (!s.url || hanyaBeranda(s.url))
  ) {
    errors.push(
      `sumber ${s.id}: verification_tier "official_source" tanpa salinan arsip dan ` +
        `tanpa tautan dokumen (${s.url ?? "tanpa url"}) - beranda lembaga tidak ` +
        `membuktikan dokumennya; pakai "unverified"`
    );
  }
  if (s.verification_tier === undefined) {
    errors.push(
      `sumber ${s.id}: verification_tier wajib diisi - derajat verifikasi tidak ` +
        `boleh dibiarkan tersirat`
    );
  }
}

// (6c) Satu dimensi hanya boleh dinilai sekali per masa jabatan, dan rasional
//      tidak boleh dipakai ulang lintas masa jabatan. Rasional yang sama pada
//      beberapa periode berarti yang ditulis adalah uraian tugas lembaga,
//      bukan penilaian atas periode tertentu - dan itu memaksa anakronisme
//      (mis. MK 2003-2008 "menghasilkan" putusan tahun 2013).
for (const a of assessments) {
  const terlihat = new Set<string>();
  for (const ds of a.dimension_scores) {
    if (terlihat.has(ds.dimension_id)) {
      errors.push(`${a.id}: dimensi "${ds.dimension_id}" dinilai lebih dari sekali`);
    }
    terlihat.add(ds.dimension_id);
  }
}

const rasionalTerpakai = new Map<string, string[]>();
for (const a of assessments) {
  for (const ds of a.dimension_scores) {
    const kunci = ds.rationale_id.trim().toLowerCase();
    rasionalTerpakai.set(kunci, [...(rasionalTerpakai.get(kunci) ?? []), `${a.id}/${ds.dimension_id}`]);
  }
}
/*
 * Audit lanjutan 4 September 2026 menemukan 59 klaster rasional kembar yang
 * menjangkiti 248 skor - uraian tugas lembaga disalin ke setiap masa jabatan
 * organ yang sama, sehingga MK 2003-2008 "menghasilkan" Putusan 85/PUU-XI/2013
 * dan MPR 1971-1999 "menetapkan" TAP IX/MPR/2001. Selama utang itu belum
 * dilunasi, pelanggarannya dilaporkan keras di setiap build alih-alih
 * menggagalkannya; ambang ini WAJIB dinaikkan menjadi error begitu angkanya nol.
 */
const rasionalKembar = [...rasionalTerpakai].filter(([, dipakai]) => dipakai.length > 1);
if (rasionalKembar.length > 0) {
  const skorTerdampak = rasionalKembar.reduce((n, [, d]) => n + d.length, 0);
  console.warn(
    `PERINGATAN rasional kembar: ${rasionalKembar.length} klaster menjangkiti ` +
      `${skorTerdampak} skor dimensi - rasional wajib menilai masa jabatan yang ` +
      `bersangkutan, bukan menguraikan tugas lembaganya. Lihat docs/remediasi-audit-2026-09.md.`
  );
  for (const [teks, dipakai] of rasionalKembar.slice(0, 5)) {
    console.warn(`  ${dipakai.length}x ${dipakai.slice(0, 3).join(", ")}: "${teks.slice(0, 60)}..."`);
  }
}

// (7) Klaim pengawasan manusia EU AI Act Pasal 14 harus punya penelaah nyata.
for (const a of assessments) {
  const ho = a.ai_disclosure?.human_oversight;
  if (!ho) continue;
  if (ho.status === "verified" && ho.approvers.length === 0) {
    errors.push(`${a.id}: human_oversight berstatus "verified" tanpa satu pun approver bernama`);
  }
  if (a.human_confirmed && ho.status === "draft") {
    errors.push(`${a.id}: human_confirmed=true tetapi human_oversight masih berstatus draft`);
  }
}

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

// ---- laporan integritas: sumber/peristiwa yatim harus terlihat ----
// Sumber yang tidak dipakai siapa pun, dan peristiwa yang tidak tersambung
// ke penilaian apa pun, adalah kekosongan yang harus dipertanggungjawabkan
// (bukan disimpan diam-diam).
const referencedSrcIds = new Set<string>();
for (const e of events) for (const sid of e.source_ids) referencedSrcIds.add(sid);
for (const a of assessments)
  for (const ds of a.dimension_scores)
    for (const ev of ds.evidence) referencedSrcIds.add(ev.source_id);
const orphanSources = sourcesRaw.filter(
  (s) => !referencedSrcIds.has(s.id) && !baselineSrcIds.has(s.id)
);
const assessmentEventIds = new Set<string>();
for (const a of assessments)
  for (const ds of a.dimension_scores)
    for (const eid of ds.event_ids ?? []) assessmentEventIds.add(eid);
const lonelyEvents = events.filter((e) => !assessmentEventIds.has(e.id));
console.log(
  `Integritas: ${orphanSources.length} sumber yatim, ${lonelyEvents.length} peristiwa yatim`
);
if (orphanSources.length > 0) {
  console.log(
    `  sumber yatim: ${orphanSources.slice(0, 12).map((s) => s.id).join(", ")}` +
      (orphanSources.length > 12 ? ` (+${orphanSources.length - 12})` : "")
  );
}

console.log(
  `OK: ${institutions.length} lembaga, ${terms.length} masa jabatan, ` +
    `${events.length} peristiwa, ${sourcesResolved.length} sumber, ` +
    `${assessments.length} penilaian, ${uud.babs.length} bab UUD, ` +
    `${externalIndices.length} indeks eksternal -> generated/dataset.json`
);
