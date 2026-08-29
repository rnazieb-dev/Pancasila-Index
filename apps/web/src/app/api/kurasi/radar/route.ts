import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.ckanRadarItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
