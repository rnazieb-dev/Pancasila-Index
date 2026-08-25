import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";

import { db } from "@/lib/db";
import { audit, getCurrentUser, hasRole } from "@/lib/authz";
import {
  applyReviews,
  dataset,
  type ReviewEntry,
} from "@pancasila-index/data";

/**
 * POST /api/kurasi — catat keputusan kurasi (approved/rejected).
 *
 * Fase 5b:
 *  - Setiap keputusan = baris Review baru (riwayat penuh di DB).
 *  - Status akhir mengikuti aturan kuorum applyReviews: publish butuh
 *    >=2 approver berbeda-nama dan keputusan terakhir approved.
 *  - Mirror write-through ke generated/review-state.json HANYA untuk
 *    penilaian yang benar-benar final (published/rejected); yang
 *    pending telaah kedua sengaja tidak ditulis agar build tetap draft.
 *
 * Otorisasi: KURATOR/ADMIN, atau CURATION_DEV=1 (dev lokal).
 */
const REVIEW_FILE = path.resolve(
  process.cwd(),
  "../../packages/data/generated/review-state.json"
);

/** Ambil seluruh keputusan dari DB dalam bentuk ReviewEntry. */
async function loadEntries(): Promise<ReviewEntry[]> {
  const rows = await db.review.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map((r) => ({
    assessment_id: r.assessmentId,
    decision: r.decision === "APPROVED" ? ("approved" as const) : ("rejected" as const),
    reviewer: r.reviewerName,
    at: r.createdAt.toISOString().slice(0, 10),
    ...(r.note ? { note_id: r.note } : {}),
  }));
}

/** Status satu penilaian menurut kuorum (murni, dipakai POST & GET). */
function statusOf(
  outcome: ReturnType<typeof applyReviews>,
  assessmentId: string
): "published" | "rejected" | "pending_second" | "untouched" {
  if (outcome.publishedIds.includes(assessmentId)) return "published";
  if (outcome.rejectedIds.includes(assessmentId)) return "rejected";
  if (outcome.pendingIds.includes(assessmentId)) return "pending_second";
  return "untouched";
}

/**
 * Hitung outcome atas seluruh penilaian dan tulis hanya yang final ke file.
 * Mengembalikan status untuk satu assessment yang diminta.
 */
async function mirrorAndStatus(assessmentId: string) {
  const entries = await loadEntries();
  const outcome = applyReviews(dataset.assessments, entries);

  const lastOf = (id: string) =>
    entries.filter((e) => e.assessment_id === id).at(-1)!;
  const finals = [...outcome.publishedIds, ...outcome.rejectedIds].map(lastOf);
  const reviews = finals.map((e) => ({
    assessment_id: e.assessment_id,
    decision: e.decision === "approved" ? ("approved" as const) : ("rejected" as const),
    reviewer: e.reviewer,
    at: e.at,
    ...(e.note_id ? { note_id: e.note_id } : {}),
  }));

  await fs.mkdir(path.dirname(REVIEW_FILE), { recursive: true });
  await fs.writeFile(REVIEW_FILE, JSON.stringify({ reviews }, null, 2) + "\n");

  return { status: statusOf(outcome, assessmentId), total: reviews.length };
}

function fireWebhook(payload: Record<string, unknown>): void {
  const url = process.env.KURASI_WEBHOOK_URL;
  if (!url) return;
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!hasRole(user, "KURATOR")) {
    return NextResponse.json(
      {
        error:
          "Butuh peran KURATOR. Login GitHub (set GITHUB_ID/GITHUB_SECRET) atau aktifkan CURATION_DEV=1 untuk pengembangan lokal.",
      },
      { status: 401 }
    );
  }

  let body: { assessmentId?: string; decision?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak valid" }, { status: 400 });
  }

  const { assessmentId, decision } = body;
  if (!assessmentId || (decision !== "approved" && decision !== "rejected")) {
    return NextResponse.json(
      { error: "assessmentId dan decision (approved|rejected) wajib diisi" },
      { status: 400 }
    );
  }
  const target = dataset.assessments.find((a) => a.id === assessmentId);
  if (!target) {
    return NextResponse.json(
      { error: `assessment "${assessmentId}" tidak dikenal` },
      { status: 404 }
    );
  }
  if (decision === "rejected" && !body.note) {
    return NextResponse.json(
      { error: "penolakan wajib menyertakan alasan (note)" },
      { status: 400 }
    );
  }

  await db.review.create({
    data: {
      assessmentId,
      decision: decision === "approved" ? "APPROVED" : "REJECTED",
      note: body.note,
      reviewerId: user!.id ?? null,
      reviewerName: user!.name ?? "tanpa-nama",
    },
  });

  await audit(user, "review.create", "Assessment", assessmentId, {
    decision,
    note: body.note,
  });

  const { status, total } = await mirrorAndStatus(assessmentId);
  revalidatePath("/kurasi");
  revalidatePath(`/kurasi/${assessmentId}`);

  const payload = {
    assessmentId,
    decision,
    reviewer: user!.name ?? "tanpa-nama",
    note: body.note ?? null,
    status,
    term: target.term_id,
  };
  fireWebhook(payload);

  return NextResponse.json({
    ok: true,
    total,
    status,
    ...(status === "pending_second"
      ? {
          hint: `Tercatat. Menunggu telaah kedua — publikasi butuh ${2} approver berbeda nama.`,
        }
      : {}),
  });
}

/** GET /api/kurasi — ringkasan antrean untuk dashboard. */
export async function GET() {
  const user = await getCurrentUser();
  if (!hasRole(user, "KONTRIBUTOR")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const counts = {
    draft: dataset.assessments.filter((a) => a.status === "draft").length,
    published: dataset.assessments.filter((a) => a.status === "published").length,
    // hidup dari DB (bukan hasil build terakhir): sudah approve 1 orang,
    // menunggu telaah kedua sesuai kuorum fase 5b.
    pending_second: applyReviews(dataset.assessments, await loadEntries())
      .pendingIds.length,
  };
  return NextResponse.json({ counts });
}
