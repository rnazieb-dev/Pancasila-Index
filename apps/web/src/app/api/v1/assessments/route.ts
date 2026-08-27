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
  const status = searchParams.get("status");

  let assessments = dataset.assessments;

  if (term) {
    assessments = assessments.filter((a) => a.term_id === term);
  }

  if (status) {
    assessments = assessments.filter((a) => a.status === status);
  }

  return NextResponse.json({
    data: assessments,
    count: assessments.length,
  });
}
