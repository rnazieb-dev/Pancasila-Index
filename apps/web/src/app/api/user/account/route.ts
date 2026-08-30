import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Hak penghapusan (right to erasure) — UU PDP Pasal 8: menghapus akun dan
 * data pribadi pengguna. Rekam ilmiah (keputusan kurasi) dipertahankan dalam
 * bentuk dianonimkan agar integritas dataset tidak rusak:
 * - komentar milik pengguna dihapus,
 * - usulan bukti dianonimkan (nama/afiliasi/funding dikosongkan, author dilepas),
 * - referensi aktor pada review/audit/ckan diubah menjadi null,
 * - baris User dihapus (email & hash sandi ikut terhapus).
 */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    await db.$transaction([
      db.comment.deleteMany({ where: { authorId: userId } }),
      db.usulan.updateMany({
        where: { authorId: userId },
        data: { authorId: null, nama: "[anonim]", afiliasi: null, funding: null },
      }),
      db.review.updateMany({ where: { reviewerId: userId }, data: { reviewerId: null } }),
      db.auditLog.updateMany({ where: { actorId: userId }, data: { actorId: null } }),
      db.ckanAudit.updateMany({ where: { contributorId: userId }, data: { contributorId: null } }),
      db.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({
      success: true,
      message:
        "Akun dan data pribadi Anda telah dihapus. Kontribusi kurasi yang bersifat publik dipertahankan dalam bentuk anonim demi integritas ilmiah.",
    });
  } catch (err) {
    console.error("Gagal menghapus akun:", err);
    return NextResponse.json(
      { error: "Gagal menghapus akun. Silakan coba kembali atau hubungi tim@pancasila.site." },
      { status: 500 }
    );
  }
}
