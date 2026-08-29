"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Milestone {
  id: string;
  year: string;
  era: "pra-1900" | "1905-1920" | "1922-1938" | "1945" | "1945-1949" | "1950-2002";
  title: string;
  subtitle: string;
  category: "islam" | "pendidikan" | "sosio-desa" | "pemuda" | "perempuan" | "kebangsaan" | "konstitusi" | "oposisi";
  categoryLabel: string;
  icon: string;
  tldr: string; // Intisari 1 kalimat ramah publik
  isMonumental?: boolean; // Highlight peristiwa puncak
  quote?: {
    text: string;
    author: string;
  };
  description: string;
  figures: string[];
  connectionType: "embrio-nilai" | "norma-positif";
  connections: string[];
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
    categoryLabel: "Perlawanan Moral & Agama",
    icon: "🗡️",
    tldr: "Perlawanan moral rakyat pertama yang memadukan kewajiban syariat dan pembelaan kaum tani tertindas melawan pemerasan pajak gerbang kolonial.",
    quote: {
      text: "Kewajiban moral seorang ksatria dan ulama adalah menegakkan keadilan dan membela rakyat kecil dari kesewenang-wenangan.",
      author: "Pangeran Diponegoro (Babad Diponegoro)",
    },
    description:
      "Perang Diponegoro meletup sebagai respons perlawanan terhadap pemerasan pajak tanah pintu gerbang (tol) Raffles-Van der Capellen, intervensi kraton, dan degradasi moral. Diponegoro mendasarkan perjuangannya pada kewajiban moral syariat untuk menegakkan keadilan sosial dan membela kaum tani tertindas dari kesewenang-wenangan.",
    figures: ["Pangeran Diponegoro", "Kiai Mojo", "Sentot Alibasya Prawirodirdjo"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Embrio Kemanusiaan: Pembelaan Kaum Tertindas (Kelak Mengilhami Sila 2)",
      "🌱 Embrio Keadilan: Perlawanan atas Pajak Sewenang-wenang (Kelak Mengilhami Sila 5)",
    ],
    citations: [
      "Babad Diponegoro (Naskah Manuskrip UNESCO Memory of the World / Perpusnas KBG No. 282 / KITLV Leiden)",
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
    categoryLabel: "Hukum Adat & Musyawarah",
    icon: "📜",
    isMonumental: true,
    tldr: "Model konstitusional nusantara tertua: sintesis damai musyawarah adat nagari yang egaliter dengan nilai tauhid.",
    quote: {
      text: "Adat Basandi Syarak, Syarak Basandi Kitabullah — Syarak mangato, adat mamakai.",
      author: "Konsensus Piagam Bukit Marapalam 1837",
    },
    description:
      "Kesepakatan bersejarah antara Kaum Adat dan Kaum Padri pasca-Perang Padri melahirkan doktrin 'Adat Basandi Syarak, Syarak Basandi Kitabullah' (Adat bersendikan syariat, syariat bersendikan Kitabullah). Ini menjadi model konstitusional nusantara tertua dalam memadukan tradisi musyawarah adat nagari yang egaliter dengan nilai tauhid.",
    figures: ["Tuanku Imam Bonjol", "Tuanku Nan Renceh", "Para Pemangku Adat Minangkabau"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Preseden Ketauhidan: Landasan Kitabullah dalam Tatanan Masyarakat (Kelak Menjadi Jiwa Sila 1)",
      "🌱 Preseden Demokrasi Adat: Musyawarah Mufakat Nagari (Kelak Mengilhami Sila 4)",
    ],
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
    categoryLabel: "Emansipasi & Pendidikan",
    icon: "🕯️",
    tldr: "Pelopor emansipasi insani: memperjuangkan kesetaraan harkat martabat dan hak memperoleh pendidikan bagi seluruh anak bangsa.",
    quote: {
      text: "Dari gelap menuju cahaya — kami hendak mengangkat derajat kaum bumiputera melalui jalan ilmu pengetahuan.",
      author: "R.A. Kartini (Door Duisternis tot Licht)",
    },
    description:
      "Korespondensi Raden Ajeng Kartini dengan sahabat-sahabatnya di Eropa merintis gugatan filosofis terhadap belenggu feodalisme kaku dan penjajahan kolonial. Kartini terinspirasi terjemahan Al-Qur'an oleh Kiai Saleh Darat Semarang mengenai konsep 'Minaz Zhulumati Ilan Nur' (dari kegelapan menuju cahaya), memperjuangkan martabat kemanusiaan dan hak pendidikan bagi perempuan nusantara.",
    figures: ["R.A. Kartini", "K.H. Sholeh Darat Semarang", "Rosa Abendanon"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Embrio Emansipasi Insani: Martabat & Kesetaraan Manusia (Kelak Mengilhami Sila 2)",
      "🌱 Embrio Hak Belajar Bumiputera (Kelak Menjadi Dasar Filosofis Pasal 31 UUD 1945)",
    ],
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
    categoryLabel: "Ekonomi Berdikari",
    icon: "🪙",
    tldr: "Gerakan massa pribumi pertama yang melawan dominasi modal monopoli kolonial demi kedaulatan ekonomi rakyat.",
    quote: {
      text: "Berdikari dan tolong-menolong sesama pedagang bumiputera adalah jalan membebaskan diri dari jeratan penindasan.",
      author: "H. Samanhudi & RM. Tirto Adhi Soerjo",
    },
    description:
      "Didirikan oleh H. Samanhudi di Surakarta dan dikembangkan oleh RM. Tirto Adhi Soerjo di Bogor, SDI memobilisasi saudagar batik bumiputera untuk melawan monopoli bahan baku kolonial dan dominasi pedagang asing berprivilese. SDI menjadi cikal bakal kesadaran bahwa kedaulatan ekonomi berkeadilan adalah prasyarat mutlak kedaulatan bangsa.",
    figures: ["H. Samanhudi", "RM. Tirto Adhi Soerjo"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Embrio Ekonomi Mandiri: Solidaritas Anti-Monopoli (Kelak Mengilhami Sila 5)",
      "🌱 Embrio Usaha Bersama Pribumi (Kelak Mengilhami Asas Kekeluargaan Pasal 33 UUD 1945)",
    ],
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
    categoryLabel: "Kebangkitan Intelektual",
    icon: "🌱",
    tldr: "Titik balik perjuangan bangsa: beralih dari senjata fisik kedaerahan menjadi organisasi pergerakan intelektual terencana.",
    quote: {
      text: "Kemajuan tanah air hanya dapat dicapai bila kaum mudanya bersatu membangun pendidikan dan peradaban luhur.",
      author: "dr. Soetomo (Notulen Pendirian Boedi Oetomo)",
    },
    description:
      "Inisiasi para pemuda STOVIA menjadi titik tolak transisi perlawanan fisik sporadis menjadi gerakan terorganisasi modern berlandaskan pendidikan dan kebudayaan. Boedi Oetomo menyemaikan kesadaran persatuan bumiputera yang melampaui sekat kedaerahan primodial.",
    figures: ["dr. Soetomo", "dr. Wahidin Soedirohoesodo", "dr. Goenawan Mangoenkoesoemo"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Benih Kesadaran Persatuan Terstruktur (Kelak Mengkristal Menjadi Sila 3)",
      "🌱 Fondasi Gagasan Pembangunan Pendidikan Nasional (Kelak Menjadi Rujukan Pasal 31 UUD)",
    ],
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
    categoryLabel: "Nasionalisme Radikal",
    icon: "🚩",
    tldr: "Partai politik modern pertama yang menegaskan paham kebangsaan teritorial: seluruh warga dari berbagai latar ras adalah satu bangsa yang berhak merdeka.",
    quote: {
      text: "Indie voor Indiërs — Hindia untuk bangsa Hindia tanpa membeda-bedakan asal keturunan dan golongan.",
      author: "Tiga Serangkai (Douwes Dekker, Tjipto, Ki Hadjar)",
    },
    description:
      "Tiga Serangkai (Douwes Dekker, Tjipto Mangoenkoesoemo, Ki Hadjar Dewantara) mendirikan partai politik modern pertama di Hindia Belanda dengan semboyan 'Indie voor Indiërs'. Indische Partij memelopori paham kebangsaan teritorial yang merangkul seluruh warga tanpa membedakan ras, suku, atau keturunan.",
    figures: ["E.F.E. Douwes Dekker (Danudirja Setiabudi)", "dr. Tjipto Mangoenkoesoemo", "RM. Soewardi Soerjaningrat (Ki Hadjar Dewantara)"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Paham Kebangsaan Teritorial Lintas Ras (Kelak Menjadi Jiwa Sila 3)",
      "🌱 Tuntutan Kemerdekaan Politik Nasional (Kelak Mengilhami Alinea I Pembukaan UUD 1945)",
    ],
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
    categoryLabel: "Kedaulatan Rakyat & Syura",
    icon: "📢",
    tldr: "Gerakan massa jutaan rakyat menuntut pemerintahan mandiri (Zelfbestuur) dan kedaulatan politik berdasarkan syariat dan musyawarah.",
    quote: {
      text: "Jika kalian ingin menjadi pemimpin besar, menulislah seperti wartawan dan bicaralah seperti orator. Kedaulatan rakyat adalah mutlak!",
      author: "H.O.S. Tjokroaminoto (Kongres SI 1916)",
    },
    description:
      "Transformasi SDI menjadi SI menciptakan gerakan massa modern pertama dengan jutaan anggota. H.O.S. Tjokroaminoto memproklamirkan cita-cita 'Zelfbestuur' (pemerintahan sendiri oleh rakyat) pada Kongres Nasional SI 1916 di Bandung, merumuskan sintesis sosialisme religius bahwa kemerdekaan sejati bersumber dari kedaulatan rakyat dan ketauhidan.",
    figures: ["H.O.S. Tjokroaminoto", "H. Agus Salim", "Abdul Muis"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Embrio Kedaulatan Rakyat: Konsepsi Zelfbestuur (Kelak Menjadi Roh Sila 4)",
      "🌱 Sintesis Sosialisme Berketuhanan (Kelak Mengilhami Keterpaduan Sila 1 & Sila 5)",
    ],
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
    categoryLabel: "Pelayanan Kemanusiaan",
    icon: "🏥",
    tldr: "Praksis nyata pembelaan kaum lemah: menerjemahkan ajaran Al-Qur'an ke dalam jaringan rumah sakit, panti asuhan, dan sekolah terbuka untuk semua.",
    quote: {
      text: "Bukan hanya membaca ayat tentang menyantuni anak yatim dan orang miskin, melainkan mendirikan lembaga nyata untuk menolong mereka!",
      author: "K.H. Ahmad Dahlan (Risalah Teologi Al-Ma'un)",
    },
    description:
      "Didirikan di Kauman Yogyakarta, Muhammadiyah mempelopori reformasi pendidikan Islam modern dan pelayanan kemanusiaan universal tanpa membedakan agama/golongan. Berlandaskan penafsiran praksis Surat Al-Ma'un, K.H. Ahmad Dahlan mendirikan Penolong Kesengsaraan Oemoem (PKO) dan panti asuhan, yang kelak menjadi rujukan konstitusional amanat fakir miskin Pasal 34 UUD 1945.",
    figures: ["K.H. Ahmad Dahlan", "Nyai Ahmad Dahlan (Siti Walidah)", "K.H. Ibrahim"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Praksis Kemanusiaan Universal: Pelayanan PKO Lintas Agama (Kelak Mengilhami Sila 2)",
      "🌱 Model Pelembagaan Jaminan Kesejahteraan Duafa (Kelak Menjadi Rujukan Pasal 34 UUD 1945)",
    ],
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
    categoryLabel: "Pendidikan Pembebasan",
    icon: "🎓",
    tldr: "Fondasi filosofi pendidikan Indonesia: mendidik anak bangsa menjadi manusia merdeka lahir dan batin yang berbudaya luhur.",
    quote: {
      text: "Ing Ngarsa Sung Tuladha, Ing Madya Mangun Karsa, Tut Wuri Handayani.",
      author: "Ki Hadjar Dewantara (Panca Dharma Tamansiswa)",
    },
    description:
      "Ki Hadjar Dewantara mendirikan Tamansiswa dengan semboyan 'Ing Ngarsa Sung Tuladha, Ing Madya Mangun Karsa, Tut Wuri Handayani'. Tamansiswa menolak subsidi pemerintah kolonial (wilde scholen ordonnantie) untuk memastikan anak-anak pribumi dididik menjadi manusia merdeka yang berjiwa mandiri, beretika luhur, dan cinta kebudayaan nasional.",
    figures: ["Ki Hadjar Dewantara", "Nyi Hadjar Dewantara", "Ki Sarmidi Mangunsarkoro"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Filosofi Kemanusiaan Beradab & Manusia Merdeka (Kelak Mengilhami Sila 2)",
      "🌱 Asas Panca Dharma sebagai Cita-Cita Pendidikan Nasional (Kelak Menjadi Fondasi Pasal 31 UUD)",
    ],
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
    categoryLabel: "Hukum & Syura",
    icon: "📖",
    tldr: "Pusat dialektika intelektual: merumuskan kebebasan berpikir, demokrasi syura, dan kedudukan moral agama dalam negara hukum merdeka.",
    quote: {
      text: "Islam tidak anti-demokrasi; Islam menghendaki demokrasi yang dipimpin oleh akhlak, hikmah, dan keadilan.",
      author: "Mohammad Natsir & A. Hassan (Majalah Pembela Islam)",
    },
    description:
      "Persis didirikan di Bandung oleh KH. Zamzam dan M. Yunus, diperkuat oleh ulama A. Hassan dan cendekiawan muda Mohammad Natsir. Persis menerbitkan majalah 'Pembela Islam' dan 'Pandji Islam' yang memicu perdebatan intelek tingkat tinggi dengan Bung Karno mengenai kedudukan syariat Islam, demokrasi syura, dan kebebasan berpikir dalam bingkai negara hukum merdeka.",
    figures: ["A. Hassan Bandung", "Mohammad Natsir", "K.H. Zamzam"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Dialektika Syariat & Negara Hukum Berketuhanan (Kelak Menjadi Bahan Perdebatan Sila 1 BPUPK)",
      "🌱 Gagasan Demokrasi Syura Berakhlak (Kelak Mengilhami Konsep Permusyawaratan Sila 4)",
    ],
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
    categoryLabel: "Sosio-Demokrasi & Desa",
    icon: "🌾",
    tldr: "Kelahiran gagasan Republik Indonesia: menegaskan bahwa demokrasi sejati bangsa bersumber dari tradisi mufakat, hak membantah, dan gotong royong desa.",
    quote: {
      text: "Demokrasi kita bukan demokrasi Barat yang individualistik, melainkan Demokrasi Asli Desa yang berakar pada tolong-menolong dan musyawarah.",
      author: "Mohammad Hatta & Tan Malaka (Naar de Republiek Indonesia 1925)",
    },
    description:
      "Melalui 'Naar de Republiek Indonesia' (1925) karya Tan Malaka dan Manifesto Perhimpunan Indonesia 1925 oleh Mohammad Hatta, para pemikir muda merumuskan bahwa Republik Indonesia harus tegak di atas Demokrasi Asli Desa: tradisi mufakat, hak membantah, gotong royong, dan kepemilikan tanah kolektif. Ini menjadi cikal bakal Pasal 33 UUD 1945.",
    figures: ["Mohammad Hatta", "Tan Malaka", "Sutan Sjahrir"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Teori Demokrasi Asli Desa & Hak Memprotes (Kelak Mengilhami Musyawarah Sila 4)",
      "🌱 Konsepsi Kepemilikan Kolektif & Koperasi (Kelak Menjadi Fondasi Penyusunan Pasal 33 UUD)",
    ],
    citations: [
      "Tan Malaka, 'Naar de Republiek Indonesia' (Canton, 1925)",
      "Mohammad Hatta, 'Indonesia Vrij' (Pledoi Den Haag, 1928)",
      "IISG Amsterdam ARCH01460 (Tan Malaka Papers)",
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
    tldr: "Doktrin teologis fundamental: mencintai tanah air adalah bagian dari iman, merawat keragaman kultural sebagai pilar Bhinneka Tunggal Ika.",
    quote: {
      text: "Hubbul wathan minal iman — Cinta tanah air adalah bagian tak terpisahkan dari keimanan seorang muslim.",
      author: "Hadratus Syekh K.H. Hasyim Asy'ari",
    },
    description:
      "Didirikan di Surabaya oleh para kiai pesantren di bawah Hadratus Syekh KH. Hasyim Asy'ari dan KH. Wahab Chasbullah. NU mempopulerkan doktrin teologis 'Hubbul Wathan Minal Iman' (Mencintai Tanah Air adalah Sebagian dari Iman). NU merawat pluralisme kultural dan toleransi lokal (tasamuh, tawazun, i'tidal) yang menjadi tulang punggung Bhinneka Tunggal Ika.",
    figures: ["K.H. Hasyim Asy'ari", "K.H. Wahab Chasbullah", "K.H. Bisri Syansuri"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Doktrin Teologis Cinta Tanah Air Bagian dari Iman (Kelak Menjadi Jiwa Sila 1 & Sila 3)",
      "🌱 Prinsip Moderasi Tasamuh & Tawazun (Kelak Menjadi Pilar Filosofis Bhinneka Tunggal Ika)",
    ],
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
    categoryLabel: "Pemuda & Persatuan",
    icon: "🇮🇩",
    isMonumental: true,
    tldr: "Penyatuan sadar ribuan pulau dan ratusan suku: meleburkan sekat kesukuan ke dalam ikrar Satu Tanah Air, Satu Bangsa, dan Bahasa Persatuan Indonesia.",
    quote: {
      text: "Kami poetra dan poetri Indonesia mengakoe bertoempah darah jang satoe, tanah Indonesia... mendjoendjoeng bahasa persatoean, bahasa Indonesia.",
      author: "Ikrar Kongres Pemuda II (28 Oktober 1928)",
    },
    description:
      "Jong Java, Jong Sumatranen Bond, Jong Islamieten Bond, Jong Bataks Bond, Jong Celebes, Jong Ambon, dan Pemuda Kaum Betawi mengikrarkan satu tumpah darah, satu bangsa, dan satu bahasa persatuan: Indonesia. Ikrar ini membuktikan persatuan nasional tidak dibangun dari asimilasi paksa, melainkan kesepakatan sadar untuk bersatu di tengah kebinekaan.",
    figures: ["Soegondo Djojopoespito", "Mohammad Yamin", "Amir Sjarifuddin", "Wage Rudolf Supratman"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Konsensus Kebangsaan Kesadaran Bersatu (Kelak Mengkristal Menjadi Sila 3)",
      "🌱 Penetapan Bahasa Indonesia sebagai Pemersatu (Kelak Diformalkan dalam Pasal 36 UUD 1945)",
    ],
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
    categoryLabel: "Gerakan Perempuan",
    icon: "🧕",
    tldr: "Persatuan 30 organisasi perempuan lintas agama dan suku menuntut kesetaraan hak di depan hukum dan penghapusan diskriminasi.",
    quote: {
      text: "Nasib bangsa ini sangat bergantung pada bagaimana kaum perempuan dididik dan dihormati hak-haknya.",
      author: "R.A. Soekonto & Nyi Hajar Dewantara (Kongres Perempuan 1928)",
    },
    description:
      "Bertempat di Ndalem Joyodipuran Yogyakarta, kongres perempuan pertama menyatukan organisasi wanita Islam (Aisyiyah, Wanito Oetomo), Kristen, dan nasionalis. Mereka menuntut penghapusan perkawinan anak di bawah umur, perlindungan buruh perempuan, dan hak perempuan dalam anggaran belanja negara, meletakkan fondasi non-diskriminasi gender dalam konstitusi.",
    figures: ["R.A. Soekonto", "Nyi Hajar Dewantara", "Siti Moendjijah (Aisyiyah)"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Embrio Penegakan Hak Kemanusiaan Perempuan (Kelak Mengilhami Sila 2)",
      "🌱 Tuntutan Kesetaraan Hak Warga Negara di Hadapan Hukum (Kelak Menjadi Rujukan Pasal 27 ayat 1 UUD)",
    ],
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
    categoryLabel: "Keadilan Sosial & Marhaen",
    icon: "⚖️",
    tldr: "Pledoi pembelaan legendaris di Landraad Bandung yang membongkar eksploitasi imperialisme dan merumuskan jembatan kemerdekaan menuju keadilan ekonomi.",
    quote: {
      text: "Kaum pergerakan Indonesia bukanlah pembuat kerusuhan. Imperialisme dan kapitalisme asing itulah yang menjadi sumber penderitaan rakyat!",
      author: "Ir. Soekarno (Indonesia Menggugat 1930)",
    },
    description:
      "Dalam sidang Landraad Bandung, Ir. Soekarno menyampaikan pidato pembelaan legendaris 'Indonesië Klaagt Aan!'. Soekarno membedah secara saintifik bagaimana modal imperialistik menguras kekayaan bumi pertiwi dan memiskinkan marhaen. Pledoi ini menegaskan bahwa kemerdekaan Indonesia adalah jembatan emas menuju keadilan distributif ekonomi.",
    figures: ["Ir. Soekarno", "Mr. Sartono", "Mr. Sastromulyono"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Kritik Teoretis Kapitalisme Kolonial (Kelak Mengkristal Menjadi Sila 5)",
      "🌱 Doktrin Penguasaan Cabang Produksi Strategis (Kelak Menjadi Roh Pasal 33 ayat 2-3 UUD)",
    ],
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
    categoryLabel: "Unifikasi Umat & Parlemen",
    icon: "🤝",
    tldr: "Unifikasi ormas Islam nusantara bersama gerakan nasionalis menuntut dewan perwakilan rakyat yang berdaulat penuh (Indonesia Berparlemen).",
    quote: {
      text: "Persatuan umat dan bangsa adalah senjata terkuat untuk menuntut parlemen yang dipilih langsung oleh rakyat.",
      author: "K.H. Mas Mansur & Wondoamiseno (MIAI-GAPI 1937)",
    },
    description:
      "MIAI didirikan di Surabaya atas prakarsa KH. Mas Mansur, KH. Wahab Chasbullah, dan Wondoamiseno untuk menyatukan seluruh kekuatan organisasi Islam nusantara. MIAI menjadi kekuatan penekan politik utama bersama Gabungan Politik Indonesia (GAPI) dengan semboyan 'Indonesia Berparlemen', menuntut dewan perwakilan rakyat yang berdaulat penuh.",
    figures: ["K.H. Mas Mansur", "K.H. Wahab Chasbullah", "Wondoamiseno"],
    connectionType: "embrio-nilai",
    connections: [
      "🌱 Tuntutan Pelembagaan Perwakilan Rakyat Berdaulat (Kelak Mengilhami Sila 4 & Bab VII UUD)",
      "🌱 Model Unifikasi Ormas Nasional (Kelak Mengilhami Solidaritas Kebangsaan Sila 3)",
    ],
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
    categoryLabel: "Falsafah Negara",
    icon: "🏛️",
    isMonumental: true,
    tldr: "Kelahiran Pancasila: Bung Karno pada 1 Juni 1945 memeras intisari jiwa bangsa menjadi lima prinsip filosofis dasar negara merdeka.",
    quote: {
      text: "Pancasila adalah weltanschauung, dasar falsafah, jiwa yang sedalam-dalamnya di atas mana didirikan gedung Indonesia Merdeka yang kekal dan abadi.",
      author: "Ir. Soekarno (Pidato 1 Juni 1945)",
    },
    description:
      "Sidang pertama BPUPK (Badan Penyelidik Usaha-Usaha Persiapan Kemerdekaan) menjadi panggung dialektika intelektual pendiri bangsa. Moh. Yamin mengusulkan 5 asas peri-kebangsaan; Soepomo memaparkan paham negara integralistik; dan Bung Karno pada 1 Juni 1945 menyampaikan pidato 'Lahirnya Pancasila' yang memeras intisari jiwa bangsa menjadi Kebangsaan, Internasionalisme, Mufakat/Demokrasi, Kesejahteraan Sosial, dan Ketuhanan yang Berkebudayaan.",
    figures: ["Ir. Soekarno", "Prof. Mr. Soepomo", "Mr. Mohammad Yamin", "Dr. K.R.T. Radjiman Wedyodiningrat"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Perumusan Awal 5 Sila Falsafah Negara",
      "⚖️ Landasan Mukaddimah Konstitusi (Pembukaan UUD 1945)",
    ],
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
    categoryLabel: "Naskah Konstitusi Islam",
    icon: "📜",
    tldr: "Fraksi Islam BPUPK mengajukan dalil QS. Asy-Syura: 38 (musyawarah wajib) dan QS. An-Nisa: 58 (pemerintahan amanah & adil) ke dalam batang tubuh UUD.",
    quote: {
      text: "Negara harus mewajibkan musyawarah dan menegakkan keadilan hukum secara jujur sebagaimana perintah Kitab Suci.",
      author: "Ki Bagus Hadikusumo & K.H. Wahid Hasyim (Sidang BPUPK Juli 1945)",
    },
    description:
      "Fraksi Islam di BPUPK mengajukan draf rancangan UUD dengan rujukan eksplisit pada nilai-nilai Al-Qur'an dan Sunnah: mewajibkan musyawarah dalam pemerintahan (QS. Asy-Syura: 38), menegakkan hukum dan amanah secara adil (QS. An-Nisa: 58), serta draf Pasal 6 ayat (1) yang mensyaratkan Presiden orang Indonesia asli beragama Islam, serta draf Pasal 29.",
    figures: ["Ki Bagus Hadikusumo", "K.H. Wahid Hasyim", "Prof. Abdoel Kahar Moezakkir", "H. Agus Salim"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Rujukan Asas Sila 1: Ketuhanan Yang Maha Esa",
      "⚖️ Draf Pasal 6 ayat (1) & Pasal 29 UUD 1945 dalam Pembahasan BPUPK",
    ],
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
    categoryLabel: "Piagam Konstitusi",
    icon: "🤝",
    tldr: "Sintesis agung 9 tokoh pendiri bangsa: merumuskan Pembukaan UUD 1945 yang menjembatani golongan kebangsaan dan Islam.",
    quote: {
      text: "Mukaddimah ini adalah hasil jerih payah persetujuan antara golongan kebangsaan dan golongan Islam.",
      author: "Ir. Soekarno (Laporan Panitia Sembilan 22 Juni 1945)",
    },
    description:
      "Panitia Sembilan merumuskan naskah mukadimah hukum dasar negara yang memuat kompromi agung: Sila 'Ketuhanan dengan kewajiban menjalankan syariat Islam bagi pemeluk-pemeluknya'. Naskah ini membuktikan kemampuan para pendiri bangsa dari berbagai latar belakang keyakinan untuk menyatukan visi negara merdeka yang adil, makmur, dan berdaulat.",
    figures: ["Ir. Soekarno", "Drs. Mohammad Hatta", "Mr. A.A. Maramis", "Abikoesno Tjokrosoejoso", "H. Agus Salim", "K.H. Wahid Hasyim"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Naskah Dasar Pembukaan UUD 1945 Alinea I s.d. IV",
      "⚖️ Kompromi Yuridis Sila 1 s.d. Sila 5 Pancasila",
    ],
    citations: [
      "Naskah Asli Piagam Jakarta 22 Juni 1945 (ANRI Koleksi No. 17 / Pandji Soerachman)",
      "Risalah Panitia Sembilan BPUPK (Setneg RI)",
    ],
  },
  {
    id: "ppki-konsensus-1945",
    year: "1945 (18 Agu)",
    era: "1945",
    title: "Sidang PPKI I: Konsensus Ketuhanan Yang Maha Esa & Jaminan Hak Warga (Pasal 28 Hatta)",
    subtitle: "Pengorbanan Negarawan Muslim demi Keutuhan Sabang–Merauke & Pengesahan UUD 1945",
    category: "konstitusi",
    categoryLabel: "Pengesahan UUD 1945",
    icon: "⚖️",
    isMonumental: true,
    tldr: "Hari kelahiran Konstitusi: pengorbanan luhur tokoh Islam menyepakati Sila 1 Ketuhanan Yang Maha Esa demi keutuhan NKRI dan pengesahan Pasal 28 jaminan hak asasi.",
    quote: {
      text: "Demi menjaga persatuan seluruh wilayah Indonesia dari Sabang sampai Merauke, kita sepakati Ketuhanan Yang Maha Esa bermakna Tauhid.",
      author: "Ki Bagus Hadikusumo, Kasman Singodimedjo, & Mohammad Hatta (18 Agustus 1945)",
    },
    description:
      "Demi merangkul wilayah Indonesia Timur dan menjamin keutuhan NKRI, Ki Bagus Hadikusumo, Wahid Hasyim, dan Kasman Singodimedjo dengan jiwa kenegarawanan tulus menyepakati perubahan 7 kata menjadi 'Ketuhanan Yang Maha Esa' (makna Tauhid). Pada sidang ini pula Bung Hatta dan Yamin memperjuangkan hak asasi warga (kemerdekaan berserikat, berkumpul, dan berpendapat) hingga disahkan dalam Pasal 28 UUD 1945.",
    figures: ["Ki Bagus Hadikusumo", "K.H. Wahid Hasyim", "Mr. Kasman Singodimedjo", "Mr. Teuku Mohammad Hasan", "Drs. Mohammad Hatta"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Norma Positif Sila 1: Ketuhanan Yang Maha Esa (Pengesahan Resmi)",
      "⚖️ Norma Positif Pasal 28 UUD 1945: Kemerdekaan Berserikat & Berpendapat",
    ],
    citations: [
      "Berita Repoeblik Indonesia Tahun I No. 2 (1946; ANRI)",
      "Risalah Stenografis Sidang Lengkap PPKI 18 Agustus 1945 (ANRI No. 01/1945)",
    ],
  },
  {
    id: "ppki-sidang-2-3-1945",
    year: "1945 (19–22 Agu)",
    era: "1945",
    title: "Sidang PPKI II & III: Penataan 8 Provinsi Pertama, 12 Kementerian, & Pembentukan KNIP",
    subtitle: "Peletakan Struktur Lembaga Negara, Pemerintahan Daerah, & Parlemen Darurat",
    category: "konstitusi",
    categoryLabel: "Struktur Lembaga Negara",
    icon: "🏛️",
    tldr: "Peletakan fondasi tata negara: menetapkan 8 Provinsi awal, 12 kementerian kabinet pertama, dan parlemen darurat KNIP.",
    quote: {
      text: "Negara yang merdeka harus segera memiliki aparat pemerintahan yang bekerja nyata melayani rakyat di seluruh daerah.",
      author: "Otto Iskandardinata & Mr. Latuharhary (Sidang PPKI 19 Agustus 1945)",
    },
    description:
      "Sidang PPKI tanggal 19 dan 22 Agustus 1945 menetapkan pembagian wilayah Republik Indonesia menjadi 8 Provinsi (Sumatera, Jawa Barat, Jawa Tengah, Jawa Timur, Sunda Kecil, Maluku, Sulawesi, Kalimantan), 12 Kementerian Kabinet Presidensial Pertama, serta pembentukan Komite Nasional Indonesia Pusat (KNIP) dan Badan Keamanan Rakyat (BKR) sebagai cikal bakal TNI.",
    figures: ["Otto Iskandardinata", "Mr. Johannes Latuharhary", "Mr. Iwa Kusumasumantri", "Mr. Kasman Singodimedjo"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Pelaksanaan Pasal 18 UUD 1945: Pembagian Daerah Otonom & Provinsi",
      "⚖️ Pelaksanaan Pasal 17 UUD 1945: Struktur Kementerian Negara",
    ],
    citations: [
      "Risalah Sidang PPKI 19 & 22 Agustus 1945 (ANRI Koleksi PPKI No. 02–03/1945)",
      "Berita Repoeblik Indonesia Th. I No. 2 (1946)",
    ],
  },

  // ─── ERA 4: MEMPERTAHANKAN EKSISTENSI, OPOSISI & REVOLUSI FISIK (1945–1949) ───
  {
    id: "resolusi-jihad-1945",
    year: "1945 (22 Okt)",
    era: "1945-1949",
    title: "Resolusi Jihad Nahdlatul Ulama: Fatwa Membela Kedaulatan Bangsa adalah Fardhu 'Ain",
    subtitle: "Hadratus Syekh KH. Hasyim Asy'ari Mengobarkan Perlawanan Rakyat Melawan Agresi NICA",
    category: "islam",
    categoryLabel: "Revolusi & Bela Negara",
    icon: "🔥",
    isMonumental: true,
    tldr: "Fatwa legendaris ulama: membela kemerdekaan Republik dari agresi penjajah adalah kewajiban agama mutlak (Fardhu 'Ain), membakar heroisme 10 November Surabaya.",
    quote: {
      text: "Mempertahankan Negara Kesatuan Republik Indonesia dari kembalinya penjajah adalah kewajiban fardhu 'ain bagi setiap mukallaf!",
      author: "Hadratus Syekh K.H. Hasyim Asy'ari (Resolusi Jihad 22 Oktober 1945)",
    },
    description:
      "Rapat konsul NU se-Jawa dan Madura di Surabaya menetapkan fatwa legendaris bahwa mempertahankan kemerdekaan Republik Indonesia dari agresi Belanda/NICA adalah kewajiban agama (Fardhu 'Ain) bagi setiap muslim dalam radius 94 km. Fatwa ini menjadi bahan bakar spiritual meletusnya Peristiwa Heroik 10 November 1945 di Surabaya.",
    figures: ["Hadratus Syekh K.H. Hasyim Asy'ari", "K.H. Wahab Chasbullah", "Bung Tomo", "Laskar Hizbullah & Sabilillah"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Penguatan Nyata Sila 3: Persatuan Indonesia di Medan Perang",
      "⚖️ Manifestasi Kewajiban Pasal 30 ayat (1) UUD 1945: Pembelaan Negara",
    ],
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
    categoryLabel: "Demokrasi & Parlemen",
    icon: "🗳️",
    tldr: "Penyelamat demokrasi dari kekuasaan tunggal: Bung Hatta membuka sistem multipartai dan memberikan wewenang legislatif kepada KNIP.",
    quote: {
      text: "Pemerintah menyukai timbulnya partai-partai politik, agar segala aliran paham masyarakat dapat dipimpin ke jalan yang teratur.",
      author: "Mohammad Hatta (Maklumat Wakil Presiden No. X 1945)",
    },
    description:
      "Maklumat No. X tanggal 3 November 1945 yang ditandatangani Wapres Mohammad Hatta menganjurkan pendirian partai-partai politik untuk menyalurkan seluruh aliran paham yang ada dalam masyarakat. Langkah ini mengubah KNIP dari badan pembantu presiden menjadi lembaga legislatif pengawas eksekutif, mencegah sentralisasi kekuasaan totaliter.",
    figures: ["Drs. Mohammad Hatta", "Sutan Sjahrir", "Mr. Assaat"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Implementasi Kedaulatan Rakyat Sila 4 & Pengawasan Eksekutif",
      "⚖️ Pelaksanaan Hak Berserikat Politik Pasal 28 UUD 1945",
    ],
    citations: [
      "Maklumat Pemerintah No. X tanggal 3 November 1945 (Berita Repoeblik Indonesia Th. I No. 2; ANRI)",
      "Mohammad Hatta, 'Memoir' (Tintamas, 1979)",
    ],
  },
  {
    id: "pki-madiun-1948",
    year: "1948 (Sep)",
    era: "1945-1949",
    title: "Peristiwa Madiun 1948: Resolusi 'Djalan Baru' Musso & Ujian Ideologi Negara",
    subtitle: "Konfrontasi Bersenjata Front Demokrasi Rakyat Melawan Garis Politik Sukarno-Hatta",
    category: "oposisi",
    categoryLabel: "Oposisi Kiri",
    icon: "🚩",
    tldr: "Ujian ideologi negara pertama: perlawanan bersenjata FDR/PKI Musso menolak perundingan Renville di tengah ancaman agresi Belanda.",
    quote: {
      text: "Djalan Baru untuk Republik Indonesia menuntut pemutusan kompromi dengan imperialis!",
      author: "Musso (Manifesto FDR/PKI Madiun 1948)",
    },
    description:
      "Kembalinya Musso dari Moskow membawa manifesto resolusi 'Djalan Baru untuk Republik Indonesia' yang menolak diplomasi Renville dan menuntut perombakan total kepemimpinan nasional. Pemberontakan FDR/PKI di Madiun menjadi ujian eksistensial pertama bagi konsensus Pancasila dan kedaulatan tentara reguler di tengah ancaman agresi Belanda.",
    figures: ["Musso", "Amir Sjarifuddin", "Kolonel Gatot Soebroto", "Kolonel Sungkono"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Ujian Ketahanan Ideologi Negara Sila 3: Persatuan Indonesia",
      "⚖️ Penegakan Kedaulatan Hukum & Keamanan Negara Berdasarkan Konstitusi",
    ],
    citations: [
      "Musso, 'Djalan Baru untuk Republik Indonesia' (Agustus 1948; IISG Amsterdam ARCH01061)",
      "ANRI Khazanah Pemberontakan PKI Madiun 1948 / Puspen TNI",
    ],
  },
  {
    id: "pdri-1948",
    year: "1948–1949",
    era: "1945-1949",
    title: "Pemerintah Darurat Republik Indonesia (PDRI): Penyelamat Nyawa Eksistensi NKRI",
    subtitle: "Mr. Sjafruddin Prawiranegara Menjalankan Roda Pemerintahan di Rimba Sumatera Barat",
    category: "kebangsaan",
    categoryLabel: "Penyelamat Eksistensi Negara",
    icon: "📻",
    isMonumental: true,
    tldr: "Penyelamat de jure Republik: Mr. Sjafruddin Prawiranegara menjalankan pemerintahan darurat selama 207 hari di hutan Sumatera saat Sukarno-Hatta ditawan Belanda.",
    quote: {
      text: "Selama PDRI masih berdiri di rimba Sumatera dan gerilya Sudirman bertahan di Jawa, Republik Indonesia tidak akan pernah mati!",
      author: "Mr. Sjafruddin Prawiranegara (Ketua PDRI 1948)",
    },
    description:
      "Ketika Agresi Militer Belanda II menduduki Yogyakarta dan menawan Soekarno-Hatta, Mr. Sjafruddin Prawiranegara menerima mandat kawat sandi untuk membentuk PDRI di Bukittinggi. Selama 207 hari bergerilya di hutan Sumatera, PDRI menjaga nyawa de jure Republik Indonesia di mata internasional dan mematahkan klaim Belanda bahwa RI telah musnah.",
    figures: ["Mr. Sjafruddin Prawiranegara", "Mr. Teuku Mohammad Hasan", "Jenderal Soedirman", "Mr. A.A. Maramis (Diplomasi New Delhi)"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Penyelamatan Mandat Konstitusi: Alinea IV Pembukaan UUD 1945",
      "⚖️ Keberlangsungan Kekuasaan Pemerintahan Berdasarkan Aturan Peralihan",
    ],
    citations: [
      "Kawat Sandi Mandat Pembentukan PDRI 19 Desember 1948 (ANRI Koleksi Sandi Militer)",
      "Mr. Sjafruddin Prawiranegara, 'Pemerintah Darurat Republik Indonesia' (Bulan Bintang, 1978)",
    ],
  },
  {
    id: "nii-proklamasi-1949",
    year: "1949 (7 Agu)",
    era: "1945-1949",
    title: "Proklamasi Negara Islam Indonesia (NII) & Qanun Asasi di Cisayong",
    subtitle: "SM Kartosoewirjo Memproklamasikan NII sebagai Respon Penolakan Perjanjian Renville",
    category: "oposisi",
    categoryLabel: "Oposisi Teokratis",
    icon: "⚡",
    tldr: "Respon penolakan hijrah Renville: SM Kartosoewirjo memproklamasikan NII dengan Qanun Asasi 31 pasal menolak kompromi dengan Belanda.",
    quote: {
      text: "Kami bangsa Islam Indonesia menyatakan berdirinya Negara Islam Indonesia berdasarkan Qanun Asasi.",
      author: "S.M. Kartosoewirjo (Naskah Proklamasi NII 1949)",
    },
    description:
      "Kecewa terhadap Perjanjian Renville yang mengharuskan TNI hijrah mengosongkan Jawa Barat ke Yogyakarta, Sekarmadji Maridjan Kartosoewirjo bersama laskar Hizbullah-Sabilillah memproklamirkan berdirinya NII (Darul Islam) dan menetapkan Qanun Asasi 31 pasal. Peristiwa ini menjadi representasi benturan gagasan teokrasi Islam melawan negara kebangsaan Pancasila.",
    figures: ["Sekarmadji Maridjan Kartosoewirjo", "K.H. Raden Oni", "Sanusi Partawidjaja"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Benturan Tafsir Teokrasi vs Kesepakatan Sila 1 & Sila 3 Konsensus Nasional",
      "⚖️ Penolakan Norma Pasal 1 ayat (1) UUD: Bentuk Negara Kesatuan",
    ],
    citations: [
      "Naskah Asli Proklamasi NII 7 Agustus 1949 (KITLV Leiden Or. 26.850 / ANRI)",
      "Naskah Qanun Asasi NII 1949 (KITLV Special Collections / Disjarahad)",
    ],
  },
  {
    id: "kmb-1949",
    year: "1949",
    era: "1945-1949",
    title: "Konferensi Antar-Indonesia & KMB Den Haag: Pengakuan Kedaulatan Penuh Tanpa Syarat",
    subtitle: "Bung Hatta & BFO Bersatu Menuntaskan Pengakuan Kemerdekaan Internasional",
    category: "kebangsaan",
    categoryLabel: "Pengakuan Kedaulatan",
    icon: "🌐",
    isMonumental: true,
    tldr: "Kemenangan diplomasi puncak: Bung Hatta memimpin delegasi RI-BFO memaksa Belanda mengakui kedaulatan penuh dan tanpa syarat.",
    quote: {
      text: "Pengakuan kedaulatan ini adalah hasil perjuangan darah seluruh rakyat dan keteguhan diplomasi bangsa.",
      author: "Mohammad Hatta (Pidato Penandatanganan KMB Den Haag 1949)",
    },
    description:
      "Didahului Konferensi Antar-Indonesia di Kaliurang yang menyatukan Republik Indonesia dengan negara-negara bagian BFO, delegasi RI dipimpin Bung Hatta berhasil memaksa Kerajaan Belanda menandatangani Piagam Penyerahan dan Pengakuan Kedaulatan penuh, bulat, dan tanpa syarat pada 27 Desember 1949 di Den Haag.",
    figures: ["Drs. Mohammad Hatta", "Sultan Hamid II", "Mr. Mohammad Roem", "Ide Anak Agung Gde Agung"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Realisasi Alinea I Pembukaan UUD: Kemerdekaan Hak Segala Bangsa",
      "⚖️ Konsolidasi Kedaulatan Wilayah Sabang–Merauke Sila 3",
    ],
    citations: [
      "Naskah Resmi Akta Penyerahan dan Pengakuan Kedaulatan KMB Den Haag (Lembaran Negara RIS 1949 No. 1; Nationaal Archief Nederland)",
      "Risalah Konferensi Antar-Indonesia Juli–Agustus 1949 (ANRI)",
    ],
  },

  // ─── ERA 5: DINAMIKA KONSTITUSI, DEKRIT, OPOSISI & REFORMASI (1950–2002) ───
  {
    id: "rms-1950",
    year: "1950 (25 Apr)",
    era: "1950-2002",
    title: "Proklamasi Republik Maluku Selatan (RMS) di Ambon: Penolakan Unifikasi NKRI",
    subtitle: "Mr. Dr. Chr. Soumokil Menolak Pembubaran NIT Menjadi Negara Kesatuan",
    category: "oposisi",
    categoryLabel: "Oposisi Separatis",
    icon: "🏝️",
    tldr: "Penolakan pembubaran negara federal NIT: Soumokil memproklamirkan RMS di Ambon sebelum dipulihkan melalui jalur militer dan diplomasi Leimena.",
    quote: {
      text: "Kami menolak peleburan ke dalam kesatuan Jakarta dan mempertahankan kemerdekaan Maluku Selatan.",
      author: "Chr. Soumokil (Proklamasi RMS 1950)",
    },
    description:
      "Menolak peleburan Negara Indonesia Timur (NIT) kembali ke dalam Negara Kesatuan Republik Indonesia, Mr. Dr. Chr. Soumokil dan J.H. Manuhutu memproklamasikan RMS di Ambon. Pemerintah RI mengupayakan misi damai dr. Leimena sebelum akhirnya menggelar operasi militer pimpinan Kolonel A.E. Kawilarang dan Letkol Slamet Riyadi untuk memulihkan keutuhan wilayah.",
    figures: ["Mr. Dr. Chr. Soumokil", "J.H. Manuhutu", "dr. J. Leimena", "Kolonel A.E. Kawilarang"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Pelanggaran atas Bentuk Negara Kesatuan Pasal 1 ayat (1) UUD 1945",
      "⚖️ Ujian Ketahanan Sila 3: Persatuan Indonesia",
    ],
    citations: [
      "Naskah Proklamasi RMS 25 April 1950 (Nationaal Archief Nederland NA NL 2.10.14)",
      "ANRI Khazanah Penumpasan Pemberontakan RMS 1950",
    ],
  },
  {
    id: "kaa-1955",
    year: "1955",
    era: "1950-2002",
    title: "Dasa Sila Bandung (KAA 1955): Internasionalisme Anti-Kolonial & Keadilan Global",
    subtitle: "Puncak Politik Bebas-Aktif Memimpin Bangsa-Bangsa Terjajah Asia dan Afrika",
    category: "kebangsaan",
    categoryLabel: "Keadilan Dunia",
    icon: "🌍",
    isMonumental: true,
    tldr: "Kepemimpinan moral dunia: Indonesia menyatukan 29 negara Asia-Afrika menentang kolonialisme dan merumuskan Dasa Sila Bandung.",
    quote: {
      text: "Mari kita jadikan Konferensi Asia-Afrika ini mercusuar perdamaian dan kebebasan bagi bangsa-bangsa tertindas!",
      author: "Ali Sastroamidjojo & Ir. Soekarno (KAA Bandung 1955)",
    },
    description:
      "Indonesia memprakarsai Konferensi Tingkat Tinggi Asia-Afrika di Gedung Merdeka Bandung, melahirkan 'Dasa Sila Bandung'. Deklarasi ini menjadi wujud nyata amanat Alinea IV Pembukaan UUD 1945: 'ikut melaksanakan ketertiban dunia yang berdasarkan kemerdekaan, perdamaian abadi, dan keadilan sosial' serta melahirkan Gerakan Non-Blok.",
    figures: ["Ali Sastroamidjojo", "Ir. Soekarno", "Jawaharlal Nehru", "Zhou Enlai", "Gamal Abdel Nasser"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Realisasi Amanat Alinea IV Pembukaan UUD 1945: Ketertiban Dunia & Perdamaian Abadi",
      "⚖️ Internasionalisme Kemanusiaan yang Adil dan Beradab Sila 2",
    ],
    citations: [
      "Final Communiqué of the Asian-African Conference, Bandung 24 April 1955 (Museum KAA / ANRI)",
      "Roeslan Abdulgani, 'The Bandung Connection: Konperensi Asia-Afrika' (Gunung Agung, 1980)",
    ],
  },
  {
    id: "prri-permesta-1957",
    year: "1957–1958",
    era: "1950-2002",
    title: "Piagam Permesta Makassar & Proklamasi PRRI Padang: Tuntutan Otonomi Daerah Luas",
    subtitle: "Perlawanan Daerah Terhadap Sentralisme Kekuasaan & Dominasi Politik Jakarta",
    category: "oposisi",
    categoryLabel: "Otonomi & Rekonsiliasi",
    icon: "🌾",
    tldr: "Pemberontakan menuntut desentralisasi fiskal dan otonomi daerah luas, diselesaikan melalui rekonsiliasi dan Keppres Amnesti 1961.",
    quote: {
      text: "Kami berjuang bukan untuk memisahkan diri, melainkan menuntut keadilan perimbangan pembangunan untuk daerah!",
      author: "Ventje Sumual & Sjafruddin Prawiranegara (Piagam PRRI/Permesta)",
    },
    description:
      "Piagam Permesta di Makassar (Letkol Ventje Sumual) dan Proklamasi PRRI di Padang (Letkol Ahmad Husein, Mr. Sjafruddin Prawiranegara, Dr. Sumitro Djojohadikusumo) menuntut dekonsentrasi kekuasaan, perimbangan keuangan pusat-daerah, dan penolakan pengaruh komunisme. Krisis ini diselesaikan melalui diplomasi rekonsiliasi dan Keppres Amnesti/Abolisi No. 449/1961 oleh Presiden Sukarno.",
    figures: ["Mr. Sjafruddin Prawiranegara", "Dr. Sumitro Djojohadikusumo", "Letkol Ventje Sumual", "Kolonel Maludin Simbolon"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Tuntutan Desentralisasi & Otonomi Daerah Pasal 18 UUD 1945",
      "⚖️ Rekonsiliasi Nasional & Amnesti Presiden Berdasarkan Hak Prerogatif Konstitusional",
    ],
    citations: [
      "Piagam Permesta 2 Maret 1957 & Piagam PRRI 15 Februari 1958 (Nationaal Archief NL 2.10.36.04 / ANRI)",
      "Keppres No. 449 Tahun 1961 tentang Amnesti & Abolisi PRRI/Permesta (Lembaran Negara RI)",
    ],
  },
  {
    id: "konstituante-natsir-dekrit-1959",
    year: "1957–1959",
    era: "1950-2002",
    title: "Sidang Konstituante & Dekrit 5 Juli 1959: Piagam Madinah 622 M & Menjiwai UUD 1945",
    subtitle: "Mohammad Natsir Memaparkan Doktrin Negara Madinah; Dekrit Menegaskan Kesatuan Jiwa Piagam Jakarta",
    category: "islam",
    categoryLabel: "Dasar Negara & Dekrit",
    icon: "📜",
    isMonumental: true,
    tldr: "Debat konstitusi terbesar: Natsir memaparkan Piagam Madinah 622 M; Dekrit Presiden 5 Juli 1959 menetapkan kembali ke UUD 1945 dengan jiwa Piagam Jakarta.",
    quote: {
      text: "Piagam Jakarta tertanggal 22 Juni 1945 menjiwai UUD 1945 dan adalah merupakan suatu rangkaian kesatuan dengan konstitusi tersebut.",
      author: "Dekrit Presiden Soekarno (5 Juli 1959)",
    },
    description:
      "Dalam perdebatan Majelis Konstituante di Bandung, Mohammad Natsir memaparkan naskah otentik Piagam Madinah (Sahifah al-Madinah 622 M) sebagai bukti sejarah bahwa konstitusi Islam menjamin kemajemukan agama, musyawarah, dan keadilan hukum. Saat sidang mengalami kebuntuan, Dekrit Presiden 5 Juli 1959 menetapkan kembali ke UUD 1945 dengan konsiderans yuridis bahwa Piagam Jakarta menjiwai dan merupakan satu kesatuan dengan UUD 1945.",
    figures: ["Mohammad Natsir", "Ir. Soekarno", "K.H. Masjkoer", "Prof. Kasman Singodimedjo", "K.H. Achmad Sjaichu"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Konsiderans Yuridis Dekrit 5 Juli 1959: Piagam Jakarta Menjiwai UUD 1945",
      "⚖️ Penegasan Kembali Berlakunya UUD 1945 & Sila 1 s.d. Sila 5",
    ],
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
    categoryLabel: "Keadilan Agraria",
    icon: "🌱",
    tldr: "Revolusi hukum tanah: mencabut hukum tanah kolonial Domein Verklaring dan menegakkan penguasaan bumi-air untuk kemakmuran rakyat.",
    quote: {
      text: "Bumi, air, dan ruang angkasa mempunyai fungsi sosial dan dikuasai oleh negara untuk sebesar-besar kemakmuran rakyat.",
      author: "Pasal 1 & 2 UUPA No. 5 Tahun 1960",
    },
    description:
      "Pemerintah dan DPR-GR mengesahkan UU No. 5 Tahun 1960 tentang Peraturan Dasar Pokok-Pokok Agraria (UUPA). UUPA mencabut hukum agraria kolonial yang menindas (Agrarische Wet 1870 / Domein Verklaring) dan menegaskan bahwa seluruh bumi, air, dan ruang angkasa dikuasai negara untuk sebesar-besar kemakmuran rakyat berdasarkan Pasal 33 ayat (3) UUD 1945.",
    figures: ["Mr. Sadjarwo", "Prof. Boedi Harsono", "Ir. Soekarno"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Pelaksanaan Norma Keadilan Sosial Sila 5",
      "⚖️ Pelaksanaan Pasal 33 ayat (3) UUD 1945: Penguasaan Bumi & Air oleh Negara",
    ],
    citations: [
      "Undang-Undang No. 5 Tahun 1960 tentang Pokok-Pokok Agraria (Lembaran Negara RI No. 104 Tahun 1960; ANRI)",
      "Penjelasan UUPA 1960 (Tambahan Lembaran Negara No. 2043)",
    ],
  },
  {
    id: "papua-new-york-pepera-1962-1969",
    year: "1962–1969",
    era: "1950-2002",
    title: "New York Agreement 1962 & PEPERA 1969: Integrasi Final Papua Barat ke Pangkuan NKRI",
    subtitle: "Perjanjian Bilateral PBB & Resolusi Sidang Umum PBB No. 2504 (XXIV)",
    category: "kebangsaan",
    categoryLabel: "Integritas Wilayah",
    icon: "🗺️",
    tldr: "Penuntasan batas wilayah Sabang-Merauke: Perjanjian New York dan Resolusi Majelis Umum PBB No. 2504 mengesahkan status Irian Barat dalam NKRI.",
    quote: {
      text: "Irian Barat adalah bagian tak terpisahkan dari proklamasi kemerdekaan 17 Agustus 1945.",
      author: "Frans Kaisiepo & Johannes Abraham Dimara (PEPERA 1969)",
    },
    description:
      "Perjanjian New York 15 Agustus 1962 mengakhiri sengketa Irian Barat antara Indonesia dan Belanda melalui administrasi transisi PBB (UNTEA). Pada 1969, diselenggarakan Penentuan Pendapat Rakyat (PEPERA) di 8 kabupaten yang memutuskan Papua tetap menjadi bagian mutlak dari NKRI, yang kemudian disahkan oleh Majelis Umum PBB lewat Resolusi No. 2504 (XXIV).",
    figures: ["Frans Kaisiepo", "Johannes Abraham Dimara", "Subandrio", "U Thant (Sekjen PBB)"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Penuntasan Integritas Wilayah Nasional Sila 3: Persatuan Indonesia",
      "⚖️ Pelaksanaan Mandat Perlindungan Segenap Tumpah Darah Alinea IV Pembukaan UUD",
    ],
    citations: [
      "New York Agreement 1962 (United Nations Treaty Series Vol. 437 No. 6311)",
      "Resolusi Majelis Umum PBB No. 2504 (XXIV) 19 November 1969 (UN Archives / ANRI)",
    ],
  },
  {
    id: "gam-helsinki-uupa-1976-2005",
    year: "1976–2005",
    era: "1950-2002",
    title: "Deklarasi GAM 1976, MoU Helsinki 2005, & UU Pemerintahan Aceh (UUPA)",
    subtitle: "Transformasi Konflik Bersenjata Menjadi Konsensus Damai Otonomi Asimetris dalam NKRI",
    category: "oposisi",
    categoryLabel: "Perdamaian & Otonomi Khusus",
    icon: "🕊️",
    isMonumental: true,
    tldr: "Model rekonsiliasi damai teladan: mengakhiri konflik 30 tahun Aceh melalui MoU Helsinki 2005 dan pelembagaan otonomi asimetris UUPA No. 11/2006.",
    quote: {
      text: "Perdamaian bermartabat ini membuktikan bahwa persatuan Indonesia dapat merangkul kekhususan sejarah daerah secara konstitusional.",
      author: "M. Jusuf Kalla & Martti Ahtisaari (MoU Helsinki 2005)",
    },
    description:
      "Deklarasi kemerdekaan oleh Teungku Hasan di Tiro pada 1976 memicu konflik bersenjata selama hampir tiga dekade di Aceh. Pasca-tsunami 2004, Pemerintah RI (Wapres Jusuf Kalla) dan GAM menandatangani Nota Kesepahaman (MoU) Helsinki 15 Agustus 2005 yang difasilitasi CMI Martti Ahtisaari. Kesepakatan damai ini diwujudkan secara konstitusional melalui UU No. 11/2006 (UUPA) yang memberikan otonomi khusus dan partai lokal di Aceh.",
    figures: ["Teungku Hasan di Tiro", "M. Jusuf Kalla", "Martti Ahtisaari (CMI)", "Hamid Awaludin", "Malik Mahmud"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Pelaksanaan Otonomi Khusus & Asimetris Pasal 18B ayat (1) UUD 1945",
      "⚖️ Rekonsiliasi Perdamaian Berkelanjutan Sila 3: Persatuan Indonesia",
    ],
    citations: [
      "Declaration of Independence of Acheh-Sumatra 1976 (KITLV Leiden D H 1426 / IISG)",
      "MoU Helsinki 15 Agustus 2005 (Crisis Management Initiative / Setneg RI)",
      "Undang-Undang No. 11 Tahun 2006 tentang Pemerintahan Aceh (Lembaran Negara RI No. 62/2006)",
    ],
  },
  {
    id: "petisi-50-1980",
    year: "1980 (5 Mei)",
    era: "1950-2002",
    title: "Petisi 50: Oposisi Moral Konstitusional Menolak Monopoli Tafsir Pancasila",
    subtitle: "Ali Sadikin, Natsir, Hoegeng, & Kasman Mengkritik Penggunaan Pancasila untuk Membungkam Oposisi",
    category: "oposisi",
    categoryLabel: "Oposisi Moral & Demokrasi",
    icon: "✊",
    tldr: "Kritik moral 50 tokoh bangsa: menolak Pancasila dijadikan alat kekuasaan rezim Orba untuk memusuhi dan memukul lawan politik.",
    quote: {
      text: "Pancasila adalah milik seluruh rakyat dan titik temu bangsa, bukan monopoli penguasa untuk mencurigai perbedaan pendapat.",
      author: "Ali Sadikin, Mohammad Natsir, & Hoegeng (Pernyataan Keprihatinan 1980)",
    },
    description:
      "Sebanyak 50 tokoh perintis kemerdekaan, mantan menteri, perwira tinggi militer, dan ulama menandatangani dokumen 'Pernyataan Keprihatinan' yang diserahkan ke DPR. Petisi 50 menolak pidato Presiden Soeharto yang menempatkan Pancasila sebagai alat kekuasaan untuk mencurigai dan memusuhi lawan politik, serta mengingatkan bahwa Pancasila adalah titik temu pemersatu seluruh golongan.",
    figures: ["Letjen (Mar) Ali Sadikin", "Mohammad Natsir", "Jenderal Pol. Hoegeng Imam Santoso", "Mr. Sjafruddin Prawiranegara", "Mr. Kasman Singodimedjo"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Penegakan Hak Berpendapat & Kritik Moral Pasal 28 UUD 1945",
      "⚖️ Penolakan Monopoli Tafsir atas Sila 1 s.d. Sila 5 Pancasila",
    ],
    citations: [
      "Naskah 'Pernyataan Keprihatinan' Petisi 50 (5 Mei 1980; ANRI / LKB)",
      "Ali Sadikin, 'Demi Demokrasi: Catatan Penjelasan Pernyataan Keprihatinan' (LKB, 1981)",
    ],
  },
  {
    id: "amandemen-uud-1999-2002",
    year: "1999–2002",
    era: "1950-2002",
    title: "Amandemen Komprehensif UUD 1945 (Perubahan I–IV): Checks & Balances dan Hak Asasi",
    subtitle: "Pembentukan Mahkamah Konstitusi, Komisi Yudisial, DPD RI, & Pengesahan Bab XA HAM (Pasal 28A–28J)",
    category: "konstitusi",
    categoryLabel: "Reformasi Konstitusi",
    icon: "⚖️",
    isMonumental: true,
    tldr: "Reformasi konstitusi terbesar: pembatasan masa jabatan presiden, pelembagaan Mahkamah Konstitusi & Komisi Yudisial, serta jaminan Bab XA Hak Asasi Manusia.",
    quote: {
      text: "Amandemen ini menegakkan kedaulatan hukum dan checks and balances agar kekuasaan tidak lagi terkonsentrasi mutlak di satu tangan.",
      author: "Prof. Dr. Amien Rais & Jakob Tobing (Risalah Amandemen MPR 1999–2002)",
    },
    description:
      "MPR RI hasil Pemilu 1999 menuntaskan reformasi konstitusi terbesar sepanjang sejarah melalui empat kali perubahan UUD 1945 (1999, 2000, 2001, 2002). Amandemen membatasi masa jabatan presiden, meniadakan lembaga tertinggi negara mutlak, membentuk Mahkamah Konstitusi, Komisi Yudisial, dan DPD, serta menyisipkan piagam perlindungan Hak Asasi Manusia komprehensif (Pasal 28A–28J).",
    figures: ["Prof. Dr. Amien Rais", "Jakob Tobing (PAH I BP MPR)", "Harun Alrasid", "Jimly Asshiddiqie"],
    connectionType: "norma-positif",
    connections: [
      "⚖️ Pengesahan Bab XA Hak Asasi Manusia (Pasal 28A s.d. 28J UUD 1945)",
      "⚖️ Pelembagaan Mahkamah Konstitusi (Pasal 24C) & Komisi Yudisial (Pasal 24B)",
    ],
    citations: [
      "Naskah Komprehensif Perubahan UUD 1945 Buku I–X (Sekretariat Jenderal Mahkamah Konstitusi & MPR RI, 2010; ANRI)",
      "Risalah Rapat Panitia Ad Hoc I & II Badan Pekerja MPR RI 1999–2002",
    ],
  },
];

const ERAS = [
  { id: "all", label: "Semua Era (1825–2002)", icon: "🌐", count: 33 },
  { id: "pra-1900", label: "Era 0: Fondasi Adat & Moral (Pra-1900)", icon: "🗡️", count: 3 },
  { id: "1905-1920", label: "Era 1: Fajar Organisasi Modern (1905–1920)", icon: "🌱", count: 5 },
  { id: "1922-1938", label: "Era 2: Sosio-Demokrasi & Persatuan (1922–1938)", icon: "🤝", count: 8 },
  { id: "1945", label: "Era 3: Perumusan Konstitusi (1945)", icon: "🏛️", count: 5 },
  { id: "1945-1949", label: "Era 4: Revolusi & Oposisi (1945–1949)", icon: "🔥", count: 5 },
  { id: "1950-2002", label: "Era 5: Dinamika, Konflik & Reformasi (1950–2002)", icon: "⚖️", count: 7 },
];

const CATEGORIES = [
  { id: "all", label: "Semua Arus", icon: "🌐" },
  { id: "islam", label: "Islam & Syariat Kerakyatan", icon: "🕌" },
  { id: "oposisi", label: "Oposisi & Perlawanan Regional", icon: "⚡" },
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
  const [viewMode, setViewMode] = useState<"summary" | "academic">("summary");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCards(new Set(HISTORICAL_MILESTONES.map((m) => m.id)));
  };

  const collapseAll = () => {
    setExpandedCards(new Set());
  };

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
      const matchesTldr = m.tldr.toLowerCase().includes(q);
      const matchesFigures = m.figures.some((f) => f.toLowerCase().includes(q));
      const matchesYear = m.year.toLowerCase().includes(q);
      return matchesTitle || matchesSubtitle || matchesDesc || matchesTldr || matchesFigures || matchesYear;
    });
  }, [selectedEra, activeCategory, searchQuery]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 pb-24">
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
              <span>Genealogi Intelektual, Dokumen Konstitusi & Khazanah Oposisi (1825–2002)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)] mt-1">
              Akar Sejarah, Genealogi & Oposisi
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-3xl">
              Pancasila dan UUD 1945 bukan produk instan yang lahir dalam semalam pada 1945, melainkan titik temu (*kalimatun sawa*) dari ratusan tahun perlawanan moral anti-kolonial, syariat Islam kerakyatan, tradisi musyawarah adat nagari/desa, kebangkitan pendidikan kritis, emansipasi perempuan, pergerakan pemuda kebinekaan, dialektika sidang PPKI, hingga ujian keras dari berbagai arus oposisi (NII, PKI, RMS, PRRI/Permesta, GAM, Papua, Petisi 50) yang melahirkan konsensus rekonsiliasi konstitusi modern 1999–2002.
            </p>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)]">
            <div className="text-xs text-[var(--muted)]">Total Tonggak Sejarah Terverifikasi:</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--acc-emerald)]">
              33 <span className="text-xs font-normal text-[var(--muted)]">Peristiwa Primer</span>
            </div>
            <div className="text-[11px] text-[var(--acc-sky)] font-semibold">
              ✓ 6 Babakan Zaman &bull; Termasuk 6 Arus Oposisi & Rekonsiliasi
            </div>
          </div>
        </div>

        {/* Mode Membaca Segmented Control */}
        <div className="mt-6 p-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Pilih Mode Tampilan:</span>
            <div className="flex rounded-xl p-1 bg-[var(--bg)] border border-[var(--line)]">
              <button
                onClick={() => setViewMode("summary")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "summary"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                📖 Mode Intisari Publik (Ringkas)
              </button>
              <button
                onClick={() => setViewMode("academic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "academic"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                🔬 Mode Risalah Lengkap (Akademik)
              </button>
            </div>
          </div>

          {viewMode === "summary" && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={expandAll}
                className="px-2.5 py-1 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400"
              >
                Buka Semua Telaah
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400"
              >
                Tutup Semua Telaah
              </button>
            </div>
          )}
        </div>

        {/* Catatan Hermeneutika Anti-Anakronisme */}
        <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs text-[var(--muted)] leading-relaxed space-y-1.5">
          <div className="font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
            <span>💡</span> Prinsip Metodologis Bebas Anakronisme Sejarah:
          </div>
          <div>
            Peristiwa pada era <strong>Pra-1945 (Era 0, 1, 2)</strong> ditautkan sebagai <span className="text-emerald-400 font-semibold">🌱 Embrio Nilai & Preseden Genealogi</span> (nilai moral/sosial/adat yang <em>kelak mengilhami / dikristalisasikan oleh BPUPK-PPKI</em>). Tautan langsung sebagai <span className="text-sky-400 font-semibold">⚖️ Norma Konstitusi Positif</span> baru berlaku sejak UUD 1945 resmi disahkan pada 18 Agustus 1945 (Era 3, 4, 5).
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tokoh (Diponegoro, Natsir, Kartosoewirjo, Hasan Tiro, Hatta), naskah arsip ANRI, Leiden, IISG..."
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
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Filter Arus Gerakan & Oposisi:</div>
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

      {/* Banner Khazanah Arsip ANRI & Internasional */}
      <div className="mt-8 p-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <div className="font-bold text-sm text-[var(--text)]">Jelajahi Khazanah Arsip Nasional & Repositori Internasional</div>
            <div className="text-xs text-[var(--muted)]">Telusuri 578 dokumen otentik ANRI, Nationaal Archief Nederland, IISG Amsterdam, KITLV Leiden, UN Archives, dan CMI Helsinki.</div>
          </div>
        </div>
        <Link
          href="/arsip"
          className="px-4 py-2 rounded-xl bg-sky-600 dark:bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 transition shrink-0 shadow-sm"
        >
          Buka Direktori Arsip Lengkap &rarr;
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
          filteredMilestones.map((m, index) => {
            const isPre1945 = m.connectionType === "embrio-nilai";
            const isExpanded = viewMode === "academic" || expandedCards.has(m.id);

            return (
              <div key={m.id} className="relative flex items-start gap-4 sm:gap-6 pl-1 sm:pl-2">
                {/* Year Badge */}
                <div
                  className={`flex items-center justify-center size-8 sm:size-10 rounded-full border-2 border-[var(--bg)] shrink-0 font-extrabold text-[10px] sm:text-xs z-10 shadow-md ${
                    m.isMonumental
                      ? "bg-amber-500 dark:bg-amber-500 text-slate-950 ring-4 ring-amber-400/40"
                      : "bg-emerald-600 dark:bg-emerald-600 text-white ring-2 ring-emerald-400/40"
                  }`}
                >
                  {m.year.split(" ")[0]}
                </div>

                {/* Card Content */}
                <div
                  className={`flex-1 rounded-2xl border p-5 sm:p-6 shadow-sm space-y-3.5 transition ${
                    m.isMonumental
                      ? "border-amber-500/50 bg-gradient-to-br from-amber-500/5 via-[var(--panel)] to-[var(--panel)] hover:border-amber-400 ring-1 ring-amber-500/20"
                      : "border-[var(--line)] bg-[var(--panel)] hover:border-slate-400"
                  }`}
                >
                  {/* Top Bar: Icon, Category, Monumental Badge, Index */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)]/50 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg">{m.icon}</span>
                      <span className="rounded-md bg-[var(--bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--acc-emerald)] border border-[var(--line)]">
                        {m.categoryLabel}
                      </span>
                      {m.isMonumental && (
                        <span className="rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                          ⭐ Tonggak Akbar
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
                      <span>Tonggak {String(index + 1).padStart(2, "0")}/33</span>
                      <span>&bull;</span>
                      <span className="font-bold text-[var(--text)]">{m.year}</span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[var(--text)] leading-snug">
                      {m.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-[var(--acc-sky)] mt-0.5">
                      {m.subtitle}
                    </p>
                  </div>

                  {/* TL;DR Intisari 1 Kalimat Ramah Publik */}
                  <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]/80 text-xs sm:text-sm text-[var(--text)] leading-relaxed flex items-start gap-2.5">
                    <span className="text-base shrink-0">💡</span>
                    <div>
                      <span className="font-bold text-[var(--acc-emerald)]">Intisari Peristiwa: </span>
                      <span>{m.tldr}</span>
                    </div>
                  </div>

                  {/* Quote of the Milestone (if present) */}
                  {m.quote && (
                    <div className="rounded-xl border-l-4 border-amber-500 bg-amber-500/5 p-3 sm:p-3.5 space-y-1">
                      <p className="text-xs sm:text-sm italic text-[var(--text)] leading-relaxed">
                        &ldquo;{m.quote.text}&rdquo;
                      </p>
                      <p className="text-[11px] font-semibold text-amber-500 dark:text-amber-400 text-right">
                        — {m.quote.author}
                      </p>
                    </div>
                  )}

                  {/* Progressive Disclosure Toggle Button (in summary mode) */}
                  {viewMode === "summary" && (
                    <div className="pt-1">
                      <button
                        onClick={() => toggleExpand(m.id)}
                        className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs font-bold text-[var(--acc-sky)] hover:border-sky-500/50 hover:bg-sky-500/5 transition"
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{isExpanded ? "▲ Tutup Telaah Lengkap & Sitasi" : "▼ Buka Telaah Lengkap, Manuskrip & Sitasi"}</span>
                          {!isExpanded && (
                            <span className="text-[10px] text-[var(--muted)] font-normal">
                              ({m.citations.length} Bukti Primer)
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-[var(--muted)]">
                          {isExpanded ? "Sembunyikan" : "Pelajari"}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Expandable Section: Deep-Dive Description, Quran, Figures, Connections, Citations */}
                  {isExpanded && (
                    <div className="space-y-3.5 pt-2 border-t border-[var(--line)]/40 animate-fadeIn">
                      {/* Deep Historical Description */}
                      <div>
                        <div className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                          📖 Telaah Historis & Konteks Peristiwa:
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                          {m.description}
                        </p>
                      </div>

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

                      {/* Figures & Dimensions/Connections */}
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
                            <span>{isPre1945 ? "🌱" : "⚖️"}</span>
                            <span>
                              {isPre1945
                                ? "Embrio Nilai & Preseden Genealogi:"
                                : "Norma Konstitusi Positif (UUD 1945):"}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            {m.connections.map((c, i) => (
                              <span
                                key={i}
                                className={`rounded-md px-2 py-0.5 text-[11px] border font-medium ${
                                  isPre1945
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                }`}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Primary Citations */}
                      <div className="pt-2 border-t border-[var(--line)]/50">
                        <div className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <span>🏛️</span> Bukti Primer / Repositori Arsip:
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
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mobile Floating Bottom Era Rail */}
      <div className="fixed bottom-3 inset-x-3 z-40 sm:hidden">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex items-center justify-between gap-1 overflow-x-auto">
          {ERAS.map((era) => {
            const isActive = selectedEra === era.id;
            return (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 transition flex items-center gap-1 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>{era.icon}</span>
                <span>{era.id === "all" ? "Semua" : era.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Catatan Metodologi & Kebijakan Anti-Dehistorisasi */}
      <div className="mt-14 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-8 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-[var(--text)] flex items-center gap-2">
          <span>📜</span> Kebijakan Historiografi Objektif & Penilaian Ketaatan Konstitusi
        </h3>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          Pancasila Index memegang prinsip ketat hermeneutika sejarah: menolak anakronisme dengan mengakui bahwa peristiwa sebelum 1945 adalah akar budaya dan etika pergerakan yang mematangkan lahirnya Pancasila, bukan norma hukum positif yang sudah berlaku. Platform memberlakukan sanksi tegas <strong>skor -2 pada Sila 1 (Ketuhanan) dan Sila 3 (Persatuan)</strong> bagi setiap rezim yang memonopoli tafsir Pancasila untuk membungkam kebebasan sipil atau meminggirkan peran kelompok bangsa.
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
            <span>Telusuri 578 Dokumen Primer & Naskah Internasional</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
