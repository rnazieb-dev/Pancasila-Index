import fs from 'fs';

const path = 'apps/web/src/app/cari/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const ALL_AKAR_SEJARAH = [
  {
    year: "1905 / 1911",
    title: "Syarikat Dagang Islam (SDI): Solidaritas Ekonomi Pribumi",
    summary: "Haji Samanhudi & RM. Tirto Adhi Soerjo merintis kemandirian ekonomi pribumi dan perlawanan monopoli kolonial.",
    link: "/akar-sejarah#sdi-1905",
    category: "Arus Islam & Kerakyatan"
  },
  {
    year: "1908",
    title: "Boedi Oetomo: Fajar Kesadaran Organisasi Modern",
    summary: "Dr. Soetomo & dr. Wahidin mempelopori persatuan kemajuan kebudayaan dan intelektual modern bangsa.",
    link: "/akar-sejarah#boedi-oetomo-1908",
    category: "Pendidikan & Kebudayaan"
  },
  {
    year: "1912",
    title: "Syarikat Islam & Muhammadiyah: Demokrasi & Pelayanan Publik",
    summary: "Tjokroaminoto merumuskan Zelfbestuur (demokrasi kerakyatan), K.H. Ahmad Dahlan mempelopori pembaruan sekolah & PKO.",
    link: "/akar-sejarah#si-muhammadiyah-1912",
    category: "Arus Islam & Kerakyatan"
  },
  {
    year: "1922",
    title: "Perguruan Tamansiswa: Pendidikan Kemerdekaan Jiwa",
    summary: "Ki Hadjar Dewantara merumuskan filosofi Tut Wuri Handayani dan membentuk manusia merdeka lahir-batin.",
    link: "/akar-sejarah#tamansiswa-1922",
    category: "Pendidikan & Kebudayaan"
  },
  {
    year: "1925",
    title: "Perhimpunan Indonesia: Demokrasi Asli Desa & Republik",
    summary: "Mohammad Hatta & Tan Malaka menggali demokrasi musyawarah gotong royong asli nusantara.",
    link: "/akar-sejarah#perhimpunan-indonesia-1925",
    category: "Sosio-Demokrasi Desa"
  },
  {
    year: "1926",
    title: "Nahdlatul Ulama: Hubbul Wathan Minal Iman",
    summary: "K.H. Hasyim Asy'ari & ulama pesantren menegaskan cinta tanah air adalah bagian dari iman dan ukhuwah wathaniyah.",
    link: "/akar-sejarah#nu-1926",
    category: "Arus Islam & Kerakyatan"
  },
  {
    year: "1928",
    title: "Sumpah Pemuda: Peleburan Sukuisme Nusantara",
    summary: "Kongres Pemuda II menyatukan Jong Java, Sumatra, Ambon, Batak, Celebes, JIB, Betawi jadi Satu Bangsa.",
    link: "/akar-sejarah#sumpah-pemuda-1928",
    category: "Pemuda & Kebhinekaan"
  },
  {
    year: "1928",
    title: "Kongres Perempuan Indonesia I: Emansipasi & Keadilan Gender",
    summary: "30 organisasi perempuan nusantara di Yogyakarta menuntut kesetaraan hak pendidikan dan perlindungan perempuan.",
    link: "/akar-sejarah#kongres-perempuan-1928",
    category: "Gerakan Perempuan"
  },
  {
    year: "1945",
    title: "Sidang BPUPK: Draf Rancang UUD Al-Qur'an & Sunnah",
    summary: "Ki Bagus Hadikusumo, Wahid Hasyim, Kahar Muzakkir mengajukan dalil QS. Asy-Syura 38 & draf Pasal 6(1) UUD.",
    link: "/akar-sejarah#bpupk-draft-islam-1945",
    category: "Draf Konstitusi BPUPK"
  },
  {
    year: "1945",
    title: "Piagam Jakarta (22 Juni 1945): Konsensus Panitia Sembilan",
    summary: "Kompromi luhur merumuskan Mukaddimah UUD 1945 dan falsafah 5 Sila negara.",
    link: "/akar-sejarah#piagam-jakarta-1945",
    category: "Draf Konstitusi BPUPK"
  },
  {
    year: "1945",
    title: "Pengesahan UUD 1945 (18 Agustus): Ketuhanan Yang Maha Esa",
    summary: "Kenegarawanan tokoh Islam PPKI menetapkan Sila 1 Tauhid demi keutuhan wilayah Indonesia Timur.",
    link: "/akar-sejarah#ppki-konsensus-18-agustus-1945",
    category: "Draf Konstitusi BPUPK"
  },
  {
    year: "1957–1959",
    title: "Konstituante & Dekrit 5 Juli 1959: Piagam Madinah & Menjiwai UUD",
    summary: "Natsir memaparkan Piagam Madinah 622 M; Dekrit 1959 menyatakan Piagam Jakarta menjiwai UUD 1945.",
    link: "/akar-sejarah#konstituante-dekrit-1959",
    category: "Arus Islam & Kerakyatan"
  }
];

content = content.replace(
  /const AKAR_SEJARAH_DATA = \[[\s\S]*?\];/,
  `const AKAR_SEJARAH_DATA = ${JSON.stringify(ALL_AKAR_SEJARAH, null, 2)};`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Cari page updated with all 12 milestones!");
