import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
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
    const session = await auth();
    if (!session?.user?.name) {
      return NextResponse.json({ error: "Akses ditolak. Butuh akun Kurator/Kontributor." }, { status: 401 });
    }

    const { auditId, decision } = await req.json();
    if (!auditId || (decision !== "approved" && decision !== "rejected")) {
      return NextResponse.json({ error: "auditId dan decision (approved|rejected) wajib diisi." }, { status: 400 });
    }

    const audit = await prisma.ckanAudit.findUnique({ where: { id: auditId } });
    if (!audit) {
      return NextResponse.json({ error: "Audit tidak ditemukan." }, { status: 404 });
    }

    const reviewerName = session.user.name;

    if (decision === "rejected") {
      const updated = await prisma.ckanAudit.update({
        where: { id: auditId },
        data: { status: "rejected" }
      });
      return NextResponse.json({ success: true, status: updated.status });
    }

    // Cek approver unik
    const currentApprovers = audit.approverNames || [];
    if (currentApprovers.includes(reviewerName)) {
      return NextResponse.json({ 
        error: "Anda sudah memberikan persetujuan untuk usulan audit ini. Publikasi membutuhkan peninjau kedua yang berbeda." 
      }, { status: 400 });
    }

    const newApprovers = [...currentApprovers, reviewerName];
    const newStatus = newApprovers.length >= 2 ? "published" : "pending_second";

    const updated = await prisma.ckanAudit.update({
      where: { id: auditId },
      data: {
        approverNames: newApprovers,
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
