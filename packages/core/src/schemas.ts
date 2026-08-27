import { z } from "zod";

/**
 * Skala penilaian per dimensi: -2 .. +2
 *  -2 = melanggar berat terhadap norma
 *  -1 = cenderung menggerus norma
 *   0 = netral / tidak ada tindakan signifikan
 *  +1 = memperkuat norma secara konkret
 *  +2 = selaras penuh; memajukan norma secara teladan
 */
export const SCORE_MIN = -2;
export const SCORE_MAX = 2;

export const branchSchema = z.enum(["eksekutif", "legislatif", "yudikatif", "eksaminatif"]);
export type Branch = z.infer<typeof branchSchema>;

export const eraSchema = z.enum([
  "revolusi",
  "demokrasi-liberal",
  "demokrasi-terpimpin",
  "orde-baru",
  "reformasi",
]);
export type Era = z.infer<typeof eraSchema>;

const idField = (what: string) =>
  z
    .string()
    .min(1, `${what}: wajib diisi`)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, `${what}: format slug kecil-dengan-strip`);

// ---------------------------------------------------------------- sumber

export const sourceTypeSchema = z.enum([
  "undang-undang",
  "perppu",
  "keppres",
  "putusan-mk",
  "putusan-ma",
  "mputusan-mpd",
  "dokumen-mpr",
  "arsip-nasional",
  "jurnal",
  "buku",
  "berita",
  "laporan-lembaga",
  "lainnya",
]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const sourceSchema = z.object({
  id: idField("source.id"),
  type: sourceTypeSchema,
  title_id: z.string().min(3),
  year: z.number().int().min(1945).max(2100).optional(),
  url: z.string().url().optional(),
  citation_id: z.string().optional(),
  /** Diisi build: tautan yang pasti bisa dibuka (portal resmi/pencarian). */
  resolved_url: z.string().url().optional(),
});
export type Source = z.infer<typeof sourceSchema>;

// ---------------------------------------------------------------- lembaga

export const institutionSchema = z.object({
  id: idField("institution.id"),
  slug: idField("institution.slug"),
  branch: branchSchema,
  name_id: z.string().min(3),
  short_id: z.string().min(1),
  description_id: z.string().min(10),
});
export type Institution = z.infer<typeof institutionSchema>;

// ---------------------------------------------------------------- masa jabatan

export const actorSchema = z.object({
  name: z.string().min(2),
  role_id: z.string().min(2),
});

export const termSchema = z.object({
  id: idField("term.id"),
  institution_id: idField("term.institution_id"),
  label_id: z.string().min(3),
  era: eraSchema,
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  actors: z.array(actorSchema).default([]),
});
export type Term = z.infer<typeof termSchema>;

// ---------------------------------------------------------------- peristiwa

export const eventCategorySchema = z.enum([
  "produk-hukum",
  "kebijakan",
  "peristiwa",
  "krisis",
  "pengadilan",
  "pengangkatan",
]);

export const eventSchema = z.object({
  id: idField("event.id"),
  term_id: idField("event.term_id"),
  date: z.string().regex(/^\d{4}(-\d{2})?(-\d{2})?$/),
  category: eventCategorySchema,
  title_id: z.string().min(5),
  summary_id: z.string().min(15),
  source_ids: z.array(idField("event.source_ids")).default([]),
  dimension_ids: z.array(idField("event.dimension_ids")).default([]),
});
export type EventRecord = z.infer<typeof eventSchema>;

// ---------------------------------------------------------------- rubrik

const anchorScaleSchema = z.object({
  "-2": z.string(),
  "-1": z.string().optional(),
  "0": z.string(),
  "1": z.string().optional(),
  "2": z.string(),
});

export const rubricGroupSchema = z.object({
  id: idField("rubric.group.id"),
  name_id: z.string().min(3),
  description_id: z.string().min(10),
  weight: z.number().positive(),
});

export const rubricIndicatorSchema = z.object({
  id: idField("rubric.indicator.id"),
  name_id: z.string().min(3),
  legal_anchors_id: z.array(z.string()).default([]),
});

export const rubricDimensionSchema = z.object({
  id: idField("rubric.dimension.id"),
  group_id: idField("rubric.dimension.group_id"),
  name_id: z.string().min(3),
  question_id: z.string().min(10),
  weight: z.number().positive(),
  anchors: anchorScaleSchema,
  indicators: z.array(rubricIndicatorSchema).default([]),
});

export const rubricSchema = z.object({
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "rubric.version harus semver"),
  name_id: z.string().min(3),
  description_id: z.string().min(10),
  groups: z.array(rubricGroupSchema).min(1),
  dimensions: z.array(rubricDimensionSchema).min(1),
});
export type Rubric = z.infer<typeof rubricSchema>;
export type RubricGroup = z.infer<typeof rubricGroupSchema>;
export type RubricDimension = z.infer<typeof rubricDimensionSchema>;

// ---------------------------------------------------------------- peta UUD

export const uudPasalSchema = z.object({
  nomor: z.string().min(1).regex(/^[IVXLC]+[A-Z]*$|^\d+[A-Z]*$|^(I{1,3}|II)$/, "pasal.nomor tidak valid"),
  ringkas_id: z.string().min(10),
  dimension_ids: z.array(idField("pasal.dimension_ids")).default([]),
});
export type UudPasal = z.infer<typeof uudPasalSchema>;

export const uudBabSchema = z.object({
  nomor: z.string().min(1),
  nama_id: z.string().min(3),
  catatan_id: z.string().optional(),
  pasal: z.array(uudPasalSchema),
});
export type UudBab = z.infer<typeof uudBabSchema>;

export const uudSchema = z.object({
  title_id: z.string().min(5),
  description_id: z.string().min(10),
  babs: z.array(uudBabSchema).min(1),
});
export type UudMap = z.infer<typeof uudSchema>;

// ---------------------------------------------------------------- penilaian

export const evidenceSchema = z.object({
  source_id: idField("evidence.source_id"),
  note_id: z.string().optional(),
});

export const dimensionScoreSchema = z.object({
  dimension_id: idField("dimension_score.dimension_id"),
  score: z
    .number()
    .int()
    .min(SCORE_MIN)
    .max(SCORE_MAX),
  confidence: z.number().min(0).max(1),
  rationale_id: z.string().min(20),
  evidence: z.array(evidenceSchema).min(1),
  event_ids: z.array(idField("dimension_score.event_ids")).optional(),
  /**
   * Landasan normatif (pasal UUD) yang dinilai - BUKAN bukti empiris.
   * Ditampilkan terpisah di UI dan ikut menaikkan efektivitas keyakinan,
   * tetapi tidak boleh dibaca sebagai dukungan faktual atas skor.
   */
  normative_anchors: z.array(idField("dimension_score.normative_anchors")).optional(),
});

export const assessmentStatusSchema = z.enum(["draft", "published"]);

export const assessmentSchema = z
  .object({
    id: idField("assessment.id"),
    term_id: idField("assessment.term_id"),
    rubric_version: z.string().regex(/^\d+\.\d+\.\d+$/),
    status: assessmentStatusSchema,
    reviewers: z.array(z.string().min(2)).min(1),
    ai_suggested: z.boolean().default(false),
    human_confirmed: z.boolean().default(false),
    created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dimension_scores: z.array(dimensionScoreSchema).min(1),
  })
  .refine(
    (a) => a.status !== "published" || a.human_confirmed,
    "penilaian published wajib human_confirmed=true"
  );
export type Assessment = z.infer<typeof assessmentSchema>;
export type DimensionScore = z.infer<typeof dimensionScoreSchema>;
