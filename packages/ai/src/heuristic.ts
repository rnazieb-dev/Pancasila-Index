/**
 * Klasifikator heuristik kata-kunci -> dimensi rubrik.
 *
 * Ini PROTOTIPE deterministik untuk menyaring kandidat dimensi dari
 * teks peristiwa. Ia TIDAK memberi skor - skor tetap tugas manusia
 * (atau LLM yang diusulkan lalu dikurasi). Tujuannya mempercepat triase.
 */

export const KEYWORDS: Record<string, string[]> = {
  "sila-1": [
    "agama",
    "ibadah",
    "rumah ibadah",
    "kepercayaan",
    "intoleransi",
    "imlek",
    "tradisi tionghoa",
    "blasfemi",
  ],
  "sila-2": [
    "penyiksaan",
    "penghilangan",
    "eksekusi mati",
    "hak asasi",
    "ham ",
    "korban",
    "kekerasan aparat",
    "korban jiwa",
    "penjara",
  ],
  "sila-3": [
    "otonomi daerah",
    "otda",
    "provinsi",
    "suku",
    "etnis",
    "diskriminasi rasial",
    "papua",
    "aceh",
    "timor timur",
    "integrasi nasional",
    "shutdown internet",
  ],
  "sila-4": [
    "pers",
    "demonstrasi",
    "aksi mahasiswa",
    "pemilu",
    "pencalonan",
    "kpk",
    "antikorupsi",
    "kebebasan berekspresi",
    "dinasti politik",
    "parlemen",
    "dpr",
  ],
  "sila-5": [
    "kemiskinan",
    "bansos",
    "jaminan sosial",
    "subsidi",
    "gizi",
    "makan bergizi",
    "dana desa",
    "ketimpangan",
    "bpjs",
  ],
  "tujuan-1": [
    "pertahanan",
    "tentara",
    "tni",
    "polri",
    "terorisme",
    "bencana",
    "pandemi",
    "tsunami",
    "vaksinasi",
    "keadaan bahaya",
  ],
  "tujuan-2": [
    "apbn",
    "infrastruktur",
    "kereta cepat",
    "ibu kota negara",
    "ikn",
    "layanan dasar",
    "kesehatan",
    "kesejahteraan umum",
    "bailout",
  ],
  "tujuan-3": [
    "pendidikan",
    "sekolah",
    "guru",
    "kurikulum",
    "merdeka belajar",
    "kip",
    "beasiswa",
    "iptek",
    "budaya",
  ],
  "tujuan-4": [
    "pbb",
    "asean",
    "traktat",
    "diplomat",
    "kedaulatan",
    "perjanjian internasional",
    "ketertiban dunia",
    "myanmar",
    "palestina",
    "helsinki",
  ],
  "negara-hukum": [
    "mahkamah konstitusi",
    "putusan mk",
    "hakim",
    "kasasi",
    "supremasi hukum",
    "perppu",
    "kuhp",
    "rkuhp",
    "impunitas",
    "danantara",
    "fit and proper",
  ],
  "checks-balances": [
    "dpr mengesahkan",
    "fungsi pengawasan",
    "interpelasi",
    "angket",
    "bpk",
    "audit",
    "revisi uu kpk",
    "md3",
    "mkmk",
    "etik",
    "uji materi",
  ],
  "kedaulatan-rakyat": [
    "pemilihan langsung",
    "suara rakyat",
    "referendum",
    "konsultasi rakyat",
    "ambang batas",
    "partisipasi publik",
    "keterbukaan informasi",
    "politik dinasti",
    "nepotisme",
  ],
};

export interface HeuristicHit {
  dimension_id: string;
  hits: string[];
  /** 0..1 - makin banyak kata kunci makin tinggi */
  strength: number;
}

/** Kembalikan kandidat dimensi untuk satu potongan teks. */
export function classifyText(text: string): HeuristicHit[] {
  const lower = text.toLowerCase();
  const hits: HeuristicHit[] = [];

  for (const [dimId, words] of Object.entries(KEYWORDS)) {
    const found = words.filter((w) => lower.includes(w));
    if (found.length > 0) {
      hits.push({
        dimension_id: dimId,
        hits: found,
        strength: Math.min(0.9, 0.3 + 0.15 * (found.length - 1)),
      });
    }
  }

  return hits.sort((a, b) => b.strength - a.strength);
}
