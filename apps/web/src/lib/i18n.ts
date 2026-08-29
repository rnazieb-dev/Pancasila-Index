/**
 * i18n untuk antarmuka publik dan komponen utama.
 *
 * Bahasa Indonesia adalah sumber utama dan acuan kelengkapan. Setiap
 * bahasa lain WAJIB memuat seluruh kunci yang ada di `id`: tipe
 * `Dict = Record<UiKey, string>` membuat kunci yang hilang jadi error
 * kompilasi, sehingga tidak ada bahasa yang tampil "tersedia" di UI
 * padahal sebagian besar labelnya masih jatuh kembali ke Indonesia.
 */

export interface LocaleMeta {
  code: string;
  short: string;
  native: string;
  /** Terjemahan UI lengkap, tetapi belum diverifikasi penutur asli. */
  needsReview?: boolean;
}

export const LOCALES: LocaleMeta[] = [
  { code: "id", short: "ID", native: "Bahasa Indonesia" },
  { code: "en", short: "EN", native: "English" },
  { code: "jv", short: "JAW", native: "Basa Jawa", needsReview: true },
  { code: "su", short: "SUN", native: "Basa Sunda", needsReview: true },
  { code: "mad", short: "MAD", native: "Madhurâ", needsReview: true },
  { code: "min", short: "MIN", native: "Minangkabau", needsReview: true },
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
  navAkarSejarah: "Akar Sejarah",
  navUud: "Peta Pasal UUD",
  navExport: "Ekspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulan Saya",
  navAuditData: "Audit Data",
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
  secAccount: "Akun Kontributor",
  peerPortal: "Portal Peer Review",
  footerNote: "Catatan:",
  footerDisclaimer:
    "seluruh penilaian pada fase ini berstatus draf hasil demonstrasi metodologi dan belum dikurasi dewan editorial. Indeks bukan vonis akhir.",
  footerLicense:
    "Kode AGPL-3.0 · Data CC BY-SA 4.0 · kontribusi via Peer Review",

  // Hero & General UI
  heroBadge: "Platform Terbuka Penilaian Konstitusional",
  heroTitle: "Menilai Kesetiaan Kekuasaan pada Pancasila & UUD 1945",
  heroSubtitle:
    "Indeks kepatuhan 8 organ konstitusional Indonesia dari 1945 hingga kini, bersitasi 525+ bukti hukum primer dan ditinjau sejawat secara terbuka.",
  heroCtaExplore: "Jelajahi 8 Lembaga",
  heroCtaMethod: "Baca Metodologi",
  heroCtaTimeline: "Linimasa Penilaian",

  // Aggregate Stats
  statInstitutions: "Organ Konstitusi",
  statTerms: "Masa Jabatan",
  statEvents: "Peristiwa Berbukti",
  statSources: "Sumber Primer",
  statArticles: "Pasal UUD 1945",

  // Section Headers
  secOrgansTitle: "8 Organ Konstitusional UUD 1945",
  secOrgansDesc: "Penilaian kepatuhan terhadap 12 dimensi Pancasila, Pembukaan UUD, dan Norma Struktural.",
  secTimelineTitle: "Indeks Draf per Era Kepresidenan (1945–Kini)",
  secTimelineDesc: "Skor komposit kesetiaan konstitusional lintas era kepemimpinan nasional.",
  secEventsTitle: "Sorotan Peristiwa Sejarah Berbukti",
  secEventsDesc: "Setiap peristiwa diverifikasi dari lembaran negara, putusan pengadilan, risalah sidang, atau laporan resmi.",
  secFeaturesTitle: "Jelajahi Fitur & Data Pancasila Index",
  secFeaturesDesc: "Gunakan alat analisis interaktif, direktori aktor, pencarian teks terpadu, dan ekspor data publik.",

  // Feature Cards
  featSearchTitle: "Pencarian Terpadu",
  featSearchDesc: "Cari 652 peristiwa berbukti, 525 sumber primer, dan 73 pasal konstitusi dengan filter instan.",
  featCompareTitle: "Bandingkan Era & Organ",
  featCompareDesc: "Komparasi radar multi-dimensi antar-presiden atau antar-organ konstitusional secara berdampingan.",
  featTrendTitle: "Grafik Tren Historis",
  featTrendDesc: "Visualisasi grafik garis multi-dekade 1945–2024 memetakan dinamika 3 pilar konstitusi lintas rezim.",
  featActorsTitle: "Direktori Aktor",
  featActorsDesc: "Profil 123 pimpinan organ konstitusional dan tokoh kenegaraan tertaut ke peristiwa hukum.",
  featUudTitle: "Landasan UUD 1945",
  featUudDesc: "Peta 73 pasal konstitusi hasil amandemen dan kaitannya dengan 12 dimensi penilaian.",
  featProposeTitle: "Usulkan Bukti Baru",
  featProposeDesc: "Kanal keterbukaan bagi publik, peneliti, dan mahasiswa hukum untuk mengusulkan bukti primer.",
  featExportTitle: "Ekspor Data Terbuka",
  featExportDesc: "Unduh dataset kanonik lengkap dalam format CSV dan JSON untuk riset dan jurnalisme.",

  // Labels & Links
  viewProfile: "Lihat profil lembaga →",
  viewEra: "Buka era →",
  eventsLabel: "peristiwa",
  sourcesLabel: "sumber",
  draftIndexLabel: "Indeks draf",
  coverageLabel: "cakupan",
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
  navAkarSejarah: "Historical Roots",
  navUud: "Constitutional Article Map",
  navExport: "Export Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "My Draft Submissions",
  navAuditData: "Audit Data",
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

  heroBadge: "Open Constitutional Assessment Platform",
  heroTitle: "Assessing State Power's Fidelity to Pancasila & Constitution",
  heroSubtitle:
    "Compliance index of Indonesia's 8 constitutional organs from 1945 to date, backed by 525+ primary legal sources and open peer review.",
  heroCtaExplore: "Explore 8 Institutions",
  heroCtaMethod: "Read Methodology",
  heroCtaTimeline: "Assessment Timeline",

  statInstitutions: "Constitutional Organs",
  statTerms: "Governing Terms",
  statEvents: "Evidenced Events",
  statSources: "Primary Sources",
  statArticles: "Articles of 1945 Constitution",

  secOrgansTitle: "8 Constitutional Organs of the 1945 Constitution",
  secOrgansDesc: "Assessment across 12 dimensions: Pancasila, Preamble Mandates, and Structural Norms.",
  secTimelineTitle: "Draft Index by Presidential Era (1945–Present)",
  secTimelineDesc: "Composite constitutional compliance score across national leadership eras.",
  secEventsTitle: "Spotlight of Evidenced Historical Milestones",
  secEventsDesc: "Every event is verified from official gazettes, court rulings, parliamentary records, or audit reports.",
  secFeaturesTitle: "Explore Pancasila Index Features & Data",
  secFeaturesDesc: "Access interactive analytics tools, actor directory, full-text search, and open datasets.",

  featSearchTitle: "Unified Search",
  featSearchDesc: "Search 652 evidenced events, 525 primary sources, and 73 constitutional articles with instant filters.",
  featCompareTitle: "Compare Eras & Organs",
  featCompareDesc: "Side-by-side multi-dimensional radar comparison between presidential terms or constitutional branches.",
  featTrendTitle: "Historical Trend Chart",
  featTrendDesc: "Multi-decade line chart visualization (1945–2024) tracing constitutional dynamics across regimes.",
  featActorsTitle: "Actors Directory",
  featActorsDesc: "Profiles of 123 institutional leaders and public officials linked to constitutional cases.",
  featUudTitle: "1945 Constitutional Basis",
  featUudDesc: "Map of 73 amended constitutional articles and their direct mapping to the 12 scoring dimensions.",
  featProposeTitle: "Propose New Evidence",
  featProposeDesc: "Open submission channel for citizens, legal scholars, and students to submit court decisions.",
  featExportTitle: "Open Data Export",
  featExportDesc: "Download canonical datasets in CSV and JSON formats for academic research and journalism.",

  viewProfile: "View institution profile →",
  viewEra: "View era →",
  eventsLabel: "events",
  sourcesLabel: "sources",
  draftIndexLabel: "Draft index",
  coverageLabel: "coverage",
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
  navAkarSejarah: "Oyod Sejarah",
  navUud: "Peta Pasal UUD",
  navExport: "Ekspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulanku",
  navAuditData: "Audit Data",
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

  heroBadge: "Platform Terbuka Penilaian Konstitusional",
  heroTitle: "Mbiji Kasetyan Panguwasa marang Pancasila & UUD 1945",
  heroSubtitle:
    "Indeks kasetyan 8 organ konstitusi Indonesia wiwit 1945 nganti saiki, adhedhasar 525+ bukti hukum primer.",
  heroCtaExplore: "Njlajah 8 Lembaga",
  heroCtaMethod: "Waca Metodologi",
  heroCtaTimeline: "Garis Wektu Penilaian",

  statInstitutions: "Organ Konstitusi",
  statTerms: "Mangsa Jabatan",
  statEvents: "Kedadeyan Berbukti",
  statSources: "Sumber Primer",
  statArticles: "Pasal UUD 1945",

  secOrgansTitle: "8 Organ Konstitusi UUD 1945",
  secOrgansDesc: "Mbiji kasetyan marang 12 dimensi Pancasila, Pembukaan UUD, lan Norma Struktural.",
  secTimelineTitle: "Indeks Draf saben Jaman Kepresidenan (1945–Saiki)",
  secTimelineDesc: "Biji komposit kasetyan konstitusional ing saben jaman kepemimpinan.",
  secEventsTitle: "Kedadeyan Sejarah Kunci Berbukti",
  secEventsDesc: "Saben kedadeyan diverifikasi saka lembaran negara, putusan pengadilan, utawa laporan resmi BPK.",
  secFeaturesTitle: "Njlajah Fitur & Data Pancasila Index",
  secFeaturesDesc: "Gunakake piranti analisis interaktif, direktori tokoh, lan ekspor data publik.",

  featSearchTitle: "Panggolekan Terpadu",
  featSearchDesc: "Goleki 652 kedadeyan berbukti, 525 sumber primer, lan 73 pasal konstitusi.",
  featCompareTitle: "Bandingake Jaman & Organ",
  featCompareDesc: "Bandingake radar multi-dimensi antar-presiden utawa lembaga konstitusi kanthi jejer.",
  featTrendTitle: "Grafik Tren Historis",
  featTrendDesc: "Visualisasi garis tren 1945–2024 nggambarake dinamika 3 pilar konstitusi lintas jaman.",
  featActorsTitle: "Direktori Tokoh",
  featActorsDesc: "Profil 123 pimpinan organ konstitusi lan tokoh kenegaraan.",
  featUudTitle: "Landhesan UUD 1945",
  featUudDesc: "Peta 73 pasal konstitusi lan sambungane karo 12 dimensi penilaian.",
  featProposeTitle: "Usulake Bukti Anyar",
  featProposeDesc: "Kanal tinarbuka kanggo masyarakat lan peneliti ngusulake putusan pengadilan anyar.",
  featExportTitle: "Ekspor Data Tinarbuka",
  featExportDesc: "Undhuh dataset lengkap ing format CSV lan JSON kanggo riset.",

  viewProfile: "Deleng profil lembaga →",
  viewEra: "Bukak jaman →",
  eventsLabel: "kedadeyan",
  sourcesLabel: "sumber",
  draftIndexLabel: "Indeks draf",
  coverageLabel: "cakupan",
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
  navAkarSejarah: "Akar Sajarah",
  navUud: "Péta Pasal UUD",
  navExport: "Ékspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulan Abdi",
  navAuditData: "Audit Data",
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

  heroBadge: "Platform Terbuka Penilaian Konstitusional",
  heroTitle: "Meunteun Kasatiaan Kakawasaan kana Pancasila & UUD 1945",
  heroSubtitle:
    "Indéks kasatiaan 8 organ konstitusional Indonésia ti 1945 dugi ka kiwari, didadasaran ku 525+ bukti hukum primér.",
  heroCtaExplore: "Nalungtik 8 Lembaga",
  heroCtaMethod: "Baca Métodologi",
  heroCtaTimeline: "Garis Waktos Penilaian",

  statInstitutions: "Organ Konstitusi",
  statTerms: "Mangsa Jabatan",
  statEvents: "Kajadian Berbukti",
  statSources: "Sumber Primér",
  statArticles: "Pasal UUD 1945",

  secOrgansTitle: "8 Organ Konstitusional UUD 1945",
  secOrgansDesc: "Penilaian kana 12 dimensi Pancasila, Pembukaan UUD, sareng Norma Struktural.",
  secTimelineTitle: "Indéks Draf unggal Mangsa Kaprésidénan (1945–Kiwari)",
  secTimelineDesc: "Skor komposit kasatiaan konstitusional dina saban jaman kapamingpinan nasional.",
  secEventsTitle: "Kajadian Sajarah Utama Berbukti",
  secEventsDesc: "Saban kajadian diverifikasi tina lambaran nagara, putusan pangadilan, atanapi laporan resmi.",
  secFeaturesTitle: "Nalungtik Fitur & Data Pancasila Index",
  secFeaturesDesc: "Anggo alat analisis interaktif, direktori tokoh, sareng ékspor data publik.",

  featSearchTitle: "Panyungsi Terpadu",
  featSearchDesc: "Milarian 652 kajadian berbukti, 525 sumber primér, sareng 73 pasal konstitusi.",
  featCompareTitle: "Bandingkeun Jaman & Organ",
  featCompareDesc: "Komparasi radar multi-diménsi antar-présidén atanapi antar-lembaga sacara sajajar.",
  featTrendTitle: "Grafik Trén Historis",
  featTrendDesc: "Visualisasi garis trén 1945–2024 ngagambarkeun dinamika 3 pilar konstitusi.",
  featActorsTitle: "Diréktori Tokoh",
  featActorsDesc: "Profil 123 pamingpin organ konstitusional sareng tokoh kanagaraan.",
  featUudTitle: "Dadasar UUD 1945",
  featUudDesc: "Péta 73 pasal konstitusi sareng patalina sareng 12 diménsi penilaian.",
  featProposeTitle: "Usulkeun Bukti Anyar",
  featProposeDesc: "Kanal kabuka pikeun publik sareng panalungtik ngusulkeun bukti primér anyar.",
  featExportTitle: "Ékspor Data Terbuka",
  featExportDesc: "Unduh dataset lengkep dina format CSV sareng JSON pikeun panalungtikan.",

  viewProfile: "Tingali profil lembaga →",
  viewEra: "Buka mangsa →",
  eventsLabel: "kajadian",
  sourcesLabel: "sumber",
  draftIndexLabel: "Indéks draf",
  coverageLabel: "cakupan",
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
  navAkarSejarah: "Akar Sajhârâ",
  navUud: "Petâ Pasal UUD",
  navExport: "Ekspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulan Kaulâ",
  navAuditData: "Audit Data",
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

  heroBadge: "Platform Terbuka Penilaian Konstitusional",
  heroTitle: "Nyelèksè Kasatèya'an Kokoasa'an ka Pancasila & UUD 1945",
  heroSubtitle:
    "Indeks kasatèya'an 8 organ konstitusi Indonesia molaè 1945 kantos samangkèn, abuktè 525+ dokumen hokom primer.",
  heroCtaExplore: "Jelajah 8 Lembhâgâ",
  heroCtaMethod: "Bâca Metodologi",
  heroCtaTimeline: "Ghâris Bâkto Penilaian",

  statInstitutions: "Organ Konstitusi",
  statTerms: "Bâkto Jabatan",
  statEvents: "Kadhâddhiyân Berbukti",
  statSources: "Somber Primer",
  statArticles: "Pasal UUD 1945",

  secOrgansTitle: "8 Organ Konstitusi UUD 1945",
  secOrgansDesc: "Penilaian ka 12 dimensi Pancasila, Pembukaan UUD, bân Norma Struktural.",
  secTimelineTitle: "Indeks Draf sabbân Bâkto Kapresidenan (1945–Samangkèn)",
  secTimelineDesc: "Biji komposit kasatèya'an konstitusional sabbân bâkto pimpinan nasional.",
  secEventsTitle: "Kadhâddhiyân Sejarah Utama Berbukti",
  secEventsDesc: "Sabbân kadhâddhiyân èverifikasi ḍâri lembaran nagârâ, putusan pengadilan, otabâ laporan resmi.",
  secFeaturesTitle: "Nyelajâ Fitur & Data Pancasila Index",
  secFeaturesDesc: "Ghuna'aghi alat analisis interaktif, direktori tokoh, bân ekspor data publik.",

  featSearchTitle: "Panyarè'an Terpadu",
  featSearchDesc: "Sarè 652 kadhâddhiyân berbukti, 525 somber primer, bân 73 pasal konstitusi.",
  featCompareTitle: "Bhândhingaghi Jhâman & Organ",
  featCompareDesc: "Komparasi radar multi-dimensi antar-presiden otabâ organ konstitusi.",
  featTrendTitle: "Grafik Tren Historis",
  featTrendDesc: "Visualisasi garis tren 1945–2024 mèttèngaghi dinamika 3 pilar konstitusi.",
  featActorsTitle: "Direktori Tokoh",
  featActorsDesc: "Profil 123 pimpinan organ konstitusi bân tokoh kenagaraan.",
  featUudTitle: "Landhesan UUD 1945",
  featUudDesc: "Petâ 73 pasal konstitusi bân kaitanna ka 12 dimensi penilaian.",
  featProposeTitle: "Usulaghi Bukti Anyar",
  featProposeDesc: "Kanal tabukka' ka'angghuy publik bân panaliti ngusulaghi bukti primer anyar.",
  featExportTitle: "Ekspor Data Tabukka'",
  featExportDesc: "Download dataset lengkap format CSV bân JSON ka'angghuy riset.",

  viewProfile: "Tèngghu profil lembhâgâ →",
  viewEra: "Bukka' bâkto →",
  eventsLabel: "kadhâddhiyân",
  sourcesLabel: "somber",
  draftIndexLabel: "Indeks draf",
  coverageLabel: "cakupan",
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
  navAkarSejarah: "Aka Sajarah",
  navUud: "Peta Pasal UUD",
  navExport: "Ekspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulan Ambo",
  navAuditData: "Audit Data",
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

  heroBadge: "Platform Tabukak Panilaian Konstitusional",
  heroTitle: "Manilai Kasatiaan Kakuasoan pado Pancasila & UUD 1945",
  heroSubtitle:
    "Indeks kapatuahan 8 organ konstitusional Indonesia dari 1945 sampai kini, basandik pado 525+ bukti hukum primer.",
  heroCtaExplore: "Jelajahi 8 Lambago",
  heroCtaMethod: "Baco Metodologi",
  heroCtaTimeline: "Garih Wakatu Panilaian",

  statInstitutions: "Organ Konstitusi",
  statTerms: "Maso Jabatan",
  statEvents: "Paristiwa Babukti",
  statSources: "Sumber Primer",
  statArticles: "Pasal UUD 1945",

  secOrgansTitle: "8 Organ Konstitusional UUD 1945",
  secOrgansDesc: "Panilaian kapatuahan pado 12 dimensi Pancasila, Pambukoan UUD, jo Norma Struktural.",
  secTimelineTitle: "Indeks Draf per Maso Kapresidenan (1945–Kini)",
  secTimelineDesc: "Skor komposit kasatiaan konstitusional pado satiok maso kapamimpinan nasional.",
  secEventsTitle: "Sorotan Paristiwa Sejarah Babukti",
  secEventsDesc: "Satiok paristiwa diverifikasi dari lembaran nagara, putusan pangadilan, atau laporan rasmi.",
  secFeaturesTitle: "Jelajahi Fitur & Data Pancasila Index",
  secFeaturesDesc: "Gunoan alat analisis interaktif, direktori tokoh, dan ekspor data publik.",

  featSearchTitle: "Pancarian Tapadu",
  featSearchDesc: "Cari 652 paristiwa babukti, 525 sumber primer, jo 73 pasal konstitusi.",
  featCompareTitle: "Bandiangkan Maso & Organ",
  featCompareDesc: "Komparasi radar multi-dimensi antar-presiden atau antar-lambago sacaro badampiangan.",
  featTrendTitle: "Grafik Tren Historis",
  featTrendDesc: "Visualisasi grafik garih 1945–2024 mametakan dinamika 3 pilar konstitusi.",
  featActorsTitle: "Direktori Tokoh",
  featActorsDesc: "Profil 123 pimpinan organ konstitusional dan tokoh kanagaraan.",
  featUudTitle: "Landasan UUD 1945",
  featUudDesc: "Peta 73 pasal konstitusi dan kaitannyo jo 12 dimensi panilaian.",
  featProposeTitle: "Usuakan Bukti Baru",
  featProposeDesc: "Kanal tabukak untuak masyarakaik jo panaliti mangusuakan bukti primer baru.",
  featExportTitle: "Ekspor Data Tabukak",
  featExportDesc: "Unduah dataset langkok dalam format CSV jo JSON untuak riset.",

  viewProfile: "Caliak profil lambago →",
  viewEra: "Bukak maso →",
  eventsLabel: "paristiwa",
  sourcesLabel: "sumber",
  draftIndexLabel: "Indeks draf",
  coverageLabel: "cakupan",
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
