import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";

/**
 * Menjaga agar penyimpanan profil TIDAK pernah lagi mengaku berhasil saat
 * gagal.
 *
 * Latar: PUT /api/user/profile dulu menelan kegagalan tulis lalu tetap
 * menjawab `success: true` dengan pesan "berhasil disimpan". Form selalu
 * tampak berhasil padahal tidak ada yang tersimpan; pengguna baru sadar
 * setelah memuat ulang halaman.
 *
 * Penyebab tersering di produksi: sesi memakai JWT tanpa PrismaAdapter, dan
 * callback jwt memberi uid cadangan `github_<id>` bila sinkron basis data
 * saat login gagal. Token itu berlaku berhari-hari, sehingga setiap
 * penyimpanan menargetkan id yang tidak ada.
 */
const db = new PrismaClient();
const adaDb = await db.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
if (!adaDb) console.log("[lewati] Uji simpan profil butuh Postgres aktif.");
const d = adaDb ? describe : describe.skip;

const EMAIL = "profil-uji@uji.local";

/** Meniru logika PUT: coba id, lalu pulihkan lewat email. */
async function simpanProfil(
  sesi: { id: string | null; email: string | null },
  data: Record<string, string>,
) {
  let updated = null;
  if (sesi.id) {
    updated = await db.user.update({ where: { id: sesi.id }, data }).catch(() => null);
  }
  if (!updated && sesi.email) {
    updated = await db.user.update({ where: { email: sesi.email }, data }).catch(() => null);
  }
  return updated;
}

d("penyimpanan profil", () => {
  let idAsli = "";

  beforeAll(async () => {
    const u = await db.user.upsert({
      where: { email: EMAIL },
      update: { name: "Nama Awal", affiliation: null },
      create: { email: EMAIL, name: "Nama Awal", role: "KONTRIBUTOR" },
    });
    idAsli = u.id;
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { email: EMAIL } });
    await db.$disconnect();
  });

  it("menyimpan sungguhan ketika id sesi benar", async () => {
    const hasil = await simpanProfil(
      { id: idAsli, email: EMAIL },
      { name: "Nama Tersimpan", affiliation: "Universitas Uji" },
    );
    expect(hasil).not.toBeNull();

    // Dibaca ulang dari basis data, bukan dari nilai kembalian.
    const dari = await db.user.findUnique({ where: { email: EMAIL } });
    expect(dari!.name).toBe("Nama Tersimpan");
    expect(dari!.affiliation).toBe("Universitas Uji");
  });

  it("tetap tersimpan meski id sesi basi (kasus github_<id>)", async () => {
    const hasil = await simpanProfil(
      { id: "github_999999", email: EMAIL },
      { name: "Dipulihkan Lewat Email" },
    );
    expect(hasil).not.toBeNull();

    const dari = await db.user.findUnique({ where: { email: EMAIL } });
    expect(dari!.name).toBe("Dipulihkan Lewat Email");
  });

  it("melaporkan GAGAL ketika akun benar-benar tidak ada", async () => {
    const hasil = await simpanProfil(
      { id: "github_999999", email: "tidak-ada@uji.local" },
      { name: "Seharusnya Gagal" },
    );
    // Inilah inti perbaikannya: null -> API menjawab galat, BUKAN success:true.
    expect(hasil).toBeNull();
  });

  it("tidak menyentuh akun lain saat memulihkan lewat email", async () => {
    const lain = await db.user.create({
      data: { email: "lain@uji.local", name: "Jangan Berubah", role: "KONTRIBUTOR" },
    });
    await simpanProfil({ id: "github_999999", email: EMAIL }, { name: "Hanya Saya" });

    const cek = await db.user.findUnique({ where: { id: lain.id } });
    expect(cek!.name).toBe("Jangan Berubah");
    await db.user.delete({ where: { id: lain.id } });
  });
});
