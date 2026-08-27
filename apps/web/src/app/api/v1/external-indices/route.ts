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
  const dimension = searchParams.get("dimension");
  const q = searchParams.get("q")?.toLowerCase();

  let indices = dataset.external_indices ?? [];

  if (type) {
    indices = indices.filter((idx) => idx.type === type);
  }

  if (dimension) {
    indices = indices.filter((idx) => idx.target_dimensions.includes(dimension));
  }

  if (q) {
    indices = indices.filter(
      (idx) =>
        idx.name.toLowerCase().includes(q) ||
        idx.publisher.toLowerCase().includes(q) ||
        idx.description.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    data: indices,
    meta: {
      total: indices.length,
      methodology_notice:
        "External indices contain third-party objective hard-data, double-blind expert coding, and civil society research to enrich constitutional governance analysis beyond self-reported bureaucratic claims.",
    },
  });
}
