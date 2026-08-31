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
  navArsip: "Khazanah Arsip ANRI",
  navUud: "Peta Pasal UUD",
  navExport: "Ekspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulan Saya",
  navAuditLog: "Log Aktivitas Kurasi",
  navAuditData: "Audit Data CKAN",
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
    "Indeks kepatuhan 8 organ konstitusional Indonesia dari 1945 hingga kini, bersitasi bukti hukum primer dan ditinjau sejawat secara terbuka.",
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
  featSearchDesc: "Cari peristiwa berbukti dan sumber primer dengan filter instan.",
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

  // Ekspor
  exportPageTitle: "Ekspor & Data Terbuka",
  exportPageSubtitle:
    "Unduh seluruh dataset Pancasila Index dalam format terstruktur CSV atau JSON untuk riset, analisis data, dan visualisasi independen.",
  exportFormatJson: "Format JSON",
  exportFormatCsv: "Format CSV",
  exportFormatApi: "API / JSON",
  exportCkanLabel: "Data Terbuka / CKAN",
  exportCardJsonTitle: "Dataset Kanonik Lengkap",
  exportCardEventsTitle: "Tabel Peristiwa Berbukti (Events)",
  exportCardAssessTitle: "Tabel Skor Penilaian (Assessments)",
  exportCardSourcesTitle: "Tabel Sumber Primer & Sitasi",
  exportCardCkanTitle: "Audit Data Terbuka (CKAN DataStore)",
  exportCardInstitutionsTitle: "Tabel Lembaga & Masa Jabatan",
  exportDownloadJson: "Unduh JSON",
  exportDownloadCsvEvents: "Unduh CSV Peristiwa",
  exportDownloadCsvAssess: "Unduh CSV Penilaian",
  exportDownloadCsvSources: "Unduh CSV Sumber",
  exportDownloadCsvInstitutions: "Unduh CSV Lembaga",
  exportCopy: "Salin",
  exportCopied: "Tersalin",
  exportLicenseTitle: "Lisensi Data Terbuka",
  exportLicenseBody: "Seluruh dataset Pancasila Index dilisensikan di bawah",
  exportLicenseCode:
    "Kode sumber platform berlisensi AGPL-3.0. Anda bebas mengutip, menyebarluaskan, dan membuat karya turunan dengan syarat menyebutkan sumber.",

  // Cari / Search
  cariPageTitle: "Pencarian Konstitusional",
  cariPlaceholder:
    "Ketik kata kunci, nomor UU, tokoh, atau topik (misal: HAM, korupsi, otonomi, Bagir Manan, Pemilu)...",
  cariFilterAll: "Semua",
  cariFilterEra: "Semua Era",
  cariFilterLembaga: "Semua Lembaga",
  cariEraRevolusi: "Era Revolusi",
  cariEraDemokrasiLiberal: "Demokrasi Liberal",
  cariEraDemokrasiTerpimpin: "Demokrasi Terpimpin",
  cariEraOrdeBaru: "Orde Baru",
  cariEraReformasi: "Era Reformasi",
  cariNoResults: "Tidak ada hasil yang cocok dengan filter Anda.",
  cariResultsCount: "hasil",
  cariSeeTimeline: "Lihat Linimasa",
  cariViewProfile: "Lihat profil",
  cariViewEvents: "Lihat peristiwa",

  // Bandingkan
  bandingkanPageTitle: "Bandingkan Era & Lembaga",
  bandingkanPlaceholder: "Cari nama tokoh / era...",
  bandingkanTableTitle: "Tabel Skor Komparatif Per Dimensi",
  bandingkanSummaryTitle: "Ringkasan Komparasi",

  // Donasi
  donasiPageTitle: "Dukung Pancasila Index",
  donasiPageSubtitle:
    "Donasi individu untuk pendirian yayasan/think tank yang akan mengelola Pancasila Index. 100% transparan, sesuai hukum.",
  donasiUseOfFundTitle: "Penggunaan dana",
  donasiUseOfFundBody:
    "Donasi yang masuk ke PT Aplikasi Profesi Indonesia (PT Perorangan, badan hukum) akan digunakan untuk:",
  donasiUseOfFund1Title: "Pembukaan yayasan / think tank",
  donasiUseOfFund1Body:
    "Biaya notaris, SK Kemenkumham, NPWP badan hukum baru, izin operasional.",
  donasiUseOfFund2Title: "Pengalihan kepemilikan",
  donasiUseOfFund2Body:
    "Setelah yayasan berdiri, kepemilikan dan pengelolaan Pancasila Index dialihkan ke yayasan.",
  donasiUseOfFund3Title: "Operasional yayasan",
  donasiUseOfFund3Body:
    "Riset, audit independen, hosting (Vercel, Cloudflare R2), penerjemahan, tinjauan sejawat.",

  donasiUseOfFund4Title: "Ngedegake dewan editorial",
  donasiUseOfFund4Body:
    "Honorarium anggota dewan editorial, rapat pleno, lan proses rekrutmen.",
  donasiUseOfFund5Title: "Ngedegake kepengurusan & anggota",
  donasiUseOfFund5Body:
    "Administrasi kepengurusan yayasan, rekrutmen anggota, pelatihan metodologi.",
  donasiUseOfFund6Title: "Operasional & risiko hukum",
  donasiUseOfFund6Body:
    "Konsultan hukum, audit internal, biaya notaris lanjutan, dan operasional harian.",

  donasiMethodsTitle: "Metode donasi",
  donasiMethodKitabisaLabel: "Kitabisa",
  donasiMethodKitabisaBody:
    "Donasi lewat Kitabisa: terverifikasi, terlapor, transparan. Donasi akan di-bridge ke rekening PT.",
  donasiMethodOpenCollectiveLabel: "Open Collective",
  donasiMethodOpenCollectiveBody:
    "Donasi lewat Open Collective: transparansi penuh internasional, dashboard publik, laporan otomatis.",
  donasiMethodBankLabel: "Transfer bank ke rekening PT",
  donasiMethodBankBody:
    "Rekening PT Aplikasi Profesi Indonesia: [Bank] [Nomor] a.n. [Nama]. Akan diisi setelah Anda menyediakannya.",
  donasiTransparencyTitle: "Transparansi",
  donasiTransparencyBody:
    "Setiap donasi yang masuk akan tercatat di halaman /transparansi. Audit publik dilakukan setiap akhir tahun fiskal.",
  donasiDisclaimer:
    "Donasi sukarela, tidak ada imbalan. Donasi tidak memberikan hak istimewa atas isi indeks. Setelah yayasan berdiri, pengelolaan Pancasila Index dialihkan ke yayasan dan PT kembali ke aktivitas komersialnya yang tidak terkait platform ini.",
  donasiCtaOpen: "Buka halaman donasi",
  footerDonate: "Dukung",

  // Audio (TTS)
  audioPlay: "Dengarkan",
  audioPlayTitle: "Dengarkan audio",
  audioLoading: "Memuat…",
  audioPlaying: "Berhenti",
  audioError: "Gagal",
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
  navArsip: "National Archives",
  navUud: "Constitutional Article Map",
  navExport: "Export Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "My Draft Submissions",
  navAuditLog: "Curation Activity Log",
  navAuditData: "Audit Data CKAN",
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
    "Compliance index of Indonesia's 8 constitutional organs from 1945 to date, backed by primary legal sources and open peer review.",
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
  featSearchDesc: "Search evidenced events and primary sources with instant filters.",
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

  // Ekspor / Export
  exportPageTitle: "Export & Open Data",
  exportPageSubtitle:
    "Download the full Pancasila Index dataset in structured CSV or JSON for research, data analysis, and independent visualization.",
  exportFormatJson: "JSON format",
  exportFormatCsv: "CSV format",
  exportFormatApi: "API / JSON",
  exportCkanLabel: "Open Data / CKAN",
  exportCardJsonTitle: "Full canonical dataset",
  exportCardEventsTitle: "Evidenced events table",
  exportCardAssessTitle: "Assessment scores table",
  exportCardSourcesTitle: "Primary sources & citations table",
  exportCardCkanTitle: "Open data audit (CKAN DataStore)",
  exportCardInstitutionsTitle: "Institutions & terms table",
  exportDownloadJson: "Download JSON",
  exportDownloadCsvEvents: "Download events CSV",
  exportDownloadCsvAssess: "Download assessments CSV",
  exportDownloadCsvSources: "Download sources CSV",
  exportDownloadCsvInstitutions: "Download institutions CSV",
  exportCopy: "Copy",
  exportCopied: "Copied",
  exportLicenseTitle: "Open data licence",
  exportLicenseBody: "The full Pancasila Index dataset is licensed under",
  exportLicenseCode:
    "Platform source code is licensed under AGPL-3.0. You are free to cite, redistribute, and create derivative works provided you credit the source.",

  // Cari / Search
  cariPageTitle: "Constitutional Search",
  cariPlaceholder:
    "Type a keyword, law number, public figure, or topic (e.g. human rights, corruption, regional autonomy, Bagir Manan, elections)...",
  cariFilterAll: "All",
  cariFilterEra: "All eras",
  cariFilterLembaga: "All institutions",
  cariEraRevolusi: "Revolution era",
  cariEraDemokrasiLiberal: "Liberal democracy",
  cariEraDemokrasiTerpimpin: "Guided democracy",
  cariEraOrdeBaru: "New Order",
  cariEraReformasi: "Reform era",
  cariNoResults: "No results match your filters.",
  cariResultsCount: "results",
  cariSeeTimeline: "View timeline",
  cariViewProfile: "View profile",
  cariViewEvents: "View events",

  // Bandingkan
  bandingkanPageTitle: "Compare Eras & Institutions",
  bandingkanPlaceholder: "Search figure / era...",
  bandingkanTableTitle: "Comparative dimension score table",
  bandingkanSummaryTitle: "Comparison summary",

  // Donasi / Donate
  donasiPageTitle: "Support Pancasila Index",
  donasiPageSubtitle:
    "Individual donations to establish a foundation/think tank that will manage Pancasila Index. 100% transparent, lawful.",
  donasiUseOfFundTitle: "Use of funds",
  donasiUseOfFundBody:
    "Donations received by PT Aplikasi Profesi Indonesia (a one-person company, a legal entity) will be used for:",
  donasiUseOfFund1Title: "Establishing a foundation / think tank",
  donasiUseOfFund1Body:
    "Notary fees, Ministry of Law and HAM registration, new entity tax ID, operating permits.",
  donasiUseOfFund2Title: "Transfer of ownership",
  donasiUseOfFund2Body:
    "After the foundation is established, ownership and management of Pancasila Index are transferred to it.",
  donasiUseOfFund3Title: "Foundation operations",
  donasiUseOfFund3Body:
    "Research, independent audits, hosting (Vercel, Cloudflare R2), translation, peer review.",
  donasiUseOfFund4Title: "Establishing an editorial board",
  donasiUseOfFund4Body:
    "Honoraria for board members, plenary sessions, and recruitment process.",
  donasiUseOfFund5Title: "Establishing board & membership",
  donasiUseOfFund5Body:
    "Board administration, member recruitment, methodology training.",
  donasiUseOfFund6Title: "Operations & legal risk",
  donasiUseOfFund6Body:
    "Legal counsel, internal audit, ongoing notary fees, and daily operations.",
  donasiMethodsTitle: "Donation methods",
  donasiMethodKitabisaLabel: "Kitabisa",
  donasiMethodKitabisaBody:
    "Donate via Kitabisa: verified, reported, transparent. Donations are bridged to the company's bank account.",
  donasiMethodOpenCollectiveLabel: "Open Collective",
  donasiMethodOpenCollectiveBody:
    "Donate via Open Collective: full international transparency, public dashboard, automatic reports.",
  donasiMethodBankLabel: "Bank transfer to the company account",
  donasiMethodBankBody:
    "Bank OCBC Indonesia, Account No. 693800145668 a.n. PT Aplikasi Profesi Indonesia. Confirm via Security Advisories after transfer.",
  donasiTransparencyTitle: "Transparency",
  donasiTransparencyBody:
    "Every donation received will be recorded on the /transparansi page. Public audit is performed at the end of each fiscal year.",
  donasiDisclaimer:
    "Donations are voluntary with no reward. Donations do not grant any privileged rights over the index's content. After the foundation is established, management of Pancasila Index is transferred to it and the company returns to its commercial activities unrelated to this platform.",
  donasiCtaOpen: "Open the donation page",
  footerDonate: "Support",

  // Audio (TTS)
  audioPlay: "Listen",
  audioPlayTitle: "Listen to audio",
  audioLoading: "Loading…",
  audioPlaying: "Stop",
  audioError: "Failed",
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
  navArsip: "Khazanah Arsip ANRI",
  navUud: "Peta Pasal UUD",
  navExport: "Ekspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulanku",
  navAuditLog: "Log Kagiyatan Kurasi",
  navAuditData: "Audit Data CKAN",
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
    "Indeks kasetyan 8 organ konstitusi Indonesia wiwit 1945 nganti saiki, adhedhasar bukti hukum primer.",
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
  featSearchDesc: "Goleki kedadeyan berbukti lan sumber primer kanthi filter cepet.",
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

  // Ekspor (terjemahan generik, akan diperbaiki penutur asli)
  exportPageTitle: "Ékspor & Data Terbuka",
  exportPageSubtitle:
    "Unduh seluruh dataset Pancasila Index ing format CSV utawi JSON kanggo riset, analisis data, lan visualisasi independen.",
  exportFormatJson: "Format JSON",
  exportFormatCsv: "Format CSV",
  exportFormatApi: "API / JSON",
  exportCkanLabel: "Data Terbuka / CKAN",
  exportCardJsonTitle: "Dataset Kanonik Lengkep",
  exportCardEventsTitle: "Tabel Peristiwa Berbukti",
  exportCardAssessTitle: "Tabel Skor Penilaian",
  exportCardSourcesTitle: "Tabel Sumber Primer & Sitasi",
  exportCardCkanTitle: "Audit Data Terbuka (CKAN)",
  exportCardInstitutionsTitle: "Tabel Lembaga & Masa Jabatan",
  exportDownloadJson: "Unduh JSON",
  exportDownloadCsvEvents: "Unduh CSV Peristiwa",
  exportDownloadCsvAssess: "Unduh CSV Penilaian",
  exportDownloadCsvSources: "Unduh CSV Sumber",
  exportDownloadCsvInstitutions: "Unduh CSV Lembaga",
  exportCopy: "Salin",
  exportCopied: "Tersalin",
  exportLicenseTitle: "Lisénsi Data Terbuka",
  exportLicenseBody: "Sedaya dataset Pancasila Index dilisénsi ing ngisor",
  exportLicenseCode:
    "Kode sumber platform dilisénsi AGPL-3.0. Panjenengan bebas ngutip, nyebarnaake, lan damel karya turunan kanthi nyebut sumber.",

  // Cari / Search
  cariPageTitle: "Panelusuran Konstitusional",
  cariPlaceholder:
    "Ketik tembung kunci, nomor UU, tokoh, utawi topik (umpamane: HAM, korupsi, otonomi, Bagir Manan, Pemilu)...",
  cariFilterAll: "Sedaya",
  cariFilterEra: "Sedaya Jaman",
  cariFilterLembaga: "Sedaya Lembaga",
  cariEraRevolusi: "Jaman Revolusi",
  cariEraDemokrasiLiberal: "Demokrasi Liberal",
  cariEraDemokrasiTerpimpin: "Demokrasi Terpimpin",
  cariEraOrdeBaru: "Orde Baru",
  cariEraReformasi: "Jaman Reformasi",
  cariNoResults: "Ora ana asil sing cocog karo panyaring panjenengan.",
  cariResultsCount: "asil",
  cariSeeTimeline: "Deleng Garis Waktos",
  cariViewProfile: "Deleng profil",
  cariViewEvents: "Deleng kedadéyan",

  // Bandingkan
  bandingkanPageTitle: "Bandingake Jaman & Lembaga",
  bandingkanPlaceholder: "Goleki tokoh / jaman...",
  bandingkanTableTitle: "Tabel Skor Komparatif Per Dimensi",
  bandingkanSummaryTitle: "Ringkesan Komparasi",

  // Donasi / Sumbang
  donasiPageTitle: "Sumbangana Pancasila Index",
  donasiPageSubtitle:
    "Sumbangane ti individu kanggo ngedegake yayasan utawa think tank sing bakal ngatur Pancasila Index. Transparan 100%, miturut ukum.",
  donasiUseOfFundTitle: "Panganggone dana",
  donasiUseOfFundBody:
    "Sumbangan sing mlebu ing PT Aplikasi Profesi Indonesia (PT Perorangan, badan hukum) bakal dianggo kanggo:",
  donasiUseOfFund1Title: "Ngedegake yayasan utawa think tank",
  donasiUseOfFund1Body:
    "Biaya notaris, SK Kemenkumham, NPWP badan hukum anyar, idin operasional.",
  donasiUseOfFund2Title: "Owah kepemilikan",
  donasiUseOfFund2Body:
    "Sawise yayasan madeg, kepemilikan lan pangaturan Pancasila Index dialihake maring yayasan.",
  donasiUseOfFund3Title: "Operasional yayasan",
  donasiUseOfFund3Body:
    "Riset, audit independen, hosting (Vercel, Cloudflare R2), panerjemahan, tinjauan sejawat.",
  donasiUseOfFund4Title: "Ngedegake dewan editorial",
  donasiUseOfFund4Body:
    "Honorarium anggota dewan editorial, rapat pleno, lan proses rekrutmen.",
  donasiUseOfFund5Title: "Ngedegake kepengurusan & anggota",
  donasiUseOfFund5Body:
    "Administrasi kepengurusan yayasan, rekrutmen anggota, pelatihan metodologi.",
  donasiUseOfFund6Title: "Operasional & risiko hukum",
  donasiUseOfFund6Body:
    "Konsultan hukum, audit internal, biaya notaris lanjutan, lan operasional harian.",
  donasiMethodsTitle: "Cara nyumbang",
  donasiMethodKitabisaLabel: "Kitabisa",
  donasiMethodKitabisaBody:
    "Sumbang liwat Kitabisa: diverifikasi, dilapurake, transparan. Sumbangan bakal di-bridge maring rekening PT.",
  donasiMethodOpenCollectiveLabel: "Open Collective",
  donasiMethodOpenCollectiveBody:
    "Sumbang liwat Open Collective: transparansi internasional kebak, dashboard publik, laporan otomatis.",
  donasiMethodBankLabel: "Transfer bank maring rekening PT",
  donasiMethodBankBody:
    "Rekening PT Aplikasi Profesi Indonesia: [Bank] [Nomor] a.n. [Nama]. Bakal diisi sawise Panjenengan nyediani.",
  donasiTransparencyTitle: "Transparansi",
  donasiTransparencyBody:
    "Saben sumbangan sing mlebu bakal kacathet ing kaca /transparansi. Audit publik dilakokake saben akhir taun fiskal.",
  donasiDisclaimer:
    "Sumbangan sukarela, ora ana upa-upa. Ora maringi hak istimewa maring isi indeks. Sawise yayasan madeg, pangaturan Pancasila Index dialihake maring yayasan lan PT bali maring aktivitas komersial sing ora ana gandhengane karo platform iki.",
  donasiCtaOpen: "Bukak kaca sumbang",
  footerDonate: "Sumbang",

  // Audio (TTS)
  audioPlay: "Ngrungokake",
  audioPlayTitle: "Ngrungokake audio",
  audioLoading: "Ngemot…",
  audioPlaying: "Mandheg",
  audioError: "Gagal",
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
  navArsip: "Khazanah Arsip ANRI",
  navUud: "Péta Pasal UUD",
  navExport: "Ékspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulan Abdi",
  navAuditLog: "Log Kagiatan Kurasi",
  navAuditData: "Audit Data CKAN",
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
    "Indéks kasatiaan 8 organ konstitusional Indonésia ti 1945 dugi ka kiwari, didadasaran ku bukti hukum primér.",
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
  featSearchDesc: "Milarian kajadian berbukti sareng sumber primér kalayan saringan gancang.",
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

  // Ekspor (terjemahan generik, akan diperbaiki penutur asli)
  exportPageTitle: "Ékspor & Data Terbuka",
  exportPageSubtitle:
    "Unduh dataset Pancasila Index dina format CSV atanapi JSON pikeun panalungtik, analisis data, sareng visualisasi mandiri.",
  exportFormatJson: "Format JSON",
  exportFormatCsv: "Format CSV",
  exportFormatApi: "API / JSON",
  exportCkanLabel: "Data Terbuka / CKAN",
  exportCardJsonTitle: "Dataset Kanonik Lengkep",
  exportCardEventsTitle: "Tabel Kajadian Berbukti",
  exportCardAssessTitle: "Tabel Skor Panilaian",
  exportCardSourcesTitle: "Tabel Sumber Primér & Sitasi",
  exportCardCkanTitle: "Audit Data Terbuka (CKAN)",
  exportCardInstitutionsTitle: "Tabel Lembhâgâ & Masa Jabatan",
  exportDownloadJson: "Unduh JSON",
  exportDownloadCsvEvents: "Unduh CSV Kajadian",
  exportDownloadCsvAssess: "Unduh CSV Panilaian",
  exportDownloadCsvSources: "Unduh CSV Sumber",
  exportDownloadCsvInstitutions: "Unduh CSV Lembhâgâ",
  exportCopy: "Salin",
  exportCopied: "Tersalin",
  exportLicenseTitle: "Lisénsi Data Terbuka",
  exportLicenseBody: "Sadayana dataset Pancasila Index dilisénsi di handapeun",
  exportLicenseCode:
    "Kode sumber platform dilisénsi AGPL-3.0. Anjeun bebas ngutip, nyebarkeun, sareng nyieun karya turunan kalawan nyebut sumber.",

  // Cari / Search
  cariPageTitle: "Sungsi Konstitusional",
  cariPlaceholder:
    "Ketik kecap konci, nomor UU, tokoh, atanapi topik (conto: HAM, korupsi, otonomi, Bagir Manan, Pemilu)...",
  cariFilterAll: "Sadaya",
  cariFilterEra: "Sadaya Jaman",
  cariFilterLembaga: "Sadaya Lembhâgâ",
  cariEraRevolusi: "Jaman Revolusi",
  cariEraDemokrasiLiberal: "Démokrasi Liberal",
  cariEraDemokrasiTerpimpin: "Démokrasi Térpimpin",
  cariEraOrdeBaru: "Orde Baru",
  cariEraReformasi: "Jaman Reformasi",
  cariNoResults: "Teu aya hasil nu cocog jeung saringan anjeun.",
  cariResultsCount: "hasil",
  cariSeeTimeline: "Tingal Garis Waktu",
  cariViewProfile: "Tingal profil",
  cariViewEvents: "Tingal kajadian",

  // Bandingkan
  bandingkanPageTitle: "Bandingkeun Jaman & Lembhâgâ",
  bandingkanPlaceholder: "Sungsi tokoh / jaman...",
  bandingkanTableTitle: "Tabel Skor Komparatif Pér Dimensi",
  bandingkanSummaryTitle: "Ringkesan Komparasi",

  // Donasi / Sungsi
  donasiPageTitle: "Sungi Pancasila Index",
  donasiPageSubtitle:
    "Sungi ti individu pikeun ngadegkeun yayasan atawa think tank anu bakal ngatur Pancasila Index. 100% transparan, nurut kana hukum.",
  donasiUseOfFundTitle: "Panganggaran dana",
  donasiUseOfFundBody:
    "Sungi anu asup ka PT Aplikasi Profesi Indonesia (PT Perorangan, badan hukum) bakal dianggo pikeun:",
  donasiUseOfFund1Title: "Ngadegkeun yayasan / think tank",
  donasiUseOfFund1Body:
    "Biaya notaris, SK Kemenkumham, NPWP badan hukum anyar, idin operasional.",
  donasiUseOfFund2Title: "Mindahkeun kapamilikan",
  donasiUseOfFund2Body:
    "Saatos yayasan ngadeg, kapamilikan sareng pangaturan Pancasila Index dipindahkeun ka yayasan.",
  donasiUseOfFund3Title: "Operasional yayasan",
  donasiUseOfFund3Body:
    "Riset, audit independen, hosting (Vercel, Cloudflare R2), panarjamahan, tinjauan sajerabat.",
  donasiUseOfFund4Title: "Ngadegkeun dewan editorial",
  donasiUseOfFund4Body:
    "Honorarium anggota dewan editorial, rapat pleno, sareng prosés rekrutmen.",
  donasiUseOfFund5Title: "Ngadegkeun kepengurusan & anggota",
  donasiUseOfFund5Body:
    "Administrasi kepengurusan yayasan, rekrutmen anggota, pelatihan metodologi.",
  donasiUseOfFund6Title: "Operasional & risiko hukum",
  donasiUseOfFund6Body:
    "Konsultan hukum, audit internal, biaya notaris lanjutan, sareng operasional harian.",
  donasiMethodsTitle: "Cara nyung",
  donasiMethodKitabisaLabel: "Kitabisa",
  donasiMethodKitabisaBody:
    "Sungi liwat Kitabisa: diverifikasi, dilaporkeun, transparan. Sungi bakal di-bridge ka rekening PT.",
  donasiMethodOpenCollectiveLabel: "Open Collective",
  donasiMethodOpenCollectiveBody:
    "Sungi liwat Open Collective: transparansi internasional pinuh, dashboard publik, laporan otomatis.",
  donasiMethodBankLabel: "Transfer bank ka rekening PT",
  donasiMethodBankBody:
    "Rekening PT Aplikasi Profesi Indonesia: [Bank] [Nomor] a.n. [Ngaran]. Bakal dieusian saatos Anjeun nyadiakeunana.",
  donasiTransparencyTitle: "Transparansi",
  donasiTransparencyBody:
    "Unggal sungi anu asup bakal kacatet dina kaca /transparansi. Audit publik dilaksanakeun tiap ahir taun fiskal.",
  donasiDisclaimer:
    "Sungi sukarela, henteu aya upa-upa. Henteu masihan hak istimewa kana eusi indeks. Saatos yayasan ngadeg, pangaturan Pancasila Index dipindahkeun ka yayasan sareng PT balik kana aktivitas komersial anu henteu aya hubunganana jeung platform ieu.",
  donasiCtaOpen: "Buka kaca sungi",
  footerDonate: "Sungi",

  // Audio (TTS)
  audioPlay: "Ngadangdang",
  audioPlayTitle: "Ngadangdang audio",
  audioLoading: "Ngamusu…",
  audioPlaying: "Eureun",
  audioError: "Gagal",
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
  navArsip: "Khazanah Arsip ANRI",
  navUud: "Petâ Pasal UUD",
  navExport: "Ekspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulan Kaulâ",
  navAuditLog: "Log Kagiatân Kurasi",
  navAuditData: "Audit Data CKAN",
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
    "Indeks kasatèya'an 8 organ konstitusi Indonesia molaè 1945 kantos samangkèn, abuktè dokumen hokom primer.",
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
  featSearchDesc: "Sarè kadhâddhiyân berbukti sareng somber primer ngangghuy saringan enggal.",
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

  // Ekspor (terjemahan generik, akan diperbaiki penutur asli)
  exportPageTitle: "Ekspor & Data Tabukak",
  exportPageSubtitle:
    "Unduah dataset Pancasila Index e format CSV otabâ JSON kaangghuy riset, analisis data, sareng visualisasi independen.",
  exportFormatJson: "Format JSON",
  exportFormatCsv: "Format CSV",
  exportFormatApi: "API / JSON",
  exportCkanLabel: "Data Tabukak / CKAN",
  exportCardJsonTitle: "Dataset Kanonik Lengkep",
  exportCardEventsTitle: "Tabel Kadhâddhiyân Berbukti",
  exportCardAssessTitle: "Tabel Skor Panilaian",
  exportCardSourcesTitle: "Tabel Somber Primér & Sitasi",
  exportCardCkanTitle: "Audit Data Tabukak (CKAN)",
  exportCardInstitutionsTitle: "Tabel Lembhâgâ & Maso Jâbâtan",
  exportDownloadJson: "Unduah JSON",
  exportDownloadCsvEvents: "Unduah CSV Kadhâddhiyân",
  exportDownloadCsvAssess: "Unduah CSV Panilaian",
  exportDownloadCsvSources: "Unduah CSV Somber",
  exportDownloadCsvInstitutions: "Unduah CSV Lembhâgâ",
  exportCopy: "Salèn",
  exportCopied: "Tersalèn",
  exportLicenseTitle: "Lisènsi Data Tabukak",
  exportLicenseBody: "Sadâjâ dataset Pancasila Index èlisènsi è bâbâna",
  exportLicenseCode:
    "Kode sumber platform èlisènsi AGPL-3.0. Bâdâ bebas ngotè, nyebâraghân, sareng mabdus karya turunan ngangghuy nyebut sumber.",

  // Cari / Search
  cariPageTitle: "Sareán Konstitusional",
  cariPlaceholder:
    "Ketik kato kunci, nomor UU, tokoh, otabâ topik (contoh: HAM, korupsi, otonomi, Bagir Manan, Pemilu)...",
  cariFilterAll: "Sadâjâ",
  cariFilterEra: "Sadâjâ Jaman",
  cariFilterLembaga: "Sadâjâ Lembhâgâ",
  cariEraRevolusi: "Jaman Revolusi",
  cariEraDemokrasiLiberal: "Démokrasi Liberal",
  cariEraDemokrasiTerpimpin: "Démokrasi Tèrpimpin",
  cariEraOrdeBaru: "Orde Baru",
  cariEraReformasi: "Jaman Reformasi",
  cariNoResults: "Ta' ada hasèl sè cocok sareng saringan bâna.",
  cariResultsCount: "hasèl",
  cariSeeTimeline: "Ghâlis Ghâris Bâkto",
  cariViewProfile: "Ghâlis profil",
  cariViewEvents: "Ghâlis kadhâddhiyân",

  // Bandingkan
  bandingkanPageTitle: "Bandinghân Jaman & Lembhâgâ",
  bandingkanPlaceholder: "Sareân tokoh / jaman...",
  bandingkanTableTitle: "Tabel Skor Komparatif Per Dimensi",
  bandingkanSummaryTitle: "Rèngkesan Komparasi",

  // Donasi / Sèdhekah
  donasiPageTitle: "Sèdhekah Pancasila Index",
  donasiPageSubtitle:
    "Sèdhekah dhari orèng ènggi' kaangguy ngadiriyaghi yayasan otabâ think tank arèng bakal ngola Pancasila Index. 100% transparan, nurut'aghi ka'angkan hukum.",
  donasiUseOfFundTitle: "Angangghuy dâna",
  donasiUseOfFundBody:
    "Sèdhekah sè maso' ka PT Aplikasi Profesi Indonesia (PT Perorangan, badan hukum) bakal èangghuy kaangguy:",
  donasiUseOfFund1Title: "Ngadiriyaghi yayasan / think tank",
  donasiUseOfFund1Body:
    "Biaa notaris, SK Kemenkumham, NPWP badan hukum anyar, idin operasional.",
  donasiUseOfFund2Title: "Mingalihaghi kapemilik",
  donasiUseOfFund2Body:
    "Saos yayasan deddhi, kapemilik sareng ngola Pancasila Index èalihaghi ka yayasan.",
  donasiUseOfFund3Title: "Operasional yayasan",
  donasiUseOfFund3Body:
    "Riset, audit independen, hosting (Vercel, Cloudflare R2), panarjamahan, tinjauan sajerabat.",
  donasiUseOfFund4Title: "Pembentukan dewan editorial",
  donasiUseOfFund4Body:
    "Honorarium anggota dewan editorial, rapat pleno, dan proses rekrutmen.",
  donasiUseOfFund5Title: "Pembentukan kepengurusan & anggota",
  donasiUseOfFund5Body:
    "Administrasi kepengurusan yayasan, rekrutmen anggota, pelatihan metodologi.",
  donasiUseOfFund6Title: "Operasional & risiko hukum",
  donasiUseOfFund6Body:
    "Konsultan hukum, audit internal, biaya notaris lanjutan, dan operasional harian.",
  donasiMethodsTitle: "Cara masèdhekah",
  donasiMethodKitabisaLabel: "Kitabisa",
  donasiMethodKitabisaBody:
    "Sèdhekah liwat Kitabisa: diverifikasi, èlapoeraghi, transparan. Sèdhekah bakal e-bridge ka rekening PT.",
  donasiMethodOpenCollectiveLabel: "Open Collective",
  donasiMethodOpenCollectiveBody:
    "Sèdhekah liwat Open Collective: transparansi internasional kèbhus, dashboard publik, laporan otomatis.",
  donasiMethodBankLabel: "Transfer bank ka rekening PT",
  donasiMethodBankBody:
    "Bank OCBC Indonesia, No. Rekening 693800145668 a.n. PT Aplikasi Profesi Indonesia. Konfirmasi via Security Advisories setelah transfer.",
  donasiTransparencyTitle: "Transparansi",
  donasiTransparencyBody:
    "Sabbhek sèdhekah sè maso' bakal ècatet è kaca /transparansi. Audit publik èlaksanaaghi sabbhun aèri taon fiskal.",
  donasiDisclaimer:
    "Sèdhekah sukarela, ta' ana opa-upa. Ta' aghili hak istimewa ka isi indeks. Saos yayasan deddhi, ngola Pancasila Index èalihaghi ka yayasan sareng PT abâli ka aktivitas komersial sè ta' aghiliyaghi platform panèka.",
  donasiCtaOpen: "Buka kaca sèdhekah",
  footerDonate: "Sèdhekah",

  // Audio (TTS)
  audioPlay: "Ngenneng",
  audioPlayTitle: "Ngenneng audio",
  audioLoading: "Ngobhet…",
  audioPlaying: "Aso",
  audioError: "Gagal",
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
  navArsip: "Khazanah Arsip ANRI",
  navUud: "Peta Pasal UUD",
  navExport: "Ekspor Dataset",
  navApiDocs: "REST API Docs",
  navMyDrafts: "Draf Usulan Ambo",
  navAuditLog: "Log Aktivitas Kurasi",
  navAuditData: "Audit Data CKAN",
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
    "Indeks kapatuahan 8 organ konstitusional Indonesia dari 1945 sampai kini, basandik pado bukti hukum primer.",
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
  featSearchDesc: "Cari paristiwa babukti jo sumber primer pakai filter instan.",
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

  // Ekspor (terjemahan generik, akan diperbaiki penutur asli)
  exportPageTitle: "Ekspor & Data Tabukak",
  exportPageSubtitle:
    "Unduah dataset Pancasila Index dalam format CSV atau JSON untuak riset, analisis data, jo visualisasi independen.",
  exportFormatJson: "Format JSON",
  exportFormatCsv: "Format CSV",
  exportFormatApi: "API / JSON",
  exportCkanLabel: "Data Tabukak / CKAN",
  exportCardJsonTitle: "Dataset Kanonik Langkok",
  exportCardEventsTitle: "Tabel Paristiwa Babukti",
  exportCardAssessTitle: "Tabel Skor Panilaian",
  exportCardSourcesTitle: "Tabel Sumber Primér & Sitasi",
  exportCardCkanTitle: "Audit Data Tabukak (CKAN)",
  exportCardInstitutionsTitle: "Tabel Lambago & Maso Jabatan",
  exportDownloadJson: "Unduah JSON",
  exportDownloadCsvEvents: "Unduah CSV Paristiwa",
  exportDownloadCsvAssess: "Unduah CSV Panilaian",
  exportDownloadCsvSources: "Unduah CSV Sumber",
  exportDownloadCsvInstitutions: "Unduah CSV Lambago",
  exportCopy: "Salin",
  exportCopied: "Tasalin",
  exportLicenseTitle: "Lisensi Data Tabukak",
  exportLicenseBody: "Sadonyo dataset Pancasila Index dilisensikan di bawah",
  exportLicenseCode:
    "Kode sumber platform berlisensi AGPL-3.0. Anda bebas mengutip, menyebarluaskan, dan membuat karya turunan dengan syarat menyebutkan sumber.",

  // Cari / Search
  cariPageTitle: "Pencarian Konstitusional",
  cariPlaceholder:
    "Ketik kato kun-ci, nomor UU, tokoh, atau topik (contoh: HAM, korupsi, otonomi, Bagir Manan, Pemilu)...",
  cariFilterAll: "Sadonyo",
  cariFilterEra: "Sadonyo Maso",
  cariFilterLembaga: "Sadonyo Lambago",
  cariEraRevolusi: "Maso Revolusi",
  cariEraDemokrasiLiberal: "Demokrasi Liberal",
  cariEraDemokrasiTerpimpin: "Demokrasi Tarpimpin",
  cariEraOrdeBaru: "Orde Baru",
  cariEraReformasi: "Maso Reformasi",
  cariNoResults: "Indak ado hasia nan cocok jo filter Sanak.",
  cariResultsCount: "hasia",
  cariSeeTimeline: "Caliak Garik Wakatu",
  cariViewProfile: "Caliak profil",
  cariViewEvents: "Caliak paristiwa",

  // Bandingkan
  bandingkanPageTitle: "Bandinkan Maso & Lambago",
  bandingkanPlaceholder: "Caliak tokoh / maso...",
  bandingkanTableTitle: "Tabel Skor Komparatif Per Dimensi",
  bandingkanSummaryTitle: "Ringkasan Komparasi",

  // Donasi / Sadonyo
  donasiPageTitle: "Dukuang Pancasila Index",
  donasiPageSubtitle:
    "Sadonyo donor dari individu untuak mandirian yayasan atau think tank nan akan mangalola Pancasila Index. 100% transparan, sasuai hukum.",
  donasiUseOfFundTitle: "Panggunoan dana",
  donasiUseOfFundBody:
    "Sadonyo donor nan masuak ka PT Aplikasi Profesi Indonesia (PT Perorangan, badan hukum) akan dipakai untuak:",
  donasiUseOfFund1Title: "Mandirian yayasan / think tank",
  donasiUseOfFund1Body:
    "Biaya notaris, SK Kemenkumham, NPWP badan hukum baru, izin operasional.",
  donasiUseOfFund2Title: "Pindahan kapamilikan",
  donasiUseOfFund2Body:
    "Sasudah yayasan tabanniak, kapamilikan jo pangalolaan Pancasila Index dipindahan ka yayasan.",
  donasiUseOfFund3Title: "Operasional yayasan",
  donasiUseOfFund3Body:
    "Riset, audit independen, hosting (Vercel, Cloudflare R2), panerjemahan, tinjauan sejawat.",
  donasiUseOfFund4Title: "Pambentukan dewan editorial",
  donasiUseOfFund4Body:
    "Honorarium anggota dewan editorial, rapat pleno, jo proses rekrutmen.",
  donasiUseOfFund5Title: "Pambentukan kepengurusan & anggota",
  donasiUseOfFund5Body:
    "Administrasi kepengurusan yayasan, rekrutmen anggota, pelatihan metodologi.",
  donasiUseOfFund6Title: "Operasional & risiko hukum",
  donasiUseOfFund6Body:
    "Konsultan hukum, audit internal, biaya notaris lanjutan, jo operasional harian.",
  donasiMethodsTitle: "Caro manjadi donor",
  donasiMethodKitabisaLabel: "Kitabisa",
  donasiMethodKitabisaBody:
    "Donor lewat Kitabisa: diverifikasi, dilapokan, transparan. Donor akan di-bridge ka rekening PT.",
  donasiMethodOpenCollectiveLabel: "Open Collective",
  donasiMethodOpenCollectiveBody:
    "Donor lewat Open Collective: transparansi internasional tujuih, dashboard publik, laporan otomatis.",
  donasiMethodBankLabel: "Transfer bank ka rekening PT",
  donasiMethodBankBody:
    "Bank OCBC Indonesia, No. Rekening 693800145668 a.n. PT Aplikasi Profesi Indonesia. Konfirmasi via Security Advisories sasudah transfer.",
  donasiTransparencyTitle: "Transparansi",
  donasiTransparencyBody:
    "Sadonyo donor nan masuak akan tacatat di halaman /transparansi. Audit publik dilakuan satiok ahir tahun fiskal.",
  donasiDisclaimer:
    "Donor sukarela, indak ado imbalan. Indak maaghia hak istimewa ats isi indeks. Sasudah yayasan tabanniak, pangalolaan Pancasila Index dipindahan ka yayasan jo PT baliak ka aktivitas komersial nan indak basangkutan jo platform ko.",
  donasiCtaOpen: "Bukak halaman donor",
  footerDonate: "Dukuang",

  // Audio (TTS)
  audioPlay: "Caliak",
  audioPlayTitle: "Caliak audio",
  audioLoading: "Maapkan…",
  audioPlaying: "Barek",
  audioError: "Gagal",
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

/**
 * Locale yang didukung untuk field data opsional. Bila `id`, tidak ada
 * suffix (`title_id`, `summary_id`). Untuk locale lain, sufiks adalah
 * `_<loc>` (mis. `title_en`, `summary_jv`).
 */
export const I18N_DATA_LOCALES = ["id", "en", "jv", "su", "mad", "min"] as const;
export type I18nDataLocale = (typeof I18N_DATA_LOCALES)[number];

/**
 * Pilih field data yang sesuai dengan locale saat ini, dengan fallback ke
 * `title_id` (atau `summary_id`). Bila `locale` adalah `id` atau tidak
 * diterjemahkan, kembalikan field Indonesia.
 *
 * Contoh:
 *   pickI18n(event, "title", locale) -> event.title_en ?? event.title_id
 *   pickI18n(source, "summary", locale) -> source.summary_jv ?? source.summary_id
 */
export function pickI18n<T extends Record<string, unknown>>(
  obj: T,
  base: "title" | "summary" | "name" | "description" | "label",
  locale: string,
): string {
  if (!obj || typeof obj !== "object") return "";
  const idField = obj[`${base}_id`];
  if (locale === "id" || !I18N_DATA_LOCALES.includes(locale as I18nDataLocale)) {
    return typeof idField === "string" ? idField : "";
  }
  const localized = obj[`${base}_${locale}`];
  if (typeof localized === "string" && localized.trim().length > 0) {
    return localized;
  }
  return typeof idField === "string" ? idField : "";
}
