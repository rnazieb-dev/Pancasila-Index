import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Catatan: middleware (apps/web/src/middleware.ts) yang memasang
 * Content-Security-Policy dan header keamanan lain
 * (X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
 * Permissions-Policy). next.config.ts hanya memegang redirect.
 *
 * Pagar berlapis:
 * - CSP: default-src/object-src/base-uri/form-action/frame-ancestors ketat.
 *   `script-src` memuat 'unsafe-inline' karena 254 halaman di sini
 *   di-prerender statis dan tidak dapat membawa nonce per-permintaan;
 *   alasan lengkapnya ada di docstring middleware.ts. JANGAN mengklaim
 *   perlindungan inline-script di dokumentasi mana pun.
 * - SameSite=Strict (auth.ts): cookie tidak bocor cross-site.
 * - Origin/Referer check (middleware): tolak mutation cross-origin.
 * - auth() di setiap route handler: wajib sesi valid.
 */

const nextConfig: NextConfig = {
  transpilePackages: ["@pancasila-index/core", "@pancasila-index/data"],
  outputFileTracingRoot: monorepoRoot,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "pancasila.site" }],
        destination: "https://www.pancasila.site/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
