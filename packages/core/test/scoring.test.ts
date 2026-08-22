import { describe, expect, it } from "vitest";

import {
  computeAssessmentSummary,
  computePublicIndex,
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
    },
    {
      id: "d2",
      group_id: "g1",
      name_id: "Dimensi Dua",
      question_id: "Pertanyaan untuk dimensi dua?",
      weight: 3,
      anchors: { "-2": "buruk", "0": "netral", "2": "sangat baik" },
      indicators: [],
    },
    {
      id: "d3",
      group_id: "g2",
      name_id: "Dimensi Tiga",
      question_id: "Pertanyaan untuk dimensi tiga?",
      weight: 2,
      anchors: { "-2": "buruk", "0": "netral", "2": "sangat baik" },
      indicators: [],
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

describe("computeAssessmentSummary", () => {
  it("menghitung rerata tertimbang bobot dimensi x keyakinan", () => {
    const summary = computeAssessmentSummary(
      [mkAssessment("a-1", "draft", false, fullScores)],
      testRubric
    )!;

    // g1: efektif d1 = 1*0.8 = 0.8 ; d2 = 3*0.5 = 1.5
    const g1Expected = (1 * 0.8 + -1 * 1.5) / 2.3;
    const g1 = summary.groups.find((g) => g.group_id === "g1")!;
    expect(g1.score).toBeCloseTo(g1Expected, 9);
    expect(g1.coverage).toBe(1);

    const g2 = summary.groups.find((g) => g.group_id === "g2")!;
    expect(g2.score).toBe(2);

    // indeks keseluruhan: bobot grup 3 dan 1, cakupan penuh
    const overallRaw = (3 * g1Expected + 1 * 2) / 4; // = 0.271739...
    const expectedIndex =
      Math.round((((overallRaw + 2) / 4) * 100 + Number.EPSILON) * 10) / 10;
    expect(summary.index).toBeCloseTo(expectedIndex, 6);
    expect(summary.index).toBeCloseTo(56.8, 1);
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
    const summary = computeAssessmentSummary(
      [mkAssessment("a-2", "draft", false, partial)],
      testRubric
    )!;

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
    const single = computeAssessmentSummary(
      [mkAssessment("a-3", "draft", false, fullScores)],
      testRubric
    )!;
    const both = computeAssessmentSummary(
      [
        mkAssessment("a-3", "draft", false, fullScores),
        mkAssessment("a-4", "draft", false, other),
      ],
      testRubric
    )!;

    // d2 berubah dari -1 menjadi rata-rata 0 -> indeks harus naik
    expect(both.index!).toBeGreaterThan(single.index!);
  });

  it("mengembalikan null tanpa penilaian", () => {
    expect(computeAssessmentSummary([], testRubric)).toBeNull();
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
