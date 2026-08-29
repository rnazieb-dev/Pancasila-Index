import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;

    const body = await req.json();
    const { resourceId, baseUrl, title, contextNote, relevantDimension } = body;

    if (!resourceId || !contextNote) {
      return NextResponse.json(
        { success: false, error: "Resource ID dan Catatan Verifikasi wajib diisi." },
        { status: 400 }
      );
    }

    let user = null;
    if (userEmail) {
      user = await prisma.user.findUnique({ where: { email: userEmail } });
    }

    // 1. Catat Audit Log
    const audit = await prisma.auditLog.create({
      data: {
        actorId: user?.id,
        action: "ckan.audit.create",
        entity: "CkanAudit",
        entityId: resourceId,
        meta: JSON.stringify({
          baseUrl,
          title,
          relevantDimension,
          contextNote,
          contributorName: user?.name || session?.user?.name || "Kontributor Publik"
        })
      }
    });

    // 2. Perbarui status Radar Item jika ada
    await prisma.ckanRadarItem.updateMany({
      where: { resourceId },
      data: { status: "AUDITED" }
    });

    return NextResponse.json({
      success: true,
      message: "Verifikasi audit independen berhasil dicatat dan masuk ke antrean kurasi.",
      auditId: audit.id
    });
  } catch (err: any) {
    console.error("CKAN Audit Submission Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menyimpan verifikasi." },
      { status: 500 }
    );
  }
}
