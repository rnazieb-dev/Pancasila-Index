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

/**
 * Field terjemahan opsional untuk selain Bahasa Indonesia.
 * Locale yang didukung: en, jv (Jawa), su (Sunda), mad (Madura), min (Minang).
 * Bila tidak diisi, tampilan jatuh kembali ke `*_id` (Bahasa Indonesia).
 *
 * Field i18n tidak wajib untuk seluruh entitas — kontributor yang
 * mampu menerjemahkan akan menambahkan bila tersedia, dan yang belum
 * akan tetap muncul dalam Bahasa Indonesia. Prinsip: "lebih baik
 * satu bahasa lengkap daripada setengah-setengah".
 */
const I18N_LOCALES = ["en", "jv", "su", "mad", "min"] as const;
export type I18nLocale = (typeof I18N_LOCALES)[number];

/** Helper: tambahkan field i18n (title/summary/description) opsional ke schema. */
export const i18nString = (what: string) =>
  z.string().min(3, `${what}: minimal 3 karakter`).optional();

/** Helper: tambahkan sekumpulan field i18n (title + summary) ke schema. */
export const i18nFields = (key: string) =>
  z
    .object(
      Object.fromEntries(
        I18N_LOCALES.flatMap((loc) => [
          [`title_${loc}`, i18nString(`${key}.title_${loc}`)],
          [`summary_${loc}`, i18nString(`${key}.summary_${loc}`)],
        ]),
      ),
    )
    .partial();

// ---------------------------------------------------------------- sumber

export const sourceTypeSchema = z.enum([
  "undang-undang",
  "perppu",
  "keppres",
  "inpres",
  "putusan-mk",
  "putusan-ma",
  "putusan-mpd",
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
  /**
   * Sumber ini adalah ALAT UKUR rubrik, bukan perbuatan yang diukur.
   * UUD 1945 dan dokumen yang membentuknya tidak dapat menjadi bukti
   * empiris atas fakta apa pun: ia yang dijadikan pembanding. Sumber
   * bertanda ini ditolak di dalam `evidence` (lihat build.mts) dan hanya
   * boleh muncul di `normative_anchors`.
   *
   * Sebuah UU biasa TIDAK bertanda ini: mengesahkan UU adalah perbuatan
   * lembaga yang dinilai, jadi sah sebagai bukti.
   */
  normative_baseline: z.boolean().optional(),
  title_id: z.string().min(3),
  ...i18nFields("source").shape,
  year: z.number().int().min(1800).max(2100).optional(),
  url: z.string().url().optional(),
  citation_id: z.string().optional(),
  r2_key: z.string().optional(),
  archive_url: z.string().url().optional(),
  /**
   * false = arsip di R2 untuk sumber ini terkonfirmasi rusak (snapshot
   * halaman blokir-bot situs sumber, bukan dokumen asli - lihat
   * docs/audit-source-url-mati-2026-09.md). Sengaja tidak dihapus dari
   * dataset - ditandai eksplisit agar UI tidak menyajikannya seolah valid.
   * Default (tidak diisi) = dianggap valid.
   */
  archive_ok: z.boolean().optional(),
  /** Diisi build: tautan yang pasti bisa dibuka (portal resmi/pencarian). */
  resolved_url: z.string().url().optional(),
  /** Diisi build: path halaman dokumen di situs ini (/arsip/<id>). */
  detail_url: z.string().min(1).optional(),
  /**
   * URI kanonik ala Akoma Ntoso, mengikuti konvensi pasal.id
   * (/akn/id/act/{jenis}/{tahun}/{nomor} untuk UU/PP/dst,
   * /akn/id/judgment/{lane}/{tahun}/{nomor} untuk putusan MK - format asli
   * yang dipakai pasal.id sendiri).
   *
   * pasal.id TIDAK mencakup putusan MA individual maupun arsip ANRI, jadi
   * untuk dua kelas sumber itu kita definisikan namespace sendiri yang
   * konsisten dengan pola yang sama, supaya integrasi ke penyedia lain di
   * masa depan (kalau ada yang mencakup MA/ANRI dengan skema akn serupa)
   * tinggal cocok tanpa migrasi ulang:
   * - /akn/id/judgment/putusan-ma/{tahun}/{slug} untuk putusan MA
   * - /akn/id/archive/anri/{tahun}/{slug} untuk arsip ANRI
   */
  frbr_uri: z.string().optional(),
  /** true = isi sumber sudah diverifikasi manusia terhadap dokumen resmi asli. */
  content_verified: z.boolean().optional(),
  /**
   * Tingkat verifikasi ala pasal.id (verification.tier):
   * - human_verified: ditinjau manusia terhadap naskah resmi
   * - official_source: diambil langsung dari domain resmi, belum ditinjau manusia
   * - unverified: belum diverifikasi sama sekali
   */
  verification_tier: z
    .enum(["human_verified", "official_source", "unverified"])
    .optional(),
});
export type Source = z.infer<typeof sourceSchema>;

// ---------------------------------------------------------------- lembaga

export const institutionSchema = z.object({
  id: idField("institution.id"),
  slug: idField("institution.slug"),
  branch: branchSchema,
  name_id: z.string().min(3),
  ...i18nFields("institution").shape,
  short_id: z.string().min(1),
  description_id: z.string().min(10),
});
export type Institution = z.infer<typeof institutionSchema>;

// ---------------------------------------------------------------- masa jabatan

/**
 * Aktor sebagaimana tercantum di dalam satu masa jabatan.
 * `actor_id` menautkannya ke entitas orang kanonik di data/actors.yaml;
 * dibiarkan opsional agar masa jabatan lama tetap valid selama migrasi.
 */
export const termActorSchema = z.object({
  name: z.string().min(2),
  role_id: z.string().min(2),
  actor_id: idField("term.actor.actor_id").optional(),
});
/** @deprecated pakai termActorSchema; alias dipertahankan untuk kompatibilitas. */
export const actorSchema = termActorSchema;
export type TermActor = z.infer<typeof termActorSchema>;

export const termSchema = z.object({
  id: idField("term.id"),
  institution_id: idField("term.institution_id"),
  label_id: z.string().min(3),
  ...i18nFields("term").shape,
  era: eraSchema,
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  actors: z.array(termActorSchema).default([]),
});
export type Term = z.infer<typeof termSchema>;

// ------------------------------------------------------------------- aktor

/**
 * Jabatan yang pernah diduduki seseorang. `term_id` diisi bila jabatan itu
 * memang salah satu masa jabatan pimpinan 8 organ konstitusional; dibiarkan
 * kosong untuk jabatan di luar itu (menteri, kepala daerah, hakim non-ketua,
 * direksi BUMN) yang tetap perlu tercatat namun bukan unit penilaian rubrik.
 */
export const actorRoleSchema = z.object({
  title_id: z.string().min(2),
  institution_id: idField("actor.role.institution_id").optional(),
  term_id: idField("actor.role.term_id").optional(),
  /**
   * Opsional: untuk jabatan di luar 8 organ konstitusional, dokumen sumber
   * sering hanya menyebut jabatannya tanpa tanggal. Lebih baik jabatan
   * tercatat tanpa tanggal daripada tanggal dikarang.
   */
  start_date: z
    .string()
    .regex(/^\d{4}(-\d{2})?(-\d{2})?$/)
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}(-\d{2})?(-\d{2})?$/)
    .nullable()
    .default(null),
  note_id: z.string().optional(),
});
export type ActorRole = z.infer<typeof actorRoleSchema>;

/**
 * Entitas orang kanonik. Sengaja tidak memuat penilaian apa pun: indeks
 * dihitung per masa jabatan lembaga, bukan per kepala. Profil orang hanya
 * mengagregasi jabatan, peristiwa, dan perkara yang sudah bersitasi.
 */
export const actorProfileSchema = z.object({
  id: idField("actor.id"),
  name: z.string().min(2),
  aliases: z.array(z.string().min(2)).default([]),
  roles: z.array(actorRoleSchema).min(1, "actor.roles: minimal satu jabatan"),
  bio_id: z.string().optional(),
  /** Sumber untuk identitas & riwayat jabatan (bukan untuk perkara). */
  source_ids: z.array(idField("actor.source_ids")).default([]),
});
export type ActorProfile = z.infer<typeof actorProfileSchema>;

/**
 * Status hukum seseorang dalam satu perkara, wajib eksplisit.
 * Tanpa ini, tampilan indeks mudah membaca "disebut di berita" sebagai
 * "sudah bersalah" - asas praduga tak bersalah harus terbaca di data.
 */
export const legalStatusSchema = z.enum([
  "terlapor",
  "tersangka",
  "terdakwa",
  "terpidana",
  "inkracht",
  "bebas",
  "dihentikan",
]);
export type LegalStatus = z.infer<typeof legalStatusSchema>;

/**
 * Perkara hukum yang melibatkan seorang aktor.
 * `source_ids` minimal satu: tidak ada nama yang boleh masuk tanpa dokumen.
 */
export const actorCaseSchema = z.object({
  id: idField("actor_case.id"),
  actor_id: idField("actor_case.actor_id"),
  title_id: z.string().min(5),
  ...i18nFields("actor_case").shape,
  status: legalStatusSchema,
  status_date: z.string().regex(/^\d{4}(-\d{2})?(-\d{2})?$/),
  /** Nomor putusan / register perkara bila sudah masuk pengadilan. */
  decision_ref: z.string().optional(),
  /** Kerugian negara dalam rupiah, hanya bila diaudit resmi. */
  loss_idr: z.number().nonnegative().optional(),
  sentence_id: z.string().optional(),
  summary_id: z.string().min(15),
  source_ids: z
    .array(idField("actor_case.source_ids"))
    .min(1, "actor_case.source_ids: perkara wajib bersitasi minimal satu sumber"),
  event_ids: z.array(idField("actor_case.event_ids")).default([]),
});
export type ActorCase = z.infer<typeof actorCaseSchema>;

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
  // Terjemahan opsional (lihat I18N_LOCALES). Bila kosong, tampilan
  // tetap memakai title_id/summary_id (Bahasa Indonesia).
  ...i18nFields("event").shape,
  source_ids: z.array(idField("event.source_ids")).default([]),
  dimension_ids: z.array(idField("event.dimension_ids")).default([]),
  /** Orang-orang yang menjadi subjek peristiwa ini (data/actors.yaml). */
  actor_ids: z.array(idField("event.actor_ids")).default([]),
  /**
   * Masa jabatan yang menjadi *subjek* peristiwa, bila berbeda dari `term_id`
   * yang mencatatnya. Dipakai ketika sebuah lembaga pengawas/pengadil
   * (BPK, MA, KY) membongkar perkara yang pelakunya duduk di lembaga lain:
   * `term_id` = yang membongkar, `subject_term_id` = yang diperiksa.
   */
  subject_term_id: idField("event.subject_term_id").optional(),
  /**
   * Dasar penetapan `subject_term_id`: periode yang diperiksa menurut dokumen
   * yang disitasi. Wajib diisi bila `subject_term_id` diisi (dijaga build),
   * agar re-atribusi bisa diaudit dan tidak jadi tebakan sejarah.
   */
  subject_basis_id: z.string().min(10).optional(),
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
  /**
   * Dimensi ini memuat hak yang TIDAK DAPAT DIKURANGI dalam keadaan apa pun
   * (Pasal 28I ayat (1) UUD 1945: hak hidup, hak bebas dari penyiksaan).
   *
   * Pelanggaran pada dimensi bertanda ini membatasi komposit dan tidak dapat
   * dilunasi capaian di dimensi lain - lihat scoring.ts. Mesin skor HANYA
   * membaca field ini; build.mts memverifikasinya terhadap
   * `indicators[].legal_anchors_id` sebagai auditor, bukan sumber data,
   * karena jangkar itu teks bebas dan salah tulis akan menghapus jaminan
   * konstitusional tanpa terlihat.
   */
  non_derogable: z.boolean().default(false),
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

export const expertQuoteSchema = z.object({
  quote: z.string().min(5),
  author: z.string().min(2),
  role: z.string().min(2),
  source_id: idField("expert_quote.source_id").optional(),
  year: z.number().int().optional(),
});
export type ExpertQuote = z.infer<typeof expertQuoteSchema>;

export const dimensionScoreSchema = z.object({
  dimension_id: idField("dimension_score.dimension_id"),
  score: z
    .number()
    .int()
    .min(SCORE_MIN)
    .max(SCORE_MAX),
  confidence: z.number().min(0).max(1),
  rationale_id: z.string().min(20),
  /** Dalil yuridis formal / pembelaan kebijakan resmi lembaga pembuat keputusan. */
  thesis_id: z.string().optional(),
  /** Sanggahan kritis doktriner para pakar, dissenting opinion, dan realitas empiris lapangan. */
  antithesis_id: z.string().optional(),
  /** Pertimbangan penimbangan konstitusional penentu skor indeks. */
  synthesis_id: z.string().optional(),
  /** Kutipan langsung perkataan pakar hukum tata negara, hakim, atau sejarawan terpercaya. */
  expert_quotes: z.array(expertQuoteSchema).optional(),
  /**
   * Bukti empiris. Boleh kosong HANYA bila `evidence_gap: true` — dan skor
   * seperti itu dikeluarkan dari perhitungan indeks (lihat scoring.ts),
   * jadi mengosongkannya tidak menguntungkan siapa pun.
   */
  evidence: z.array(evidenceSchema),
  event_ids: z.array(idField("dimension_score.event_ids")).optional(),
  /**
   * Landasan normatif (pasal UUD) yang dinilai - BUKAN bukti empiris.
   * Ditampilkan terpisah di UI dan ikut menaikkan efektivitas keyakinan,
   * tetapi tidak boleh dibaca sebagai dukungan faktual atas skor.
   */
  normative_anchors: z.array(idField("dimension_score.normative_anchors")).optional(),
  /**
   * Pengakuan eksplisit bahwa skor ini belum berbukti empiris. Skor
   * bertanda ini TIDAK ikut membentuk indeks; ia tampil sebagai penilaian
   * yang menunggu bukti. Sebelumnya celah semacam ini tersembunyi dengan
   * mencantumkan UUD 1945 di `evidence` sehingga `min(1)` terpenuhi.
   */
  evidence_gap: z.boolean().optional(),
  ai_disclosure: z.lazy(() => aiDisclosureSchema).optional(),
})
  .refine(
    (ds) => ds.evidence.length > 0 || ds.evidence_gap === true,
    "dimension_score tanpa evidence wajib menyatakan evidence_gap: true"
  );

/**
 * Metadata transparansi kepatuhan EU Artificial Intelligence Act
 * (Regulation (EU) 2024/1689 Article 50 & Article 14).
 */
export const aiDisclosureSchema = z.object({
  assisted: z.boolean().default(false),
  model_id: z.string().default("gemini-3.8-flash-high"),
  model_provider: z.string().default("Google DeepMind"),
  pipeline_version: z.string().default("pancasila-nlp-v1.5"),
  analysis_type: z
    .enum(["heuristic-classification", "llm-assisted-synthesis", "human-verified-only"])
    .default("llm-assisted-synthesis"),
  temperature: z.number().optional(),
  human_oversight: z
    .object({
      mechanism: z.literal("quorum-2-reviewers").default("quorum-2-reviewers"),
      /**
       * `draft` = belum ada penelaah manusia sama sekali. Nilai ini WAJIB
       * dipakai selama `approver_count === 0`; mengklaim `verified` tanpa
       * approver nyata adalah pelanggaran EU AI Act Pasal 14.
       */
      status: z.enum(["verified", "pending_second_review", "draft"]).default("draft"),
      approver_count: z.number().int().min(0).default(0),
      /** Nama penelaah manusia sungguhan - bukan label peran generik. */
      approvers: z.array(z.string()).default([]),
    })
    .default({})
    .refine(
      (h) => h.approvers.length === h.approver_count,
      "human_oversight.approver_count wajib sama dengan jumlah nama approvers"
    )
    .refine(
      (h) => h.status === "draft" || h.approver_count > 0,
      "human_oversight berstatus terverifikasi wajib punya minimal satu approver bernama"
    ),
  /**
   * Jejak remediasi otomatis (mis. pencabutan materi hasil halusinasi model
   * terdahulu). Dicatat terpisah agar model yang membangkitkan draf tidak
   * tertukar dengan model yang membersihkannya.
   */
  remediation: z
    .object({
      model_id: z.string(),
      model_provider: z.string(),
      performed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      notes_id: z.string().optional(),
    })
    .optional(),
  limitations_notice: z
    .string()
    .default(
      "Sintesis analitis dibantu oleh model AI untuk klasifikasi awal dan perumusan draf. Otoritas kebenaran dan validitas hukum kanonik sepenuhnya diverifikasi oleh penelaah manusia terhadap dokumen primer Lembaran Negara dan Putusan Peradilan."
    ),
  eu_ai_act_compliance: z
    .object({
      article_50_compliant: z.literal(true).default(true),
      transparency_tag: z.string().default("EU-AI-ACT-ART-50-DISCLOSED"),
    })
    .default({}),
});
export type AiDisclosure = z.infer<typeof aiDisclosureSchema>;

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
    ai_disclosure: aiDisclosureSchema.optional(),
    created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dimension_scores: z.array(dimensionScoreSchema).min(1),
  })
  .refine(
    (a) => a.status !== "published" || a.human_confirmed,
    "penilaian published wajib human_confirmed=true"
  );
export type Assessment = z.infer<typeof assessmentSchema>;
export type DimensionScore = z.infer<typeof dimensionScoreSchema>;

// ---------------------------------------------------------------- indeks eksternal

export const externalIndexTypeSchema = z.enum([
  "hard-data",
  "expert-coded",
  "civil-society",
  "official-self-assessment",
]);
export type ExternalIndexType = z.infer<typeof externalIndexTypeSchema>;

/**
 * Asal-usul satu angka. Tanpa ini sebuah titik data tidak bisa dibedakan
 * dari karangan, dan itulah cacat yang membuat blok "Konteks Independen"
 * sempat berisi angka tak berdasar.
 */
export const provenanceSchema = z.object({
  /** Tautan tepat ke halaman/berkas tempat angka ini terbaca. */
  url: z.string().url(),
  retrieved_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  method: z.enum([
    "unduh-dataset",
    "halaman-penerbit",
    "siaran-pers",
    "laporan-pdf",
    "pencarian-web",
  ]),
  note_id: z.string().optional(),
});
export type Provenance = z.infer<typeof provenanceSchema>;

export const externalDataPointSchema = z.object({
  year: z.number().int().min(1945).max(2100),
  /**
   * `null` bila penerbit mempublikasikan peringkat tetapi skornya belum bisa
   * ditelusuri. Lebih baik skor kosong daripada skor dikira-kira.
   */
  score: z.number().nullable(),
  rank: z.number().int().optional(),
  total_countries: z.number().int().optional(),
  note: z.string().optional(),
  subscores: z.record(z.string(), z.number()).optional(),
  /** Wajib ada agar titik data boleh ditandai terverifikasi oleh build. */
  provenance: provenanceSchema.optional(),
})
  .refine(
    (d) => d.score !== null || d.rank !== undefined,
    "titik data tanpa skor wajib punya peringkat - kalau dua-duanya kosong, hapus saja"
  );
export type ExternalDataPoint = z.infer<typeof externalDataPointSchema>;

export const externalIndexSchema = z.object({
  id: idField("external_index.id"),
  name: z.string().min(3),
  publisher: z.string().min(2),
  type: externalIndexTypeSchema,
  scale: z.string().min(3),
  description: z.string().min(10),
  url: z.string().url(),
  target_dimensions: z.array(idField("external_index.target_dimensions")).default([]),
  data: z.array(externalDataPointSchema).min(1),
  abs_discrepancy_note: z.string().optional(),
  /**
   * Derajat verifikasi deret waktu ini. Diisi ulang oleh build berdasarkan
   * kelengkapan `provenance` tiap titik - tidak boleh diklaim manual:
   *  - terverifikasi      : seluruh titik punya provenance
   *  - sebagian           : sebagian titik punya provenance
   *  - belum-terverifikasi: tidak ada titik yang punya provenance
   */
  verification: z
    .enum(["terverifikasi", "sebagian", "belum-terverifikasi"])
    .default("belum-terverifikasi"),
});
export type ExternalIndex = z.infer<typeof externalIndexSchema>;
