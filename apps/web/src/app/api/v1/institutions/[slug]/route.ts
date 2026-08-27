import { NextResponse, type NextRequest } from "next/server";
import { dataset, getInstitution, getTermsOfInstitution } from "@pancasila-index/data";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const { slug } = await params;
  const institution = getInstitution(dataset, slug);
  if (!institution) {
    return NextResponse.json({ error: `Lembaga '${slug}' tidak ditemukan` }, { status: 404 });
  }

  const terms = getTermsOfInstitution(dataset, institution.id);

  return NextResponse.json({
    data: {
      ...institution,
      terms,
    },
  });
}
