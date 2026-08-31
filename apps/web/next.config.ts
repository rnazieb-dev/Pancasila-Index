import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Content Security Policy (CSP).
 *
 * Dev mode butuh 'unsafe-inline' dan 'unsafe-eval' untuk HMR Next.js.
 * Produksi tetap memakai keduanya untuk inline style & eval yang dipakai
 * oleh library pihak ketiga (mis. chart libs) yang tidak menambah
 * nonce. Pemutakhiran ke nonce penuh adalah pekerjaan terpisah dan
 * memerlukan audit semua style/script inline.
 *
 * Tujuan pagar:
 * - Blokir injeksi script inline berbahaya (XSS).
 * - Blokir frame embedding (clickjacking) oleh pihak ketiga.
 * - Batasi konektivitas keluar hanya ke domain yang dipakai.
 * - Cegah plugin Flash/Java/etc. (object-src 'none').
 */
const isProd = process.env.NODE_ENV === "production";
const scriptSrc = [
  "'self'",
  // Catatan: @vercel/analytics & @vercel/speed-insights saat ini TIDAK
  // dipakai (lihat apps/web/package.json). Disisakan agar CSP siap
  // ketika telemetry diaktifkan kembali tanpa harus mengedit ulang.
  "https://vercel.live",
  ...(isProd ? [] : ["'unsafe-inline'", "'unsafe-eval'"]),
];
const styleSrc = ["'self'", "'unsafe-inline'"];
const imgSrc = ["'self'", "data:", "https:", "blob:"];
const fontSrc = ["'self'", "data:"];
const connectSrc = [
  "'self'",
  "https://www.pancasila.site",
  "https://pancasila.site",
  "https://vercel.live",
];
const frameAncestors = ["'none'"];
const formAction = ["'self'"];

const cspValue = [
  `default-src 'self'`,
  `script-src ${scriptSrc.join(" ")}`,
  `style-src ${styleSrc.join(" ")}`,
  `img-src ${imgSrc.join(" ")}`,
  `font-src ${fontSrc.join(" ")}`,
  `connect-src ${connectSrc.join(" ")}`,
  `frame-ancestors ${frameAncestors.join(" ")}`,
  `form-action ${formAction.join(" ")}`,
  `base-uri 'self'`,
  `object-src 'none'`,
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspValue,
  },
  {
    // Mencegah browser MIME-sniffing file menjadi tipe lain.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Referer tidak bocor ke host lain.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Aktifkan perlindungan XSS bawaan browser (legacy, tetap berguna).
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    // Tolak embedding oleh iframe pihak ketiga (clickjacking).
    // CSP frame-ancestors sudah mengurus, header ini backup untuk browser lama.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Batasi API browser berbahaya (kamera/mikrofon/geolokasi/dll.) ke origin sendiri.
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
    ].join(", "),
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ["@pancasila-index/core", "@pancasila-index/data"],
  outputFileTracingRoot: monorepoRoot,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
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
