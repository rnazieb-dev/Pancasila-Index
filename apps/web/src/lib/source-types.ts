/**
 * Daftar kanonik jenis sumber primer.
 *
 * Satu-satunya sumber kebenaran untuk formulir usulan DAN validasi API.
 *
 * Latar: daftar ini pernah ditulis dua kali. Formulir /peer-review/usulan
 * memakai label ("Undang-Undang", "TAP MPR") sedangkan API memvalidasi slug
 * ("undang-undang", "dokumen-mpr"), sehingga setiap pengiriman ditolak 422.
 * Selama kedua sisi mengimpor dari berkas ini, keduanya tidak bisa berpisah.
 */
export const SOURCE_TYPES = [
  { slug: "undang-undang", label: "Undang-Undang (Lembaran Negara)" },
  { slug: "perppu", label: "Perppu" },
  { slug: "peraturan-pemerintah", label: "Peraturan Pemerintah" },
  { slug: "keppres", label: "Keputusan / Peraturan Presiden" },
  { slug: "putusan-mk", label: "Putusan Mahkamah Konstitusi (MK)" },
  { slug: "putusan-ma", label: "Putusan Mahkamah Agung (MA)" },
  { slug: "putusan-mpd", label: "Putusan Majelis Kehormatan / Pengawas" },
  { slug: "dokumen-mpr", label: "Ketetapan / Risalah Sidang MPR" },
  { slug: "arsip-nasional", label: "Arsip Nasional" },
  { slug: "laporan-lembaga", label: "Laporan Lembaga Negara (LHP BPK, KY, Ombudsman)" },
  { slug: "jurnal", label: "Jurnal Akademik (peer-reviewed)" },
  { slug: "buku", label: "Buku" },
  { slug: "berita", label: "Pemberitaan" },
  { slug: "lainnya", label: "Dokumen Resmi Lainnya" },
] as const;

export type SourceTypeSlug = (typeof SOURCE_TYPES)[number]["slug"];

export const SOURCE_TYPE_SLUGS: readonly string[] = SOURCE_TYPES.map((t) => t.slug);

export function isValidSourceType(value: unknown): value is SourceTypeSlug {
  return typeof value === "string" && SOURCE_TYPE_SLUGS.includes(value);
}
