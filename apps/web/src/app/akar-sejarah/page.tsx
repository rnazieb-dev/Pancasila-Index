"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Milestone {
  id: string;
  year: string;
  era: string; // "pra-1900" | "1905-1920" | "1922-1938" | "1945" | "1945-1949" | "1950-2002"
  title: string;
  subtitle: string;
  category: "islam" | "pendidikan" | "sosio-desa" | "pemuda" | "perempuan" | "kebangsaan" | "konstitusi";
  categoryLabel: string;
  icon: string;
  description: string;
  figures: string[];
  dimensions: string[];
  citations: string[];
  quranVerse?: {
    surah: string;
    arabic: string;
    translation: string;
  };
}

const HISTORICAL_MILESTONES: Milestone[] = [
  // ─── ERA 0: FONDASI ETIKA ADAT & PERLAWANAN MORAL (PRA-1900) ───
  {
    id: "perang-diponegoro-1825",
    year: "1825–1830",
    era: "pra-1900",
    title: "Perang Jawa / Perang Diponegoro: Perlawanan Moral & Syariat",
    subtitle: "Pangeran Diponegoro Memimpin Perang Melawan Kezaliman Fiskal Kolonial",
    category: "islam",
    categoryLabel: "Perlawanan Anti-Kolonial & Etika Agama",
    icon: "🗡️",
    description:
      "Perang Diponegoro meletup sebagai respons perlawanan terhadap pemerasan pajak tanah pintu gerbang (tol) Raffles-Van der Capellen, intervensi kraton, dan degradasi moral. Diponegoro mendasarkan perjuangannya pada kewajiban moral syariat untuk menegakkan keadilan sosial dan membela kaum tani tertindas dari kesewenang-wenangan.",
    figures: ["Pangeran Diponegoro", "Kiai Mojo", "Sentot Alibasya Prawirodirdjo"],
    dimensions: ["Sila 2: Kemanusiaan yang Adil dan Beradab", "Sila 5: Keadilan Sosial bagi Seluruh Rakyat"],
    citations: [
      "Babad Diponegoro (Naskah Manuskrip UNESCO Memory of the World / ANRI)",
      "Peter Carey, 'The Power of Prophecy: Prince Diponegoro and the End of an Old Order in Java, 1785-1855' (2007)",
    ],
  },
  {
    id: "piagam-marapalam-1837",
    year: "1837",
    era: "pra-1900",
    title: "Piagam Bukit Marapalam: Adat Basandi Syarak, Syarak Basandi Kitabullah",
    subtitle: "Konsensus Sintesis Hukum Adat Minangkabau & Syariat Islam",
    category: "sosio-desa",
    categoryLabel: "Hukum Adat & Musyawarah Nusantara",
    icon: "📜",
    description:
      "Kesepakatan bersejarah antara Kaum Adat dan Kaum Padri pasca-Perang Padri melahirkan doktrin 'Adat Basandi Syarak, Syarak Basandi Kitabullah' (Adat bersendikan syariat, syariat bersendikan Kitabullah). Ini menjadi model konstitusional nusantara tertua dalam memadukan tradisi musyawarah adat nagari yang egaliter dengan nilai tauhid.",
    figures: ["Tuanku Imam Bonjol", "Tuanku Nan Renceh", "Para Pemangku Adat Minangkabau"],
    dimensions: ["Sila 1: Ketuhanan Yang Maha Esa", "Sila 4: Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan"],
    citations: [
      "Naskah Piagam Kesepakatan Bukit Marapalam 1837",
      "Taufik Abdullah, 'Adat and Islam: An Examination of Conflict in Minangkabau' (Indonesia Journal, Cornell, 1966)",
    ],
  },
  {
    id: "surat-kartini-1899",
    year: "1899–1904",
    era: "pra-1900",
    title: "Surat-Surat R.A. Kartini: Minaz Zhulumati Ilan Nur (Habis Gelap Terbitlah Terang)",
    subtitle: "Fondasi Emansipasi Intelektual, Kemanusiaan, & Hak Pendidikan Kaum Bumiputera",
    category: "perempuan",
    categoryLabel: "Gerakan Emansipasi & Pendidikan Perempuan",
    icon: "🕯️",
    description:
      "Korespondensi Raden Ajeng Kartini dengan sahabat-sahabatnya di Eropa merintis gugatan filosofis terhadap belenggu feodalisme kaku dan penjajahan kolonial. Kartini terinspirasi terjemahan Al-Qur'an oleh Kiai Saleh Darat Semarang mengenai konsep 'Minaz Zhulumati Ilan Nur' (dari kegelapan menuju cahaya), memperjuangkan martabat kemanusiaan dan hak pendidikan bagi perempuan nusantara.",
    figures: ["R.A. Kartini", "K.H. Sholeh Darat Semarang", "Rosa Abendanon"],
    dimensions: ["Sila 2: Kemanusiaan yang Adil dan Beradab", "Pasal 31 UUD 1945: Hak Memperoleh Pendidikan"],
    citations: [
      "R.A. Kartini, 'Door Duisternis tot Licht' (Kumpulan Surat Kartini, 1911)",
      "Koleksi Surat Asli R.A. Kartini (ANRI / Koninklijk Instituut voor Taal-, Land- en Volkenkunde - KITLV)",
    ],
  },

  // ─── ERA 1: FAJAR PERGERAKAN & ORGANISASI MODERN (1905–1920) ───
  {
    id: "sdi-1905",
    year: "1905 / 1911",
    era: "1905-1920",
    title: "Syarikat Dagang Islam (SDI): Perlawanan Monopoli & Keadilan Ekonomi",
    subtitle: "Kebangkitan Ekonomi Mandiri Pribumi Berlandaskan Tauhid & Solidaritas Pedagang",
    category: "islam",
    categoryLabel: "Islam & Ekonomi Berdikari",
    icon: "🪙",
    description:
      "Didirikan oleh H. Samanhudi di Surakarta dan dikembangkan oleh RM. Tirto Adhi Soerjo di Bogor, SDI memobilisasi saudagar batik bumiputera untuk melawan monopoli bahan baku kolonial dan dominasi pedagang asing berprivilese. SDI menjadi cikal bakal kesadaran bahwa kedaulatan ekonomi berkeadilan adalah prasyarat mutlak kedaulatan bangsa.",
    figures: ["H. Samanhudi", "RM. Tirto Adhi Soerjo"],
    dimensions: ["Sila 5: Keadilan Sosial bagi Seluruh Rakyat Indonesia", "Pasal 33 UUD 1945: Perekonomian Bersama"],
    citations: [
      "Anggaran Dasar Syarikat Dagang Islam (1911)",
      "Medan Prijaji (1907–1912), Arsip Surat Kabar Nasional ANRI",
    ],
  },
  {
    id: "boedi-oetomo-1908",
    year: "1908",
    era: "1905-1920",
    title: "Boedi Oetomo: Fajar Organisasi Modern & Kesadaran Intelektual",
    subtitle: "Transformasi Perjuangan Bersenjata Kedaerahan ke Konsolidasi Intelektual Terstruktur",
    category: "pendidikan",
    categoryLabel: "Kebangkitan Intelektual Modern",
    icon: "🌱",
    description:
      "Inisiasi para pemuda STOVIA menjadi titik tolak transisi perlawanan fisik sporadis menjadi gerakan terorganisasi modern berlandaskan pendidikan dan kebudayaan. Boedi Oetomo menyemaikan kesadaran persatuan bumiputera yang melampaui sekat kedaerahan primodial.",
    figures: ["dr. Soetomo", "dr. Wahidin Soedirohoesodo", "dr. Goenawan Mangoenkoesoemo"],
    dimensions: ["Sila 3: Persatuan Indonesia", "Pasal 31 UUD 1945: Pendidikan Nasional"],
    citations: [
      "Notulen Sidang Pendirian Boedi Oetomo 20 Mei 1908 (Gedung Kebangkitan Nasional / ANRI)",
      "Statuten van de Vereeniging Boedi Oetomo (1908)",
    ],
  },
  {
    id: "indische-partij-1912",
    year: "1912",
    era: "1905-1920",
    title: "Indische Partij: Tuntutan Kemerdekaan Politik Lintas Ras ('Indie voor Indiërs')",
    subtitle: "Partai Politik Pertama Berani Menuntut Kemerdekaan Nasional Terbuka",
    category: "kebangsaan",
    categoryLabel: "Nasionalisme Radikal & Politik Terbuka",
    icon: "🚩",
    description:
      "Tiga Serangkai (Douwes Dekker, Tjipto Mangoenkoesoemo, Ki Hadjar Dewantara) mendirikan partai politik modern pertama di Hindia Belanda dengan semboyan 'Indie voor Indiërs'. Indische Partij memelopori paham kebangsaan teritorial yang merangkul seluruh warga tanpa membedakan ras, suku, atau keturunan.",
    figures: ["E.F.E. Douwes Dekker (Danudirja Setiabudi)", "dr. Tjipto Mangoenkoesoemo", "RM. Soewardi Soerjaningrat (Ki Hadjar Dewantara)"],
    dimensions: ["Sila 3: Persatuan Indonesia", "Alinea I Pembukaan UUD 1945: Hak Kemerdekaan"],
    citations: [
      "RM. Soewardi Soerjaningrat, 'Als ik eens Nederlander was' (Seandainya Aku Seorang Belanda, 1913)",
      "Statuten der Indische Partij (1912; ANRI Koleksi Algemeene Secretarie)",
    ],
  },
  {
    id: "si-1912",
    year: "1912",
    era: "1905-1920",
    title: "Syarikat Islam (SI): Pergerakan Kerakyatan & Tuntutan Zelfbestuur",
    subtitle: "H.O.S. Tjokroaminoto Memelopori Tuntutan Pemerintahan Sendiri & Sosialisme Berketuhanan",
    category: "islam",
    categoryLabel: "Islam & Kerakyatan Massa",
    icon: "📢",
    description:
      "Transformasi SDI menjadi SI menciptakan gerakan massa modern pertama dengan jutaan anggota. H.O.S. Tjokroaminoto memproklamirkan cita-cita 'Zelfbestuur' (pemerintahan sendiri oleh rakyat) pada Kongres Nasional SI 1916 di Bandung, merumuskan sintesis sosialisme religius bahwa kemerdekaan sejati bersumber dari kedaulatan rakyat dan ketauhidan.",
    figures: ["H.O.S. Tjokroaminoto", "H. Agus Salim", "Abdul Muis"],
    dimensions: ["Sila 4: Kerakyatan & Musyawarah", "Sila 1: Ketuhanan Yang Maha Esa"],
    citations: [
      "H.O.S. Tjokroaminoto, 'Islam dan Sosialisme' (1924)",
      "Risalah Kongres Nasional Sarekat Islam Pertama di Bandung (1916; ANRI)",
    ],
  },
  {
    id: "muhammadiyah-1912",
    year: "1912",
    era: "1905-1920",
    title: "Muhammadiyah: Praksis Teologi Al-Ma'un & Pelayanan Sosial Inklusif",
    subtitle: "K.H. Ahmad Dahlan Menerjemahkan Sila Keadilan dalam Ribuan Sekolah & Balai Pengobatan",
    category: "islam",
    categoryLabel: "Islam & Pelayanan Kemanusiaan",
    icon: "🏥",
    description:
      "Didirikan di Kauman Yogyakarta, Muhammadiyah mempelopori reformasi pendidikan Islam modern dan pelayanan kemanusiaan universal tanpa membedakan agama/golongan. Berlandaskan penafsiran praksis Surat Al-Ma'un, K.H. Ahmad Dahlan mendirikan Penolong Kesengsaraan Oemoem (PKO) dan panti asuhan, yang kelak menjadi rujukan konstitusional amanat fakir miskin Pasal 34 UUD 1945.",
    figures: ["K.H. Ahmad Dahlan", "Nyai Ahmad Dahlan (Siti Walidah)", "K.H. Ibrahim"],
    dimensions: ["Sila 2: Kemanusiaan yang Adil dan Beradab", "Pasal 34 UUD 1945: Jaminan Sosial"],
    citations: [
      "Statuten van de Vereeniging Moehammadijah (1912; Lembaran Keputusan Gubernur Jenderal)",
      "Risalah Al-Ma'un dan Berdirinya PKO (1920; Arsip Suara Muhammadiyah)",
    ],
  },

  // ─── ERA 2: JIWA MERDEKA, SOSIO-DEMOKRASI & PERSATUAN (1922–1938) ───
  {
    id: "tamansiswa-1922",
    year: "1922",
    era: "1922-1938",
    title: "Perguruan Tamansiswa: Pendidikan Pembebasan & Tut Wuri Handayani",
    subtitle: "Ki Hadjar Dewantara Menolak Pembodohan Kolonial demi Jiwa Merdeka",
    category: "pendidikan",
    categoryLabel: "Pendidikan Kritis & Jiwa Merdeka",
    icon: "🎓",
    description:
      "Ki Hadjar Dewantara mendirikan Tamansiswa dengan semboyan 'Ing Ngarsa Sung Tuladha, Ing Madya Mangun Karsa, Tut Wuri Handayani'. Tamansiswa menolak subsidi pemerintah kolonial (wilde scholen ordonnantie) untuk memastikan anak-anak pribumi dididik menjadi manusia merdeka yang berjiwa mandiri, beretika luhur, dan cinta kebudayaan nasional.",
    figures: ["Ki Hadjar Dewantara", "Nyi Hadjar Dewantara", "Ki Sarmidi Mangunsarkoro"],
    dimensions: ["Sila 2: Kemanusiaan yang Beradab", "Pasal 31 UUD 1945: Sistem Pendidikan Nasional"],
    citations: [
      "Asas-Asas Tamansiswa 1922 (Panca Dharma: Kodrat Alam, Kemerdekaan, Kebudayaan, Kebangsaan, Kemanusiaan)",
      "Ki Hadjar Dewantara, 'Pendidikan dan Pengajaran Nasional' (1936)",
    ],
  },
  {
    id: "persis-1923",
    year: "1923",
    era: "1922-1938",
    title: "Persatuan Islam (Persis) & Dialektika Negara Hukum Islam di Bandung",
    subtitle: "A. Hassan & Mohammad Natsir Merumuskan Purifikasi Hukum dan Demokrasi Berakhlak",
    category: "islam",
    categoryLabel: "Pemikiran Hukum & Syura",
    icon: "📖",
    description:
      "Persis didirikan di Bandung oleh KH. Zamzam dan M. Yunus, diperkuat oleh ulama A. Hassan dan cendekiawan muda Mohammad Natsir. Persis menerbitkan majalah 'Pembela Islam' dan 'Pandji Islam' yang memicu perdebatan intelek tingkat tinggi dengan Bung Karno mengenai kedudukan syariat Islam, demokrasi syura, dan kebebasan berpikir dalam bingkai negara hukum merdeka.",
    figures: ["A. Hassan Bandung", "Mohammad Natsir", "K.H. Zamzam"],
    dimensions: ["Sila 1: Ketuhanan Yang Maha Esa", "Sila 4: Musyawarah dan Syura"],
    citations: [
      "A. Hassan, 'Soal-Jawab tentang Hukum Islam dan Masalah Kenegaraan' (1931)",
      "Majalah Pembela Islam No. 1–72 (1929–1935; Koleksi Langka Perpustakaan Nasional RI)",
    ],
  },
  {
    id: "pi-tanmalaka-1925",
    year: "1925",
    era: "1922-1938",
    title: "Perhimpunan Indonesia & Tan Malaka: Sosio-Demokrasi Desa & Republik Merdeka",
    subtitle: "Hatta & Tan Malaka Mengonseptualisasikan Republik Indonesia Berdasarkan Gotong Royong Desa",
    category: "sosio-desa",
    categoryLabel: "Sosio-Demokrasi Desa & Republikanisme",
    icon: "🌾",
    description:
      "Melalui 'Naar de Republiek Indonesia' (1925) karya Tan Malaka dan Manifesto Perhimpunan Indonesia 1925 oleh Mohammad Hatta, para pemikir muda merumuskan bahwa Republik Indonesia harus tegak di atas Demokrasi Asli Desa: tradisi mufakat, hak membantah, gotong royong, dan kepemilikan tanah kolektif. Ini menjadi cikal bakal Pasal 33 UUD 1945.",
    figures: ["Mohammad Hatta", "Tan Malaka", "Sutan Sjahrir"],
    dimensions: ["Sila 4: Kerakyatan & Musyawarah", "Sila 5: Keadilan Sosial", "Pasal 33 UUD 1945"],
    citations: [
      "Tan Malaka, 'Naar de Republiek Indonesia' (Canton, 1925)",
      "Mohammad Hatta, 'Indonesia Vrij' (Pledoi Den Haag, 1928)",
    ],
  },
  {
    id: "nu-1926",
    year: "1926",
    era: "1922-1938",
    title: "Nahdlatul Ulama (NU): Hubbul Wathan Minal Iman & Komite Hijaz",
    subtitle: "Hadratus Syekh Hasyim Asy'ari Menegakkan Islam Nusantara & Nasionalisme Berketuhanan",
    category: "islam",
    categoryLabel: "Islam Moderat & Kebangsaan",
    icon: "🕌",
    description:
      "Didirikan di Surabaya oleh para kiai pesantren di bawah Hadratus Syekh KH. Hasyim Asy'ari dan KH. Wahab Chasbullah. NU mempopulerkan doktrin teologis 'Hubbul Wathan Minal Iman' (Mencintai Tanah Air adalah Sebagian dari Iman). NU merawat pluralisme kultural dan toleransi lokal (tasamuh, tawazun, i'tidal) yang menjadi tulang punggung Bhinneka Tunggal Ika.",
    figures: ["K.H. Hasyim Asy'ari", "K.H. Wahab Chasbullah", "K.H. Bisri Syansuri"],
    dimensions: ["Sila 1: Ketuhanan Yang Maha Esa", "Sila 3: Persatuan Indonesia"],
    citations: [
      "K.H. Hasyim Asy'ari, 'Muqaddimah Qanun Asasi Nahdlatul Ulama' (1926)",
      "Hasil Muktamar NU Pertama di Surabaya (1926)",
    ],
  },
  {
    id: "sumpah-pemuda-1928",
    year: "1928 (Okt)",
    era: "1922-1938",
    title: "Sumpah Pemuda: Konsensus Satu Bangsa & Bahasa Persatuan",
    subtitle: "Kongres Pemuda II Meleburkan Ego Primordial ke dalam Identitas Nasional",
    category: "pemuda",
    categoryLabel: "Pemuda & Kebhinekaan",
    icon: "🇮🇩",
    description:
      "Jong Java, Jong Sumatranen Bond, Jong Islamieten Bond, Jong Bataks Bond, Jong Celebes, Jong Ambon, dan Pemuda Kaum Betawi mengikrarkan satu tumpah darah, satu bangsa, dan satu bahasa persatuan: Indonesia. Ikrar ini membuktikan persatuan nasional tidak dibangun dari asimilasi paksa, melainkan kesepakatan sadar untuk bersatu di tengah kebinekaan.",
    figures: ["Soegondo Djojopoespito", "Mohammad Yamin", "Amir Sjarifuddin", "Wage Rudolf Supratman"],
    dimensions: ["Sila 3: Persatuan Indonesia", "Pasal 36 UUD 1945: Bahasa Negara"],
    citations: [
      "Naskah Ikrar Sumpah Pemuda 28 Oktober 1928 (Museum Sumpah Pemuda / ANRI)",
      "Risalah Rapat Kongres Pemoeda-Pemoedi Indonesia II (1928)",
    ],
  },
  {
    id: "kongres-perempuan-1928",
    year: "1928 (Des)",
    era: "1922-1938",
    title: "Kongres Perempuan Indonesia I: Emansipasi & Hak Sosial Perempuan",
    subtitle: "30 Organisasi Perempuan Bersatu Menuntut Keadilan Hukum & Pendidikan",
    category: "perempuan",
    categoryLabel: "Gerakan Perempuan & Keadilan Sosial",
    icon: "🧕",
    description:
      "Bertempat di Ndalem Joyodipuran Yogyakarta, kongres perempuan pertama menyatukan organisasi wanita Islam (Aisyiyah, Wanito Oetomo), Kristen, dan nasionalis. Mereka menuntut penghapusan perkawinan anak di bawah umur, perlindungan buruh perempuan, dan hak perempuan dalam anggaran belanja negara, meletakkan fondasi non-diskriminasi gender dalam konstitusi.",
    figures: ["R.A. Soekonto", "Nyi Hajar Dewantara", "Siti Moendjijah (Aisyiyah)"],
    dimensions: ["Sila 2: Kemanusiaan yang Adil dan Beradab", "Pasal 27 ayat (1) UUD 1945: Persamaan di Hadapan Hukum"],
    citations: [
      "Verslag van het Eerste Indonesische Vrouwencongres (Yogyakarta, 22-25 Desember 1928)",
      "Koleksi Naskah Kongres Perempuan I (ANRI / Balai Pelestarian Nilai Budaya)",
    ],
  },
  {
    id: "indonesia-menggugat-1930",
    year: "1930",
    era: "1922-1938",
    title: "Indonesia Menggugat: Pledoi Bung Karno Membongkar Imperialisme Kapitalistik",
    subtitle: "Analisis Ilmiah Struktur Hisap Kolonial & Fondasi Keadilan Sosial Nasional",
    category: "kebangsaan",
    categoryLabel: "Anti-Imperialisme & Keadilan Sosial",
    icon: "⚖️",
    description:
      "Dalam sidang Landraad Bandung, Ir. Soekarno menyampaikan pidato pembelaan legendaris 'Indonesië Klaagt Aan!'. Soekarno membedah secara saintifik bagaimana modal imperialistik menguras kekayaan bumi pertiwi dan memiskinkan marhaen. Pledoi ini menegaskan bahwa kemerdekaan Indonesia adalah jembatan emas menuju keadilan distributif ekonomi.",
    figures: ["Ir. Soekarno", "Mr. Sartono", "Mr. Sastromulyono"],
    dimensions: ["Sila 5: Keadilan Sosial bagi Seluruh Rakyat Indonesia", "Pasal 33 UUD 1945: Kesejahteraan Sosial"],
    citations: [
      "Ir. Soekarno, 'Indonesia Menggugat: Pidato Pembelaan di Depan Pengadilan Kolonial Bandung 1930'",
      "ANRI Koleksi Raad van Justitie / Landraad Bandung 1930",
    ],
  },
  {
    id: "miai-1937",
    year: "1937",
    era: "1922-1938",
    title: "Majelis Islam A'la Indonesia (MIAI): Unifikasi Ormas Menuntut Indonesia Berparlemen",
    subtitle: "NU, Muhammadiyah, PSII, Al-Irsyad, PUI, & Persis Bersatu dalam Aksi Politik GAPI",
    category: "islam",
    categoryLabel: "Unifikasi Umat & Demokrasi Parlemen",
    icon: "🤝",
    description:
      "MIAI didirikan di Surabaya atas prakarsa KH. Mas Mansur, KH. Wahab Chasbullah, dan Wondoamiseno untuk menyatukan seluruh kekuatan organisasi Islam nusantara. MIAI menjadi kekuatan penekan politik utama bersama Gabungan Politik Indonesia (GAPI) dengan semboyan 'Indonesia Berparlemen', menuntut dewan perwakilan rakyat yang berdaulat penuh.",
    figures: ["K.H. Mas Mansur", "K.H. Wahab Chasbullah", "Wondoamiseno"],
    dimensions: ["Sila 4: Kerakyatan & Lembaga Perwakilan", "Sila 3: Persatuan Indonesia"],
    citations: [
      "Statuten dan Program Aksi Madjlis Islam A'la Indonesia (1937; ANRI)",
      "Deliar Noer, 'Gerakan Modern Islam di Indonesia 1900-1942' (LP3ES, 1980)",
    ],
  },

  // ─── ERA 3: PERUMUSAN NASKAH KONSTITUSI & KEMERDEKAAN (1945) ───
  {
    id: "sidang-bpupk-1-1945",
    year: "1945 (Mei–Jun)",
    era: "1945",
    title: "Sidang BPUPK I: Dialektika Asas Falsafah Dasar Negara Merdeka",
    subtitle: "Pidato Mr. Moh. Yamin (29 Mei), Prof. Mr. Soepomo (31 Mei), & Ir. Soekarno (1 Juni)",
    category: "konstitusi",
    categoryLabel: "Falsafah Dasar Konstitusi",
    icon: "🏛️",
    description:
      "Sidang pertama BPUPK (Badan Penyelidik Usaha-Usaha Persiapan Kemerdekaan) menjadi panggung dialektika intelektual pendiri bangsa. Moh. Yamin mengusulkan 5 asas peri-kebangsaan; Soepomo memaparkan paham negara integralistik; dan Bung Karno pada 1 Juni 1945 menyampaikan pidato 'Lahirnya Pancasila' yang memeras intisari jiwa bangsa menjadi Kebangsaan, Internasionalisme, Mufakat/Demokrasi, Kesejahteraan Sosial, dan Ketuhanan yang Berkebudayaan.",
    figures: ["Ir. Soekarno", "Prof. Mr. Soepomo", "Mr. Mohammad Yamin", "Dr. K.R.T. Radjiman Wedyodiningrat"],
    dimensions: ["Sila 1 s.d. Sila 5: Seluruh Falsafah Pancasila", "Pembukaan UUD 1945"],
    citations: [
      "Risalah Sidang Badan Penyelidik Usaha-Usaha Persiapan Kemerdekaan Indonesia (BPUPKI) (Setneg RI, 1995)",
      "Notulen Stenografis Sidang BPUPK Mr. A.G. Pringgodigdo (ANRI)",
    ],
  },
  {
    id: "bpupk-islam-draft-1945",
    year: "1945 (Jul)",
    era: "1945",
    title: "Draf Rancang UUD Al-Qur'an & Sunnah BPUPK: Syura, Amanah, & Kepala Negara",
    subtitle: "Ki Bagus Hadikusumo, Wahid Hasyim, & Kahar Muzakkir Mengajukan Norma Berbasis Al-Qur'an",
    category: "islam",
    categoryLabel: "Islam & Naskah Konstitusi BPUPK",
    icon: "📜",
    description:
      "Fraksi Islam di BPUPK mengajukan draf rancangan UUD dengan rujukan eksplisit pada nilai-nilai Al-Qur'an dan Sunnah: mewajibkan musyawarah dalam pemerintahan (QS. Asy-Syura: 38), menegakkan hukum dan amanah secara adil (QS. An-Nisa: 58), serta draf Pasal 6 ayat (1) yang mensyaratkan Presiden orang Indonesia asli beragama Islam, serta draf Pasal 29.",
    figures: ["Ki Bagus Hadikusumo", "K.H. Wahid Hasyim", "Prof. Abdoel Kahar Moezakkir", "H. Agus Salim"],
    dimensions: ["Sila 1: Ketuhanan Yang Maha Esa", "Pasal 6 ayat (1) & Pasal 29 UUD 1945"],
    citations: [
      "Arsip Nasional RI: Berkas Sidang Panitia Perancang UUD BPUPK 11–16 Juli 1945 (Notulen Mr. A.G. Pringgodigdo)",
      "Risalah Resmi BPUPKI-PPKI, Sekretariat Negara RI (1995)",
    ],
    quranVerse: {
      surah: "QS. Asy-Syura: 38 & QS. An-Nisa: 58",
      arabic: "وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ ... إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا وَإِذَا حَكَمْتُم بَيْنَ النَّاسِ أَن تَحْكُمُوا بِالْعَدْلِ",
      translation:
        "'Dan urusan mereka diputuskan dengan musyawarah di antara mereka...' (QS. 42:38) dan 'Sungguh, Allah menyuruhmu menyampaikan amanat kepada yang berhak menerimanya, dan apabila kamu menetapkan hukum di antara manusia hendaklah kamu menetapkannya dengan adil...' (QS. 4:58)",
    },
  },
  {
    id: "piagam-jakarta-1945",
    year: "1945 (22 Jun)",
    era: "1945",
    title: "Piagam Jakarta (Jakarta Charter): Sintesis Luhur Panitia Sembilan",
    subtitle: "Konsensus Falsafah Pembukaan Konstitusi Menjembatani Golongan Kebangsaan & Islam",
    category: "konstitusi",
    categoryLabel: "Piagam Konstitusi Negara",
    icon: "🤝",
    description:
      "Panitia Sembilan merumuskan naskah mukadimah hukum dasar negara yang memuat kompromi agung: Sila 'Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya'. Naskah ini membuktikan kemampuan para pendiri bangsa dari berbagai latar belakang keyakinan untuk menyatukan visi negara merdeka yang adil, makmur, dan berdaulat.",
    figures: ["Ir. Soekarno", "Drs. Mohammad Hatta", "Mr. A.A. Maramis", "Abikoesno Tjokrosoejoso", "H. Agus Salim", "K.H. Wahid Hasyim"],
    dimensions: ["Pembukaan UUD 1945", "Sila 1 s.d. Sila 5"],
    citations: [
      "Naskah Asli Piagam Jakarta 22 Juni 1945 (ANRI Koleksi No. 17 / Pandji Soerachman)",
      "Risalah Panitia Sembilan BPUPK (Setneg RI)",
    ],
  },
  {
    id: "ppki-konsensus-1945",
    year: "1945 (18 Agu)",
    era: "1945",
    title: "Sidang PPKI: Konsensus Ketuhanan Yang Maha Esa (Tauhid) & Hak Warga (Pasal 28 Hatta)",
    subtitle: "Pengorbanan Negarawan Muslim demi Keutuhan Sabang–Merauke & Jaminan Hak Asasi",
    category: "konstitusi",
    categoryLabel: "Pengesahan UUD 1945 & Hak Asasi",
    icon: "⚖️",
    description:
      "Demi merangkul wilayah Indonesia Timur dan menjamin keutuhan NKRI, Ki Bagus Hadikusumo, Wahid Hasyim, dan Kasman Singodimedjo dengan jiwa kenegarawanan tulus menyepakati perubahan 7 kata menjadi 'Ketuhanan Yang Maha Esa' (makna Tauhid). Pada sidang ini pula Bung Hatta dan Yamin memperjuangkan hak asasi warga (kemerdekaan berserikat, berkumpul, dan berpendapat) hingga disahkan dalam Pasal 28 UUD 1945.",
    figures: ["Ki Bagus Hadikusumo", "K.H. Wahid Hasyim", "Mr. Kasman Singodimedjo", "Mr. Teuku Mohammad Hasan", "Drs. Mohammad Hatta"],
    dimensions: ["Sila 1: Ketuhanan Yang Maha Esa", "Pasal 28 UUD 1945: Hak Berserikat & Berpendapat"],
    citations: [
      "Berita Repoeblik Indonesia Tahun I No. 2 (1946; ANRI)",
      "Kasman Singodimedjo, 'Hidup Itu Berjuang: Kasman Singodimedjo 75 Tahun' (Bulan Bintang, 1982)",
    ],
  },

  // ─── ERA 4: MEMPERTAHANKAN EKSISTENSI & REVOLUSI FISIK (1945–1949) ───
  {
    id: "resolusi-jihad-1945",
    year: "1945 (22 Okt)",
    era: "1945-1949",
    title: "Resolusi Jihad Nahdlatul Ulama: Fatwa Membela Kedaulatan Bangsa adalah Fardhu 'Ain",
    subtitle: "Hadratus Syekh KH. Hasyim Asy'ari Mengobarkan Perlawanan Rakyat Melawan Agresi NICA",
    category: "islam",
    categoryLabel: "Kedaulatan & Revolusi Kemerdekaan",
    icon: "🔥",
    description:
      "Rapat konsul NU se-Jawa dan Madura di Surabaya menetapkan fatwa legendaris bahwa mempertahankan kemerdekaan Republik Indonesia dari agresi Belanda/NICA adalah kewajiban agama (Fardhu 'Ain) bagi setiap muslim dalam radius 94 km. Fatwa ini menjadi bahan bakar spiritual meletusnya Peristiwa Heroik 10 November 1945 di Surabaya.",
    figures: ["Hadratus Syekh K.H. Hasyim Asy'ari", "K.H. Wahab Chasbullah", "Bung Tomo", "Laskar Hizbullah & Sabilillah"],
    dimensions: ["Sila 3: Persatuan Indonesia", "Pasal 30 ayat (1) UUD 1945: Hak & Kewajiban Bela Negara"],
    citations: [
      "Naskah Otentik Resolusi Jihad PBNU 22 Oktober 1945 (Arsip PBNU & Suara Muslimin Indonesia 1945)",
      "Berita Harian Kedaulatan Rakjat & Soeara Rakjat No. 24 (Oktober 1945)",
    ],
  },
  {
    id: "maklumat-x-1945",
    year: "1945 (3 Nov)",
    era: "1945-1949",
    title: "Maklumat Wakil Presiden No. X: Fondasi Kedaulatan Rakyat & Multipartai",
    subtitle: "Mohammad Hatta Membuka Ruang Demokrasi Multipartai & Pengawasan Parlemen (KNIP)",
    category: "konstitusi",
    categoryLabel: "Demokrasi Parlemen & Multipartai",
    icon: "🗳️",
    description:
      "Maklumat No. X tanggal 3 November 1945 yang ditandatangani Wapres Mohammad Hatta menganjurkan pendirian partai-partai politik untuk menyalurkan seluruh aliran paham yang ada dalam masyarakat. Langkah ini mengubah KNIP dari badan pembantu presiden menjadi lembaga legislatif pengawas eksekutif, mencegah sentralisasi kekuasaan totaliter.",
    figures: ["Drs. Mohammad Hatta", "Sutan Sjahrir", "Mr. Assaat"],
    dimensions: ["Sila 4: Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan", "Pasal 28 UUD 1945"],
    citations: [
      "Maklumat Pemerintah No. X tanggal 3 November 1945 (Berita Repoeblik Indonesia Th. I No. 2; ANRI)",
      "Mohammad Hatta, 'Memoir' (Tintamas, 1979)",
    ],
  },
  {
    id: "pdri-1948",
    year: "1948–1949",
    era: "1945-1949",
    title: "Pemerintah Darurat Republik Indonesia (PDRI): Penyelamat Nyawa Eksistensi NKRI",
    subtitle: "Mr. Sjafruddin Prawiranegara Menjalankan Roda Pemerintahan di Rimba Sumatera Barat",
    category: "kebangsaan",
    categoryLabel: "Penyelamatan Kedaulatan Konstitusi",
    icon: "📻",
    description:
      "Ketika Agresi Militer Belanda II menduduki Yogyakarta dan menawan Soekarno-Hatta, Mr. Sjafruddin Prawiranegara menerima mandat kawat sandi untuk membentuk PDRI di Bukittinggi. Selama 207 hari bergerilya di hutan Sumatera, PDRI menjaga nyawa de jure Republik Indonesia di mata internasional dan mematahkan klaim Belanda bahwa RI telah musnah.",
    figures: ["Mr. Sjafruddin Prawiranegara", "Mr. Teuku Mohammad Hasan", "Jenderal Soedirman", "Mr. A.A. Maramis (Diplomasi New Delhi)"],
    dimensions: ["Sila 3: Persatuan Indonesia", "Alinea IV Pembukaan UUD 1945: Melindungi Segenap Bangsa"],
    citations: [
      "Kawat Sandi Mandat Pembentukan PDRI 19 Desember 1948 (ANRI Koleksi Sandi Militer)",
      "Mr. Sjafruddin Prawiranegara, 'Pemerintah Darurat Republik Indonesia' (Bulan Bintang, 1978)",
    ],
  },
  {
    id: "kmb-1949",
    year: "1949",
    era: "1945-1949",
    title: "Konferensi Antar-Indonesia & KMB Den Haag: Pengakuan Kedaulatan Penuh Tanpa Syarat",
    subtitle: "Bung Hatta & BFO Bersatu Menuntaskan Pengakuan Kemerdekaan Internasional",
    category: "kebangsaan",
    categoryLabel: "Diplomasi & Pengakuan Kedaulatan",
    icon: "🌐",
    description:
      "Didahului Konferensi Antar-Indonesia di Kaliurang yang menyatukan Republik Indonesia dengan negara-negara bagian BFO, delegasi RI dipimpin Bung Hatta berhasil memaksa Kerajaan Belanda menandatangani Piagam Penyerahan dan Pengakuan Kedaulatan penuh, bulat, dan tanpa syarat pada 27 Desember 1949 di Den Haag.",
    figures: ["Drs. Mohammad Hatta", "Sultan Hamid II", "Mr. Mohammad Roem", "Ide Anak Agung Gde Agung"],
    dimensions: ["Alinea I Pembukaan UUD 1945: Penjajahan Harus Dihapuskan", "Sila 3: Persatuan Indonesia"],
    citations: [
      "Naskah Resmi Akta Penyerahan dan Pengakuan Kedaulatan KMB Den Haag (Lembaran Negara RIS 1949 No. 1; ANRI)",
      "Risalah Konferensi Antar-Indonesia Juli–Agustus 1949 (ANRI)",
    ],
  },

  // ─── ERA 5: DINAMIKA KONSTITUSI, DEKRIT & REFORMASI (1950–2002) ───
  {
    id: "kaa-1955",
    year: "1955",
    era: "1950-2002",
    title: "Dasa Sila Bandung (KAA 1955): Internasionalisme Anti-Kolonial & Keadilan Global",
    subtitle: "Puncak Politik Bebas-Aktif Memimpin Bangsa-Bangsa Terjajah Asia dan Afrika",
    category: "kebangsaan",
    categoryLabel: "Ketertiban Dunia & Kemanusiaan",
    icon: "🌍",
    description:
      "Indonesia memprakarsai Konferensi Tingkat Tinggi Asia-Afrika di Gedung Merdeka Bandung, melahirkan 'Dasa Sila Bandung'. Deklarasi ini menjadi wujud nyata amanat Alinea IV Pembukaan UUD 1945: 'ikut melaksanakan ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi, dan keadilan sosial' serta melahirkan Gerakan Non-Blok.",
    figures: ["Ali Sastroamidjojo", "Ir. Soekarno", "Jawaharlal Nehru", "Zhou Enlai", "Gamal Abdel Nasser"],
    dimensions: ["Alinea IV Pembukaan UUD 1945: Perdamaian Abadi & Keadilan Sosial", "Sila 2: Kemanusiaan yang Adil dan Beradab"],
    citations: [
      "Final Communiqué of the Asian-African Conference, Bandung 24 April 1955 (Museum KAA / ANRI)",
      "Roeslan Abdulgani, 'The Bandung Connection: Konperensi Asia-Afrika' (Gunung Agung, 1980)",
    ],
  },
  {
    id: "konstituante-natsir-dekrit-1959",
    year: "1957–1959",
    era: "1950-2002",
    title: "Sidang Konstituante & Dekrit 5 Juli 1959: Piagam Madinah 622 M & Menjiwai UUD 1945",
    subtitle: "Mohammad Natsir Memaparkan Doktrin Negara Madinah; Dekrit Menegaskan Kesatuan Jiwa Piagam Jakarta",
    category: "islam",
    categoryLabel: "Debat Dasar Negara & Dekrit Presiden",
    icon: "📜",
    description:
      "Dalam perdebatan Majelis Konstituante di Bandung, Mohammad Natsir memaparkan naskah otentik Piagam Madinah (Sahifah al-Madinah 622 M) sebagai bukti sejarah bahwa konstitusi Islam menjamin kemajemukan agama, musyawarah, dan keadilan hukum. Saat sidang mengalami kebuntuan, Dekrit Presiden 5 Juli 1959 menetapkan kembali ke UUD 1945 dengan konsiderans yuridis bahwa Piagam Jakarta menjiwai dan merupakan satu kesatuan dengan UUD 1945.",
    figures: ["Mohammad Natsir", "Ir. Soekarno", "K.H. Masjkoer", "Prof. Kasman Singodimedjo", "K.H. Achmad Sjaichu"],
    dimensions: ["Sila 1: Ketuhanan Yang Maha Esa", "Pasal 29 UUD 1945: Kebebasan Beragama", "Dekrit Presiden 5 Juli 1959"],
    citations: [
      "Risalah Resmi Sidang Majelis Konstituante Republik Indonesia Jilid I–III (Bandung, 1957–1959; ANRI)",
      "Dekrit Presiden 5 Juli 1959 (Lembaran Negara RI No. 75 Tahun 1959)",
    ],
  },
  {
    id: "uupa-1960",
    year: "1960",
    era: "1950-2002",
    title: "Undang-Undang Pokok Agraria (UUPA No. 5/1960): Keadilan Sosial atas Bumi & Air",
    subtitle: "Pemberantasan Domein Verklaring Kolonial Demi Kedaulatan Tanah Kaum Tani",
    category: "sosio-desa",
    categoryLabel: "Keadilan Agraria & Kesejahteraan Rakyat",
    icon: "🌱",
    description:
      "Pemerintah dan DPR-GR mengesahkan UU No. 5 Tahun 1960 tentang Peraturan Dasar Pokok-Pokok Agraria (UUPA). UUPA mencabut hukum agraria kolonial yang menindas (Agrarische Wet 1870 / Domein Verklaring) dan menegaskan bahwa seluruh bumi, air, dan ruang angkasa dikuasai negara untuk sebesar-besar kemakmuran rakyat berdasarkan Pasal 33 ayat (3) UUD 1945.",
    figures: ["Mr. Sadjarwo", "Prof. Boedi Harsono", "Ir. Soekarno"],
    dimensions: ["Sila 5: Keadilan Sosial bagi Seluruh Rakyat Indonesia", "Pasal 33 ayat (3) UUD 1945"],
    citations: [
      "Undang-Undang No. 5 Tahun 1960 tentang Pokok-Pokok Agraria (Lembaran Negara RI No. 104 Tahun 1960; ANRI)",
      "Penjelasan UUPA 1960 (Tambahan Lembaran Negara No. 2043)",
    ],
  },
  {
    id: "amandemen-uud-1999-2002",
    year: "1999–2002",
    era: "1950-2002",
    title: "Amandemen Komprehensif UUD 1945 (Perubahan I–IV): Checks & Balances dan Hak Asasi",
    subtitle: "Pembentukan Mahkamah Konstitusi, Komisi Yudisial, DPD RI, & Pengesahan Bab XA HAM (Pasal 28A–28J)",
    category: "konstitusi",
    categoryLabel: "Reformasi Konstitusi Modern",
    icon: "⚖️",
    description:
      "MPR RI hasil Pemilu 1999 menuntaskan reformasi konstitusi terbesar sepanjang sejarah melalui empat kali perubahan UUD 1945 (1999, 2000, 2001, 2002). Amandemen membatasi masa jabatan presiden, meniadakan lembaga tertinggi negara mutlak, membentuk Mahkamah Konstitusi, Komisi Yudisial, dan DPD, serta menyisipkan piagam perlindungan Hak Asasi Manusia komprehensif (Pasal 28A–28J).",
    figures: ["Prof. Dr. Amien Rais", "Jakob Tobing (PAH I BP MPR)", "Harun Alrasid", "Jimly Asshiddiqie"],
    dimensions: ["Seluruh Norma Struktural UUD 1945", "Bab XA Hak Asasi Manusia (Pasal 28A–28J)", "Pasal 24C UUD 1945"],
    citations: [
      "Naskah Komprehensif Perubahan UUD 1945 Buku I–X (Sekretariat Jenderal Mahkamah Konstitusi & MPR RI, 2010; ANRI)",
      "Risalah Rapat Panitia Ad Hoc I & II Badan Pekerja MPR RI 1999–2002",
    ],
  },
];

const ERAS = [
  { id: "all", label: "Semua Era (1825–2002)", icon: "🌐", count: 27 },
  { id: "pra-1900", label: "Era 0: Fondasi Adat & Moral (Pra-1900)", icon: "🗡️", count: 3 },
  { id: "1905-1920", label: "Era 1: Fajar Organisasi Modern (1905–1920)", icon: "🌱", count: 5 },
  { id: "1922-1938", label: "Era 2: Sosio-Demokrasi & Persatuan (1922–1938)", icon: "🤝", count: 8 },
  { id: "1945", label: "Era 3: Perumusan Konstitusi (1945)", icon: "🏛️", count: 4 },
  { id: "1945-1949", label: "Era 4: Revolusi Kedaulatan (1945–1949)", icon: "🔥", count: 4 },
  { id: "1950-2002", label: "Era 5: Dinamika & Reformasi (1950–2002)", icon: "⚖️", count: 4 },
];

const CATEGORIES = [
  { id: "all", label: "Semua Arus", icon: "🌐" },
  { id: "islam", label: "Islam & Syariat Kerakyatan", icon: "🕌" },
  { id: "kebangsaan", label: "Kebangsaan & Anti-Kolonial", icon: "🇮🇩" },
  { id: "pendidikan", label: "Pendidikan Kritis", icon: "🎓" },
  { id: "sosio-desa", label: "Sosio-Demokrasi Desa & Adat", icon: "🌾" },
  { id: "pemuda", label: "Pemuda & Kebhinekaan", icon: "🤝" },
  { id: "perempuan", label: "Gerakan Perempuan", icon: "🧕" },
  { id: "konstitusi", label: "Naskah Konstitusi & Tata Negara", icon: "⚖️" },
];

export default function AkarSejarahPage() {
  const [selectedEra, setSelectedEra] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredMilestones = useMemo(() => {
    return HISTORICAL_MILESTONES.filter((m) => {
      if (selectedEra !== "all" && m.era !== selectedEra) {
        return false;
      }
      if (activeCategory !== "all" && m.category !== activeCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchesTitle = m.title.toLowerCase().includes(q);
      const matchesSubtitle = m.subtitle.toLowerCase().includes(q);
      const matchesDesc = m.description.toLowerCase().includes(q);
      const matchesFigures = m.figures.some((f) => f.toLowerCase().includes(q));
      const matchesYear = m.year.toLowerCase().includes(q);
      return matchesTitle || matchesSubtitle || matchesDesc || matchesFigures || matchesYear;
    });
  }, [selectedEra, activeCategory, searchQuery]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* Navigation */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--muted)] mb-6">
        <Link href="/" className="hover:text-[var(--text)] transition">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <span className="text-[var(--text)]">Akar Sejarah & Genealogi Konstitusi</span>
      </div>

      {/* Header */}
      <div className="border-b border-[var(--line)] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--acc-emerald)]">
              <span>🏛️</span>
              <span>Genealogi Intelektual & Dokumen Konstitusi (1825–2002)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)] mt-1">
              Akar Sejarah & Genealogi Pancasila
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-3xl">
              Pancasila dan UUD 1945 bukan produk instan yang lahir dalam semalam pada 1945, melainkan titik temu (*kalimatun sawa*) dari ratusan tahun perlawanan moral anti-kolonial, syariat Islam kerakyatan, tradisi musyawarah adat nagari/desa, kebangkitan pendidikan kritis, emansipasi perempuan, pergerakan pemuda kebinekaan, hingga amandemen konstitusi modern 1999–2002.
            </p>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)]">
            <div className="text-xs text-[var(--muted)]">Total Tonggak Sejarah Terverifikasi:</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--acc-emerald)]">
              27 <span className="text-xs font-normal text-[var(--muted)]">Peristiwa Primer</span>
            </div>
            <div className="text-[11px] text-[var(--acc-sky)] font-semibold">
              ✓ Terbagi dalam 6 Babakan Zaman
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-8 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tokoh (Diponegoro, Natsir, Hatta, Kartini), tahun, naskah arsip ANRI, atau topik..."
              className="w-full bg-[var(--panel)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-[var(--muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Era Filter Tabs */}
        <div className="mt-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Pilih Babakan Zaman:</div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {ERAS.map((era) => {
              const isActive = selectedEra === era.id;
              return (
                <button
                  key={era.id}
                  onClick={() => setSelectedEra(era.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-emerald-600 dark:bg-emerald-600 text-white font-bold shadow-md ring-1 ring-emerald-400"
                      : "bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400"
                  }`}
                >
                  <span>{era.icon}</span>
                  <span>{era.label}</span>
                  <span className="opacity-70 text-[10px]">({era.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category / Arus Filter Tabs */}
        <div className="mt-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Filter Arus Gerakan:</div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count =
                cat.id === "all"
                  ? HISTORICAL_MILESTONES.length
                  : HISTORICAL_MILESTONES.filter((m) => m.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-emerald-600 dark:bg-emerald-600 text-white font-bold shadow-md ring-1 ring-emerald-400"
                      : "bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="opacity-70 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Banner Khazanah Arsip ANRI */}
      <div className="mt-8 p-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <div className="font-bold text-sm text-[var(--text)]">Jelajahi Khazanah Arsip Nasional & Sumber Primer</div>
            <div className="text-xs text-[var(--muted)]">Telusuri 553 dokumen hukum otentik ANRI, kawat telegram sandi PDRI 1948, risalah BPUPK, hingga naskah komprehensif UUD 1945.</div>
          </div>
        </div>
        <Link
          href="/arsip"
          className="px-4 py-2 rounded-xl bg-sky-600 dark:bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 transition shrink-0 shadow-sm"
        >
          Buka Direktori Arsip ANRI &rarr;
        </Link>
      </div>

      {/* Timeline Stream */}
      <div className="mt-10 space-y-8 relative before:absolute before:inset-0 before:left-4 sm:before:left-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[var(--acc-emerald)] before:via-[var(--line)] before:to-transparent">
        {filteredMilestones.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-[var(--line)]">
            <p className="text-sm font-semibold text-[var(--muted)]">
              Tidak ditemukan tonggak sejarah yang cocok dengan filter atau kata kunci &quot;{searchQuery}&quot;.
            </p>
          </div>
        ) : (
          filteredMilestones.map((m) => (
            <div key={m.id} className="relative flex items-start gap-4 sm:gap-6 pl-1 sm:pl-2">
              {/* Year Badge */}
              <div className="flex items-center justify-center size-8 sm:size-10 rounded-full border-2 border-[var(--bg)] bg-emerald-600 dark:bg-emerald-600 text-white shrink-0 font-extrabold text-[10px] sm:text-xs z-10 shadow-md ring-2 ring-emerald-400/40">
                {m.year.split(" ")[0]}
              </div>

              {/* Card Content */}
              <div className="flex-1 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 shadow-sm space-y-3.5 hover:border-slate-400 transition">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)]/50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg">{m.icon}</span>
                    <span className="rounded-md bg-[var(--bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--acc-emerald)] border border-[var(--line)]">
                      {m.categoryLabel}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--muted)]">
                    {m.year}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[var(--text)] leading-snug">
                    {m.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--acc-sky)] mt-0.5">
                    {m.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  {m.description}
                </p>

                {/* Quran Citation if present */}
                {m.quranVerse && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 sm:p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                      <span>📖 Rujukan Al-Qur&apos;an Fraksi Islam BPUPK:</span>
                      <span>{m.quranVerse.surah}</span>
                    </div>
                    <div className="text-sm sm:text-base font-serif text-right text-[var(--text)] leading-loose dir-rtl pt-1">
                      {m.quranVerse.arabic}
                    </div>
                    <p className="text-xs italic text-[var(--muted)] border-t border-emerald-500/20 pt-2">
                      {m.quranVerse.translation}
                    </p>
                  </div>
                )}

                {/* Figures & Dimensions */}
                <div className="grid gap-3 sm:grid-cols-2 pt-2 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-[var(--text)] flex items-center gap-1.5">
                      <span>👤</span> Tokoh & Eksponen Kunci:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {m.figures.map((f) => (
                        <span
                          key={f}
                          className="rounded-md bg-[var(--bg)] px-2 py-0.5 text-[11px] text-[var(--muted)] border border-[var(--line)] font-medium"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-[var(--text)] flex items-center gap-1.5">
                      <span>⚖️</span> Tautan Sila & Pasal UUD:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {m.dimensions.map((d) => (
                        <span
                          key={d}
                          className="rounded-md bg-[var(--bg)] px-2 py-0.5 text-[11px] text-[var(--acc-amber)] border border-[var(--line)] font-medium"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Primary Citations */}
                <div className="pt-2 border-t border-[var(--line)]/50">
                  <div className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span>🏛️</span> Bukti Primer / Naskah Arsip Nasional (ANRI):
                  </div>
                  <ul className="space-y-1 text-xs text-[var(--muted)]">
                    {m.citations.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[var(--acc-sky)] shrink-0">•</span>
                        <span className="font-mono text-[11px]">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Catatan Metodologi & Kebijakan Anti-Dehistorisasi */}
      <div className="mt-14 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-8 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-[var(--text)] flex items-center gap-2">
          <span>📜</span> Kebijakan Penilaian Anti-Dehistorisasi Pancasila Index
        </h3>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          Pancasila Index memberlakukan penalti tegas <strong>skor -2 pada Sila 1 (Ketuhanan) dan Sila 3 (Persatuan)</strong> bagi setiap rezim atau institusi negara yang melakukan manipulasi sejarah, monopoli tafsir Pancasila sepihak, atau penghapusan kontribusi arus Islam, sosio-demokrasi desa, peran perempuan, dan gerakan pemuda dalam genealogi konstitusi Indonesia.
        </p>
        <div className="flex flex-wrap gap-4 pt-2 text-xs">
          <Link
            href="/metodologi"
            className="text-[var(--acc-sky)] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Pelajari Rubrik Metodologi 12 Dimensi</span>
            <span>&rarr;</span>
          </Link>
          <Link
            href="/arsip"
            className="text-[var(--acc-emerald)] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Telusuri 553 Dokumen Primer & Naskah ANRI</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
