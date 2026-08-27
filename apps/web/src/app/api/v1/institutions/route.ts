import { NextResponse, type NextRequest } from "next/server";
import { dataset } from "@pancasila-index/data";
import { checkRateLimit } from "@/lib/rate-limit";

export function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Sila tunggu sejenak." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const branch = searchParams.get("branch");

  let institutions = dataset.institutions;
  if (branch) {
    institutions = institutions.filter((i) => i.branch === branch);
  }

  const items = institutions.map((i) => {
    const terms = dataset.terms.filter((t) => t.institution_id === i.id);
    return {
      ...i,
      total_terms: terms.length,
    };
  });

  return NextResponse.json(
    { data: items, count: items.length },
    {
      headers: {
        "X-RateLimit-Limit": "120",
        "X-RateLimit-Remaining": rl.remaining.toString(),
      },
    }
  );
}
