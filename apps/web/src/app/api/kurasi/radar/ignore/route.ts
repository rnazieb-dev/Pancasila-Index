import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    const { resourceId } = await req.json();
    if (!resourceId) {
      return NextResponse.json({ error: "Resource ID wajib." }, { status: 400 });
    }

    await prisma.ckanRadarItem.updateMany({
      where: { resourceId },
      data: { status: "IGNORED" }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
