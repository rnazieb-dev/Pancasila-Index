import fs from 'fs';

const cariPath = 'apps/web/src/app/cari/page.tsx';
let cari = fs.readFileSync(cariPath, 'utf8');

const updatedAkarData = `const AKAR_SEJARAH_DATA = [
  {
    "year": "1825–1830",
    "title": "Perang Diponegoro (Perang Jawa): Perlawanan Moral & Syariat",
    "summary": "Pangeran Diponegoro memimpin perang membela kaum tani dari pemerasan pajak gerbang dan kezaliman kolonial.",
    "link": "/akar-sejarah#perang-diponegoro-1825",
    "category": "Perlawanan Anti-Kolonial & Etika Agama"
  },
  {
    "year": "1837",
    "title": "Piagam Bukit Marapalam: Adat Basandi Syarak, Syarak Basandi Kitabullah",
    "summary": "Konsensus sintesis hukum adat egaliter Minangkabau dengan syariat Islam pasca-Perang Padri.",
    "link": "/akar-sejarah#piagam-marapalam-1837",
    "category": "Hukum Adat & Musyawarah Nusantara"
  },
  {
    "year": "1899–1904",
    "title": "Surat-Surat R.A. Kartini: Minaz Zhulumati Ilan Nur (Habis Gelap Terbitlah Terang)",
    "summary": "Fondasi emansipasi intelektual, martabat kemanusiaan, dan hak pendidikan bagi kaum bumiputera.",
    "link": "/akar-sejarah#surat-kartini-1899",
    "category": "Gerakan Emansipasi & Pendidikan Perempuan"
  },
  {
    "year": "1905 / 1911",
    "title": "Syarikat Dagang Islam (SDI): Perlawanan Monopoli & Keadilan Ekonomi",
    "summary": "Haji Samanhudi & RM. Tirto Adhi Soerjo merintis kemandirian ekonomi pribumi dan perlawanan monopoli kolonial.",
    "link": "/akar-sejarah#sdi-1905",
    "category": "Islam & Ekonomi Berdikari"
  },
  {
    "year": "1908",
    "title": "Boedi Oetomo: Fajar Organisasi Modern & Kesadaran Intelektual",
    "summary": "Dr. Soetomo & dr. Wahidin mempelopori transisi perlawanan fisik ke organisasi intelektual modern terstruktur.",
    "link": "/akar-sejarah#boedi-oetomo-1908",
    "category": "Kebangkitan Intelektual Modern"
  },
  {
    "year": "1912",
    "title": "Indische Partij: Tuntutan Kemerdekaan Politik Lintas Ras ('Indie voor Indiërs')",
    "summary": "Tiga Serangkai (Douwes Dekker, Tjipto Mangoenkoesoemo, Ki Hadjar Dewantara) mendirikan partai politik modern pertama.",
    "link": "/akar-sejarah#indische-partij-1912",
    "category": "Nasionalisme Radikal & Politik Terbuka"
  },
  {
    "year": "1912",
    "title": "Syarikat Islam (SI): Pergerakan Kerakyatan & Tuntutan Zelfbestuur",
    "summary": "H.O.S. Tjokroaminoto memelopori tuntutan pemerintahan sendiri (Zelfbestuur) dan sosialisme berketuhanan.",
    "link": "/akar-sejarah#si-1912",
    "category": "Islam & Kerakyatan Massa"
  },
  {
    "year": "1912",
    "title": "Muhammadiyah: Praksis Teologi Al-Ma'un & Pelayanan Sosial Inklusif",
    "summary": "K.H. Ahmad Dahlan menerjemahkan keadilan sosial dalam ribuan sekolah dan Penolong Kesengsaraan Oemoem (PKO).",
    "link": "/akar-sejarah#muhammadiyah-1912",
    "category": "Islam & Pelayanan Kemanusiaan"
  },
  {
    "year": "1922",
    "title": "Perguruan Tamansiswa: Pendidikan Pembebasan & Tut Wuri Handayani",
    "summary": "Ki Hadjar Dewantara merumuskan filosofi Tut Wuri Handayani dan membentuk manusia merdeka lahir-batin.",
    "link": "/akar-sejarah#tamansiswa-1922",
    "category": "Pendidikan Kritis & Jiwa Merdeka"
  },
  {
    "year": "1923",
    "title": "Persatuan Islam (Persis) & Dialektika Negara Hukum Islam di Bandung",
    "summary": "A. Hassan & Mohammad Natsir merumuskan purifikasi hukum syariat dan perdebatan dialektika negara hukum.",
    "link": "/akar-sejarah#persis-1923",
    "category": "Pemikiran Hukum & Syura"
  },
  {
    "year": "1925",
    "title": "Perhimpunan Indonesia & Tan Malaka: Sosio-Demokrasi Desa & Republik Merdeka",
    "summary": "Mohammad Hatta & Tan Malaka (Naar de Republiek Indonesia) menggali Demokrasi Asli Desa dan Pasal 33 UUD.",
    "link": "/akar-sejarah#pi-tanmalaka-1925",
    "category": "Sosio-Demokrasi Desa & Republikanisme"
  },
  {
    "year": "1926",
    "title": "Nahdlatul Ulama (NU): Hubbul Wathan Minal Iman & Komite Hijaz",
    "summary": "K.H. Hasyim Asy'ari & ulama pesantren menegaskan cinta tanah air adalah bagian dari iman dan merawat kebinekaan.",
    "link": "/akar-sejarah#nu-1926",
    "category": "Islam Moderat & Kebangsaan"
  },
  {
    "year": "1928",
    "title": "Sumpah Pemuda: Konsensus Satu Bangsa & Bahasa Persatuan",
    "summary": "Kongres Pemuda II menyatukan Jong Java, Sumatra, Ambon, Batak, Celebes, JIB, Betawi jadi Satu Bangsa.",
    "link": "/akar-sejarah#sumpah-pemuda-1928",
    "category": "Pemuda & Kebhinekaan"
  },
  {
    "year": "1928",
    "title": "Kongres Perempuan Indonesia I: Emansipasi & Hak Sosial Perempuan",
    "summary": "30 organisasi perempuan nusantara di Yogyakarta menuntut kesetaraan hak pendidikan dan perlindungan perempuan.",
    "link": "/akar-sejarah#kongres-perempuan-1928",
    "category": "Gerakan Perempuan & Keadilan Sosial"
  },
  {
    "year": "1930",
    "title": "Indonesia Menggugat: Pledoi Bung Karno Membongkar Imperialisme Kapitalistik",
    "summary": "Bung Karno di Landraad Bandung membedah struktur hisap kolonialisme menuju keadilan distributif ekonomi.",
    "link": "/akar-sejarah#indonesia-menggugat-1930",
    "category": "Anti-Imperialisme & Keadilan Sosial"
  },
  {
    "year": "1937",
    "title": "Majelis Islam A'la Indonesia (MIAI): Unifikasi Ormas Menuntut Indonesia Berparlemen",
    "summary": "Federasi ormas Islam bersatu bersama GAPI menuntut dewan perwakilan rakyat berdaulat (Indonesia Berparlemen).",
    "link": "/akar-sejarah#miai-1937",
    "category": "Unifikasi Umat & Demokrasi Parlemen"
  },
  {
    "year": "1945",
    "title": "Sidang BPUPK I: Dialektika Asas Falsafah Dasar Negara Merdeka",
    "summary": "Pidato Mr. Moh. Yamin, Prof. Mr. Soepomo, dan Ir. Soekarno (1 Juni Lahirnya Pancasila).",
    "link": "/akar-sejarah#sidang-bpupk-1-1945",
    "category": "Falsafah Dasar Konstitusi"
  },
  {
    "year": "1945",
    "title": "Draf Rancang UUD Al-Qur'an & Sunnah BPUPK: Syura, Amanah, & Kepala Negara",
    "summary": "Ki Bagus Hadikusumo, Wahid Hasyim, Kahar Muzakkir mengajukan dalil QS. Asy-Syura: 38 & QS. An-Nisa: 58.",
    "link": "/akar-sejarah#bpupk-islam-draft-1945",
    "category": "Islam & Naskah Konstitusi BPUPK"
  },
  {
    "year": "1945",
    "title": "Piagam Jakarta (Jakarta Charter): Sintesis Luhur Panitia Sembilan",
    "summary": "Kompromi luhur merumuskan Mukaddimah UUD 1945 dan falsafah 5 Sila negara.",
    "link": "/akar-sejarah#piagam-jakarta-1945",
    "category": "Piagam Konstitusi Negara"
  },
  {
    "year": "1945",
    "title": "Sidang PPKI: Konsensus Ketuhanan Yang Maha Esa (Tauhid) & Hak Warga (Pasal 28 Hatta)",
    "summary": "Kenegarawanan tokoh Islam PPKI menetapkan Sila 1 Tauhid dan jaminan hak asasi berserikat/berpendapat.",
    "link": "/akar-sejarah#ppki-konsensus-1945",
    "category": "Pengesahan UUD 1945 & Hak Asasi"
  },
  {
    "year": "1945",
    "title": "Resolusi Jihad Nahdlatul Ulama: Fatwa Membela Kedaulatan Bangsa adalah Fardhu 'Ain",
    "summary": "Hadratus Syekh KH. Hasyim Asy'ari mengobarkan perang sabil membakar Peristiwa Heroik 10 November 1945.",
    "link": "/akar-sejarah#resolusi-jihad-1945",
    "category": "Kedaulatan & Revolusi Kemerdekaan"
  },
  {
    "year": "1945",
    "title": "Maklumat Wakil Presiden No. X: Fondasi Kedaulatan Rakyat & Multipartai",
    "summary": "Mohammad Hatta membuka ruang demokrasi multipartai dan memperkuat fungsi pengawasan parlemen KNIP.",
    "link": "/akar-sejarah#maklumat-x-1945",
    "category": "Demokrasi Parlemen & Multipartai"
  },
  {
    "year": "1948–1949",
    "title": "Pemerintah Darurat Republik Indonesia (PDRI): Penyelamat Nyawa Eksistensi NKRI",
    "summary": "Mr. Sjafruddin Prawiranegara di Bukittinggi menyelamatkan eksistensi kedaulatan RI saat Sukarno-Hatta ditawan.",
    "link": "/akar-sejarah#pdri-1948",
    "category": "Penyelamatan Kedaulatan Konstitusi"
  },
  {
    "year": "1949",
    "title": "Konferensi Antar-Indonesia & KMB Den Haag: Pengakuan Kedaulatan Penuh Tanpa Syarat",
    "summary": "Bung Hatta & BFO bersatu memaksa Kerajaan Belanda mengakui kedaulatan penuh Republik Indonesia.",
    "link": "/akar-sejarah#kmb-1949",
    "category": "Diplomasi & Pengakuan Kedaulatan"
  },
  {
    "year": "1955",
    "title": "Dasa Sila Bandung (KAA 1955): Internasionalisme Anti-Kolonial & Keadilan Global",
    "summary": "Indonesia memimpin Konferensi Asia-Afrika melahirkan Dasa Sila Bandung dan Gerakan Non-Blok.",
    "link": "/akar-sejarah#kaa-1955",
    "category": "Ketertiban Dunia & Kemanusiaan"
  },
  {
    "year": "1957–1959",
    "title": "Sidang Konstituante & Dekrit 5 Juli 1959: Piagam Madinah 622 M & Menjiwai UUD 1945",
    "summary": "Mohammad Natsir memaparkan Piagam Madinah 622 M; Dekrit 1959 menetapkan Piagam Jakarta menjiwai UUD 1945.",
    "link": "/akar-sejarah#konstituante-natsir-dekrit-1959",
    "category": "Debat Dasar Negara & Dekrit Presiden"
  },
  {
    "year": "1960",
    "title": "Undang-Undang Pokok Agraria (UUPA No. 5/1960): Keadilan Sosial atas Bumi & Air",
    "summary": "Pencabutan Domein Verklaring kolonial untuk menegakkan kedaulatan tanah kaum tani berdasar Pasal 33(3) UUD.",
    "link": "/akar-sejarah#uupa-1960",
    "category": "Keadilan Agraria & Kesejahteraan Rakyat"
  },
  {
    "year": "1999–2002",
    "title": "Amandemen Komprehensif UUD 1945 (Perubahan I–IV): Checks & Balances dan Hak Asasi",
    "summary": "Kelahiran Mahkamah Konstitusi, Komisi Yudisial, DPD RI, dan pengesahan Bab XA HAM (Pasal 28A–28J).",
    "link": "/akar-sejarah#amandemen-uud-1999-2002",
    "category": "Reformasi Konstitusi Modern"
  }
];`;

const startIdx = cari.indexOf('const AKAR_SEJARAH_DATA = [');
const endIdx = cari.indexOf('];', startIdx) + 2;

cari = cari.slice(0, startIdx) + updatedAkarData + cari.slice(endIdx);
fs.writeFileSync(cariPath, cari, 'utf8');
console.log("Cari page updated with all 27 historical milestones!");
