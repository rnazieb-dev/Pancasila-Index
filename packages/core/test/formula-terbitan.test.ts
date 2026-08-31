import { describe, it, expect } from "vitest";
import { computeIndex, scoreToIndex, MAX_UNCERTAINTY_HALFWIDTH } from "../src/index.js";
import type { Assessment, Rubric } from "../src/schemas.js";

/**
 * Menjaga agar rumus yang DITERBITKAN di halaman /metodologi tetap sama
 * dengan yang DIHITUNG mesin.
 *
 * Latar: halaman pernah menerbitkan
 *     K = (sum G_k * W_k * c_k) / (sum W_k * c_k)
 * yaitu keyakinan bukti (c_k) ikut membobot komposit. Mesin tidak pernah
 * melakukannya. Pada masukan dengan keyakinan yang berbeda antar-kelompok,
 * kedua rumus berselisih sampai ~27 poin indeks.
 *
 * Keputusan: MESIN yang benar. Bobot menyatakan seberapa penting sebuah
 * landasan secara normatif; keyakinan menyatakan seberapa kuat buktinya.
 * Mencampur keduanya membuat sebuah lembaga dapat memperbaiki skornya cukup
 * dengan membiarkan bukti pada dimensi terburuknya tetap langka.
 * Keyakinan hanya melebarkan rentang, tidak menggeser nilai tengah.
 */

const mkDim = (id: string, group_id: string, non_derogable = false) => ({
  id, group_id, name_id: id, question_id: "Pertanyaan?", weight: 1,
  anchors: { "-2": "buruk", "0": "netral", "2": "baik" },
  indicators: [], non_derogable,
});

const rubric: Rubric = {
  version: "1.0.0", name_id: "R", description_id: "Rubrik uji rumus terbitan.",
  groups: [
    { id: "a", name_id: "A", description_id: "grup a", weight: 0.4 },
    { id: "b", name_id: "B", description_id: "grup b", weight: 0.3 },
    { id: "c", name_id: "C", description_id: "grup c", weight: 0.3 },
  ],
  dimensions: [
    mkDim("a1", "a"), mkDim("a2", "a"),
    mkDim("b1", "b"), mkDim("b2", "b"),
    mkDim("c1", "c"), mkDim("c2", "c"),
  ],
};

const mkAssessment = (
  S: Record<string, number>,
  C: Record<string, number>,
): Assessment => ({
  id: "as-1", term_id: "t-1", rubric_version: "1.0.0", status: "published",
  reviewers: ["R1", "R2"], ai_suggested: false, human_confirmed: true,
  created_at: "2026-01-01",
  dimension_scores: Object.keys(S).map((d) => ({
    dimension_id: d, score: S[d]!, confidence: C[d]!,
    rationale_id: "Rasional yang cukup panjang untuk lolos validasi skema.",
    evidence: [{ source_id: "src-x" }],
  })),
});

/** Rumus Bagian 3 seperti yang tercetak di halaman, diterjemahkan apa adanya. */
const rumusTerbitan = (G: Record<string, number>, W: Record<string, number>) => {
  const ks = Object.keys(G);
  const atas = ks.reduce((s, k) => s + G[k]! * W[k]!, 0);
  const bawah = ks.reduce((s, k) => s + W[k]!, 0);
  return scoreToIndex(atas / bawah);
};

describe("rumus terbitan /metodologi = mesin penskoran", () => {
  const W = { a: 0.4, b: 0.3, c: 0.3 };

  it("cocok ketika keyakinan seragam", () => {
    const S = { a1: 2, a2: 2, b1: -2, b2: -2, c1: 0, c2: 0 };
    const C = Object.fromEntries(Object.keys(S).map((d) => [d, 0.8]));
    const hasil = computeIndex([mkAssessment(S, C)], "t-1", rubric, "published")!;
    expect(hasil.index).toBeCloseTo(rumusTerbitan({ a: 2, b: -2, c: 0 }, W), 6);
  });

  it("TETAP cocok ketika keyakinan sangat berbeda antar-kelompok", () => {
    // Inilah kasus yang dulu membongkar selisihnya. Nilai tengah tidak boleh
    // bergeser sedikit pun oleh keyakinan.
    const S = { a1: 2, a2: 2, b1: -2, b2: -2, c1: 0, c2: 0 };
    const C = { a1: 1.0, a2: 1.0, b1: 0.1, b2: 0.1, c1: 0.5, c2: 0.5 };
    const hasil = computeIndex([mkAssessment(S, C)], "t-1", rubric, "published")!;
    expect(hasil.index).toBeCloseTo(rumusTerbitan({ a: 2, b: -2, c: 0 }, W), 6);
  });

  it("keyakinan hanya melebarkan rentang, tidak menggeser nilai tengah", () => {
    const S = { a1: 1, a2: 1, b1: 1, b2: 1, c1: 1, c2: 1 };
    const tinggi = computeIndex([mkAssessment(S, Object.fromEntries(Object.keys(S).map(d => [d, 1.0])))], "t-1", rubric, "published")!;
    const rendah = computeIndex([mkAssessment(S, Object.fromEntries(Object.keys(S).map(d => [d, 0.2])))], "t-1", rubric, "published")!;

    expect(rendah.index).toBeCloseTo(tinggi.index!, 6); // nilai tengah sama
    const lebarTinggi = tinggi.index_interval!.high - tinggi.index_interval!.low;
    const lebarRendah = rendah.index_interval!.high - rendah.index_interval!.low;
    expect(lebarRendah).toBeGreaterThan(lebarTinggi); // rentang melebar
  });

  it("rentang maksimum sesuai angka yang diterbitkan (+/- 12,5 poin)", () => {
    const poinMaks = scoreToIndex(0) - scoreToIndex(-MAX_UNCERTAINTY_HALFWIDTH);
    expect(poinMaks).toBeCloseTo(12.5, 6);
  });

  it("Indeks = 50 + 25K seperti yang diterbitkan", () => {
    for (const k of [-2, -1, -0.5, 0, 0.5, 1, 2]) {
      expect(scoreToIndex(k)).toBeCloseTo(50 + 25 * k, 6);
    }
  });
});
