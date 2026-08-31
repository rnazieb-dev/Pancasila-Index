import { NextRequest, NextResponse } from "next/server";
import { dataset } from "@pancasila-index/data";

/**
 * Resolver Arsip Primer Resmi Pancasila Index:
 * - Menghubungkan pembaca langsung ke portal hukum primer institusi
 *   (JDIH Setneg, MKRI, Mahkamah Agung, BPK, ANRI, dll.)
 *
 * PENTING: ini hanya redirect ke `source.url` - TIDAK ada salinan cadangan
 * tersimpan di R2 atau di mana pun (`r2_key`/`archive_url` di dataset belum
 * benar-benar terhubung ke storage apa pun). Kalau portal resminya sudah
 * pindah/dihapus, redirect ini akan 404 juga. Audit 2026-09 menemukan 72
 * dari 634 `source.url` sudah mati (lihat /arsip/[id] untuk cadangan
 * Wayback Machine per-dokumen).
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

