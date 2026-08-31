import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";

import {
  persistUsulan,
  recordUsulanDecision,
  getUsulanByPublicId,
  listUsulanForCuration,
} from "@/lib/usulan-store";
import { buildUsulanPatch } from "@/lib/usulan-patch";

/**
 * Uji integrasi rantai kurasi terhadap basis data sungguhan.
 *
 * Dilewati otomatis bila DATABASE_URL belum menunjuk Postgres, agar CI tanpa
 * basis data tetap hijau. Jalankan lokal dengan:
 *   docker run --name pancasila-pg -e POSTGRES_PASSWORD=pancasila \
 *     -e POSTGRES_DB=pancasila -p 5433:5432 -d postgres:17
 *   pnpm --filter @pancasila-index/web db:push
 */
const db = new PrismaClient();

/**
 * Penjaga berbasis KONEKSI, bukan sekadar keberadaan DATABASE_URL.
 *
 * Vitest ikut memuat apps/web/.env, sehingga memeriksa variabel saja tidak
 * cukup: variabelnya bisa ada padahal basis datanya tidak berjalan, dan uji
 * akan gagal alih-alih dilewati.
 */
const adaDb = await db
  .$queryRaw`SELECT 1`
  .then(() => true)
  .catch(() => false);

if (!adaDb) {
  console.log(
    "[lewati] Uji integrasi kurasi butuh Postgres aktif. " +
      "Jalankan container lalu `pnpm --filter @pancasila-index/web db:push`.",
  );
}

const d = adaDb ? describe : describe.skip;

const dasar = {
  publicId: "",
  institutionId: "presiden-ri",
  termId: "presiden-habibie",
  sourceType: "putusan-mk",
  sourceUrl: "https://mkri.id/uji-alur",
  nama: "Ilmuwan Uji",
  afiliasi: "Universitas Uji",
  funding: "Mandiri",
  pakta: true,
  status: "PENDING_REVIEW",
  reviewerNames: [],
  authorIdent: "uji-integrasi",
};

d("rantai kurasi usulan (basis data sungguhan)", () => {
  let idA = "";
  let idB = "";
  const dibuat: string[] = [];

  beforeAll(async () => {
    const a = await db.user.upsert({
      where: { email: "kurator-a@uji.local" },
      update: { role: "KURATOR" },
      create: { email: "kurator-a@uji.local", name: "Kurator A", role: "KURATOR" },
    });
    const b = await db.user.upsert({
      where: { email: "kurator-b@uji.local" },
      update: { role: "KURATOR" },
      create: { email: "kurator-b@uji.local", name: "Kurator B", role: "KURATOR" },
    });
    idA = a.id;
    idB = b.id;
  });

  afterAll(async () => {
    if (dibuat.length) {
      await db.usulan.deleteMany({ where: { publicId: { in: dibuat } } });
    }
    await db.user.deleteMany({
      where: { email: { in: ["kurator-a@uji.local", "kurator-b@uji.local"] } },
    });
    await db.$disconnect();
  });

  it("usulan masuk, tampil di antrean, dan lolos kuorum dua kurator", async () => {
    const row = await persistUsulan(
      { ...dasar, dimensionId: "sila-2", sourceTitle: "Putusan Uji Alur Kurasi",
        argumentasi: "Bukti uji untuk memverifikasi rantai kurasi." },
      null,
    );
    dibuat.push(row.publicId);
    expect(row.status).toBe("PENDING_REVIEW");

    const antrean = await listUsulanForCuration("PENDING_REVIEW");
    expect(antrean.some((u) => u.publicId === row.publicId)).toBe(true);

    const a1 = await recordUsulanDecision({
      publicId: row.publicId, decision: "approve", reviewerId: idA, reviewerName: "Kurator A",
    });
    expect(a1.ok && a1.row.status).toBe("PENDING_SECOND");

    const b1 = await recordUsulanDecision({
      publicId: row.publicId, decision: "approve", reviewerId: idB, reviewerName: "Kurator B",
    });
    expect(b1.ok && b1.row.status).toBe("PUBLISHED");
    expect(b1.ok && b1.row.reviewerIds.length).toBe(2);
  });

  it("kurator yang sama tidak dapat memenuhi kuorum sendirian", async () => {
    const row = await persistUsulan(
      { ...dasar, dimensionId: "sila-4", sourceTitle: "Uji Kuorum", argumentasi: "uji" },
      null,
    );
    dibuat.push(row.publicId);

    await recordUsulanDecision({
      publicId: row.publicId, decision: "approve", reviewerId: idA, reviewerName: "Kurator A",
    });

    const ulang = await recordUsulanDecision({
      publicId: row.publicId, decision: "approve", reviewerId: idA, reviewerName: "Kurator A",
    });
    expect(ulang.ok).toBe(false);

    // Celah lama: kuorum dihitung dari nama tampilan, yang dapat diganti
    // pemiliknya. Mengganti nama TIDAK boleh menembus kuorum.
    const gantiNama = await recordUsulanDecision({
      publicId: row.publicId, decision: "approve", reviewerId: idA,
      reviewerName: "Nama Lain Sama Sekali",
    });
    expect(gantiNama.ok).toBe(false);

    const kini = await getUsulanByPublicId(row.publicId);
    expect(kini!.status).toBe("PENDING_SECOND");
  });

  it("penolakan bersifat final dan alasannya tersimpan", async () => {
    const row = await persistUsulan(
      { ...dasar, dimensionId: "sila-3", sourceType: "berita",
        sourceTitle: "Uji Tolak", argumentasi: "uji" },
      null,
    );
    dibuat.push(row.publicId);

    const tolak = await recordUsulanDecision({
      publicId: row.publicId, decision: "reject", reviewerId: idA,
      reviewerName: "Kurator A", note: "Sumber bukan bukti primer.",
    });
    expect(tolak.ok && tolak.row.status).toBe("REJECTED");
    expect(tolak.ok && tolak.row.reviewNote).toBe("Sumber bukan bukti primer.");

    const lagi = await recordUsulanDecision({
      publicId: row.publicId, decision: "approve", reviewerId: idB, reviewerName: "Kurator B",
    });
    expect(lagi.ok).toBe(false);
  });

  it("usulan yang lolos menghasilkan patch YAML yang sah", async () => {
    const row = await persistUsulan(
      { ...dasar, dimensionId: "sila-5", sourceTitle: "Putusan Uji Patch",
        argumentasi: "uji patch" },
      null,
    );
    dibuat.push(row.publicId);
    await recordUsulanDecision({ publicId: row.publicId, decision: "approve", reviewerId: idA, reviewerName: "A" });
    await recordUsulanDecision({ publicId: row.publicId, decision: "approve", reviewerId: idB, reviewerName: "B" });

    const final = await getUsulanByPublicId(row.publicId);
    expect(final!.status).toBe("PUBLISHED");

    const patch = buildUsulanPatch(final!, 2026);
    expect(patch.sourceId).toBe("putusan-uji-patch");
    expect(patch.sourcesYaml).toContain("- id: putusan-uji-patch");
    expect(patch.sourcesYaml).toContain(`url: ${final!.sourceUrl}`);
    expect(patch.assessmentsHint).toContain(final!.dimensionId);
  });
});
