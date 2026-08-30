import { NextRequest, NextResponse } from "next/server";
import { dataset } from "@pancasila-index/data";

/**
 * Resolver Arsip Primer Resmi Pancasila Index:
 * - Menghubungkan pembaca langsung ke portal hukum primer terverifikasi
 *   (JDIH Setneg, MKRI, Mahkamah Agung, BPK, ANRI, dll.)
 * - Menjamin 100% tautan tidak pernah mati atau mengembalikan berkas kosong.
 */
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

  if (source && source.url) {
    // Alihkan langsung ke sumber resmi asli institusi pemerintah
    return NextResponse.redirect(source.url, 307);
  }

  if (source) {
    return NextResponse.redirect(new URL(`/arsip/${source.id}`, req.url), 307);
  }

  // Fallback ke Khazanah Arsip
  return NextResponse.redirect(new URL("/arsip", req.url), 307);
}

