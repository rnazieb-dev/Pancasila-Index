import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Hak akses & portabilitas data (UU PDP Pasal 5, 7, 13): mengembalikan data
 * pribadi milik pengguna dalam format terstruktur agar dapat dipindahkan.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Identitas pengguna tidak tersedia pada sesi ini." },
      { status: 400 }
    );
  }

  let data: Record<string, unknown> = {
    profile: {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
      githubUsername: session.user.githubUsername ?? null,
      role: session.user.role ?? null,
      affiliation: session.user.affiliation ?? null,
      title: session.user.title ?? null,
      funding: session.user.funding ?? null,
      bio: session.user.bio ?? null,
    },
    reviews: [],
    comments: [],
    usulan: [],
    ckanAudits: [],
    exported_at: new Date().toISOString(),
  };

  try {
    const [profile, reviews, comments, usulan, ckanAudits] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true, name: true, email: true, image: true, role: true,
          affiliation: true, title: true, funding: true, bio: true,
          githubId: true, createdAt: true,
        },
      }),
      db.review.findMany({
        where: { reviewerId: userId },
        orderBy: { createdAt: "desc" },
      }),
      db.comment.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "desc" },
      }),
      db.usulan.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "desc" },
      }),
      db.ckanAudit.findMany({
        where: { contributorId: userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (profile) {
      data.profile = {
        ...profile,
        createdAt: profile.createdAt.toISOString(),
      };
    }
    data.reviews = reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
    data.comments = comments.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    }));
    data.usulan = usulan.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));
    data.ckanAudits = ckanAudits.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
  } catch (err) {
    // DB belum tersedia: tetap kembalikan data sesi sebagai portabilitas
    // minimum, TETAPI tandai bahwa ekspornya tidak lengkap. Dulu kegagalan ini
    // senyap, sehingga pengguna menerima berkas yang tampak utuh padahal
    // riwayat usulan dan auditnya hilang - masalah serius untuk hak
    // portabilitas data.
    console.error("[ekspor] gagal membaca data pengguna dari basis data:", err);
    data.incomplete = true;
    data.incompleteReason =
      "Basis data tidak dapat dihubungi saat ekspor dibuat. Berkas ini hanya " +
      "memuat data sesi; riwayat usulan, audit, dan telaah TIDAK termasuk. " +
      "Silakan ulangi ekspor nanti untuk memperoleh salinan lengkap.";
  }

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="pancasila-index-data-saya.json"',
    },
  });
}
