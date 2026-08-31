import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { auth } from "@/auth";
import { persistUsulan } from "@/lib/usulan-store";
import { isValidSourceType, SOURCE_TYPE_SLUGS } from "@/lib/source-types";
import { USULAN_REQUIRED_FIELDS } from "@/lib/usulan-payload";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Akses ditolak. Hanya Kontributor yang telah login yang dapat mengusulkan bukti." },
      { status: 401 }
    );
  }

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

  // Validasi field wajib. Daftarnya diturunkan dari kontrak bersama
  // lib/usulan-payload.ts agar formulir dan API tidak dapat berbeda.
  const missing = USULAN_REQUIRED_FIELDS.filter((f) => !body[f]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Field wajib tidak terisi: ${missing.join(", ")}` },
      { status: 422 }
    );
  }

  // Daftar kanonik dipakai bersama formulir; lihat lib/source-types.ts.
  if (!isValidSourceType(body.source_type)) {
    return NextResponse.json(
      {
        error:
          `Tipe sumber (source_type) tidak valid. Nilai yang diterima: ` +
          SOURCE_TYPE_SLUGS.join(", "),
      },
      { status: 422 },
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

  const sourceTitle = body.source_title ? String(body.source_title).trim() : null;
  const pakta = Boolean(body.setuju_pakta);

  // Persist ke DB (write-through dengan fallback JSON saat database nonaktif).
  try {
    const saved = await persistUsulan(
      {
        publicId: "",
        institutionId: String(body.institution_id),
        termId: String(body.term_id),
        dimensionId: String(body.dimension_id),
        sourceType: String(body.source_type),
        sourceTitle,
        sourceUrl: String(body.source_url),
        argumentasi: String(body.argumentasi).trim(),
        nama: String(body.nama).trim(),
        afiliasi: body.afiliasi ? String(body.afiliasi).trim() : null,
        funding: body.funding ? String(body.funding).trim() : null,
        pakta,
        status: "PENDING_REVIEW",
        reviewerNames: [],
        authorIdent: session.user.email || session.user.name || "kontributor",
      },
      session.user.id || null,
    );

    return NextResponse.json(
      {
        success: true,
        id: saved.publicId,
        status: "under_review",
        message: "Usulan berhasil diterima. Status dapat dipantau melalui ID usulan yang tertera.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Gagal menyimpan usulan:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan usulan. Mohon coba kembali." },
      { status: 503 }
    );
  }
}
