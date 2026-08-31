import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser, hasRole, audit } from "@/lib/authz";
import { recordUsulanDecision } from "@/lib/usulan-store";

/**
 * Keputusan kurator atas usulan bukti kontributor.
 *
 * Menyetujui di sini TIDAK menerbitkan skor. Ia menandai usulan siap
 * dijadikan patch YAML yang harus masuk lewat PR — kanonik penilaian tetap
 * git. Lihat lib/usulan-patch.ts.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!hasRole(user, "KURATOR")) {
    return NextResponse.json(
      { error: "Butuh peran KURATOR untuk menelaah usulan." },
      { status: 403 },
    );
  }

  const reviewerId = user!.id;
  if (!reviewerId) {
    return NextResponse.json(
      { error: "Sesi tidak memuat identitas pengguna yang stabil." },
      { status: 401 },
    );
  }

  let body: { publicId?: string; decision?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format JSON tidak valid" }, { status: 400 });
  }

  const { publicId, decision } = body;
  if (!publicId || (decision !== "approve" && decision !== "reject")) {
    return NextResponse.json(
      { error: "publicId dan decision (approve|reject) wajib diisi." },
      { status: 400 },
    );
  }

  // Penolakan wajib beralasan: pengusul berhak tahu mengapa, dan alasan itu
  // menjadi bagian dari jejak audit publik.
  const note = String(body.note ?? "").trim();
  if (decision === "reject" && !note) {
    return NextResponse.json(
      { error: "Alasan penolakan wajib diisi." },
      { status: 422 },
    );
  }

  const result = await recordUsulanDecision({
    publicId,
    decision,
    reviewerId,
    reviewerName: user!.name || "Kurator",
    note,
  });

  if (!result.ok) {
    const pesan = {
      "not-found": "Usulan tidak ditemukan.",
      "already-reviewed":
        "Anda sudah menelaah usulan ini. Kuorum membutuhkan penelaah kedua yang berbeda.",
      final: "Usulan ini sudah final dan tidak dapat ditelaah ulang.",
    }[result.reason];
    return NextResponse.json({ error: pesan }, { status: 409 });
  }

  await audit(user, `usulan.${decision}`, "Usulan", publicId, note || undefined).catch(
    () => {},
  );

  return NextResponse.json({
    success: true,
    status: result.row.status,
    reviewers: result.row.reviewerIds.length,
    message:
      result.row.status === "PUBLISHED"
        ? "Kuorum terpenuhi. Usulan siap dijadikan patch YAML untuk PR."
        : result.row.status === "REJECTED"
          ? "Usulan ditolak beserta alasannya."
          : "Telaah pertama tercatat. Menunggu penelaah kedua.",
  });
}
