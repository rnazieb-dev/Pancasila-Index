import { NextResponse, type NextRequest } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dimension = searchParams.get("dimension");
  const status = searchParams.get("status") || "published";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;

  if (!isDatabaseAvailable) {
    return NextResponse.json({
      success: true,
      data: [],
      meta: { total: 0, page, limit, pages: 0, note: "Database overlay offline" }
    }, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  try {
    const where: any = {
      ...(status !== "all" ? { status } : {}),
      ...(dimension ? { relevantDimension: dimension } : {})
    };

    const [total, audits] = await Promise.all([
      db.ckanAudit.count({ where }),
      db.ckanAudit.findMany({
        where,
        include: {
          contributor: {
            select: { name: true, affiliation: true, title: true, funding: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit
      })
    ]);

    return NextResponse.json({
      success: true,
      data: audits,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
