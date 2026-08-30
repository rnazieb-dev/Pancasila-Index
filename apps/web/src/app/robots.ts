import type { MetadataRoute } from "next";

/**
 * Petunjuk crawler: indeksasi halaman publik (termasuk /arsip/[id] & /privasi),
 * menolak area API, autentikasi, dan rute kurasi internal.
 *
 * Selaras dengan visi: mesin pencari melihat halaman dokumen ber-OG yang
 * bersih (bukan file mentah). Semua rute `/api/*` dan `/kurasi/*` ditolak.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/kurasi/", "/peer-review/", "/pengaturan/", "/masuk/", "/daftar/"],
      },
    ],
    sitemap: "https://www.pancasila.site/sitemap.xml",
  };
}
