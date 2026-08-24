/**
 * Backfill: baca generated/review-state.json lama (jika ada) dan masukkan
 * sebagai baris Review. Aman dijalankan berulang — entri identik dilewati.
 *
 * Jalankan: npx tsx scripts/backfill-reviews.mts
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const FILE = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "packages",
  "data",
  "generated",
  "review-state.json"
);

async function main() {
  if (!existsSync(FILE)) {
    console.log("Tidak ada review-state.json lama - backfill dilewati.");
    return;
  }
  const { reviews } = JSON.parse(readFileSync(FILE, "utf8")) as {
    reviews: Array<{
      assessment_id: string;
      decision: string;
      reviewer: string;
      note_id?: string;
      at: string;
    }>;
  };

  let created = 0;
  for (const r of reviews) {
    const existing = await db.review.findFirst({
      where: { assessmentId: r.assessment_id, reviewerName: r.reviewer, note: r.note_id ?? null },
    });
    if (existing) continue;
    await db.review.create({
      data: {
        assessmentId: r.assessment_id,
        decision: r.decision === "approved" ? "APPROVED" : "REJECTED",
        reviewerName: r.reviewer,
        reviewerId: null,
        note: r.note_id,
        createdAt: new Date(`${r.at}T00:00:00Z`),
      },
    });
    created++;
  }
  console.log(`Backfill selesai: ${created} keputusan dimasukkan.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
