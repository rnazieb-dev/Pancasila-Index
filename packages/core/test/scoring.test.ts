import { describe, expect, it } from "vitest";

import {
  computeIndex,
  computePublicIndex,
  MAX_UNCERTAINTY_HALFWIDTH,
  MIN_COVERAGE_FOR_INDEX,
  NON_DEROGABLE_CAPS,
  parseDataset,
  scoreToIndex,
} from "../src/index.js";
import type { Assessment } from "../src/schemas.js";
import type { Rubric } from "../src/schemas.js";

// ------------------------------------------------------------------ fixture

const testRubric: Rubric = {
  version: "1.0.0",
  name_id: "Rubrik Uji",
  description_id: "Rubrik kecil untuk pengujian mesin penskoran.",
  groups: [
    { id: "g1", name_id: "Grup Satu", description_id: "deskripsi grup satu", weight: 3 },
    { id: "g2", name_id: "Grup Dua", description_id: "deskripsi grup dua", weight: 1 },
  ],
  dimensions: [
    {
      id: "d1",
      group_id: "g1",
      name_id: "Dimensi Satu",
      question_id: "Pertanyaan untuk dimensi satu?",
      weight: 1,
      anchors: { "-2": "buruk", "0": "netral", "2": "sangat baik" },
      indicators: [],
      non_derogable: false,
    },
    {
      id: "d2",
      group_id: "g1",
      name_id: "Dimensi Dua",
      question_id: "Pertanyaan untuk dimensi dua?",
      weight: 3,
      anchors: { "-2": "buruk", "0": "netral", "2": "sangat baik" },
      indicators: [],
      non_derogable: false,
    },
    {
      id: "d3",
      group_id: "g2",
      name_id: "Dimensi Tiga",
      question_id: "Pertanyaan untuk dimensi tiga?",
      weight: 2,
      anchors: { "-2": "buruk", "0": "netral", "2": "sangat baik" },
      indicators: [],
      non_derogable: false,
    },
  ],
};

const mkAssessment = (
  id: string,
  status: "draft" | "published",
  humanConfirmed: boolean,
  dimension_scores: Assessment["dimension_scores"],
  extra: Partial<Assessment> = {}
): Assessment => ({
  id,
  term_id: "t-1",
  rubric_version: "1.0.0",
  status,
  reviewers: ["Reviewer A"],
  ai_suggested: false,
  human_confirmed: humanConfirmed,
  created_at: "2026-01-01",
  dimension_scores,
  ...extra,
});

const fullScores: Assessment["dimension_scores"] = [
  {
    dimension_id: "d1",
    score: 1,
    confidence: 0.8,
    rationale_id: "Rasional yang cukup panjang untuk lolos validasi skema.",
    evidence: [{ source_id: "src-x" }],
  },
  {
    dimension_id: "d2",
    score: -1,
    confidence: 0.5,
    rationale_id: "Rasional yang cukup panjang untuk lolos validasi skema.",
    evidence: [{ source_id: "src-x" }],
  },
  {
    dimension_id: "d3",
    score: 2,
    confidence: 1.0,
    rationale_id: "Rasional yang cukup panjang untuk lolos validasi skema.",
    evidence: [{ source_id: "src-x" }],
  },
];

// ------------------------------------------------------------------ uji

describe("scoreToIndex", () => {
  it("memetakan batas skala dengan benar", () => {
    expect(scoreToIndex(-2)).toBe(0);
    expect(scoreToIndex(0)).toBe(50);
    expect(scoreToIndex(2)).toBe(100);
  });

  it("membulatkan ke satu desimal", () => {
    // ((1/4)*100) = 25 persis; ((-0.5+2)/4*100)=37.5 persis
    expect(scoreToIndex(1)).toBe(75);
    expect(scoreToIndex(-0.5)).toBe(37.5);
  });

  it("menjepit nilai di luar rentang", () => {
    expect(scoreToIndex(-99)).toBe(0);
    expect(scoreToIndex(99)).toBe(100);
  });
});

describe("computeIndex (draft-preview)", () => {
  it("menghitung rerata tertimbang bobot dimensi SAJA - keyakinan tidak ikut", () => {
    const summary = computeIndex([mkAssessment("a-1", "draft", false, fullScores)], "t-1", testRubric, "draft-preview")!;

    // Dihitung tangan. g1: d1 (bobot 1, skor +1), d2 (bobot 3, skor -1)
    //   -> (1*1 + (-1)*3) / (1+3) = -0.5
    // Keyakinan (0.8 dan 0.5) TIDAK boleh muncul di sini. Versi lama
    // menghasilkan -0.3043 karena mengalikan keyakinan ke bobot, sehingga
    // dimensi berbukti lemah kehilangan pengaruh.
    const g1 = summary.groups.find((g) => g.group_id === "g1")!;
    expect(g1.score).toBeCloseTo(-0.5, 9);
    expect(g1.coverage).toBe(1);
    // keyakinan dilaporkan terpisah, bukan dilebur ke skor
    expect(g1.confidence).toBeCloseTo((1 * 0.8 + 3 * 0.5) / 4, 9);

    const g2 = summary.groups.find((g) => g.group_id === "g2")!;
    expect(g2.score).toBe(2);

    // komposit: bobot grup 3 dan 1, cakupan penuh
    //   -> (-0.5*3 + 2*1) / 4 = 0.125  ->  ((0.125+2)/4)*100 = 53.125 -> 53.1
    expect(summary.index).toBe(53.1);
  });

  it("menghormati bobot grup dan menurunkan kontribusi grup parsial", () => {
    const partial: Assessment["dimension_scores"] = [
      {
        dimension_id: "d1",
        score: 1,
        confidence: 1.0,
        rationale_id: "Rasional yang cukup panjang untuk lolos validasi skema.",
        evidence: [{ source_id: "src-x" }],
      },
      {
        dimension_id: "d3",
        score: 1,
        confidence: 1.0,
        rationale_id: "Rasional yang cukup panjang untuk lolos validasi skema.",
        evidence: [{ source_id: "src-x" }],
      },
    ];
    const summary = computeIndex([mkAssessment("a-2", "draft", false, partial)], "t-1", testRubric, "draft-preview")!;

    // g1 skor 1 cakupan 0.5 -> efektif 1.5 ; g2 skor 1 cakupan 1 -> efektif 1
    // rerata = (1.5*1 + 1*1)/2.5 = 1.0 -> indeks 75
    expect(summary.index).toBe(75);
    expect(summary.coverage).toBeCloseTo(2 / 3, 9);
  });

  it("merata-ratakan beberapa penilaian per dimensi sebelum agregasi", () => {
    const other: Assessment["dimension_scores"] = fullScores.map((ds) =>
      ds.dimension_id === "d2"
        ? { ...ds, score: 1 } // bertentangan dengan penilaian pertama
        : { ...ds }
    );
    const single = computeIndex([mkAssessment("a-3", "draft", false, fullScores)], "t-1", testRubric, "draft-preview")!;
    const both = computeIndex([
        mkAssessment("a-3", "draft", false, fullScores),
        mkAssessment("a-4", "draft", false, other),
      ], "t-1", testRubric, "draft-preview")!;

    // d2 berubah dari -1 menjadi rata-rata 0 -> indeks harus naik
    expect(both.index!).toBeGreaterThan(single.index!);
  });

  it("mengembalikan null tanpa penilaian", () => {
    expect(computeIndex([], "t-1", testRubric, "draft-preview")).toBeNull();
  });

  it("bukti yang lebih beragam MENYEMPITKAN rentang tanpa menggeser indeks", () => {
    // Dulu sumber tambahan menaikkan bobot dimensi sehingga menggeser indeks.
    // Sekarang korelasi bukti berada di tempat yang benar: ia mempersempit
    // rentang ketidakpastian, bukan mengubah nilai tengah.
    const tigaSumber: Assessment["dimension_scores"] = [
      {
        dimension_id: "d1",
        score: 2,
        confidence: 0.5,
        rationale_id: "Rasional yang cukup panjang untuk lolos validasi skema.",
        evidence: [{ source_id: "src-a" }, { source_id: "src-b" }, { source_id: "src-c" }],
      },
      {
        dimension_id: "d2",
        score: -2,
        confidence: 0.5,
        rationale_id: "Rasional yang cukup panjang untuk lolos validasi skema.",
        evidence: [{ source_id: "src-a" }],
      },
    ];
    const satuSumber: Assessment["dimension_scores"] = [
      { ...tigaSumber[0]!, evidence: [{ source_id: "src-a" }] },
      { ...tigaSumber[1]! },
    ];

    const banyak = computeIndex([mkAssessment("a-12", "draft", false, tigaSumber)], "t-1", testRubric, "draft-preview")!;
    const sedikit = computeIndex([mkAssessment("a-13", "draft", false, satuSumber)], "t-1", testRubric, "draft-preview")!;

    // Dihitung tangan: g1 = (2*1 + (-2)*3)/4 = -1.0 -> indeks 25. Sama persis
    // untuk kedua kasus, karena jumlah sumber tidak menyentuh nilai tengah.
    expect(banyak.index).toBe(25);
    expect(sedikit.index).toBe(banyak.index);

    // Rentangnya yang berbeda: effectiveConfidence(0.5, 3) = 0.58 vs 0.5,
    // jadi setengah-lebar d1 turun dari 0.25 ke 0.21 satuan skor.
    const lebar = (s: typeof banyak) => s.index_interval!.high - s.index_interval!.low;
    expect(lebar(banyak)).toBeLessThan(lebar(sedikit));
    expect(banyak.mean_confidence).toBeGreaterThan(sedikit.mean_confidence);
  });
});

describe("computePublicIndex", () => {
  it("hanya menghitung penilaian published", () => {
    const draftOnly = computePublicIndex(
      [mkAssessment("a-5", "draft", false, fullScores)],
      "t-1",
      testRubric
    );
    expect(draftOnly).toBeNull();

    const mixed = computePublicIndex(
      [
        mkAssessment("a-6", "draft", false, fullScores),
        mkAssessment(
          "a-7",
          "published",
          true,
          fullScores.map((ds) => ({ ...ds, score: 2 as const }))
        ),
      ],
      "t-1",
      testRubric
    );
    // hanya a-7 (semua +2) yang dihitung -> indeks sempurna 100
    expect(mixed!.index).toBe(100);
  });

  it("abaikan masa jabatan lain", () => {
    const result = computePublicIndex(
      [mkAssessment("a-8", "published", true, fullScores)],
      "t-lain",
      testRubric
    );
    expect(result).toBeNull();
  });
});

describe("validasi dataset", () => {
  const baseDataset = {
    rubric: testRubric,
    uud: {
      title_id: "UUD NRI Tahun 1945 (Satu Naskah)",
      description_id: "Peta lengkap batang tubuh konstitusi hasil empat amandemen.",
      babs: [
        {
          nomor: "I",
          nama_id: "Bentuk dan Kedaulatan",
          pasal: [
            {
              nomor: "1",
              ringkas_id: "Negara kesatuan republik; kedaulatan rakyat; negara hukum.",
              dimension_ids: ["negara-hukum"],
            },
          ],
        },
      ],
    },
    institutions: [],
    terms: [],
    events: [],
    sources: [],
    assessments: [],
  };

  it("menerima dataset kosong yang sah", () => {
    expect(() => parseDataset(baseDataset)).not.toThrow();
  });

  it("menolak skor di luar rentang -2..2", () => {
    const bad = structuredClone(baseDataset) as Record<string, unknown>;
    bad.assessments = [
      {
        id: "a-9",
        term_id: "t-1",
        rubric_version: "1.0.0",
        status: "draft",
        reviewers: ["Reviewer A"],
        ai_suggested: false,
        human_confirmed: false,
        created_at: "2026-01-01",
        dimension_scores: [
          {
            dimension_id: "d1",
            score: 3,
            confidence: 0.5,
            rationale_id: "Rasional yang cukup panjang untuk lolos validasi.",
            evidence: [{ source_id: "src-x" }],
          },
        ],
      },
    ];
    expect(() => parseDataset(bad)).toThrow(/tidak valid/i);
  });

  it("menolak penilaian published tanpa human_confirmed", () => {
    const bad = structuredClone(baseDataset) as Record<string, unknown>;
    bad.assessments = [
      {
        id: "a-10",
        term_id: "t-1",
        rubric_version: "1.0.0",
        status: "published",
        reviewers: ["Reviewer A"],
        ai_suggested: false,
        human_confirmed: false,
        created_at: "2026-01-01",
        dimension_scores: [
          {
            dimension_id: "d1",
            score: 1,
            confidence: 0.5,
            rationale_id: "Rasional yang cukup panjang untuk lolos validasi.",
            evidence: [{ source_id: "src-x" }],
          },
        ],
      },
    ];
    expect(() => parseDataset(bad)).toThrow(/human_confirmed|tidak valid/i);
  });

  it("menolak dimensi tanpa bukti sama sekali", () => {
    const bad = structuredClone(baseDataset) as Record<string, unknown>;
    bad.assessments = [
      {
        id: "a-11",
        term_id: "t-1",
        rubric_version: "1.0.0",
        status: "draft",
        reviewers: ["Reviewer A"],
        ai_suggested: false,
        human_confirmed: false,
        created_at: "2026-01-01",
        dimension_scores: [
          {
            dimension_id: "d1",
            score: 1,
            confidence: 0.5,
            rationale_id: "Rasional yang cukup panjang untuk lolos validasi.",
            evidence: [],
          },
        ],
      },
    ];
    expect(() => parseDataset(bad)).toThrow();
  });

  it("menolak id dengan huruf kapital atau spasi", () => {
    const bad = structuredClone(baseDataset);
    (bad.rubric.dimensions[0] as { id: string }).id = "ID Salah";
    expect(() => parseDataset(bad)).toThrow();
  });
});

// ------------------------------------------------------------------ regresi
// Uji di bawah menjaga cacat yang pernah nyata terjadi, bukan perilaku umum.

describe("regresi: kebijakan status wajib ditegakkan", () => {
  it("basis published menolak draf sekalipun human_confirmed", () => {
    const draf = mkAssessment("a-draft", "draft", true, fullScores);
    expect(computeIndex([draf], "t-1", testRubric, "published")).toBeNull();
    expect(computeIndex([draf], "t-1", testRubric, "draft-preview")).not.toBeNull();
  });

  it("basis published menolak published yang belum dikonfirmasi manusia", () => {
    const tanpaKonfirmasi = mkAssessment("a-pub", "published", false, fullScores);
    expect(computeIndex([tanpaKonfirmasi], "t-1", testRubric, "published")).toBeNull();
  });

  it("hasil selalu membawa dasar dan komposisinya", () => {
    // Sebelumnya dasar status hilang di perjalanan: REST API menyajikan draf
    // tanpa penanda apa pun karena API tidak punya footer seperti situs.
    const s = computeIndex(
      [mkAssessment("a-1", "draft", false, fullScores)],
      "t-1",
      testRubric,
      "draft-preview"
    )!;
    expect(s.basis).toBe("draft-preview");
    expect(s.draft_count).toBe(1);
    expect(s.published_count).toBe(0);
  });

  it("hanya menghitung penilaian milik masa jabatan yang diminta", () => {
    const lain = mkAssessment("a-lain", "draft", false, fullScores, { term_id: "t-2" });
    expect(computeIndex([lain], "t-1", testRubric, "draft-preview")).toBeNull();
  });
});

describe("regresi: skor tanpa bukti empiris tidak menggerakkan indeks", () => {
  const tanpaBukti: Assessment["dimension_scores"] = [
    {
      dimension_id: "d1",
      score: 2,
      confidence: 0.9,
      rationale_id: "Rasional yang cukup panjang untuk lolos validasi skema.",
      evidence: [],
      evidence_gap: true,
    },
  ];

  it("skor evidence_gap tidak menggeser indeks sedikit pun", () => {
    // tanpaBukti memberi d1 skor +2 berkeyakinan 0.9; bila ia ikut dihitung,
    // rerata d1 akan naik dari +1 ke +1.5 dan indeks bergerak.
    const tanpa = computeIndex(
      [mkAssessment("a-1", "draft", false, fullScores)],
      "t-1",
      testRubric,
      "draft-preview"
    )!;
    const dengan = computeIndex(
      [mkAssessment("a-2", "draft", false, [...fullScores, ...tanpaBukti])],
      "t-1",
      testRubric,
      "draft-preview"
    )!;
    expect(dengan.excluded_no_evidence).toBe(1);
    expect(tanpa.excluded_no_evidence).toBe(0);
    expect(dengan.index).toBe(tanpa.index);
    expect(dengan.scored_dimensions).toBe(tanpa.scored_dimensions);
  });

  it("penilaian yang seluruhnya tanpa bukti tidak menghasilkan indeks", () => {
    const s = computeIndex(
      [mkAssessment("a-1", "draft", false, tanpaBukti)],
      "t-1",
      testRubric,
      "draft-preview"
    )!;
    expect(s.index).toBeNull();
    expect(s.scored_dimensions).toBe(0);
  });
});

describe("regresi: jangkar normatif tidak menaikkan keyakinan faktual", () => {
  it("menambah normative_anchors tidak mengubah indeks", () => {
    const dasar: Assessment["dimension_scores"] = [
      {
        dimension_id: "d1",
        score: 1,
        confidence: 0.5,
        rationale_id: "Rasional yang cukup panjang untuk lolos validasi skema.",
        evidence: [{ source_id: "src-x" }],
      },
    ];
    const berjangkar: Assessment["dimension_scores"] = [
      { ...dasar[0]!, normative_anchors: ["uud-nri-1945", "uu-39-1999", "tap-mpr-xvii-1998"] },
    ];
    const a = computeIndex([mkAssessment("a", "draft", false, dasar)], "t-1", testRubric, "draft-preview")!;
    const b = computeIndex([mkAssessment("b", "draft", false, berjangkar)], "t-1", testRubric, "draft-preview")!;
    expect(b.index).toBe(a.index);
  });
});

describe("regresi: ambang cakupan menahan komposit yang menyesatkan", () => {
  it("cakupan di bawah ambang menahan indeks tetapi tetap melaporkan grup", () => {
    // Kasus nyata: satu masa jabatan menampilkan 88,9 dari cakupan 17%.
    const satuDimensi: Assessment["dimension_scores"] = [
      {
        dimension_id: "d1",
        score: 2,
        confidence: 0.9,
        rationale_id: "Rasional yang cukup panjang untuk lolos validasi skema.",
        evidence: [{ source_id: "src-x" }],
      },
    ];
    const s = computeIndex(
      [mkAssessment("a-1", "draft", false, satuDimensi)],
      "t-1",
      testRubric,
      "draft-preview"
    )!;
    expect(s.coverage).toBeLessThan(MIN_COVERAGE_FOR_INDEX);
    expect(s.index).toBeNull();
    expect(s.index_suppressed_reason).toBe("cakupan-di-bawah-ambang");
    expect(s.groups.find((g) => g.group_id === "g1")!.score).toBe(2);
  });

  it("cakupan penuh menerbitkan indeks tanpa alasan penahanan", () => {
    const s = computeIndex(
      [mkAssessment("a-1", "draft", false, fullScores)],
      "t-1",
      testRubric,
      "draft-preview"
    )!;
    expect(s.coverage).toBe(1);
    expect(s.index).not.toBeNull();
    expect(s.index_suppressed_reason).toBeNull();
  });
});

// ---------------------------------------------------------------- skenario tuduhan
// Tiga blok di bawah mereproduksi PERSIS skenario yang dipakai untuk menuduh
// mesin skor cacat. Angka "sebelum" dicantumkan di komentar agar perbaikannya
// tidak bisa diam-diam mundur.

/** Rubrik satu grup berisi lima dimensi setara - meniru grup Lima Sila. */
function rubrikLimaSila(nonDerogableIds: string[] = []): Rubric {
  const dim = (id: string) => ({
    id,
    group_id: "sila",
    name_id: id,
    question_id: `Pertanyaan ${id}?`,
    weight: 1,
    anchors: { "-2": "buruk", "0": "netral", "2": "baik" },
    indicators: [],
    non_derogable: nonDerogableIds.includes(id),
  });
  return {
    version: "1.0.0",
    name_id: "Rubrik Lima Sila",
    description_id: "Satu grup berisi lima dimensi setara.",
    groups: [{ id: "sila", name_id: "Lima Sila", description_id: "lima sila", weight: 0.4 }],
    dimensions: ["sila-1", "sila-2", "sila-3", "sila-4", "sila-5"].map(dim),
  } as unknown as Rubric;
}

const ds = (
  dimension_id: string,
  score: number,
  confidence: number,
  extra: Partial<Assessment["dimension_scores"][number]> = {}
): Assessment["dimension_scores"][number] => ({
  dimension_id,
  score,
  confidence,
  rationale_id: "Rasional yang cukup panjang untuk lolos validasi skema.",
  evidence: [{ source_id: "src-x" }],
  ...extra,
});

describe("skenario tuduhan: bukti lemah tidak boleh meringankan pelanggaran", () => {
  it("pelanggaran berat berbukti lemah tetap menekan indeks", () => {
    // SEBELUM: keyakinan dikalikan ke bobot -> rerata +0.842, indeks 71.1.
    // SESUDAH: rerata murni (-2 +1 +1 +1 +1)/5 = +0.4, indeks 60.
    const scores = [
      ds("sila-2", -2, 0.2),
      ds("sila-1", 1, 0.9),
      ds("sila-3", 1, 0.9),
      ds("sila-4", 1, 0.9),
      ds("sila-5", 1, 0.9),
    ];
    const s = computeIndex(
      [mkAssessment("a-x", "draft", false, scores, { term_id: "t-1" })],
      "t-1",
      rubrikLimaSila(),
      "draft-preview"
    )!;
    expect(s.index).toBe(scoreToIndex(0.4));
    expect(s.index).toBe(60);
    expect(s.index).not.toBe(71.1);
  });

  it("keyakinan rendah melebarkan rentang tanpa menggeser indeks", () => {
    const yakin = [1, 2, 3, 4, 5].map((i) => ds(`sila-${i}`, 1, 0.9));
    const raguRagu = [1, 2, 3, 4, 5].map((i) => ds(`sila-${i}`, 1, 0.2));
    const a = computeIndex([mkAssessment("a", "draft", false, yakin)], "t-1", rubrikLimaSila(), "draft-preview")!;
    const b = computeIndex([mkAssessment("b", "draft", false, raguRagu)], "t-1", rubrikLimaSila(), "draft-preview")!;
    expect(b.index).toBe(a.index);
    const lebar = (s: typeof a) => s.index_interval!.high - s.index_interval!.low;
    expect(lebar(b)).toBeGreaterThan(lebar(a));
  });

  it("pemetaan MAX_UNCERTAINTY_HALFWIDTH ke poin indeks dipatok", () => {
    // Pada keyakinan 0, setengah-lebar = MAX_UNCERTAINTY_HALFWIDTH satuan skor.
    // 1 satuan skor = 25 poin indeks, jadi 0.5 -> +-12,5 poin.
    const nol = [1, 2, 3, 4, 5].map((i) => ds(`sila-${i}`, 0, 0));
    const s = computeIndex([mkAssessment("a", "draft", false, nol)], "t-1", rubrikLimaSila(), "draft-preview")!;
    expect(s.index).toBe(50);
    expect(s.index_interval).toEqual({
      low: scoreToIndex(0 - MAX_UNCERTAINTY_HALFWIDTH),
      high: scoreToIndex(0 + MAX_UNCERTAINTY_HALFWIDTH),
    });
    expect(s.index_interval!.high - s.index_interval!.low).toBe(25);
  });

  it("rentang tidak keluar dari [0,100] walau keyakinan nol di ujung skala", () => {
    const ekstrem = [1, 2, 3, 4, 5].map((i) => ds(`sila-${i}`, 2, 0));
    const s = computeIndex([mkAssessment("a", "draft", false, ekstrem)], "t-1", rubrikLimaSila(), "draft-preview")!;
    expect(s.index_interval!.high).toBeLessThanOrEqual(100);
    expect(s.index_interval!.low).toBeGreaterThanOrEqual(0);
  });

  it("index_interval null tepat ketika index null", () => {
    const tipis = [ds("sila-1", 2, 0.9)];
    const s = computeIndex([mkAssessment("a", "draft", false, tipis)], "t-1", rubrikLimaSila(), "draft-preview")!;
    expect(s.index).toBeNull();
    expect(s.index_interval).toBeNull();
  });
});

describe("skenario tuduhan: pelanggaran hak tak dapat dikurangi tidak boleh ketutup", () => {
  const rubrik = rubrikLimaSila(["sila-2"]);

  it("pelanggaran berat membatasi komposit di bawah netral", () => {
    // SEBELUM: -2 pada tiga dimensi + lima +2 -> 62.5, di ATAS netral.
    // Di sini bentuk minimalnya: -2 pada dimensi bertanda + empat +2.
    const scores = [ds("sila-2", -2, 0.9), ...[1, 3, 4, 5].map((i) => ds(`sila-${i}`, 2, 0.9))];
    const s = computeIndex([mkAssessment("a", "draft", false, scores)], "t-1", rubrik, "draft-preview")!;
    // rerata polos = (-2 +2+2+2+2)/5 = +1.2 -> indeks 80 tanpa batas
    expect(s.index_uncapped).toBe(80);
    expect(s.index).toBe(scoreToIndex(NON_DEROGABLE_CAPS.severe));
    expect(s.index).toBe(25);
    expect(s.index_capped).toBe(true);
    expect(s.non_derogable_breaches).toEqual([{ dimension_id: "sila-2", score: -2 }]);
  });

  it("penggerusan (-1) membatasi di netral, bukan di 25", () => {
    const scores = [ds("sila-2", -1, 0.9), ...[1, 3, 4, 5].map((i) => ds(`sila-${i}`, 2, 0.9))];
    const s = computeIndex([mkAssessment("a", "draft", false, scores)], "t-1", rubrik, "draft-preview")!;
    expect(s.index).toBe(scoreToIndex(NON_DEROGABLE_CAPS.erosion));
    expect(s.index).toBe(50);
    expect(s.index_capped).toBe(true);
  });

  it("batas tidak pernah menaikkan skor", () => {
    const semuaBaik = [1, 2, 3, 4, 5].map((i) => ds(`sila-${i}`, 2, 0.9));
    const s = computeIndex([mkAssessment("a", "draft", false, semuaBaik)], "t-1", rubrik, "draft-preview")!;
    expect(s.index).toBe(100);
    expect(s.index_capped).toBe(false);
    expect(s.non_derogable_breaches).toEqual([]);
  });

  it("skor di bawah plafon dibiarkan apa adanya", () => {
    // rerata (-2 -2 -2 -2 -2)/5 = -2 -> indeks 0, jauh di bawah plafon 25
    const semuaBuruk = [1, 2, 3, 4, 5].map((i) => ds(`sila-${i}`, -2, 0.9));
    const s = computeIndex([mkAssessment("a", "draft", false, semuaBuruk)], "t-1", rubrik, "draft-preview")!;
    expect(s.index).toBe(0);
    expect(s.index_capped).toBe(false);
    expect(s.non_derogable_breaches).toHaveLength(1);
  });

  it("pelanggaran tetap dilaporkan walau indeks ditahan ambang cakupan", () => {
    // Kasus paling umum di data nyata: cakupan tipis DAN ada pelanggaran.
    // Kalau peringatan digantungkan ke angka, fiturnya tidak jalan sama sekali.
    const tipis = [ds("sila-2", -2, 0.9), ds("sila-1", 1, 0.9)];
    const s = computeIndex([mkAssessment("a", "draft", false, tipis)], "t-1", rubrik, "draft-preview")!;
    expect(s.coverage).toBeLessThan(MIN_COVERAGE_FOR_INDEX);
    expect(s.index).toBeNull();
    // 2 dari 5 dimensi -> grup satu-satunya juga tak memenuhi ambangnya,
    // jadi alasan yang lebih spesifik itulah yang berlaku. Yang penting:
    // ADA alasan, sehingga UI menjelaskan alih-alih bilang "belum dinilai".
    expect(s.index_suppressed_reason).toBe("tak-ada-grup-memenuhi-cakupan");
    expect(s.non_derogable_breaches).toEqual([{ dimension_id: "sila-2", score: -2 }]);
    // dibatasi != ditahan: jangan campur keduanya
    expect(s.index_capped).toBe(false);
  });

  it("skor evidence_gap pada dimensi bertanda TIDAK memicu batas", () => {
    // Harus menyambung dengan aturan pengecualian yang sudah ada: tuduhan
    // tanpa bukti tidak boleh menghukum, sebagaimana ia tidak boleh memuji.
    const scores = [
      ds("sila-2", -2, 0.9, { evidence: [], evidence_gap: true }),
      ...[1, 3, 4, 5].map((i) => ds(`sila-${i}`, 2, 0.9)),
    ];
    const s = computeIndex([mkAssessment("a", "draft", false, scores)], "t-1", rubrik, "draft-preview")!;
    expect(s.excluded_no_evidence).toBe(1);
    expect(s.non_derogable_breaches).toEqual([]);
    expect(s.index_capped).toBe(false);
    expect(s.index).toBe(100);
  });

  it("rentang atas ikut dibatasi supaya tidak mengklaim 'mungkin aman'", () => {
    const scores = [ds("sila-2", -2, 0.3), ...[1, 3, 4, 5].map((i) => ds(`sila-${i}`, 2, 0.3))];
    const s = computeIndex([mkAssessment("a", "draft", false, scores)], "t-1", rubrik, "draft-preview")!;
    expect(s.index).toBe(25);
    expect(s.index_interval!.high).toBeLessThanOrEqual(25);
    // batas bawah dibiarkan: ketidakpastian ke arah lebih buruk tetap jujur
    expect(s.index_interval!.low).toBeLessThan(25);
  });
});

describe("regresi: skor dimensi tak dikenal dihitung, tidak senyap", () => {
  it("dimension_id di luar rubrik dilaporkan jumlahnya", () => {
    const scores = [
      ds("sila-1", 2, 0.9),
      ds("sila-2", 2, 0.9),
      ds("sila-3", 2, 0.9),
      ds("dimensi-yang-sudah-dihapus", -2, 0.9),
    ];
    const s = computeIndex([mkAssessment("a", "draft", false, scores)], "t-1", rubrikLimaSila(), "draft-preview")!;
    expect(s.excluded_unknown_dimension).toBe(1);
    expect(s.scored_dimensions).toBe(3);
    // skor asing tidak boleh menyentuh angkanya
    expect(s.index).toBe(100);
  });
});
