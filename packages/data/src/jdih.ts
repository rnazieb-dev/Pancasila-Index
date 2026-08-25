/**
 * Klien JDIH Kementerian Sekretariat Negara (jdih.setneg.go.id) — fase 6a.
 *
 * Semua fungsi di sini MURNI (tanpa fetch): membangun payload, mengurai
 * respons, dan menormalkan metadata. Jaringan dilakukan oleh
 * scripts/scrape-jdih.mts agar mudah dites dan di-mock.
 *
 * Endpoint terverifikasi (25 Agustus 2026):
 *  POST /api/hukumproduk/produkhukum  — daftar peraturan (jml + data[])
 *  POST /api/hukumproduk/detaildata   — metadata lengkap + daftar berkas
 *  GET  /api/hukumproduk/pdf?l=uploads&f=<realName>&fl=<idperaturan>
 *       — unduh PDF (validasi magic bytes %PDF wajib)
 */
import { z } from "zod";

export const JDIH_BASE = "https://jdih.setneg.go.id";

/** Jenis instrumen yang tersedia di JDIH Setneg (terverifikasi). */
export const JDIH_JENIS = [
  "UU",
  "PERPU",
  "PP",
  "PERPRES",
  "KEPPRES",
  "INPRES",
  "PERMENSESNEG",
  "KEPMENSESNEG",
] as const;
export type JdihJenis = (typeof JDIH_JENIS)[number];

// ---------------------------------------------------------------- skema

export const listRowSchema = z.object({
  idperaturan: z.string(),
  no_peraturan: z.string(),
  tahun: z.union([z.string(), z.number()]).transform(String),
  tentang: z.string().default(""),
  jns: z.string(),
  nama_jenis: z.string().default(""),
  files: z.string().nullish(),
});
export type ListRow = z.infer<typeof listRowSchema>;

const fileMetaSchema = z.object({
  name: z.string().nullish(),
  realName: z.string().nullish(),
  size: z.number().nullish(),
});

export const detailSchema = z.object({
  row: z
    .array(
      z.object({
        idperaturan: z.string(),
        no_peraturan: z.string(),
        tahun: z.union([z.string(), z.number()]).transform(String),
        tentang: z.string().default(""),
        jns: z.string(),
        nama_jenis: z.string().default(""),
        tgl_di: z.string().nullish(),
        diundangkan: z.string().nullish(),
        status: z.string().nullish(),
        status_hukum: z.string().nullish(),
        mengubah: z.string().nullish(),
        mencabut: z.string().nullish(),
        diubah: z.string().nullish(),
        dicabut: z.string().nullish(),
        teu: z.string().nullish(),
        ln: z.number().nullish(),
        tln: z.number().nullish(),
      })
    )
    .min(1),
  file: z.array(fileMetaSchema).default([]),
});
export type JdihDetail = z.infer<typeof detailSchema>;

// ------------------------------------------------- parser referensi hukum

/**
 * Ekstrak referensi instrumen hukum dari judul sumber.
 * Mengenali bentuk pendek (UU/Perppu/Keppres) maupun panjang
 * ("Undang-Undang Nomor ...", "Keputusan Presiden Nomor ...",
 * "Peraturan Pemerintah Pengganti Undang-Undang ...").
 * Mengembalikan null bila bukan produk hukum yang ada di JDIH Setneg
 * (mis. putusan MK/MA, dokumen MPR, artikel media, UUDS).
 */
export function parseLegalRef(title: string): {
  jns: JdihJenis;
  no: string;
  thn: string;
} | null {
  const t = title.replace(/\s+/g, " ").trim();

  // UUDS tidak disediakan jenisnya oleh JDIH Setneg -> null.
  if (/UUDS/i.test(t)) return null;

  // Urutan penting: PERPU sebelum UU (judulnya memuat "Undang-Undang"),
  // Keppres sebelum UU ("...Presiden" aman tapi eksplisit lebih dulu).
  const kinds: Array<[RegExp, JdihJenis]> = [
    [/Peraturan\s+Pemerintah\s+Pengganti|^Perppu\b|^PERPPU\b/i, "PERPU"],
    [/Keputusan\s+Presiden|\bKEPPRES\b/i, "KEPPRES"],
    [/\bUU\b|Undang[\s-]?Undang/i, "UU"],
  ];
  for (const [re, jns] of kinds) {
    if (!re.test(t)) continue;
    const m =
      t.match(/(?:No\.?\s*|Nomor\s+)(\d+[A-Z]?)\s*(?:Tahun|\/)\s*(\d{4})/i) ??
      t.match(/(\d+[A-Z]?)\s+Tahun\s+(\d{4})/i);
    if (m) return { jns, no: m[1]!, thn: m[2]! };
  }
  return null;
}

// ------------------------------------------------------- builder payload

export function buildListPayload(opts: {
  jns: JdihJenis[];
  start?: number;
  length?: number;
}): Record<string, unknown> {
  return {
    tentang: "",
    p_lihan: "semua",
    jns: opts.jns,
    thn: [],
    status: "",
    terx: "All",
    sortOrder: "asc",
    length: opts.length ?? 200,
    start: opts.start ?? 0,
  };
}

export function detailPayload(ref: {
  jns: string;
  no: string;
  thn: string;
}): Record<string, unknown> {
  return { jns: ref.jns, no: ref.no, thn: ref.thn, k: "" };
}

export function pdfUrl(realName: string, idperaturan: string): string {
  return `${JDIH_BASE}/api/hukumproduk/pdf?l=uploads&f=${encodeURIComponent(
    realName
  )}&fl=${encodeURIComponent(idperaturan)}`;
}

// ------------------------------------------------------------- pencocokan

/** Cari baris listing yang cocok persis nomor+tahun untuk satu referensi. */
export function matchRow(
  rows: readonly ListRow[],
  ref: { jns: string; no: string; thn: string }
): ListRow | undefined {
  return rows.find(
    (r) =>
      r.jns.toUpperCase() === ref.jns.toUpperCase() &&
      r.no_peraturan.replace(/^0+/, "") === ref.no.replace(/^0+/, "") &&
      r.tahun === ref.thn
  );
}

/** Enam digit tanggal ISO dari string API (atau kosong). */
export function isoDate(v: string | null | undefined): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}
