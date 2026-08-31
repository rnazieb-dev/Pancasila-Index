import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Catatan: middleware (apps/web/src/middleware.ts) yang sekarang
 * menghasilkan Content-Security-Policy dengan nonce per-request dan
 * memasang header keamanan lain (X-Content-Type-Options, X-Frame-Options,
 * Referrer-Policy, X-XSS-Protection, Permissions-Policy). Definisi CSP
 * ada di middleware agar nonce bisa di-injeksi; next.config.ts hanya
 * memegang redirect.
 *
 * Pagar berlapis:
 * - CSP nonce: blokir script inline berbahaya.
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
