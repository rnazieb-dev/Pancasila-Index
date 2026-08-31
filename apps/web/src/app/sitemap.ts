import type { MetadataRoute } from "next";

import { dataset } from "@pancasila-index/data";

/**
 * Peta situs.
 *
 * `robots.ts` sudah lama mengumumkan https://www.pancasila.site/sitemap.xml
 * kepada mesin pencari, padahal berkasnya tidak pernah ada — alamat itu
 * menjawab 404. Peta ini diturunkan dari dataset agar tidak bisa lagi
 * menyimpang dari isi situs.
 */
const BASE = "https://www.pancasila.site";

const HALAMAN_STATIS: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, freq: "daily" },
  { path: "/metodologi", priority: 0.9, freq: "monthly" },
  { path: "/lembaga", priority: 0.9, freq: "weekly" },
  { path: "/timeline", priority: 0.8, freq: "weekly" },
  { path: "/akar-sejarah", priority: 0.8, freq: "monthly" },
  { path: "/landasan-uud", priority: 0.8, freq: "monthly" },
  { path: "/bandingkan", priority: 0.7, freq: "weekly" },
  { path: "/aktor", priority: 0.7, freq: "weekly" },
  { path: "/cari", priority: 0.6, freq: "weekly" },
  { path: "/ekspor", priority: 0.6, freq: "monthly" },
  { path: "/api-docs", priority: 0.6, freq: "monthly" },
  { path: "/kurasi/log", priority: 0.5, freq: "daily" },
  // /usulkan-bukti dan /peer-review sengaja TIDAK dicantumkan: keduanya
  // berpagar login dan menjawab 307 ke /masuk bagi perayap mesin pencari.
  { path: "/transparansi", priority: 0.4, freq: "monthly" },
  { path: "/koreksi", priority: 0.4, freq: "monthly" },
  { path: "/disclaimer", priority: 0.3, freq: "yearly" },
  { path: "/privasi", priority: 0.3, freq: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const statis = HALAMAN_STATIS.map((h) => ({
    url: `${BASE}${h.path}`,
    lastModified: now,
    changeFrequency: h.freq,
    priority: h.priority,
  }));

  const lembaga = dataset.institutions.map((i) => ({
    url: `${BASE}/lembaga/${i.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const slugLembaga = new Map(dataset.institutions.map((i) => [i.id, i.slug]));
  const masaJabatan = dataset.terms.flatMap((t) => {
    const slug = slugLembaga.get(t.institution_id);
    if (!slug) return [];
    return [{
      url: `${BASE}/lembaga/${slug}/${t.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }];
  });

  return [...statis, ...lembaga, ...masaJabatan];
}
