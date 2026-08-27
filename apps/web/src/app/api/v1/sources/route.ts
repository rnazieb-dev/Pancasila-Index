import { NextResponse, type NextRequest } from "next/server";
import { dataset } from "@pancasila-index/data";
import { checkRateLimit } from "@/lib/rate-limit";

export function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const q = searchParams.get("q")?.toLowerCase();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));

  let sources = dataset.sources;

  if (type) {
    sources = sources.filter((s) => s.type === type);
  }

  if (q) {
    sources = sources.filter(
      (s) =>
        s.title_id.toLowerCase().includes(q) ||
        (s.citation_id && s.citation_id.toLowerCase().includes(q))
    );
  }

  const total = sources.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedData = sources.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    data: paginatedData,
    pagination: {
      total,
      page,
      limit,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  });
}
