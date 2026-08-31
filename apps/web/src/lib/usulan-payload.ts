import type { SourceTypeSlug } from "./source-types";

/**
 * Kontrak muatan POST /api/usulan.
 *
 * Satu-satunya sumber kebenaran untuk penamaan field, dipakai bersama oleh
 * formulir dan route handler.
 *
 * Latar: /usulkan-bukti mengirim penamaan camelCase (`institutionId`,
 * `summary`, `submitterName`) sedangkan API mewajibkan snake_case
 * (`institution_id`, `argumentasi`, `nama`) plus `funding` dan
 * `setuju_pakta`. Tidak ada yang cocok, sehingga formulir itu selalu ditolak
 * 422 sejak awal tanpa ada yang menyadarinya. Dengan tipe bersama ini,
 * ketidakcocokan serupa gagal saat kompilasi, bukan saat pengguna menekan
 * tombol kirim.
 */
export interface UsulanPayload {
  institution_id: string;
  term_id: string;
  dimension_id: string;
  source_type: SourceTypeSlug;
  source_title?: string;
  source_url: string;
  argumentasi: string;
  nama: string;
  afiliasi: string;
  funding: string;
  setuju_pakta: boolean;
}

/**
 * Field yang wajib terisi. Diturunkan dari tipe di atas, sehingga daftar ini
 * tidak dapat berbeda dari kontraknya.
 */
export const USULAN_REQUIRED_FIELDS = [
  "institution_id",
  "term_id",
  "dimension_id",
  "source_type",
  "source_url",
  "argumentasi",
  "nama",
  "afiliasi",
  "funding",
] as const satisfies readonly (keyof UsulanPayload)[];
