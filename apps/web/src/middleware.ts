import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware: header keamanan + pelindung CSRF.
 *
 * KENAPA TIDAK MEMAKAI NONCE CSP.
 *
 * Upaya pertama memakai `script-src 'nonce-<acak>'` yang di-generate
 * per-permintaan. Itu MEMATIKAN situs di produksi: 254 halaman di sini
 * di-prerender statis (SSG), HTML-nya dibekukan saat build sehingga tidak
 * memuat nonce apa pun, sementara middleware mengirim nonce baru setiap
 * permintaan. Browser memblokir SELURUH inline script Next (bootstrap +
 * hidrasi) - halaman tetap membalas HTTP 200 tetapi nol JavaScript berjalan.
 * Tidak ada error server, jadi curl tampak sehat dan hanya browser sungguhan
 * yang menunjukkannya.
 *
 * Nonce dan prerender statis pada dasarnya tidak dapat disatukan: nonce
 * berubah tiap permintaan, HTML statis beku. Hash (`'sha256-...'`) juga tidak
 * bisa: inline script Next memuat data per-halaman sehingga hash-nya berbeda
 * tiap rute, dan middleware tidak tahu rute mana yang akan dilayani.
 *
 * Yang DIPERTAHANKAN dan benar-benar berlaku pada halaman statis:
 * - `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`
 * - `frame-ancestors 'none'` + X-Frame-Options: DENY (anti clickjacking)
 * - `form-action 'self'` (form tidak bisa submit ke domain lain)
 * - `connect-src 'self'` (tidak ada exfiltrasi via fetch ke domain lain)
 * - Referrer-Policy, Permissions-Policy, X-Content-Type-Options
 *
 * Yang HILANG dan jangan diklaim ada: perlindungan terhadap inline script.
 * `script-src` memuat 'unsafe-inline' karena itulah satu-satunya cara
 * halaman prerender dapat berjalan. Mitigasi XSS karena itu bersandar pada
 * escaping bawaan React dan validasi masukan di sisi server, bukan pada CSP.
 *
 * Lapis lain yang tetap utuh:
 * - SameSite=Strict (auth.ts): cookie sesi tak terkirim cross-site.
 * - Origin/Referer check di bawah: mutation cross-origin ditolak.
 * - auth() di setiap route handler: wajib sesi valid.
 */

const UNSAFE_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

function buildCsp(): string {
  const isProd = process.env.NODE_ENV === "production";
  return [
    `default-src 'self'`,
    // 'unsafe-inline' WAJIB: lihat catatan nonce di atas. Halaman prerender
    // statis tidak dapat membawa nonce per-permintaan. Dev tambahan
    // 'unsafe-eval' untuk HMR.
    `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
    // React menyisipkan style={} inline untuk warna dinamis; Tailwind v4 juga
    // meng-inject inline style. Inline style tidak dapat mengeksekusi JS.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
  ].join("; ");
}

export function middleware(req: NextRequest) {
  const method = req.method.toUpperCase();
  const isUnsafe = UNSAFE_METHODS.has(method);

  // CSRF: untuk non-GET, validasi Origin/Referer cocok dengan host.
  if (isUnsafe) {
    const expectedOrigin = req.nextUrl.origin;
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

    if (!sourceUrl || sourceUrl.origin !== expectedOrigin) {
      return new NextResponse(
        JSON.stringify({
          error: "Forbidden",
          message:
            "Permintaan tanpa header Origin/Referer yang valid ditolak.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", buildCsp());
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );

  return response;
}

export const config = {
  // Jalankan untuk semua route KECUALI aset statis & file Vercel internal.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
