import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = checkRateLimit(ip, 10, 60_000); // Lebih ketat untuk submisi
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Mohon tunggu sebentar." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format JSON tidak valid" }, { status: 400 });
  }

  // Validasi field wajib
  const required = [
    "institution_id", "term_id", "dimension_id",
    "source_type", "source_url", "argumentasi",
    "nama", "afiliasi", "funding",
  ];
  const missing = required.filter((f) => !body[f]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Field wajib tidak terisi: ${missing.join(", ")}` },
      { status: 422 }
    );
  }

  // Validasi URL sumber
  try {
    new URL(body.source_url as string);
  } catch {
    return NextResponse.json({ error: "URL sumber tidak valid" }, { status: 422 });
  }

  // Pakta integritas wajib disetujui
  if (!body.setuju_pakta) {
    return NextResponse.json(
      { error: "Pakta Integritas harus disetujui sebelum mengirimkan usulan." },
      { status: 422 }
    );
  }

  // TODO: Simpan ke DB (Prisma) sebagai status "draft_usulan"
  // Sementara ini: kembalikan ID dummy untuk demo
  const draftId = `PR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  return NextResponse.json(
    {
      success: true,
      id: draftId,
      status: "under_review",
      message:
        "Usulan berhasil diterima. Status dapat dipantau melalui ID usulan yang tertera.",
    },
    { status: 201 }
  );
}
