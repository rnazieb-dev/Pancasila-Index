import { NextRequest, NextResponse } from "next/server";
import { dataset } from "@pancasila-index/data";

const CLOUDFLARE_ACCOUNT_ID = "69f2a9ff4fe58ace350172f315f7feb7";
const R2_BUCKET_NAME = "pancasila-arsip-v3";

/**
 * Resolver Arsip Primer Pancasila Index:
 * 1. Coba serve langsung dari R2 (salinan cadangan sungguhan yang diunggah
 *    lewat packages/data/scripts/archive-r2.mts) - butuh env var
 *    CLOUDFLARE_API_TOKEN (Cloudflare API Token, izin R2 Object Read/Write
 *    untuk akun ini) baik di lokal maupun Vercel.
 * 2. Kalau R2 gagal/tidak dikonfigurasi/dokumen ditandai `archive_ok: false`,
 *    redirect ke `source.url` (portal resmi institusi) - bisa 404 kalau
 *    portalnya sudah mati (lihat docs/audit-source-url-mati-2026-09.md,
 *    72/634 mati per audit 2026-09).
 *
 * `archive_ok: false` pada source (10 dokumen per audit 2026-09) menandai
 * arsip R2 yang terkonfirmasi rusak (snapshot halaman blokir-bot situs
 * sumber saat proses arsip berjalan, bukan dokumen asli) - untuk sumber
 * ini, R2 sengaja dilewati agar tidak menyajikan berkas sampah sebagai
 * "unduhan resmi".
 */
async function fetchFromR2(
  r2Key: string
): Promise<{ body: ReadableStream<Uint8Array>; contentType: string } | null> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) return null;

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${R2_BUCKET_NAME}/objects/${encodeURIComponent(r2Key)}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok || !res.body) return null;
    return {
      body: res.body,
      contentType: res.headers.get("content-type") ?? "application/pdf",
    };
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return NextResponse.redirect(new URL("/arsip", req.url), 307);
  }

  // Ekstrak ID sumber dari path berkas, misal "v2/peraturan/uu-3-1999.pdf" -> "uu-3-1999"
  const rawFilename = slug[slug.length - 1] ?? "";
  const sourceId = rawFilename.replace(/\.(pdf|html)$/i, "");

  const source = dataset.sources.find(
    (s) => s.id === sourceId || s.r2_key?.includes(sourceId)
  );

  if (source?.r2_key && source.archive_ok !== false) {
    const r2 = await fetchFromR2(source.r2_key);
    if (r2) {
      return new NextResponse(r2.body, {
        status: 200,
        headers: {
          "Content-Type": r2.contentType,
          "Content-Disposition": `inline; filename="${source.id}.pdf"`,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  }

  if (source && source.url) {
    // R2 gagal/tidak dikonfigurasi/ditandai rusak -> alihkan ke sumber resmi asli
    return NextResponse.redirect(source.url, 307);
  }

  if (source) {
    return NextResponse.redirect(new URL(`/arsip/${source.id}`, req.url), 307);
  }

  // Fallback ke Khazanah Arsip
  return NextResponse.redirect(new URL("/arsip", req.url), 307);
}

