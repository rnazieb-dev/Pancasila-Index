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
  /** draft karena menunggu telaah kedua (sudah di-approve 1 orang) */
  pendingIds: string[];
}

/** Jumlah approver berbeda-nama minimum agar penilaian bisa dipublikasi. */
export const MIN_APPROVERS = 2;

/**
 * Murni & deterministik.
 *
 * Aturan (fase 5b):
 *  - Keputusan TERAKHIR per penilaian menentukan arah.
 *  - latest REJECTED -> keluar dari dataset publik.
 *  - latest APPROVED hanya menjadi `published` bila jumlah approver
 *    BERBEDA-NAMA >= MIN_APPROVERS; jika belum, tetap `draft` dan masuk
 *    daftar pendingIds (menunggu telaah kedua).
 *  - Penilaian tanpa keputusan tetap apa adanya.
 */
export function applyReviews(
  assessments: readonly Assessment[],
  reviews: readonly ReviewEntry[]
): ReviewOutcome {
  const byId = new Map<string, ReviewEntry[]>();
  for (const r of reviews) {
    const list = byId.get(r.assessment_id) ?? [];
    list.push(r);
    byId.set(r.assessment_id, list);
  }

  const publishedIds: string[] = [];
  const rejectedIds: string[] = [];
  const pendingIds: string[] = [];
  const out: Assessment[] = [];

  for (const a of assessments) {
    const history = byId.get(a.id);
    if (!history || history.length === 0) {
      out.push(a);
      continue;
    }
    const latest = history[history.length - 1]!;
    if (latest.decision === "rejected") {
      rejectedIds.push(a.id);
      continue;
    }

    const approvers = new Set(
      history.filter((r) => r.decision === "approved").map((r) => r.reviewer)
    );

    if (approvers.size < MIN_APPROVERS) {
      // sudah disetujui satu orang tapi belum memenuhi kuorum
      const reviewers = [...new Set([...a.reviewers, ...approvers])];
      out.push({ ...a, status: "draft", human_confirmed: false, reviewers });
      pendingIds.push(a.id);
      continue;
    }

    out.push({
      ...a,
      status: "published",
      human_confirmed: true,
      reviewers: [
        ...new Set([...a.reviewers, ...approvers]),
      ],
    });
    publishedIds.push(a.id);
  }

  return { assessments: out, publishedIds, rejectedIds, pendingIds };
}
