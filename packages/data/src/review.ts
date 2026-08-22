import { z } from "zod";

import type { Assessment } from "@pancasila-index/core";

export const reviewDecisionSchema = z.enum(["approved", "rejected"]);
export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;

export const reviewEntrySchema = z.object({
  assessment_id: z.string().min(1),
  decision: reviewDecisionSchema,
  reviewer: z.string().min(2),
  note_id: z.string().optional(),
  /** tanggal keputusan YYYY-MM-DD */
  at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type ReviewEntry = z.infer<typeof reviewEntrySchema>;

export const reviewStateSchema = z.object({
  reviews: z.array(reviewEntrySchema),
});
export type ReviewState = z.infer<typeof reviewStateSchema>;

export interface ReviewOutcome {
  assessments: Assessment[];
  publishedIds: string[];
  rejectedIds: string[];
}

/**
 * Murni & deterministik: terapkan keputusan kurasi.
 * Keputusan TERAKHIR per penilaian yang menang; rejected mengeluarkan
 * penilaian dari dataset publik; approved mempromosikan draf menjadi
 * published dengan human_confirmed=true.
 */
export function applyReviews(
  assessments: readonly Assessment[],
  reviews: readonly ReviewEntry[]
): ReviewOutcome {
  const latest = new Map<string, ReviewEntry>();
  for (const r of reviews) latest.set(r.assessment_id, r);

  const publishedIds: string[] = [];
  const rejectedIds: string[] = [];
  const out: Assessment[] = [];

  for (const a of assessments) {
    const decision = latest.get(a.id);
    if (!decision) {
      out.push(a);
      continue;
    }
    if (decision.decision === "rejected") {
      rejectedIds.push(a.id);
      continue;
    }
    out.push({
      ...a,
      status: "published",
      human_confirmed: true,
      reviewers: [...new Set([...a.reviewers, decision.reviewer])],
    });
    publishedIds.push(a.id);
  }

  return { assessments: out, publishedIds, rejectedIds };
}
