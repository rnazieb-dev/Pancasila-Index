import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware pelindung CSRF untuk endpoint yang mengubah state.
 *
 * Strategi: untuk setiap permintaan non-GET ke /api/*, validasi bahwa
 * header Origin (atau Referer sebagai fallback) cocok dengan host yang
 * melayani. Permintaan dari origin yang berbeda ditolak dengan 403.
 *
 * Pelengkap dari SameSite=Strict (di auth.ts) dan validasi sesi
 * NextAuth (auth() di setiap route handler). Ketiga lapis ini
 * memastikan:
 * - SameSite=Strict: cookie tidak terkirim pada cross-site request.
 * - Origin/Referer: pertahanan tambahan bila SameSite dilonggarkan
 *   oleh browser lawas.
 * - auth(): setiap endpoint mutasi wajib sesi valid.
 *
 * GET request dan request yang menyertakan file (Content-Type multipart)
 * tidak dicek Origin karena umumnya tidak menjadi vektor CSRF.
 */

const UNSAFE_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

export function middleware(req: NextRequest) {
  const method = req.method.toUpperCase();

  if (!UNSAFE_METHODS.has(method)) {
    return NextResponse.next();
  }

  const url = req.nextUrl;
  const expectedOrigin = url.origin;

  // Ambil Origin (prioritas utama), fallback ke Referer.
  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");

  let sourceUrl: URL | null = null;
  if (originHeader) {
    try {
      sourceUrl = new URL(originHeader);
    } catch {
      sourceUrl = null;
    }
  } else if (refererHeader) {
    try {
      sourceUrl = new URL(refererHeader);
    } catch {
      sourceUrl = null;
    }
  }

  if (!sourceUrl) {
    // Tanpa Origin/Referer: tolak. Browser modern selalu mengirim salah satu
    // untuk permintaan non-GET. Tanpa header, sangat mencurigakan.
    return new NextResponse(
      JSON.stringify({
        error: "Forbidden",
        message: "Permintaan tanpa header Origin atau Referer ditolak.",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (sourceUrl.origin !== expectedOrigin) {
    return new NextResponse(
      JSON.stringify({
        error: "Forbidden",
        message: "Asal permintaan tidak sesuai dengan host yang melayani.",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return NextResponse.next();
}

/**
 * Middleware hanya berjalan untuk endpoint API yang mengubah state.
 * GET (read-only), asset statis, dan halaman tidak dicek.
 * Pengecualian: /api/auth/* (NextAuth) — yang menangani callback OAuth
 * dan CSRF token endpoint-nya sendiri.
 */
export const config = {
  matcher: ["/api/((?!auth/).*)"],
};
