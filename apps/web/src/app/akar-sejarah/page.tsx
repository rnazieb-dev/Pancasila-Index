"use client";

import { useState } from "react";
import Link from "next/link";

interface Milestone {
  id: string;
  year: string;
  exactDate?: string;
  title: string;
  category: "islam" | "bpupk" | "pendidikan" | "desa" | "pemuda" | "perempuan";
  categoryLabel: string;
  actors: string[];
  summary: string;
  primaryCitation: string;
  quranHadithCitation?: {
    surah: string;
    arabic?: string;
    translation: string;
  };
  archivalQuote?: string;
  dimensions: string[];
}

const MILESTONES: Milestone[] = [
  {
    id: "sdi-1905",
    year: "1905 / 1911",
    exactDate: "16 Oktober 1905 / 1911",
    title: "Syarikat Dagang Islam (SDI): Titik Nol Kedaulatan Ekonomi & Solidaritas Tauhid",
    category: "islam",
    categoryLabel: "Arus Islam & Kerakyatan",
    actors: ["Haji Samanhudi", "RM. Tirto Adhi Soerjo"],
    summary:
      "Didirikan di Surakarta oleh H. Samanhudi dan dikonsolidasikan bersama RM. Tirto Adhi Soerjo. Menjadi perintis perlawanan terorganisasi pribumi muslim terhadap hegemoni dan monopoli kapitalisme kolonial, meletakkan fondasi etika niaga berkeadilan dan persaudaraan berbasis tauhid.",
    primaryCitation:
      "Arsip Nasional RI (ANRI); Sartono Kartodirdjo, 'Pengantar Sejarah Indonesia Baru: Sejarah Pergerakan Nasional', 1993; Takashi Shiraishi, 'An Age in Motion: Popular Radicalism in Java, 1912-1926'.",
    dimensions: ["Sila 5 (Keadilan Sosial)", "Pasal 33 (Perekonomian Nasional)"],
  },
  {
    id: "boedi-oetomo-1908",
    year: "1908",
    exactDate: "20 Mei 1908",
    title: "Boedi Oetomo: Fajar Kesadaran Organisasi Modern & Persatuan Kemajuan",
    category: "pendidikan",
    categoryLabel: "Pendidikan & Kebudayaan",
    actors: ["Dr. Soetomo", "dr. Wahidin Soedirohoesodo", "Goenawan Mangoenkoesoemo"],
    summary:
      "Transformasi dari perlawanan kedaerahan bersenjata menjadi pergerakan modern berbasis pendidikan, persatuan kebudayaan, dan penguatan intelektual anak bangsa di gedung STOVIA Batavia.",
    primaryCitation:
      "Nagazumi Akira, 'The Dawn of Indonesian Nationalism: The Early Years of the Budi Utomo, 1908-1918', ILCAA, 1972.",
    dimensions: ["Sila 3 (Persatuan Indonesia)", "Pasal 31 (Pendidikan)"],
  },
  {
    id: "si-muhammadiyah-1912",
    year: "1912",
    exactDate: "1912",
    title: "Syarikat Islam & Muhammadiyah: Fusi Demokrasi Kerakyatan & Pelayanan Publik Modern",
    category: "islam",
    categoryLabel: "Arus Islam & Kerakyatan",
    actors: ["H.O.S. Tjokroaminoto", "K.H. Ahmad Dahlan"],
    summary:
      "Di bawah Tjokroaminoto, SI menjadi gerakan politik massa pertama yang menuntut 'Zelfbestuur' (pemerintahan mandiri/demokrasi). Pada saat bersamaan di Yogyakarta, K.H. Ahmad Dahlan mendirikan Muhammadiyah untuk merintis pembaruan pendidikan modern, rumah sakit inklusif (PKO), dan advokasi dhuafa-mustadh'afin.",
    primaryCitation:
      "Deliar Noer, 'Gerakan Modern Islam di Indonesia 1900-1942', LP3ES, 1980; H.O.S. Tjokroaminoto, 'Islam dan Sosialisme', 1924.",
    dimensions: ["Sila 4 (Kerakyatan & Musyawarah)", "Alinea IV (Kesejahteraan & Kecerdasan Umum)"],
  },
  {
    id: "tamansiswa-1922",
    year: "1922",
    exactDate: "3 Juli 1922",
    title: "Perguruan Tamansiswa: Pendidikan Kemerdekaan Batin & 'Tut Wuri Handayani'",
    category: "pendidikan",
    categoryLabel: "Pendidikan & Kebudayaan",
    actors: ["Ki Hadjar Dewantara (Soewardi Soerjaningrat)", "Nyi Hajar Dewantara"],
    summary:
      "Ki Hadjar Dewantara mendirikan Tamansiswa di Yogyakarta dengan menolak kurikulum penundukan kolonial. Merumuskan trilogi kepemimpinan pendidikan nasional (Ing Ngarsa Sung Tuladha, Ing Madya Mangun Karsa, Tut Wuri Handayani) demi membentuk manusia merdeka lahir-batin.",
    primaryCitation:
      "Ki Hadjar Dewantara, 'Karya Ki Hadjar Dewantara: Bagian I Pendidikan', Majelis Luhur Tamansiswa, 1962.",
    dimensions: ["Sila 2 (Kemanusiaan yang Adil dan Beradab)", "Pasal 31 UUD 1945"],
  },
  {
    id: "perhimpunan-indonesia-1925",
    year: "1925",
    exactDate: "1925",
    title: "Perhimpunan Indonesia & Sosio-Demokrasi Desa: Visi Kedaulatan Republik",
    category: "desa",
    categoryLabel: "Sosio-Demokrasi Desa",
    actors: ["Mohammad Hatta", "Tan Malaka", "Achmad Soebardjo"],
    summary:
      "Manifesto Perhimpunan Indonesia di Leiden menegaskan persatuan kebangsaan, non-kooperasi, dan kedaulatan rakyat. Bung Hatta menggali bahwa demokrasi Indonesia bersumber dari tradisi asli desa nusantara: musyawarah-mufakat, tolong-menolong/gotong royong, dan hak rakyat membantah kezaliman penguasa.",
    primaryCitation:
      "Mohammad Hatta, 'Demokrasi Kita', 1960; Tan Malaka, 'Naar de Republiek Indonesia' (Menuju Republik Indonesia), Kanton, 1925.",
    dimensions: ["Sila 4 (Musyawarah Mufakat)", "Pasal 33 (Kekeluargaan & Koperasi)"],
  },
  {
    id: "nu-1926",
    year: "1926",
    exactDate: "31 Januari 1926",
    title: "Nahdlatul Ulama: Doktrin 'Hubbul Wathan Minal Iman' & Ukhuwah Wathaniyah",
    category: "islam",
    categoryLabel: "Arus Islam & Kerakyatan",
    actors: ["K.H. Hasyim Asy'ari", "K.H. Abdul Wahab Chasbullah", "K.H. Bisri Syansuri"],
    summary:
      "Para ulama pesantren mendirikan Nahdlatul Ulama di Surabaya. Merumuskan bahwa mencintai tanah air adalah keniscayaan iman ('Hubbul Wathan Minal Iman') serta menegakkan prinsip moderasi (Tawassuth), keseimbangan (Tawazun), toleransi (Tasamuh), dan persaudaraan kebangsaan.",
    primaryCitation:
      "K.H. Hasyim Asy'ari, 'Muqaddimah Qanun Asasi Nahdlatul Ulama', Surabaya, 1926; Choirul Anam, 'Pertumbuhan dan Perkembangan NU', 1985.",
    dimensions: ["Sila 1 (Ketuhanan)", "Sila 3 (Persatuan Indonesia)"],
  },
  {
    id: "sumpah-pemuda-1928",
    year: "1928",
    exactDate: "28 Oktober 1928",
    title: "Sumpah Pemuda: Peleburan Sukuisme & Konsensus Kebhinekaan Nusantara",
    category: "pemuda",
    categoryLabel: "Pemuda & Kebhinekaan",
    actors: ["Sugondo Djojopuspito", "Mohammad Yamin", "Amir Sjarifuddin", "Johannes Leimena", "Kasman Singodimedjo"],
    summary:
      "Kongres Pemuda II di Jakarta menyatukan Jong Java, Jong Sumatranen Bond, Jong Ambon, Jong Batak, Jong Celebes, Jong Islamieten Bond, dan Pemuda Kaum Betawi. Mengikrarkan satu tumpah darah, satu bangsa, dan satu bahasa persatuan Indonesia.",
    primaryCitation:
      "Risalah Kongres Pemuda Indonesia II, 27–28 Oktober 1928, Arsip Nasional RI.",
    dimensions: ["Sila 3 (Persatuan Indonesia)", "Pasal 36 (Bahasa Negara)"],
  },
  {
    id: "kongres-perempuan-1928",
    year: "1928",
    exactDate: "22–25 Desember 1928",
    title: "Kongres Perempuan Indonesia I: Tonggak Emansipasi & Keadilan Sosial",
    category: "perempuan",
    categoryLabel: "Gerakan Perempuan",
    actors: ["R.A. Soekonto", "Nyi Hajar Dewantara", "Sujatin Kartowijono", "Siti Moendjijah"],
    summary:
      "Bertempat di Ndalem Joyodipuran Yogyakarta, 30 organisasi perempuan nusantara berhimpun menuntut kesetaraan hak pendidikan bagi perempuan, penghapusan pernikahan paksa/di bawah umur, perbaikan status hukum perkawinan, dan perlindungan buruh perempuan.",
    primaryCitation:
      "Laporan Resmi Kongres Perempoean Indonesia I, Mataram/Yogyakarta, 1928; Susan Blackburn, 'Kongres Perempuan Pertama: Tinjauan Ulang', KITLV/Obor, 2007.",
    dimensions: ["Sila 2 (Kemanusiaan Beradab)", "Sila 5 (Keadilan Sosial)", "Pasal 27 ayat (1)"],
  },
  {
    id: "bpupk-draft-islam-1945",
    year: "1945 (Mei–Juli)",
    exactDate: "31 Mei – 16 Juli 1945",
    title: "Sidang BPUPK: Draf Rancang UUD Berdasarkan Al-Qur'an & Sunnah",
    category: "bpupk",
    categoryLabel: "Draf Konstitusi BPUPK",
    actors: ["Ki Bagus Hadikusumo", "K.H. Abdul Wahid Hasyim", "K.H. Abdul Kahar Muzakkir", "K.H. Ahmad Sanusi", "Abikoesno Tjokrosoejoso"],
    summary:
      "Dalam Sidang Pleno BPUPK, para tokoh Islam mengajukan naskah rancangan dasar negara dan pasal UUD dengan landasan syariat Islam dan dalil Al-Qur'an. Panitia Perancang UUD BPUPK menyepakati draf Pasal 6 ayat (1) bahwa Presiden Indonesia adalah orang beragama Islam, serta Pasal 29 ayat (1) dengan klausul syariat.",
    primaryCitation:
      "Saafroedin Bahar dkk., 'Risalah Sidang BPUPKI-PPKI 1945', Sekretariat Negara RI, 1995, hlm. 215–260; Prof. RM. A.B. Kusuma, 'Lahirnya Undang-Undang Dasar 1945', Badan Penerbit FHUI, 2004.",
    quranHadithCitation: {
      surah: "QS. Asy-Syura: 38 & QS. An-Nisa: 58",
      translation:
        "Dan (bagi) orang-orang yang menerima (mematuhi) seruan Tuhannya dan mendirikan shalat, sedang urusan mereka (diputuskan) dengan musyawarah antara mereka... Sesungguhnya Allah menyuruh kamu menyampaikan amanat kepada yang berhak menerimanya, dan apabila menetapkan hukum di antara manusia hendaklah kamu menetapkannya dengan adil.",
    },
    archivalQuote:
      "Draf Pasal 6 ayat (1) UUD hasil kesepakatan Panitia Perancang UUD BPUPK 13 Juli 1945: 'Presiden ialah orang Indonesia asli yang beragama Islam.'",
    dimensions: ["Sila 1 (Ketuhanan)", "Sila 4 (Musyawarah/Syura)", "Draf Pasal 6 ayat (1)", "Draf Pasal 29"],
  },
  {
    id: "piagam-jakarta-1945",
    year: "1945 (22 Juni)",
    exactDate: "22 Juni 1945",
    title: "Piagam Jakarta (Jakarta Charter): Konsensus Agung Panitia Sembilan",
    category: "bpupk",
    categoryLabel: "Draf Konstitusi BPUPK",
    actors: ["Ir. Soekarno", "Mohammad Hatta", "A.A. Maramis", "Abikoesno Tjokrosoejoso", "Abdoel Kahar Muzakkir", "H. Agus Salim", "Mr. Achmad Soebardjo", "K.H. Wahid Hasyim", "Mr. Mohammad Yamin"],
    summary:
      "Sintesis kompromi luhur ('gentlemen's agreement') antara kelompok Islam dan kelompok Kebangsaan. Melahirkan naskah Mukaddimah yang memuat 5 dasar falsafah negara dengan sila pertama: 'Ketuhanan, dengan kewajiban menjalankan syari'at Islam bagi pemeluk-pemeluknya'.",
    primaryCitation:
      "Naskah Asli Piagam Jakarta, Pegangsaan Timur 56 Jakarta, 22 Juni 1945; Muhammad Yamin, 'Naskah Persiapan Undang-Undang Dasar 1945', Jilid I, 1959.",
    dimensions: ["Pembukaan UUD 1945 Alinea I–IV", "Sila 1 s.d. Sila 5"],
  },
  {
    id: "ppki-konsensus-18-agustus-1945",
    year: "1945 (18 Agustus)",
    exactDate: "18 Agustus 1945",
    title: "Pengesahan UUD 1945: Kenegarawanan PPKI & 'Ketuhanan Yang Maha Esa' (Tauhid)",
    category: "bpupk",
    categoryLabel: "Draf Konstitusi BPUPK",
    actors: ["Ki Bagus Hadikusumo", "Mr. Kasman Singodimedjo", "Teuku Mohammad Hasan", "K.H. Wahid Hasyim", "Mohammad Hatta"],
    summary:
      "Dalam forum PPKI, demi menjaga keutuhan integrasi wilayah Indonesia Timur ke dalam Republik, para tokoh Islam berjiwa besar menyetujui penggantian 7 kata Piagam Jakarta menjadi 'Ketuhanan Yang Maha Esa'. Kasman dan Teuku Hasan menegaskan frasa ini mencerminkan konsep Tauhid murni (QS. Al-Ikhlas: 1) yang menjiwai seluruh pasal UUD.",
    primaryCitation:
      "Risalah Sidang PPKI 18 Agustus 1945, Sekretariat Negara RI; Kasman Singodimedjo, 'Hidup Itu Berjuang: Kasman Singodimedjo 75 Tahun', Bulan Bintang, 1982.",
    dimensions: ["Sila 1 (Ketuhanan Yang Maha Esa)", "Pembukaan UUD 1945", "Pasal 29 UUD 1945"],
  },
  {
    id: "konstituante-dekrit-1959",
    year: "1957 – 1959",
    exactDate: "12 November 1957 & 5 Juli 1959",
    title: "Konstituante & Dekrit Presiden: Preseden Piagam Madinah & Menjiwai UUD 1945",
    category: "islam",
    categoryLabel: "Arus Islam & Kerakyatan",
    actors: ["Mohammad Natsir", "Ir. Soekarno", "K.H. Masjkur", "Sukiman Wirjosandjojo"],
    summary:
      "Dalam Sidang Konstituante 1957, Mohammad Natsir memaparkan preseden Piagam Madinah (622 M) sebagai konstitusi tertulis pertama dunia yang menjamin hak-hak kebebasan beragama kelompok minoritas secara pluralis. Pada 5 Juli 1959, Presiden Soekarno mengeluarkan Dekrit yang menegaskan secara yuridis bahwa Piagam Jakarta 22 Juni 1945 menjiwai dan merupakan satu kesatuan dengan UUD 1945.",
    primaryCitation:
      "Mohammad Natsir, 'Islam Sebagai Dasar Negara', Naskah Sidang Pleno Konstituante, Bandung, 1957; Lembaran Negara RI No. 75 Tahun 1959 (Dekrit Presiden 5 Juli 1959).",
    archivalQuote:
      "Konsiderans Menimbang ke-4 Dekrit Presiden 5 Juli 1959: 'Bahwa kami berkeyakinan bahwa Piagam Djakarta tertanggal 22 Djuni 1945 mendjiwai Undang-Undang Dasar 1945 dan adalah merupakan suatu rangkaian kesatuan dengan Konstitusi tersebut.'",
    dimensions: ["Pasal 29 UUD 1945", "Sila 1", "Sila 2", "Sila 3"],
  },
];

export default function AkarSejarahPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "Semua Arus (12 Tonggak)", icon: "🌐" },
    { id: "islam", label: "Arus Islam & Kerakyatan", icon: "🕌" },
    { id: "bpupk", label: "Draf UUD & Risalah BPUPK", icon: "📜" },
    { id: "pendidikan", label: "Pendidikan & Budaya", icon: "🎓" },
    { id: "desa", label: "Sosio-Demokrasi Desa", icon: "🌾" },
    { id: "pemuda", label: "Pemuda & Kebhinekaan", icon: "👥" },
    { id: "perempuan", label: "Gerakan Perempuan", icon: "👩" },
  ] as const;

  const filteredMilestones =
    activeCategory === "all"
      ? MILESTONES
      : MILESTONES.filter((m) => m.category === activeCategory);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)] transition mb-6"
      >
        &larr; Kembali ke Beranda
      </Link>

      {/* Header */}
      <div className="border-b border-[var(--line)] pb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl sm:text-4xl">🏛️</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
            Akar Sejarah & Genealogi Konstitusi
          </h1>
        </div>
        <p className="mt-4 text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-4xl">
          Pancasila Index menolak narasi de-historisasi. Halaman ini mendokumentasikan memori kolektif bahwa negara ini tidak lahir dari ruang hampa pada 17 Agustus 1945, melainkan dari dialektika luhur <strong>6 arus besar pergerakan bangsa</strong>, disertai fakta arsip primer naskah rancangan UUD yang diajukan para tokoh bangsa berlandaskan wahyu Ilahi dan keadilan substantif.
        </p>

        {/* Filter Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count =
              cat.id === "all"
                ? MILESTONES.length
                : MILESTONES.filter((m) => m.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-[var(--acc-emerald)] text-slate-950 shadow-sm"
                    : "bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="opacity-70 text-[11px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      
      {/* Banner Khazanah Arsip ANRI */}
      <div className="mt-8 p-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <div className="font-bold text-sm text-[var(--text)]">Jelajahi Khazanah Arsip Nasional Lengkap</div>
            <div className="text-xs text-[var(--muted)]">Telusuri register naskah otentik ANRI, kawat telegram PDRI 1948, dan Risalah BPUPK di direktori dokumen primer.</div>
          </div>
        </div>
        <Link
          href="/arsip"
          className="px-4 py-2 rounded-xl bg-[var(--acc-sky)] text-slate-950 font-bold text-xs hover:bg-sky-400 transition shrink-0"
        >
          Buka Direktori Arsip ANRI &rarr;
        </Link>
      </div>

      {/* Timeline Stream */}
      <div className="mt-10 space-y-8 relative before:absolute before:inset-0 before:left-4 sm:before:left-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[var(--acc-emerald)] before:via-[var(--line)] before:to-transparent">
        {filteredMilestones.map((m) => (
          <div key={m.id} className="relative flex items-start gap-4 sm:gap-6 pl-1 sm:pl-2">
            {/* Year Badge */}
            <div className="flex items-center justify-center size-8 sm:size-10 rounded-full border-2 border-[var(--bg)] bg-[var(--acc-emerald)] text-slate-950 shrink-0 font-extrabold text-[10px] sm:text-xs z-10 shadow-md">
              {m.year.split(" ")[0]}
            </div>

            {/* Card Content */}
            <div className="flex-1 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 shadow-sm space-y-3.5 hover:border-slate-400 transition">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)]/60 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--acc-emerald)]">
                    {m.categoryLabel}
                  </span>
                  <div className="text-xs text-[var(--muted)]">{m.exactDate ?? m.year}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {m.dimensions.map((dim) => (
                    <span
                      key={dim}
                      className="rounded-md bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text)]"
                    >
                      ⚖️ {dim}
                    </span>
                  ))}
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-[var(--text)] leading-snug">
                {m.title}
              </h2>

              <div className="text-xs text-[var(--acc-amber)] font-medium">
                Tokoh Kunci: <span className="text-[var(--text)]">{m.actors.join(" · ")}</span>
              </div>

              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                {m.summary}
              </p>

              {/* Box Quran / Hadith Citation if present */}
              {m.quranHadithCitation && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 space-y-1.5 text-xs">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>📖</span> Landasan Syura & Keadilan: {m.quranHadithCitation.surah}
                  </div>
                  <p className="italic text-[var(--text)] leading-relaxed text-[11px] sm:text-xs">
                    &quot;{m.quranHadithCitation.translation}&quot;
                  </p>
                </div>
              )}

              {/* Archival Quote if present */}
              {m.archivalQuote && (
                <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-3 space-y-1 text-xs">
                  <div className="font-bold text-sky-400 flex items-center gap-1.5">
                    <span>📜</span> Kutipan Arsip Naskah Resmi:
                  </div>
                  <p className="font-mono text-[11px] text-[var(--text)] leading-relaxed">
                    {m.archivalQuote}
                  </p>
                </div>
              )}

              {/* Primary Source Citation Footer */}
              <div className="pt-2 border-t border-[var(--line)]/50 text-[11px] text-[var(--muted)] leading-normal">
                <span className="font-semibold text-[var(--text)]">Rujukan Primer / Arsip:</span>{" "}
                {m.primaryCitation}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sanksi De-Historisasi Standar Pancasila Index */}
      <div className="mt-14 p-6 sm:p-7 rounded-2xl border border-[var(--acc-red)]/50 bg-[var(--acc-red)]/5 text-[var(--text)] space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">⚖️</span>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--acc-red)]">
            Doktrin & Sanksi De-Historisasi Pancasila Index
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          Dalam kerangka audit Pancasila Index (1945–kini), memori kolektif kenegaraan ini dijaga secara ketat melalui <strong>Rubrik Sila ke-1 (Ketuhanan Yang Maha Esa)</strong> dan <strong>Sila ke-3 (Persatuan Indonesia)</strong>.
        </p>
        <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--text)] leading-relaxed font-medium">
          ⚠️ <strong>Aturan Penalti Keras:</strong> Setiap organ kekuasaan atau rezim pemerintahan yang secara sengaja menghapus, mengaburkan, atau mendistorsi akar sejarah perjuangan pergerakan Islam dan kaum pergerakan kebangsaan dalam kurikulum, buku resmi, maupun kebijakan negara, langsung diganjar <strong>penalti maksimal (-2)</strong> sebagai bentuk pengkhianatan terhadap kontinuitas konstitusional bangsa.
        </div>
      </div>
    </div>
  );
}
