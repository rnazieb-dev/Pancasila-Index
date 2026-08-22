import { describe, expect, it } from "vitest";

import type { Assessment } from "@pancasila-index/core";
import { applyReviews } from "../src/review";

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

describe("applyReviews", () => {
  it("approved mempromosikan draf menjadi published", () => {
    const out = applyReviews(
      [mkDraft("a-1"), mkDraft("a-2")],
      [
        {
          assessment_id: "a-1",
          decision: "approved",
          reviewer: "Kurator A",
          at: "2026-08-23",
        },
      ]
    );
    expect(out.publishedIds).toEqual(["a-1"]);
    expect(out.rejectedIds).toEqual([]);
    const a1 = out.assessments.find((x) => x.id === "a-1");
    expect(a1?.status).toBe("published");
    expect(a1?.human_confirmed).toBe(true);
    // a-2 tanpa keputusan tetap draf
    expect(out.assessments.find((x) => x.id === "a-2")?.status).toBe("draft");
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

  it("keputusan terakhir menang", () => {
    const out = applyReviews([mkDraft("a-1")], [
      {
        assessment_id: "a-1",
        decision: "approved",
        reviewer: "Kurator A",
        at: "2026-08-23",
      },
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

  it("penilaian sudah published tetap published saat di-approved ulang", () => {
    const already = mkDraft("a-9", {
      status: "published",
      human_confirmed: true,
      reviewers: ["Kurator Asli"],
    });
    const out = applyReviews([already], [
      {
        assessment_id: "a-9",
        decision: "approved",
        reviewer: "Kurator Kedua",
        at: "2026-08-25",
      },
    ]);
    expect(out.publishedIds).toContain("a-9");
    expect(out.assessments[0]?.reviewers).toContain("Kurator Kedua");
  });
});
