import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let dbUser = null;
  if (session.user.id) {
    try {
      dbUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          affiliation: true,
          title: true,
          funding: true,
          bio: true,
          createdAt: true,
        },
      });
    } catch (err) {
      // Bacaan boleh jatuh ke nilai sesi agar halaman tetap tampil, tetapi
      // kegagalannya WAJIB tercatat - dulu senyap total sehingga masalah
      // basis data di produksi tidak meninggalkan jejak apa pun.
      console.error("[profil] gagal membaca pengguna dari basis data:", err);
    }
  }

  const profile = {
    id: dbUser?.id || session.user.id || "current-user",
    name: dbUser?.name || session.user.name || "Kontributor",
    email: dbUser?.email || session.user.email || null,
    image: dbUser?.image || session.user.image || null,
    role: dbUser?.role || session.user.role || "KONTRIBUTOR",
    githubUsername: session.user.githubUsername || null,
    affiliation: dbUser?.affiliation || session.user.affiliation || null,
    title: dbUser?.title || session.user.title || null,
    funding: dbUser?.funding || session.user.funding || null,
    bio: dbUser?.bio || session.user.bio || null,
    createdAt: dbUser?.createdAt ? dbUser.createdAt.toISOString() : new Date().toISOString(),
  };

  return NextResponse.json({ data: profile });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format JSON tidak valid" }, { status: 400 });
  }

  const name = body.name ? String(body.name).trim() : undefined;
  const affiliation = body.affiliation !== undefined ? String(body.affiliation).trim() : undefined;
  const title = body.title !== undefined ? String(body.title).trim() : undefined;
  const funding = body.funding !== undefined ? String(body.funding).trim() : undefined;
  const bio = body.bio !== undefined ? String(body.bio).trim() : undefined;

  const data = {
    ...(name && { name }),
    ...(affiliation !== undefined && { affiliation }),
    ...(title !== undefined && { title }),
    ...(funding !== undefined && { funding }),
    ...(bio !== undefined && { bio }),
  };

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada perubahan untuk disimpan." },
      { status: 400 },
    );
  }

  /*
   * Dulu blok ini menelan kegagalan tulis lalu tetap menjawab
   * `success: true` dengan pesan "berhasil disimpan". Akibatnya form selalu
   * tampak berhasil padahal tidak ada yang tersimpan, dan pengguna baru sadar
   * setelah memuat ulang halaman. Kegagalan penyimpanan sekarang dilaporkan
   * apa adanya.
   *
   * Pemulihan lewat email: sesi memakai strategi JWT tanpa PrismaAdapter, dan
   * callback jwt memberi `uid` cadangan berbentuk `github_<id>` bila sinkron
   * basis data saat login gagal. Token itu berlaku berhari-hari, sehingga
   * setiap penyimpanan sesudahnya menargetkan id yang tidak ada. Karena email
   * bersifat unik, ia dipakai sebagai kunci pemulihan.
   */
  let updated = null;
  try {
    if (session.user.id) {
      updated = await db.user
        .update({ where: { id: session.user.id }, data })
        .catch(() => null);
    }

    if (!updated && session.user.email) {
      updated = await db.user
        .update({ where: { email: session.user.email }, data })
        .catch(() => null);
      if (updated) {
        console.warn(
          `[profil] id sesi "${session.user.id}" tidak ada di basis data; ` +
            `dipulihkan lewat email. Sesi ini kemungkinan dibuat saat basis data tidak tersedia.`,
        );
      }
    }
  } catch (err) {
    console.error("[profil] gagal menyimpan ke basis data:", err);
    return NextResponse.json(
      {
        error:
          "Perubahan tidak dapat disimpan karena basis data tidak dapat dihubungi. " +
          "Silakan coba lagi; bila tetap gagal, laporkan ke pengelola.",
      },
      { status: 503 },
    );
  }

  if (!updated) {
    console.error(
      `[profil] akun tidak ditemukan di basis data (id="${session.user.id}", email="${session.user.email}").`,
    );
    return NextResponse.json(
      {
        error:
          "Akun Anda tidak ditemukan di basis data, sehingga perubahan tidak tersimpan. " +
          "Silakan keluar lalu masuk kembali; bila tetap gagal, laporkan ke pengelola.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Profil dan deklarasi transparansi berhasil disimpan.",
    data: {
      // Sekarang selalu dari baris yang BENAR-BENAR tersimpan, bukan campuran
      // nilai sesi yang bisa menutupi kegagalan tulis.
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      githubUsername: session.user.githubUsername,
      affiliation: updated.affiliation,
      title: updated.title,
      funding: updated.funding,
      bio: updated.bio,
    },
  });
}
