import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

import { auth } from "@/auth";

/**
 * POST /api/kurasi — catat keputusan kurasi (approved/rejected).
 * Keputusan disimpan ke generated/review-state.json yang ikut
 * dikomit sebagai jejak audit, lalu diterapkan oleh build dataset.
 *
 * Otorisasi: sesi GitHub, atau CURATION_DEV=1 untuk pengembangan lokal.
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

export async function POST(req: Request) {
  const session = await auth();
  const devMode = process.env.CURATION_DEV === "1";
  const reviewer = session?.user?.name ?? null;

  if (!reviewer && !devMode) {
    return NextResponse.json(
      {
        error:
          "Tidak terautentikasi. Login GitHub atau set CURATION_DEV=1 untuk pengembangan lokal.",
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
  if (decision === "rejected" && !body.note) {
    return NextResponse.json(
      { error: "penolakan wajib menyertakan alasan (note)" },
      { status: 400 }
    );
  }

  const existing: ReviewFileShape = await fs
    .readFile(REVIEW_FILE, "utf8")
    .then((t) => JSON.parse(t))
    .catch(() => ({ reviews: [] }));

  const entry: ReviewFileShape["reviews"][number] = {
    assessment_id: assessmentId,
    decision,
    reviewer: reviewer ?? "dev-mode",
    at: new Date().toISOString().slice(0, 10),
  };
  if (body.note) entry.note_id = body.note;

  // keputusan baru menimpa entri lama untuk penilaian yang sama
  const reviews = [
    ...existing.reviews.filter((r) => r.assessment_id !== assessmentId),
    entry,
  ];

  await fs.mkdir(path.dirname(REVIEW_FILE), { recursive: true });
  await fs.writeFile(REVIEW_FILE, JSON.stringify({ reviews }, null, 2) + "\n");

  return NextResponse.json({
    ok: true,
    total: reviews.length,
    hint: "Jalankan `pnpm build:data` untuk menerapkan keputusan ke dataset.",
  });
}
