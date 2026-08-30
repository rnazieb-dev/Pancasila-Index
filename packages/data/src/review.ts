import { z } from "zod";

import type { Assessment } from "@pancasila-index/core";

export const reviewDecisionSchema = z.enum(["approved", "rejected"]);
export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;

export const reviewEntrySchema = z.object({
  assessment_id: z.string().min(1),
  decision: reviewDecisionSchema,
  /** Nama tampilan approver - untuk DITAMPILKAN, bukan untuk menghitung kuorum. */
  reviewer: z.string().min(2),
  /**
   * Identitas akun yang stabil. Inilah yang menentukan kuorum.
   *
   * Dulu kuorum dideduplikasi dari `reviewer` (nama tampilan), padahal nama
   * GitHub dapat diubah pemiliknya: satu orang bisa menyetujui, mengganti
   * nama, lalu menyetujui lagi dan memenuhi kuorum sendirian. Sebaliknya dua
   * kurator yang nama tampilannya kosong sama-sama menjadi "tanpa-nama"
   * sehingga terhitung satu orang dan kuorum tidak pernah tercapai.
   *
   * Opsional demi kompatibilitas berkas review-state lama; bila kosong,
   * dedup jatuh kembali ke nama (lihat approverKey).
   */
  reviewer_id: z.string().min(1).optional(),
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

/** Jumlah approver BERBEDA IDENTITAS minimum agar penilaian bisa dipublikasi. */
export const MIN_APPROVERS = 2;

/**
 * Kunci identitas untuk menghitung kuorum: id akun bila ada, kalau tidak
 * nama tampilan sebagai cadangan untuk data lama. Nama diberi awalan agar
 * tidak pernah bertabrakan dengan id.
 */
export function approverKey(r: Pick<ReviewEntry, "reviewer" | "reviewer_id">): string {
  return r.reviewer_id ? `id:${r.reviewer_id}` : `nama:${r.reviewer}`;
}

/**
 * Murni & deterministik.
 *
 * Aturan (fase 5b):
 *  - Keputusan TERAKHIR per penilaian menentukan arah.
 *  - latest REJECTED -> keluar dari dataset publik.
 *  - latest APPROVED hanya menjadi `published` bila jumlah approver
 *    BERBEDA IDENTITAS (approverKey) >= MIN_APPROVERS; jika belum, tetap
 *    `draft` dan masuk daftar pendingIds (menunggu telaah kedua).
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

    const approved = history.filter((r) => r.decision === "approved");
    // Kuorum atas IDENTITAS, bukan nama tampilan.
    const approverIds = new Set(approved.map(approverKey));
    // Nama tetap dikumpulkan terpisah, hanya untuk ditampilkan.
    const approverNames = new Set(approved.map((r) => r.reviewer));

    if (approverIds.size < MIN_APPROVERS) {
      // sudah disetujui satu orang tapi belum memenuhi kuorum
      const reviewers = [...new Set([...a.reviewers, ...approverNames])];
      out.push({ ...a, status: "draft", human_confirmed: false, reviewers });
      pendingIds.push(a.id);
      continue;
    }

    out.push({
      ...a,
      status: "published",
      human_confirmed: true,
      reviewers: [
        ...new Set([...a.reviewers, ...approverNames]),
      ],
    });
    publishedIds.push(a.id);
  }

  return { assessments: out, publishedIds, rejectedIds, pendingIds };
}

/**
 * Bolehkah mode kurasi TANPA LOGIN aktif?
 *
 * Kebijakan ini tinggal di sini, bukan di apps/web, karena ia bagian dari
 * integritas gerbang kurasi yang sama dengan MIN_APPROVERS - dan karena di
 * sini ia teruji. Sebelumnya `CURATION_DEV=1` saja sudah cukup tanpa penjaga
 * lingkungan apa pun, sehingga satu variabel yang ikut tersalin ke produksi
 * memberi peran KURATOR kepada setiap pengunjung anonim.
 *
 * Perlu diingat penolakan hanya butuh keputusan TERAKHIR, bukan kuorum: satu
 * request anonim cukup untuk mengeluarkan penilaian dari dataset publik.
 *
 * Murni: seluruh masukan diberikan pemanggil, tidak membaca process.env.
 */
export function devCurationAllowed(env: {
  CURATION_DEV?: string | undefined;
  NODE_ENV?: string | undefined;
}): { allowed: boolean; misconfigured: boolean } {
  if (env.CURATION_DEV !== "1") return { allowed: false, misconfigured: false };
  if (env.NODE_ENV === "production") return { allowed: false, misconfigured: true };
  return { allowed: true, misconfigured: false };
}
