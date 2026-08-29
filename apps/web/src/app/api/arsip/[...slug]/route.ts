import { NextRequest, NextResponse } from "next/server";

const R2_PUBLIC_BASE = "https://pub-d32e9ecc77a94678995544350a586fcd.r2.dev";
const ACCOUNT_ID = "69f2a9ff4fe58ace350172f315f7feb7";
const BUCKET_NAME = "pancasila-arsip";

/**
 * Proxy streaming arsip primer dari Cloudflare R2:
 * - Menyajikan dokumen resmi PDF secara mandiri dari domain pancasila.site
 * - Memberikan header caching permanen (immutable) agar dilayani langsung oleh Edge CDN
 * - Header Content-Disposition: inline memastikan browser langsung membuka reader PDF
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const r2Key = slug.join("/");
  const encodedKey = encodeURIComponent(r2Key);
  const token = process.env.CLOUDFLARE_API_TOKEN ?? process.env.CLOUDFLARE_R2_TOKEN;
  const filename = slug[slug.length - 1] ?? "dokumen.pdf";

  try {
    // 1. Coba lewat Public R2 CDN domain
    let res = await fetch(`${R2_PUBLIC_BASE}/${r2Key}`, {
      next: { revalidate: 86400 * 30 },
    }).catch(() => null);

    // 2. Jika CDN belum propagasi/gagal, fallback ke Cloudflare API langsung
    if (!res || !res.ok) {
      const r2Url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${encodedKey}`;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      res = await fetch(r2Url, {
        headers,
        next: { revalidate: 86400 * 30 },
      });
    }

    if (!res.ok) {
      if (res.status === 404) {
        return new NextResponse(
          `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Dokumen Arsip — Pancasila Index</title><style>body{font-family:ui-sans-serif,system-ui,sans-serif;padding:3rem 1rem;max-width:600px;margin:0 auto;text-align:center;line-height:1.6;color:#0f172a;background:#ffffff;}code{background:#f1f5f9;padding:0.2rem 0.4rem;border-radius:4px;font-size:0.9em;}a{color:#d97706;font-weight:bold;text-decoration:none;}</style></head><body><h2>Arsip Primer Pancasila Index</h2><p>Dokumen <code>${r2Key}</code> dalam proses sinkronisasi repositori penelitian Pancasila Index.</p><p><a href="javascript:history.back()">&larr; Kembali ke halaman sebelumnya</a></p></body></html>`,
          { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
      return new NextResponse(`R2 Fetch Error: ${res.statusText}`, { status: res.status });
    }

    const contentType =
      res.headers.get("content-type") ||
      (r2Key.endsWith(".pdf")
        ? "application/pdf"
        : "application/octet-stream");

    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Robots-Tag": "noindex, follow",
      },
    });
  } catch (err) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
