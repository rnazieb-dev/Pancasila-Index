import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Akses ditolak. Anda wajib masuk/terdaftar sebagai Kontributor untuk mengirimkan verifikasi data." 
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { resourceId, baseUrl, title, contextNote, relevantDimension } = body;

    if (!resourceId || !contextNote?.trim()) {
      return NextResponse.json(
        { success: false, error: "Resource ID dan Catatan Verifikasi wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    // 1. Simpan ke CkanAudit untuk antrean kurasi dua-reviewer
    const ckanAudit = await prisma.ckanAudit.create({
      data: {
        resourceId,
        baseUrl: baseUrl || "https://data.go.id",
        title: title || `DataStore Resource ${resourceId}`,
        contextNote: contextNote.trim(),
        relevantDimension: relevantDimension || "sila-5",
        contributorId: user?.id || null,
        status: "pending"
      }
    });

    // 2. Catat Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: user?.id || null,
        action: "ckan.audit.create",
        entity: "CkanAudit",
        entityId: ckanAudit.id,
        meta: JSON.stringify({
          resourceId,
          baseUrl,
          relevantDimension,
          contributorName: user?.name || session.user.name || "Kontributor"
        })
      }
    });

    // 3. Perbarui status Radar Item jika ada
    await prisma.ckanRadarItem.updateMany({
      where: { resourceId },
      data: { status: "AUDITED" }
    });

    return NextResponse.json({
      success: true,
      message: "Verifikasi berhasil dicatat dan masuk ke antrean kurasi dua-reviewer.",
      auditId: ckanAudit.id
    });
  } catch (err: any) {
    console.error("CKAN Audit Submission Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menyimpan verifikasi." },
      { status: 500 }
    );
  }
}

// GET untuk mengambil daftar audit yang sudah published untuk ditampilkan di profil publik
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dimension = searchParams.get("dimension");
    
    const audits = await prisma.ckanAudit.findMany({
      where: {
        status: "published",
        ...(dimension ? { relevantDimension: dimension } : {})
      },
      include: {
        contributor: {
          select: { name: true, affiliation: true, title: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json({ success: true, audits });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
