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
  const term = searchParams.get("term");
  const institution = searchParams.get("institution");
  const category = searchParams.get("category");
  const dimension = searchParams.get("dimension");
  const q = searchParams.get("q")?.toLowerCase();

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));

  const termsById = new Map(dataset.terms.map((t) => [t.id, t]));

  let events = dataset.events;

  if (term) {
    events = events.filter((e) => e.term_id === term);
  }

  if (institution) {
    events = events.filter((e) => {
      const t = termsById.get(e.term_id);
      return t?.institution_id === institution;
    });
  }

  if (category) {
    events = events.filter((e) => e.category === category);
  }

  if (dimension) {
    events = events.filter((e) => e.dimension_ids.includes(dimension));
  }

  if (q) {
    events = events.filter(
      (e) =>
        e.title_id.toLowerCase().includes(q) ||
        e.summary_id.toLowerCase().includes(q)
    );
  }

  const total = events.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedData = events.slice(startIndex, startIndex + limit);

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
