import type { MetadataRoute } from "next";

/**
 * Petunjuk crawler: indeksasi halaman publik (termasuk /arsip/[id] & /privasi),
 * menolak area API, autentikasi, dan rute kurasi internal.
 *
 * Selaras dengan visi: mesin pencari melihat halaman dokumen ber-OG yang
 * bersih (bukan file mentah). Semua rute `/api/*` dan `/kurasi/*` ditolak.
 */
const AGGRESSIVE_AI_AND_SCRAPER_BOTS = [
  "Bytespider",
  "ClaudeBot",
  "anthropic-ai",
  "CCBot",
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "FacebookBot",
  "PerplexityBot",
  "Omgilibot",
  "Diffbot",
  "cohere-ai",
  "PetalBot",
  "SemrushBot",
  "AhrefsBot",
  "DotBot",
  "MJ12bot",
  "Amazonbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/kurasi/", "/peer-review/", "/pengaturan/", "/masuk/", "/daftar/"],
      },
      {
        userAgent: AGGRESSIVE_AI_AND_SCRAPER_BOTS,
        disallow: ["/"],
      },
    ],
    sitemap: "https://www.pancasila.site/sitemap.xml",
  };
}
