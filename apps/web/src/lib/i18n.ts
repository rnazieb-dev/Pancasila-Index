/**
 * i18n ringan untuk kerangka UI.
 *
 * Bahasa Indonesia adalah sumber utama; bahasa daerah bersifat
 * progresif (beta) dan otomatis jatuh kembali ke Indonesia untuk
 * kunci yang belum diterjemahkan. Konten substantif (rubrik,
 * rasional, bukti) tetap Indonesia - penerjemahan konten menyusul.
 */

export interface LocaleMeta {
  code: string;
  native: string;
  beta?: boolean;
}

export const LOCALES: LocaleMeta[] = [
  { code: "id", native: "Bahasa Indonesia" },
  { code: "jv", native: "Basa Jawa", beta: true },
  { code: "su", native: "Basa Sunda", beta: true },
  { code: "mad", native: "Madhurâ", beta: true },
  { code: "min", native: "Minangkabau", beta: true },
];

export type LocaleCode = (typeof LOCALES)[number]["code"];
type Dict = Record<string, string>;

const id: Dict = {
  navHome: "Beranda",
  navTimeline: "Timeline",
  navInstitutions: "Lembaga",
  navUud: "Landasan UUD",
  navMethodology: "Metodologi",
  navCuration: "Kurasi",
  footerNote: "Catatan:",
  footerDisclaimer:
    "seluruh penilaian pada fase ini berstatus draf hasil demonstrasi metodologi dan belum dikurasi dewan editorial. Indeks bukan vonis akhir.",
  footerLicense: "Kode AGPL-3.0 · Data CC BY-SA 4.0 · kontribusi via pull request",
};

const jv: Dict = {
  navHome: "Ngarep",
  navTimeline: "Garis Wektu",
  footerNote: "Cathetan:",
  footerDisclaimer:
    "sadaya pangukur ing fase iki isih draf asil demonstrasi metodologi lan durung dikurasi dewan editorial. Indeks dudu putusan final.",
};

const su: Dict = {
  navTimeline: "Garis Waktos",
  footerNote: "Catetan:",
  footerDisclaimer:
    "sadaya penilaian dina fase ieu masih draf hasil demonstrasi métodologi sareng acan dikurasi déwan éditorial. Indéks sanes putusan ahir.",
};

const mad: Dict = {
  navTimeline: "Ghâris Bâkto",
  footerNote: "Catatan:",
  footerDisclaimer:
    "sadajâ penilaian ḍâlem fase arèya ghi' draf hasèl demonstrasi metodologi bân bellum ekurasi. Indeks bânnè vonis ahir.",
};

const min: Dict = {
  navTimeline: "Garih Wakatu",
  footerNote: "Catatan:",
  footerDisclaimer:
    "sado panilaian dalam fase ko masih draf hasil demonstrasi metodologi dan alun dikurasi dewan editorial. Indeks bukan vonis akhir.",
};

const DICTS: Record<string, Dict> = { id, jv, su, mad, min };

/** Terjemahkan kunci dengan fallback ke Bahasa Indonesia lalu kunci itu sendiri. */
export function translate(locale: string, key: string): string {
  return DICTS[locale]?.[key] ?? id[key] ?? key;
}

export function localeMeta(code: string): LocaleMeta {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0]!;
}

export function isLocale(value: unknown): value is LocaleCode {
  return LOCALES.some((l) => l.code === value);
}
