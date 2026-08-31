import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware: generator nonce CSP + pelindung CSRF.
 *
 * Untuk setiap permintaan:
 * 1. Generate nonce acak (base64) untuk Content-Security-Policy.
 * 2. Set nonce ke request header `x-nonce` agar Server Component / Next.js
 *    Script component bisa membaca dan menempelkannya ke tag <script>.
 * 3. Set nonce ke response header `Content-Security-Policy`.
 * 4. Untuk permintaan non-GET ke /api/*, validasi Origin/Referer.
 *
 * Tiga lapis pagar (CSP nonce + SameSite=Strict di auth.ts + validasi
 * sesi di route handler) memastikan:
 * - Script inline berbahaya tanpa nonce ditolak browser.
 * - Cookie sesi tidak terkirim pada cross-site request (SameSite).
 * - Permintaan POST/PUT/DELETE wajib Origin cocok dengan host.
 */

const UNSAFE_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

function generateNonce(): string {
  // Web Crypto API tersedia di Node 19+ dan Edge runtime; tidak butuh
  // import `node:crypto` (yang akan memecah webpack build).
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function buildCsp(nonce: string): string {
  const isProd = process.env.NODE_ENV === "production";
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    // Dev butuh 'unsafe-inline' + 'unsafe-eval' untuk HMR Next.js.
    // Produksi ketat: hanya nonce + 'self'.
    ...(isProd ? [] : ["'unsafe-inline'", "'unsafe-eval'"]),
  ];
  return [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(" ")}`,
    // style-src tetap 'unsafe-inline': React inline style={} untuk warna
    // dinamis + library pihak ketiga (Tailwind v4) yang inject inline style.
    // Risiko inline style jauh lebih kecil dari inline script (tidak
    // bisa execute JS). Untuk produksi ketat: gunakan style-src-attr
    // 'unsafe-inline' + style-src-elem 'self' (browser support modern).
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https: blob:`,
    `font-src 'self' data:`,
    // connect-src: hanya ke origin sendiri + Vercel (kalau ada analytics
    // diaktifkan). Saat ini tidak ada telemetry, jadi bisa dikecualikan
    // 'self' saja; namun disiapkan untuk fleksibilitas.
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

  // CSP nonce per-request. Propagasi ke request header agar server
  // components (mis. layout.tsx untuk Vercel Analytics <Script>) bisa
  // membaca via `headers().get("x-nonce")`.
  const nonce = generateNonce();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  const csp = buildCsp(nonce);
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
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
