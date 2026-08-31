import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser, hasRole, audit } from "@/lib/authz";
import { getUsulanByPublicId } from "@/lib/usulan-store";
import { bukaPullRequestUsulan, githubConfig } from "@/lib/github-pr";

/**
 * Membuka Pull Request untuk satu usulan yang sudah lolos kuorum.
 *
 * Dipisahkan dari endpoint keputusan agar pembuatan PR menjadi tindakan sadar
 * seorang kurator, bukan efek samping otomatis dari persetujuan kedua.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!hasRole(user, "KURATOR")) {
    return NextResponse.json(
      { error: "Butuh peran KURATOR." },
      { status: 403 },
    );
  }

  if (!githubConfig()) {
    return NextResponse.json(
      {
        error:
          "Integrasi GitHub belum dipasang. Setel GITHUB_CANONICAL_REPO dan " +
          "GITHUB_PR_TOKEN, atau salin patch YAML secara manual.",
      },
      { status: 501 },
    );
  }

  let body: { publicId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format JSON tidak valid" }, { status: 400 });
  }
  if (!body.publicId) {
    return NextResponse.json({ error: "publicId wajib diisi." }, { status: 400 });
  }

  const row = await getUsulanByPublicId(body.publicId);
  if (!row) {
    return NextResponse.json({ error: "Usulan tidak ditemukan." }, { status: 404 });
  }
  if (row.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "Hanya usulan yang sudah lolos kuorum dapat dibuatkan PR." },
      { status: 409 },
    );
  }

  try {
    const hasil = await bukaPullRequestUsulan(row);
    await audit(user, "usulan.pr", "Usulan", row.publicId, hasil.url).catch(() => {});
    return NextResponse.json({ success: true, ...hasil });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal membuka pull request." },
      { status: 502 },
    );
  }
}
