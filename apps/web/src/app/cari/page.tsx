"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { dataset } from "@pancasila-index/data";
import { useLocale } from "@/components/locale-provider";
import { pickI18n } from "@/lib/i18n";

const AKAR_SEJARAH_DATA = [
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
    "title": "Sidang PPKI I: Konsensus Ketuhanan Yang Maha Esa (Tauhid) & Hak Warga (Pasal 28 Hatta)",
    "summary": "Kenegarawanan tokoh Islam PPKI menetapkan Sila 1 Tauhid dan jaminan hak asasi berserikat/berpendapat.",
    "link": "/akar-sejarah#ppki-konsensus-1945",
    "category": "Pengesahan UUD 1945 & Hak Asasi"
  },
  {
    "year": "1945",
    "title": "Sidang PPKI II & III: Penataan 8 Provinsi, 12 Kementerian, & Pembentukan KNIP",
    "summary": "Otto Iskandardinata, Latuharhary, dan Kasman meletakkan struktur kelembagaan negara dan pembagian wilayah.",
    "link": "/akar-sejarah#ppki-sidang-2-3-1945",
    "category": "Struktur Organ Konstitusional Awal"
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
    "year": "1948",
    "title": "Peristiwa Madiun 1948: Resolusi 'Djalan Baru' Musso & Ujian Ideologi Negara",
    "summary": "Konfrontasi bersenjata FDR/PKI menolak diplomasi Renville dan menguji ketahanan ideologi Pancasila.",
    "link": "/akar-sejarah#pki-madiun-1948",
    "category": "Oposisi Kiri & Ujian Ideologi"
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
    "title": "Proklamasi Negara Islam Indonesia (NII) & Qanun Asasi di Cisayong",
    "summary": "SM Kartosoewirjo memproklamasikan NII dan Qanun Asasi 31 pasal menolak hasil Perjanjian Renville.",
    "link": "/akar-sejarah#nii-proklamasi-1949",
    "category": "Oposisi Ideologis Teokratis"
  },
  {
    "year": "1949",
    "title": "Konferensi Antar-Indonesia & KMB Den Haag: Pengakuan Kedaulatan Penuh Tanpa Syarat",
    "summary": "Bung Hatta & BFO bersatu memaksa Kerajaan Belanda mengakui kedaulatan penuh Republik Indonesia.",
    "link": "/akar-sejarah#kmb-1949",
    "category": "Diplomasi & Pengakuan Kedaulatan"
  },
  {
    "year": "1950",
    "title": "Proklamasi Republik Maluku Selatan (RMS) di Ambon: Penolakan Unifikasi NKRI",
    "summary": "Soumokil & Manuhutu menolak pembubaran NIT dan memproklamasikan RMS di Ambon.",
    "link": "/akar-sejarah#rms-1950",
    "category": "Oposisi Separatisme Regional"
  },
  {
    "year": "1955",
    "title": "Dasa Sila Bandung (KAA 1955): Internasionalisme Anti-Kolonial & Keadilan Global",
    "summary": "Indonesia memimpin Konferensi Asia-Afrika melahirkan Dasa Sila Bandung dan Gerakan Non-Blok.",
    "link": "/akar-sejarah#kaa-1955",
    "category": "Ketertiban Dunia & Kemanusiaan"
  },
  {
    "year": "1957–1958",
    "title": "Piagam Permesta Makassar & Proklamasi PRRI Padang: Tuntutan Otonomi Daerah Luas",
    "summary": "Perlawanan daerah Letkol Ventje Sumual & Ahmad Husein menuntut desentralisasi, diakhiri Keppres Amnesti 1961.",
    "link": "/akar-sejarah#prri-permesta-1957",
    "category": "Oposisi Otonomi Daerah & Rekonsiliasi"
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
    "year": "1962–1969",
    "title": "New York Agreement 1962 & PEPERA 1969: Integrasi Final Papua Barat ke Pangkuan NKRI",
    "summary": "Perjanjian bilateral PBB dan Resolusi Sidang Umum PBB No. 2504 mengesahkan keutuhan wilayah Irian Barat.",
    "link": "/akar-sejarah#papua-new-york-pepera-1962-1969",
    "category": "Integritas Wilayah & Diplomasi PBB"
  },
  {
    "year": "1976–2005",
    "title": "Deklarasi GAM 1976, MoU Helsinki 2005, & UU Pemerintahan Aceh (UUPA)",
    "summary": "Transformasi konflik bersenjata Hasan di Tiro menjadi konsensus damai MoU Helsinki dan otonomi asimetris UUPA.",
    "link": "/akar-sejarah#gam-helsinki-uupa-1976-2005",
    "category": "Oposisi & Rekonsiliasi Damai"
  },
  {
    "year": "1980",
    "title": "Petisi 50: Oposisi Moral Konstitusional Menolak Monopoli Tafsir Pancasila",
    "summary": "Ali Sadikin, Natsir, Hoegeng, & Kasman mengkritik pidato Soeharto yang menggunakan Pancasila untuk memukul lawan politik.",
    "link": "/akar-sejarah#petisi-50-1980",
    "category": "Oposisi Moral & Demokrasi Konstitusional"
  },
  {
    "year": "1999–2002",
    "title": "Amandemen Komprehensif UUD 1945 (Perubahan I–IV): Checks & Balances dan Hak Asasi",
    "summary": "Kelahiran Mahkamah Konstitusi, Komisi Yudisial, DPD RI, dan pengesahan Bab XA HAM (Pasal 28A–28J).",
    "link": "/akar-sejarah#amandemen-uud-1999-2002",
    "category": "Reformasi Konstitusi Modern"
  }
];

export default function CariPage() {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState<string>("all");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const termsById = useMemo(() => new Map(dataset.terms.map((t) => [t.id, t])), []);
  const institutionsById = useMemo(() => new Map(dataset.institutions.map((i) => [i.id, i])), []);

  // Hasil pencarian terpadu
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1. Events
    const matchingEvents = dataset.events.filter((ev) => {
      const term = termsById.get(ev.term_id);
      if (selectedEra !== "all" && term?.era !== selectedEra) return false;
      if (selectedInstitution !== "all" && term?.institution_id !== selectedInstitution) return false;

      if (!q) return true;
      return (
        ev.title_id.toLowerCase().includes(q) ||
        ev.summary_id.toLowerCase().includes(q) ||
        ev.date.includes(q) ||
        ev.category.toLowerCase().includes(q)
      );
    });

    // 2. Sources
    const matchingSources = dataset.sources.filter((src) => {
      if (!q) return true;
      return (
        src.title_id.toLowerCase().includes(q) ||
        (src.citation_id && src.citation_id.toLowerCase().includes(q)) ||
        src.type.toLowerCase().includes(q) ||
        (src.year && src.year.toString().includes(q))
      );
    });

    // 3. Terms / Masa Jabatan
    const matchingTerms = dataset.terms.filter((term) => {
      if (selectedEra !== "all" && term.era !== selectedEra) return false;
      if (selectedInstitution !== "all" && term.institution_id !== selectedInstitution) return false;

      if (!q) return true;
      const actorsMatch = term.actors.some(
        (a) => a.name.toLowerCase().includes(q) || a.role_id.toLowerCase().includes(q)
      );
      return (
        term.label_id.toLowerCase().includes(q) ||
        term.era.toLowerCase().includes(q) ||
        actorsMatch
      );
    });

    
    // 4. Tokoh Bangsa / Aktor
    const matchingActors = (dataset.actors || []).filter((actor) => {
      if (!q) return true;
      const aliasesMatch = (actor.aliases || []).some(a => a.toLowerCase().includes(q));
      const rolesMatch = (actor.roles || []).some(r => r.title_id?.toLowerCase().includes(q));
      return (
        actor.name.toLowerCase().includes(q) ||
        (actor.bio_id && actor.bio_id.toLowerCase().includes(q)) ||
        aliasesMatch ||
        rolesMatch
      );
    });

    // 5. Akar Sejarah
    const matchingHistory = AKAR_SEJARAH_DATA.filter((h) => {
      if (!q) return true;
      return (
        h.title.toLowerCase().includes(q) ||
        h.summary.toLowerCase().includes(q) ||
        h.year.includes(q) ||
        h.category.toLowerCase().includes(q)
      );
    });

    // 6. Dimensi Rubrik
    const matchingDimensions = dataset.rubric.dimensions.filter((dim) => {
      if (!q) return true;
      return (
        dim.name_id.toLowerCase().includes(q) ||
        dim.question_id.toLowerCase().includes(q) ||
        dim.id.toLowerCase().includes(q)
      );
    });

    // 7. Pasal UUD
    const matchingPasal: Array<{ nomor: string; babNomor: string; ringkas_id: string }> = [];
    for (const bab of dataset.uud.babs) {
      for (const p of bab.pasal) {
        if (!q || p.ringkas_id.toLowerCase().includes(q) || p.nomor.toLowerCase().includes(q) || bab.nama_id.toLowerCase().includes(q)) {
          matchingPasal.push({ nomor: p.nomor, babNomor: bab.nomor, ringkas_id: p.ringkas_id });
        }
      }
    }

    return {
      events: matchingEvents,
      sources: matchingSources,
      terms: matchingTerms,
      actors: matchingActors,
      history: matchingHistory,
      dimensions: matchingDimensions,
      pasal: matchingPasal,
    };
  }, [query, selectedEra, selectedInstitution, termsById]);

  const totalMatches =
    (categoryFilter === "all" || categoryFilter === "event" ? results.events.length : 0) +
    (categoryFilter === "all" || categoryFilter === "source" ? results.sources.length : 0) +
    (categoryFilter === "all" || categoryFilter === "term" ? results.terms.length : 0) +
    (categoryFilter === "all" || categoryFilter === "pasal" ? results.pasal.length : 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">{t("cariPageTitle")}</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          Telusuri ratusan peristiwa berbukti, instrumen hukum primer, masa jabatan, dan pasal UUD 1945.
        </p>
      </div>

      {/* Input Pencarian */}
      <div className="mt-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("cariPlaceholder")}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3.5 pl-11 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition"
          />
          <span className="absolute left-4 top-3.5 text-[var(--muted)] text-base">⌕</span>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-3.5 text-xs text-[var(--muted)] hover:text-[var(--text)]"
            >
              ✕ Bersihkan
            </button>
          )}
        </div>
      </div>

      {/* Filter Kontrol */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
        {/* Filter Kategori */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: "all", label: `Semua (${totalMatches})` },
            { id: "event", label: `Peristiwa (${results.events.length})` },
            { id: "source", label: `Sumber Primer (${results.sources.length})` },
            { id: "term", label: `Masa Jabatan (${results.terms.length})` },
            { id: "pasal", label: `Pasal UUD (${results.pasal.length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-lg px-3 py-1.5 transition ${
                categoryFilter === cat.id
                  ? "bg-red-600 text-white font-semibold"
                  : "bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter Era */}
        <select
          value={selectedEra}
          onChange={(e) => setSelectedEra(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--muted)] focus:text-[var(--text)] focus:outline-none"
        >
          <option value="all">{t("cariFilterEra")}</option>
          <option value="revolusi">{t("cariEraRevolusi")}</option>
          <option value="demokrasi-liberal">{t("cariEraDemokrasiLiberal")}</option>
          <option value="demokrasi-terpimpin">{t("cariEraDemokrasiTerpimpin")}</option>
          <option value="orde-baru">{t("cariEraOrdeBaru")}</option>
          <option value="reformasi">{t("cariEraReformasi")}</option>
        </select>

        {/* Filter Lembaga */}
        <select
          value={selectedInstitution}
          onChange={(e) => setSelectedInstitution(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--muted)] focus:text-[var(--text)] focus:outline-none"
        >
          <option value="all">{t("cariFilterLembaga")}</option>
          {dataset.institutions.map((i) => (
            <option key={i.id} value={i.id}>
              {i.short_id}
            </option>
          ))}
        </select>
      </div>

      {/* Hasil Pencarian */}
      <div className="mt-8 space-y-10">
        {/* 1. Peristiwa */}
        {(categoryFilter === "all" || categoryFilter === "event") && results.events.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[var(--acc-red)] uppercase tracking-wide">
              Peristiwa Berbukti ({results.events.length})
            </h2>
            <div className="mt-3 space-y-3">
              {results.events.slice(0, 30).map((ev) => {
                const term = termsById.get(ev.term_id);
                const inst = term ? institutionsById.get(term.institution_id) : undefined;
                return (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 space-y-2 hover:border-slate-500 transition"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs font-mono text-[var(--muted)]">{ev.date}</span>
                      <span className="text-[11px] uppercase tracking-wide font-semibold text-[var(--acc-red)]">
                        {inst?.short_id ?? ""}: {term?.label_id ?? ev.term_id}
                      </span>
                    </div>
                    <div className="font-semibold text-[var(--text)]">{ev.title_id}</div>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{ev.summary_id}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ev.source_ids.map((sid) => {
                        const src = dataset.sources.find((s) => s.id === sid);
                        const href = src?.detail_url ?? src?.resolved_url ?? src?.url;
                        return href ? (
                          <a
                            key={sid}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--acc-sky)] hover:text-[var(--acc-sky-strong)]"
                          >
                            📄 {src?.title_id ?? sid} ↗
                          </a>
                        ) : (
                          <span
                            key={sid}
                            className="rounded bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--muted)]"
                          >
                            📄 {src?.title_id ?? sid}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {results.events.length > 30 && (
                <p className="text-center text-xs text-[var(--muted)]">
                  Menampilkan 30 dari {results.events.length} peristiwa. Persempit kata kunci untuk hasil lebih spesifik.
                </p>
              )}
            </div>
          </section>
        )}

        {/* 2. Sumber Primer */}
        {(categoryFilter === "all" || categoryFilter === "source") && results.sources.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[var(--acc-sky)] uppercase tracking-wide">
              Sumber Primer & Dokumen Hukum ({results.sources.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {results.sources.slice(0, 30).map((src) => {
                const href = src.detail_url ?? src.resolved_url ?? src.url;
                return (
                  <div
                    key={src.id}
                    className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)]">
                          {src.type} {src.year ? `· ${src.year}` : ""}
                        </span>
                        {src.citation_id && (
                          <span className="text-[10px] text-[var(--muted)] truncate max-w-[140px]">
                            {src.citation_id}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-sm text-[var(--text)] mt-1">{src.title_id}</div>
                    </div>
                    {href && (
                      <div className="pt-2">
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--acc-sky)] hover:text-[var(--acc-sky-strong)] underline decoration-dotted"
                        >
                          Buka rujukan dokumen ↗
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. Masa Jabatan */}
        {(categoryFilter === "all" || categoryFilter === "term") && results.terms.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[var(--acc-amber)] uppercase tracking-wide">
              Masa Jabatan & Tokoh ({results.terms.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {results.terms.map((term) => {
                const inst = institutionsById.get(term.institution_id);
                return (
                  <Link
                    key={term.id}
                    href={`/lembaga/${inst?.slug ?? ""}/${term.id}`}
                    className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-slate-500 transition block"
                  >
                    <div className="text-xs text-[var(--acc-red)] font-semibold uppercase">{inst?.name_id}</div>
                    <div className="font-semibold text-base text-[var(--text)] mt-1">{term.label_id}</div>
                    <div className="text-xs text-[var(--muted)] mt-1">
                      {term.start_date} s.d. {term.end_date ?? "sekarang"} · era {term.era}
                    </div>
                    {term.actors.length > 0 && (
                      <div className="text-xs text-[var(--muted)] mt-2">
                        Tokoh: {term.actors.map((a) => `${a.name} (${a.role_id})`).join(" · ")}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        
        {/* Tokoh Bangsa */}
        {(categoryFilter === "all" || categoryFilter === "actor") && results.actors.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-amber-500 uppercase tracking-wide">
              Tokoh Bangsa & Aktor ({results.actors.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {results.actors.slice(0, 30).map((actor) => (
                <Link
                  key={actor.id}
                  href={`/aktor/${actor.id}`}
                  className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-slate-500 transition block space-y-1"
                >
                  <div className="font-bold text-sm text-[var(--text)]">{actor.name}</div>
                  {actor.roles && actor.roles.length > 0 && (
                    <div className="text-xs text-[var(--acc-amber)]">
                      {actor.roles.map(r => r.title_id).filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {actor.bio_id && (
                    <p className="text-xs text-[var(--muted)] line-clamp-2 mt-1 leading-relaxed">
                      {actor.bio_id}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Akar Sejarah */}
        {(categoryFilter === "all" || categoryFilter === "history") && results.history.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-emerald-500 uppercase tracking-wide">
              Akar Sejarah & Genealogi Konstitusi ({results.history.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {results.history.map((h) => (
                <Link
                  key={h.year}
                  href={h.link}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 hover:border-emerald-400 transition block space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-400">{h.year} · {h.category}</span>
                    <span className="text-[10px] text-emerald-400 underline">{t("cariSeeTimeline")} &rarr;</span>
                  </div>
                  <div className="font-bold text-sm text-[var(--text)]">{h.title}</div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{h.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Dimensi Rubrik */}
        {(categoryFilter === "all" || categoryFilter === "dimension") && results.dimensions.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-purple-400 uppercase tracking-wide">
              Dimensi Rubrik UUD 1945 ({results.dimensions.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {results.dimensions.map((dim) => (
                <div
                  key={dim.id}
                  className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 space-y-1"
                >
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                    {dim.id}
                  </div>
                  <div className="font-bold text-sm text-[var(--text)]">{dim.name_id}</div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mt-1">{dim.question_id}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Pasal UUD */}
        {(categoryFilter === "all" || categoryFilter === "pasal") && results.pasal.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[var(--acc-emerald)] uppercase tracking-wide">
              Pasal UUD 1945 ({results.pasal.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {results.pasal.slice(0, 20).map((p) => (
                <div
                  key={`${p.babNomor}-${p.nomor}`}
                  className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 space-y-1"
                >
                  <div className="text-xs font-bold text-[var(--acc-emerald)]">
                    Bab {p.babNomor} · Pasal {p.nomor}
                  </div>
                  <p className="text-xs text-[var(--text)] leading-relaxed">{p.ringkas_id}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {totalMatches === 0 && (
          <div className="text-center py-16 rounded-xl border border-dashed border-[var(--line)]">
            <p className="text-base font-medium text-[var(--muted)]">
              {t("cariNoResults")} &quot;{query}&quot;
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              Coba gunakan kata kunci lain atau ubah filter era/lembaga.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
