import { describe, expect, it } from "vitest";

import type { Assessment } from "@pancasila-index/core";
import { applyReviews, devCurationAllowed, MIN_APPROVERS } from "../src/review";

const mkDraft = (
  id: string,
  overrides: Partial<Assessment> = {}
): Assessment => ({
  id,
  term_id: "t-1",
  rubric_version: "1.0.0",
  status: "draft",
  reviewers: ["Pipeline AI"],
  ai_suggested: true,
  human_confirmed: false,
  created_at: "2026-08-22",
  dimension_scores: [
    {
      dimension_id: "sila-4",
      score: 1,
      confidence: 0.5,
      rationale_id: "Rasional yang cukup panjang untuk lolos validasi skema.",
      evidence: [{ source_id: "src-x" }],
    },
  ],
  ...overrides,
});

const appr = (id: string, reviewer: string, at = "2026-08-23") => ({
  assessment_id: id,
  decision: "approved" as const,
  reviewer,
  at,
});

describe("applyReviews", () => {
  it("satu approval -> tetap draft, masuk pending (butuh telaah kedua)", () => {
    const out = applyReviews(
      [mkDraft("a-1"), mkDraft("a-2")],
      [appr("a-1", "Kurator A")]
    );
    expect(out.pendingIds).toEqual(["a-1"]);
    expect(out.publishedIds).toEqual([]);
    const a1 = out.assessments.find((x) => x.id === "a-1");
    expect(a1?.status).toBe("draft");
    expect(a1?.human_confirmed).toBe(false);
    // kurator pertama tercatat pada jejak reviewer
    expect(a1?.reviewers).toContain("Kurator A");
    expect(out.assessments.find((x) => x.id === "a-2")?.status).toBe("draft");
  });

  it(`dua approver berbeda-nama memenuhi kuorum ${MIN_APPROVERS} -> published`, () => {
    const out = applyReviews([mkDraft("a-1")], [
      appr("a-1", "Kurator A"),
      appr("a-1", "Kurator B", "2026-08-24"),
    ]);
    expect(out.publishedIds).toEqual(["a-1"]);
    const a1 = out.assessments[0]!;
    expect(a1.status).toBe("published");
    expect(a1.human_confirmed).toBe(true);
    expect(new Set(a1.reviewers)).toEqual(new Set(["Pipeline AI", "Kurator A", "Kurator B"]));
  });

  it("dua approval dari orang yang sama TIDAK memenuhi kuorum", () => {
    const out = applyReviews([mkDraft("a-1")], [
      appr("a-1", "Kurator A"),
      appr("a-1", "Kurator A", "2026-08-24"),
    ]);
    expect(out.pendingIds).toEqual(["a-1"]);
    expect(out.publishedIds).toEqual([]);
  });

  it("rejected mengeluarkan penilaian dari dataset", () => {
    const out = applyReviews([mkDraft("a-1")], [
      {
        assessment_id: "a-1",
        decision: "rejected",
        reviewer: "Kurator B",
        note_id: "bukti tidak memadai",
        at: "2026-08-23",
      },
    ]);
    expect(out.rejectedIds).toEqual(["a-1"]);
    expect(out.assessments).toHaveLength(0);
  });

  it("keputusan terakhir menang: approve lalu reject -> ditolak", () => {
    const out = applyReviews([mkDraft("a-1")], [
      appr("a-1", "Kurator A"),
      {
        assessment_id: "a-1",
        decision: "rejected",
        reviewer: "Kurator B",
        at: "2026-08-24",
      },
    ]);
    expect(out.rejectedIds).toEqual(["a-1"]);
    expect(out.publishedIds).toEqual([]);
  });

  it("keputusan terakhir menang: dua approve menimpa reject awal -> published", () => {
    const out = applyReviews([mkDraft("a-1")], [
      {
        assessment_id: "a-1",
        decision: "rejected",
        reviewer: "Kurator C",
        note_id: "perlu revisi",
        at: "2026-08-20",
      },
      appr("a-1", "Kurator A", "2026-08-23"),
      appr("a-1", "Kurator B", "2026-08-24"),
    ]);
    expect(out.publishedIds).toContain("a-1");
    expect(out.rejectedIds).toEqual([]);
  });
});

// ---------------------------------------------------------------- P0: integritas kuorum
// Kuorum adalah satu-satunya jalan menuju status `published`, dan sejak
// computeIndex mewajibkan basis eksplisit, seluruh indeks publik bergantung
// padanya. Uji di bawah menjaga agar jalan itu tidak bisa dipalsukan.

const apprId = (
  id: string,
  reviewer: string,
  reviewer_id: string,
  at = "2026-08-23"
) => ({ assessment_id: id, decision: "approved" as const, reviewer, reviewer_id, at });

describe("P0: kuorum atas identitas, bukan nama tampilan", () => {
  it("satu orang yang berganti nama TIDAK memenuhi kuorum sendirian", () => {
    // Nama tampilan GitHub dapat diubah pemiliknya. Dulu kuorum dedup atas
    // nama, jadi satu orang bisa approve, ganti nama, approve lagi, lolos.
    const out = applyReviews([mkDraft("a-1")], [
      apprId("a-1", "Budi", "user-1"),
      apprId("a-1", "Budi Santoso", "user-1"),
    ]);
    expect(out.publishedIds).toEqual([]);
    expect(out.pendingIds).toEqual(["a-1"]);
    expect(out.assessments[0]!.status).toBe("draft");
    expect(out.assessments[0]!.human_confirmed).toBe(false);
  });

  it("dua orang berbeda memenuhi kuorum meski nama tampilannya sama", () => {
    // Kebalikannya: dua kurator tanpa nama sama-sama jadi "tanpa-nama" dan
    // dulu terhitung satu orang, sehingga kuorum tidak pernah tercapai.
    const out = applyReviews([mkDraft("a-1")], [
      apprId("a-1", "tanpa-nama", "user-1"),
      apprId("a-1", "tanpa-nama", "user-2"),
    ]);
    expect(out.publishedIds).toEqual(["a-1"]);
    expect(out.assessments[0]!.status).toBe("published");
    expect(out.assessments[0]!.human_confirmed).toBe(true);
  });

  it("data lama tanpa reviewer_id tetap jalan lewat cadangan nama", () => {
    const out = applyReviews([mkDraft("a-1")], [
      appr("a-1", "Reviewer A"),
      appr("a-1", "Reviewer B"),
    ]);
    expect(out.publishedIds).toEqual(["a-1"]);
  });

  it("id dan nama tidak pernah bertabrakan sebagai kunci", () => {
    // approverKey memberi awalan, jadi reviewer_id "X" tidak sama dengan
    // nama tampilan "X" - tanpa awalan, keduanya akan terhitung satu orang.
    const out = applyReviews([mkDraft("a-1")], [
      apprId("a-1", "berbeda", "X"),
      appr("a-1", "X"),
    ]);
    expect(out.publishedIds).toEqual(["a-1"]);
  });

  it("MIN_APPROVERS tetap 2 - penurunan nilai ini harus disengaja", () => {
    expect(MIN_APPROVERS).toBe(2);
  });

  it("penolakan oleh siapa pun mengeluarkan penilaian, jadi jalur tulis wajib terautentikasi", () => {
    // Catatan kenapa CURATION_DEV dikunci ke non-produksi: penolakan hanya
    // butuh keputusan TERAKHIR, tidak butuh kuorum. Satu request anonim
    // cukup untuk mengeluarkan penilaian dari dataset publik.
    const out = applyReviews([mkDraft("a-1")], [
      apprId("a-1", "Reviewer A", "user-1"),
      apprId("a-1", "Reviewer B", "user-2"),
      { assessment_id: "a-1", decision: "rejected" as const, reviewer: "X", reviewer_id: "user-9", at: "2026-08-24" },
    ]);
    expect(out.rejectedIds).toEqual(["a-1"]);
    expect(out.assessments).toEqual([]);
  });
});

describe("P0: mode kurasi tanpa login dikunci ke non-produksi", () => {
  it("diizinkan hanya di non-produksi", () => {
    expect(devCurationAllowed({ CURATION_DEV: "1", NODE_ENV: "development" })).toEqual({
      allowed: true,
      misconfigured: false,
    });
    expect(devCurationAllowed({ CURATION_DEV: "1", NODE_ENV: "test" })).toEqual({
      allowed: true,
      misconfigured: false,
    });
  });

  it("DITOLAK di produksi dan ditandai salah konfigurasi", () => {
    // Ini inti P0-nya: satu variabel yang ikut tersalin ke environment
    // produksi dulu memberi peran KURATOR kepada setiap pengunjung anonim.
    expect(devCurationAllowed({ CURATION_DEV: "1", NODE_ENV: "production" })).toEqual({
      allowed: false,
      misconfigured: true,
    });
  });

  it("tanpa variabel: tidak diizinkan, dan bukan salah konfigurasi", () => {
    expect(devCurationAllowed({ NODE_ENV: "development" })).toEqual({
      allowed: false,
      misconfigured: false,
    });
    expect(devCurationAllowed({ CURATION_DEV: "0", NODE_ENV: "development" })).toEqual({
      allowed: false,
      misconfigured: false,
    });
    // hanya "1" yang mengaktifkan - "true"/"yes" tidak
    expect(devCurationAllowed({ CURATION_DEV: "true", NODE_ENV: "development" })).toEqual({
      allowed: false,
      misconfigured: false,
    });
  });
});
