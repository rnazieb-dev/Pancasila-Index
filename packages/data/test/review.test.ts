import { describe, expect, it } from "vitest";

import type { Assessment } from "@pancasila-index/core";
import { applyReviews, MIN_APPROVERS } from "../src/review";

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
