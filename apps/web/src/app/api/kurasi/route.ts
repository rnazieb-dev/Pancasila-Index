import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";

import { db } from "@/lib/db";
import { audit, getCurrentUser, hasRole } from "@/lib/authz";
import { dataset } from "@pancasila-index/data";

/**
 * POST /api/kurasi — catat keputusan kurasi (approved/rejected).
 *
 * Fase 5a: keputusan ditulis ke Postgres/SQLite (Review) lalu
 * di-mirror write-through ke generated/review-state.json agar
 * build dataset tetap berjalan tanpa database. Jejak audit ganda:
 * baris DB + file yang dikomit.
 *
 * Otorisasi: peran KURATOR/ADMIN, atau CURATION_DEV=1 (dev lokal).
 */
const REVIEW_FILE = path.resolve(
  process.cwd(),
  "../../packages/data/generated/review-state.json"
);

interface ReviewFileShape {
  reviews: Array<{
    assessment_id: string;
    decision: "approved" | "rejected";
    reviewer: string;
    note_id?: string;
    at: string;
  }>;
}

/** Regenerasi review-state.json dari keputusan terakhir tiap assessment. */
async function syncReviewFile(): Promise<number> {
  const all = await db.review.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      assessmentId: true,
      decision: true,
      reviewerName: true,
      note: true,
      createdAt: true,
    },
  });

  const latest = new Map<string, (typeof all)[number]>();
  for (const r of all) latest.set(r.assessmentId, r);

  const reviews = [...latest.values()].map((r) => ({
    assessment_id: r.assessmentId,
    decision: r.decision === "APPROVED" ? ("approved" as const) : ("rejected" as const),
    reviewer: r.reviewerName,
    at: r.createdAt.toISOString().slice(0, 10),
    ...(r.note ? { note_id: r.note } : {}),
  }));

  await fs.mkdir(path.dirname(REVIEW_FILE), { recursive: true });
  await fs.writeFile(REVIEW_FILE, JSON.stringify({ reviews }, null, 2) + "\n");
  return reviews.length;
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
  if (!dataset.assessments.some((a) => a.id === assessmentId)) {
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

  const total = await syncReviewFile();
  revalidatePath("/kurasi");

  return NextResponse.json({
    ok: true,
    total,
    hint: "Jalankan `pnpm build:data` untuk menerapkan keputusan ke dataset.",
  });
}

/** GET /api/kurasi — ringkasan antrean untuk dashboard (dipakai klien). */
export async function GET() {
  const user = await getCurrentUser();
  if (!hasRole(user, "KONTRIBUTOR")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const counts = {
    draft: dataset.assessments.filter((a) => a.status === "draft").length,
    published: dataset.assessments.filter((a) => a.status === "published").length,
  };
  return NextResponse.json({ counts });
}
