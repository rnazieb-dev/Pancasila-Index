/**
 * i18n ringan untuk kerangka UI.
 *
 * Bahasa Indonesia adalah sumber utama dan acuan kelengkapan. Setiap
 * bahasa lain WAJIB memuat seluruh kunci yang ada di `id`: tipe
 * `Dict = Record<UiKey, string>` membuat kunci yang hilang jadi error
 * kompilasi, sehingga tidak ada bahasa yang tampil "tersedia" di UI
 * padahal sebagian besar labelnya masih jatuh kembali ke Indonesia.
 *
 * Terjemahan bahasa daerah berstatus `needsReview`: dihasilkan sebagai
 * draf kerja dan menunggu verifikasi penutur asli lewat alur
 * /peer-review/terjemahan. Konten substantif (rubrik, rasional, bukti)
 * tetap Indonesia — penerjemahan konten menyusul.
 */

export interface LocaleMeta {
  code: string;
  native: string;
  /** Terjemahan UI lengkap, tetapi belum diverifikasi penutur asli. */
  needsReview?: boolean;
}

export const LOCALES: LocaleMeta[] = [
  { code: "id", native: "Bahasa Indonesia" },
  { code: "en", native: "English" },
  { code: "jv", native: "Basa Jawa", needsReview: true },
  { code: "su", native: "Basa Sunda", needsReview: true },
  { code: "mad", native: "Madhurâ", needsReview: true },
  { code: "min", native: "Minangkabau", needsReview: true },
];

export type LocaleCode = (typeof LOCALES)[number]["code"];

/** Kunci UI kerangka. `id` mendefinisikan kontrak; dict lain harus cocok. */
const id = {
  navHome: "Beranda",
  navExplore: "Eksplorasi",
  navMethodData: "Metodologi & Data",
  navInstitutions: "Lembaga Negara",
  navTimeline: "Timeline Penilaian",
  navCompare: "Bandingkan Era & Organ",
  navActors: "Direktori Tokoh",
  navMethodology: "Metodologi",
  navUud: "Peta Pasal UUD",
  navExport: "Ekspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulan Saya",
  actSearch: "Cari",
  actPeerReview: "Peer Review",
  actSignIn: "Masuk",
  actRegister: "Daftar",
  actSettings: "Pengaturan",
  langChoose: "Pilih bahasa",
  langNeedsReview: "perlu tinjauan penutur asli",
  themeDarkLabel: "Mode Gelap",
  themeLightLabel: "Mode Terang",
  themeSwitch: "Ganti",
  themeToDark: "Ganti ke Mode Gelap",
  themeToLight: "Ganti ke Mode Terang",
  menuOpen: "Buka menu",
  menuClose: "Tutup menu",
  secReview: "Tinjauan Sejawat",
  secAccount: "Akun Pengulas",
  peerPortal: "Portal Peer Review",
  footerNote: "Catatan:",
  footerDisclaimer:
    "seluruh penilaian pada fase ini berstatus draf hasil demonstrasi metodologi dan belum dikurasi dewan editorial. Indeks bukan vonis akhir.",
  footerLicense:
    "Kode AGPL-3.0 · Data CC BY-SA 4.0 · kontribusi via Peer Review",
} satisfies Record<string, string>;

/** Semua dict wajib memenuhi bentuk ini — kunci hilang = error kompilasi. */
export type UiKey = keyof typeof id;
type Dict = Record<UiKey, string>;

const en: Dict = {
  navHome: "Home",
  navExplore: "Explore",
  navMethodData: "Methodology & Data",
  navInstitutions: "State Institutions",
  navTimeline: "Assessment Timeline",
  navCompare: "Compare Eras & Organs",
  navActors: "Public Figures Directory",
  navMethodology: "Methodology",
  navUud: "Constitutional Article Map",
  navExport: "Export Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "My Draft Submissions",
  actSearch: "Search",
  actPeerReview: "Peer Review",
  actSignIn: "Sign in",
  actRegister: "Register",
  actSettings: "Settings",
  langChoose: "Choose language",
  langNeedsReview: "awaiting native-speaker review",
  themeDarkLabel: "Dark Mode",
  themeLightLabel: "Light Mode",
  themeSwitch: "Switch",
  themeToDark: "Switch to Dark Mode",
  themeToLight: "Switch to Light Mode",
  menuOpen: "Open menu",
  menuClose: "Close menu",
  secReview: "Peer Review",
  secAccount: "Reviewer Account",
  peerPortal: "Peer Review Portal",
  footerNote: "Note:",
  footerDisclaimer:
    "all assessments at this phase are drafts demonstrating the methodology and have not been curated by an editorial board. This index is not a final verdict.",
  footerLicense:
    "Code AGPL-3.0 · Data CC BY-SA 4.0 · contribute via Peer Review",
};

const jv: Dict = {
  navHome: "Ngarep",
  navExplore: "Njlajah",
  navMethodData: "Metodologi & Data",
  navInstitutions: "Lembaga Negara",
  navTimeline: "Garis Wektu Penilaian",
  navCompare: "Bandingake Jaman & Organ",
  navActors: "Direktori Tokoh",
  navMethodology: "Metodologi",
  navUud: "Peta Pasal UUD",
  navExport: "Ekspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulanku",
  actSearch: "Golek",
  actPeerReview: "Tinjauan Sejawat",
  actSignIn: "Mlebu",
  actRegister: "Ndaftar",
  actSettings: "Pangaturan",
  langChoose: "Pilih basa",
  langNeedsReview: "perlu ditliti penutur asli",
  themeDarkLabel: "Mode Peteng",
  themeLightLabel: "Mode Padhang",
  themeSwitch: "Ganti",
  themeToDark: "Ganti menyang Mode Peteng",
  themeToLight: "Ganti menyang Mode Padhang",
  menuOpen: "Bukak menu",
  menuClose: "Tutup menu",
  secReview: "Tinjauan Sejawat",
  secAccount: "Akun Pangulas",
  peerPortal: "Portal Tinjauan Sejawat",
  footerNote: "Cathetan:",
  footerDisclaimer:
    "sadaya pangukur ing fase iki isih draf asil demonstrasi metodologi lan durung dikurasi dewan editorial. Indeks dudu putusan final.",
  footerLicense:
    "Kode AGPL-3.0 · Data CC BY-SA 4.0 · kontribusi liwat Tinjauan Sejawat",
};

const su: Dict = {
  navHome: "Kaca Utama",
  navExplore: "Nalungtik",
  navMethodData: "Métodologi & Data",
  navInstitutions: "Lembaga Nagara",
  navTimeline: "Garis Waktos Penilaian",
  navCompare: "Bandingkeun Jaman & Organ",
  navActors: "Diréktori Tokoh",
  navMethodology: "Métodologi",
  navUud: "Péta Pasal UUD",
  navExport: "Ékspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulan Abdi",
  actSearch: "Milarian",
  actPeerReview: "Tinjauan Sasama",
  actSignIn: "Asup",
  actRegister: "Ngadaftar",
  actSettings: "Setélan",
  langChoose: "Pilih basa",
  langNeedsReview: "peryogi ditalungtik panyatur asli",
  themeDarkLabel: "Mode Poék",
  themeLightLabel: "Mode Caang",
  themeSwitch: "Ganti",
  themeToDark: "Ganti ka Mode Poék",
  themeToLight: "Ganti ka Mode Caang",
  menuOpen: "Buka menu",
  menuClose: "Tutup menu",
  secReview: "Tinjauan Sasama",
  secAccount: "Akun Pangulas",
  peerPortal: "Portal Tinjauan Sasama",
  footerNote: "Catetan:",
  footerDisclaimer:
    "sadaya penilaian dina fase ieu masih draf hasil demonstrasi métodologi sareng acan dikurasi déwan éditorial. Indéks sanes putusan ahir.",
  footerLicense:
    "Kode AGPL-3.0 · Data CC BY-SA 4.0 · kontribusi via Tinjauan Sasama",
};

const mad: Dict = {
  navHome: "Kaca Otama",
  navExplore: "Nyelajâ",
  navMethodData: "Metodologi & Data",
  navInstitutions: "Lembhâgâ Nagârâ",
  navTimeline: "Ghâris Bâkto Penilaian",
  navCompare: "Bhândhingaghi Jhâman & Organ",
  navActors: "Direktori Tokoh",
  navMethodology: "Metodologi",
  navUud: "Petâ Pasal UUD",
  navExport: "Ekspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulan Kaulâ",
  actSearch: "Nyare",
  actPeerReview: "Tinjauan Sajhâbât",
  actSignIn: "Maso'",
  actRegister: "Ngadhâftar",
  actSettings: "Pangatoran",
  langChoose: "Pèlè bhâsa",
  langNeedsReview: "parlo etèlètè panotor aslè",
  themeDarkLabel: "Mode Petteng",
  themeLightLabel: "Mode Terrang",
  themeSwitch: "Ghântè",
  themeToDark: "Ghântè ka Mode Petteng",
  themeToLight: "Ghântè ka Mode Terrang",
  menuOpen: "Bukka' menu",
  menuClose: "Totop menu",
  secReview: "Tinjauan Sajhâbât",
  secAccount: "Akun Pangolas",
  peerPortal: "Portal Tinjauan Sajhâbât",
  footerNote: "Catatan:",
  footerDisclaimer:
    "sadajâ penilaian ḍâlem fase arèya ghi' draf hasèl demonstrasi metodologi bân bellum ekurasi dhewan editorial. Indeks bânnè vonis ahir.",
  footerLicense:
    "Kode AGPL-3.0 · Data CC BY-SA 4.0 · kontribusi via Tinjauan Sajhâbât",
};

const min: Dict = {
  navHome: "Laman Utamo",
  navExplore: "Manjalajah",
  navMethodData: "Metodologi & Data",
  navInstitutions: "Lambago Nagara",
  navTimeline: "Garih Wakatu Panilaian",
  navCompare: "Bandiangkan Maso & Organ",
  navActors: "Direktori Tokoh",
  navMethodology: "Metodologi",
  navUud: "Peta Pasal UUD",
  navExport: "Ekspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulan Ambo",
  actSearch: "Mancari",
  actPeerReview: "Tinjauan Sajawat",
  actSignIn: "Masuak",
  actRegister: "Mandafta",
  actSettings: "Pangaturan",
  langChoose: "Piliah bahaso",
  langNeedsReview: "paralu ditinjau panutua asli",
  themeDarkLabel: "Mode Kalam",
  themeLightLabel: "Mode Tarang",
  themeSwitch: "Tuka",
  themeToDark: "Tuka ka Mode Kalam",
  themeToLight: "Tuka ka Mode Tarang",
  menuOpen: "Bukak menu",
  menuClose: "Tutuik menu",
  secReview: "Tinjauan Sajawat",
  secAccount: "Akun Paninjau",
  peerPortal: "Portal Tinjauan Sajawat",
  footerNote: "Catatan:",
  footerDisclaimer:
    "sado panilaian dalam fase ko masih draf hasil demonstrasi metodologi dan alun dikurasi dewan editorial. Indeks bukan vonis akhir.",
  footerLicense:
    "Kode AGPL-3.0 · Data CC BY-SA 4.0 · kontribusi via Tinjauan Sajawat",
};

const DICTS: Record<string, Dict> = { id, en, jv, su, mad, min };

/** Terjemahkan kunci dengan fallback ke Bahasa Indonesia lalu kunci itu sendiri. */
export function translate(locale: string, key: string): string {
  return DICTS[locale]?.[key as UiKey] ?? id[key as UiKey] ?? key;
}

export function localeMeta(code: string): LocaleMeta {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0]!;
}

export function isLocale(value: unknown): value is LocaleCode {
  return LOCALES.some((l) => l.code === value);
}
