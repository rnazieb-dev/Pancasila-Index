import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { getCurrentUser, hasRole } from "@/lib/authz";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    const items = await prisma.ckanAudit.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        contributor: {
          select: { name: true, affiliation: true }
        }
      }
    });

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Menerbitkan data adalah tindakan kurasi. Sebelumnya endpoint ini hanya
    // memeriksa keberadaan nama pengguna, sehingga setiap akun yang baru
    // mendaftar (peran bawaan KONTRIBUTOR) dapat menerbitkan atau menolak.
    // Disamakan dengan gerbang di /api/kurasi.
    const user = await getCurrentUser();
    if (!hasRole(user, "KURATOR")) {
      return NextResponse.json(
        { error: "Akses ditolak. Tindakan kurasi membutuhkan peran Kurator." },
        { status: 403 },
      );
    }

    const reviewerId = user!.id;
    if (!reviewerId) {
      return NextResponse.json(
        { error: "Sesi tidak memuat identitas pengguna yang stabil." },
        { status: 401 },
      );
    }

    const { auditId, decision, note } = await req.json();
    if (!auditId || (decision !== "approved" && decision !== "rejected")) {
      return NextResponse.json({ error: "auditId dan decision (approved|rejected) wajib diisi." }, { status: 400 });
    }

    // Penolakan wajib beralasan, sama seperti /api/kurasi.
    if (decision === "rejected" && !String(note || "").trim()) {
      return NextResponse.json(
        { error: "Alasan penolakan (note) wajib diisi." },
        { status: 422 },
      );
    }

    const audit = await prisma.ckanAudit.findUnique({ where: { id: auditId } });
    if (!audit) {
      return NextResponse.json({ error: "Audit tidak ditemukan." }, { status: 404 });
    }

    const reviewerName = user!.name || "Kurator";

    if (decision === "rejected") {
      const updated = await prisma.ckanAudit.update({
        where: { id: auditId },
        data: { status: "rejected" }
      });
      return NextResponse.json({ success: true, status: updated.status });
    }

    // Keunikan penyetuju ditentukan oleh User.id, BUKAN nama tampilan.
    // Nama dapat diubah pemiliknya, sehingga satu akun bisa lolos dua kali.
    const currentApproverIds = audit.approverIds || [];
    if (currentApproverIds.includes(reviewerId)) {
      return NextResponse.json({
        error: "Anda sudah memberikan persetujuan untuk usulan audit ini. Publikasi membutuhkan peninjau kedua yang berbeda."
      }, { status: 400 });
    }

    const newApproverIds = [...currentApproverIds, reviewerId];
    const newApprovers = [...(audit.approverNames || []), reviewerName];
    const newStatus = newApproverIds.length >= 2 ? "published" : "pending_second";

    const updated = await prisma.ckanAudit.update({
      where: { id: auditId },
      data: {
        approverNames: newApprovers,
        approverIds: newApproverIds,
        status: newStatus
      }
    });

    return NextResponse.json({ 
      success: true, 
      status: updated.status,
      approversCount: newApprovers.length,
      message: newStatus === "published" 
        ? "Audit berhasil dipublikasikan (kuorum 2 peninjau terpenuhi)."
        : "Persetujuan pertama dicatat. Menunggu peninjau kedua."
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
