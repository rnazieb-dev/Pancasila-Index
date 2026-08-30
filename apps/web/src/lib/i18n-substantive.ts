/**
 * Terjemahan Substantif Multibahasa (Fase 10) untuk Pancasila Index.
 * Memetakan 12 dimensi rubrik, 3 kelompok landasan, dan istilah konstitusional ke 5 bahasa:
 * - id: Bahasa Indonesia (Kanonik)
 * - en: English (Internasional)
 * - jv: Basa Jawa (Krama Inggil / Daerah)
 * - su: Basa Sunda (Daerah)
 * - min: Baso Minang (Daerah)
 */

export interface SubstantiveDimensionTranslation {
  name: string;
  question: string;
}

export interface SubstantiveGroupTranslation {
  name: string;
  description: string;
}

export const SUBSTANTIVE_I18N: Record<
  string, // locale code: en | jv | su | min
  {
    groups: Record<string, SubstantiveGroupTranslation>;
    dimensions: Record<string, SubstantiveDimensionTranslation>;
  }
> = {
  en: {
    groups: {
      sila: {
        name: "Five Principles of Pancasila",
        description:
          "Practical compliance with the five principles as the fundamental source of state law.",
      },
      pembukaan: {
        name: "Four State Objectives (Preamble Para. IV)",
        description:
          "Protect the nation; promote public welfare; educate national life; participate in world order.",
      },
      "struktur-uud": {
        name: "Structural Norms of the 1945 Constitution",
        description:
          "Constitutional mechanics: rule of law, institutional checks and balances, and popular sovereignty.",
      },
    },
    dimensions: {
      "sila-1": {
        name: "Belief in the One and Only God",
        question:
          "To what extent do institutional actions uphold freedom of religion and fair state-religion relations for all citizens?",
      },
      "sila-2": {
        name: "Just and Civilized Humanity",
        question:
          "To what extent does the institution protect human dignity, human rights, and prevent torture/discrimination?",
      },
      "sila-3": {
        name: "The Unity of Indonesia",
        question:
          "To what extent are diversity, territorial integrity, and inclusive national cohesion preserved without forced assimilation?",
      },
      "sila-4": {
        name: "Democracy Guided by Inner Wisdom in Consultations",
        question:
          "How far are decisions made through participatory deliberation, public accountability, and constitutional integrity?",
      },
      "sila-5": {
        name: "Social Justice for All Indonesian People",
        question:
          "To what extent are policies promoting equitable welfare, fair resource allocation, and anti-monopoly protection?",
      },
      "tujuan-1": {
        name: "Protecting the Whole Nation and Homeland",
        question:
          "To what extent are state actions safeguarding citizen security, personal privacy, and sovereign territory?",
      },
      "tujuan-2": {
        name: "Promoting General Welfare",
        question:
          "To what extent do institutional decisions expand sustainable social protection, health, and economic welfare?",
      },
      "tujuan-3": {
        name: "Educating the Life of the Nation",
        question:
          "To what extent are educational access, intellectual independence, and scientific advancement fostered?",
      },
      "tujuan-4": {
        name: "Participating in World Order and Peace",
        question:
          "To what extent does the institution implement an independent and active foreign policy for global justice and peace?",
      },
      "negara-hukum": {
        name: "The Rule of Law (Rechtsstaat)",
        question:
          "To what extent do institutional actions submit strictly to the constitution, due process, and judicial independence?",
      },
      "checks-balances": {
        name: "Checks and Balances",
        question:
          "To what extent does the institution respect institutional boundaries, oversight mechanisms, and avoid power concentration?",
      },
      "kedaulatan-rakyat": {
        name: "Popular Sovereignty",
        question:
          "To what extent are public elections genuine, civil freedoms respected, and state power held accountable to citizens?",
      },
    },
  },
  jv: {
    groups: {
      sila: {
        name: "Panca Sila Minangka Dhasar Negara",
        description:
          "Kepatuhan nyata dhateng gangsal sila minangka sumbering sedaya sumber hukum negara.",
      },
      pembukaan: {
        name: "Sekawan Ancasing Negari (Pambuka UUD 1945)",
        description:
          "Ngreksa sedaya bangsa; mranata karaharjan umum; nyerdhasaken gesangipun bangsa; tumut njagi katentreman donya.",
      },
      "struktur-uud": {
        name: "Pranatan Struktural UUD 1945",
        description:
          "Lampahing konstitusi: negari adhedhasar hukum, saling kontrol antarlembaga, lan kedaulatan wonten asta rakyat.",
      },
    },
    dimensions: {
      "sila-1": {
        name: "Ketuhanan Ingkang Maha Esa",
        question:
          "Sepinten tumindaking lembaga ngiyataken jaminan kamardikan agami lan sesambetan negari-agami ingkang adil?",
      },
      "sila-2": {
        name: "Kamanungsan ingkang Adil lan Beradab",
        question:
          "Sepinten lembaga ngreksa drajating manungsa, hak asasi, lan nyegah tumindak sawenang-wenang?",
      },
      "sila-3": {
        name: "Persatuan Indonesia",
        question:
          "Sepinten manunggaling bangsa, kawicaksanan Bhinneka Tunggal Ika, lan wewengkon Nusantara kareksa?",
      },
      "sila-4": {
        name: "Kerakyatan ingkang Dipunpimpin déning Hikmat Kawicaksanan",
        question:
          "Kados pundi putusan dipunpendhet lumantar musyawarah, partisipasi masyarakat, lan integritas wakil rakyat?",
      },
      "sila-5": {
        name: "Keadilan Sosial tumrap Sadaya Rakyat Indonesia",
        question:
          "Sepinten kawicaksanan mranata karaharjan ingkang warata, adil, lan ngedohi monokrasi ekonomi?",
      },
      "tujuan-1": {
        name: "Ngreksa Sadaya Bangsa lan Wutah Getih Indonesia",
        question:
          "Sepinten tumindaking negari njagi katentreman warga, data pribadi, lan kedaulatan wewengkon?",
      },
      "tujuan-2": {
        name: "Majengaken Karaharjan Umum",
        question:
          "Sepinten putusan lembaga njamin hak-hak dhasar sosial, kasarasan, lan ekonomi bebrayan agung?",
      },
      "tujuan-3": {
        name: "Nyerdhasaken Gesangipun Bangsa",
        question:
          "Sepinten pawiyatan, ilmu kawruh, lan kamardikan mikir dipunbuka wiyar tumrap sadaya kawula?",
      },
      "tujuan-4": {
        name: "Tumut Nindakaken Katentreman Donya",
        question:
          "Sepinten lembaga nindakaken politik bebas-aktif kangge perdamaian lan kaadilan donya?",
      },
      "negara-hukum": {
        name: "Negari Adhedhasar Hukum (Rechtsstaat)",
        question:
          "Sepinten lembaga manut dhateng konstitusi, pranatan hukum, lan kamardikaning peradilan?",
      },
      "checks-balances": {
        name: "Saling Ngawasi lan Ngimbangi (Checks and Balances)",
        question:
          "Sepinten lembaga ngajeni wates wewenang lan nyegah panumpukan panguwasa mutlak?",
      },
      "kedaulatan-rakyat": {
        name: "Kedaulatan Wonten Asta Rakyat",
        question:
          "Sepinten pemilu lumampah kanthi jujur lan kakuwatan negari tansah manut kekajenganipun rakyat?",
      },
    },
  },
  su: {
    groups: {
      sila: {
        name: "Lima Sila Pancasila",
        description:
          "Kapanutan nyata kana lima sila minangka sumber tina sagala sumber hukum nagara.",
      },
      pembukaan: {
        name: "Opat Tujuan Nagara (Bubuka UUD 1945)",
        description:
          "Ngajaga sakumna bangsa; ngamajukeun karaharjaan umum; nyerdaskeun kahirupan bangsa; ngiring ngalaksanakeun katartiban dunya.",
      },
      "struktur-uud": {
        name: "Norma Struktural UUD 1945",
        description:
          "Tatakrama konstitusi: nagara hukum, silih awas antarlembaga, jeung kadaulatan di leungeun rahayat.",
      },
    },
    dimensions: {
      "sila-1": {
        name: "Katuhanan Nu Maha Esa",
        question:
          "Sajauh mana lampah lembaga nguatkeun jaminan kamerdekaan ngagem agama sarta hubungan nagara-agama anu adil?",
      },
      "sila-2": {
        name: "Kamanusaan nu Adil jeung Beradab",
        question:
          "Sajauh mana lembaga ngajaga harkat martabat manusa, HAM, sarta nyegah panyiksaaan/diskriminasi?",
      },
      "sila-3": {
        name: "Persatuan Indonesia",
        question:
          "Sajauh mana karageman, kagemblengan wewengkon, jeung beungkeutan kabangsaan kajaga kalayan inklusif?",
      },
      "sila-4": {
        name: "Karahayatan nu Dipimpin ku Hikmah Kawijaksanaan",
        question:
          "Kumaha putusan dicandak ngaliwatan musyawarah, partisipasi masarakat, sarta tanggung jawab konstitusional?",
      },
      "sila-5": {
        name: "Keadilan Sosial pikeun Sakumna Rahayat Indonesia",
        question:
          "Sajauh mana kawijakan ngaronjatkeun karaharjaan anu rata, adil, sarta ngabasmi monopoli?",
      },
      "tujuan-1": {
        name: "Ngajaga Sakumna Bangsa jeung Lemah Cai",
        question:
          "Sajauh mana lampah nagara ngajaga kaamanan rahayat, data pribadi, jeung kadaulatan wewengkon?",
      },
      "tujuan-2": {
        name: "Ngamajukeun Karaharjaan Umum",
        question:
          "Sajauh mana putusan lembaga ngajamin panyayagi jaminan sosial, kasehatan, jeung ekonomi rahayat?",
      },
      "tujuan-3": {
        name: "Nyerdaskeun Kahirupan Bangsa",
        question:
          "Sajauh mana aksés atikan, kamerdekaan mikir, sarta kamajuan élmu pangaweruh dirojong?",
      },
      "tujuan-4": {
        name: "Milu Ngalaksanakeun Katartiban Dunya",
        question:
          "Sajauh mana lembaga nerapkeun kawijakan luar nagri bebas-aktif pikeun perdamaian dunya?",
      },
      "negara-hukum": {
        name: "Nagara Hukum (Rechtsstaat)",
        question:
          "Sajauh mana lembaga patuh kana konstitusi, hukum anu lumaku, jeung kamandirian kaadilan?",
      },
      "checks-balances": {
        name: "Silih Ngawaskeun jeung Nimbang (Checks and Balances)",
        question:
          "Sajauh mana lembaga ngahargaan wates kawenangan sarta nyegah museurna kakawasaan?",
      },
      "kedaulatan-rakyat": {
        name: "Kadaulatan di Leungeun Rahayat",
        question:
          "Sajauh mana pemilu lumangsung jujur sarta kakuatan nagara tanggung jawab ka sakumna rahayat?",
      },
    },
  },
  min: {
    groups: {
      sila: {
        name: "Limo Sila Pancasila",
        description:
          "Kapatuahan sabana bana pado limo sila sabagai urek dari sagalo hukum nagara.",
      },
      pembukaan: {
        name: "Ampek Tujuan Banagara (Pambuko UUD 1945)",
        description:
          "Malinduangi sagalo banso; mamajuan kasajahteraan basamo; mancaliakkan kahidupan banso; sato manjago katatiban dunia.",
      },
      "struktur-uud": {
        name: "Norma Struktural UUD 1945",
        description:
          "Aturan karajo konstitusi: nagara hukum, basamo mangawasi antarlembaga, jo kadaulatan di tangan rakyat.",
      },
    },
    dimensions: {
      "sila-1": {
        name: "Katuahanan Nan Maha Esa",
        question:
          "Sajauah ma tindakan lembaga manguatkan jaminan kabebasan baagamo jo hubungan nagara-agamo nan adia?",
      },
      "sila-2": {
        name: "Kamanusiaan nan Adia jo Baadab",
        question:
          "Sajauah ma lembaga manjago martabaik manusia, hak asasi, jo mambantah parilaku sawenang-wenang?",
      },
      "sila-3": {
        name: "Pansatuan Indonesia",
        question:
          "Sajauah ma kabaragaman, kautuahan tanah aia, jo pasatuan kabangsaan tajago basamo?",
      },
      "sila-4": {
        name: "Karayatan nan Dipimpin dek Hikmat Kabijaksanoan",
        question:
          "Bak cando apo kaputusan diambiak lewat musyawarah, rundiang sarato mufakaik, jo tangguang jawek ka rakyat?",
      },
      "sila-5": {
        name: "Kaadilan Sosial untuak Kasadonyo Rakyat Indonesia",
        question:
          "Sajauah ma aturan mamajukan kasajahteraan nan marato, adia, jo maapuih monopoli ekonomi?",
      },
      "tujuan-1": {
        name: "Malinduangi Sagenok Banso jo Ranah Nagari",
        question:
          "Sajauah ma garak nagara manjago kasalamatan rakyat, data diri, sarato kadaulatan nagari?",
      },
      "tujuan-2": {
        name: "Mamajukan Kasajahteraan Basamo",
        question:
          "Sajauah ma kaputusan lembaga manjalehkan jaminan sosial, kasehatan, jo pambadayoan ekonomi?",
      },
      "tujuan-3": {
        name: "Mancaliakkan Kahidupan Banso",
        question:
          "Sajauah ma aksés pandidikan, kabebasan bapikia, jo kamajuan ilmu pangatahuan dibukak laweh?",
      },
      "tujuan-4": {
        name: "Sato Manjago Katatiban Dunia",
        question:
          "Sajauah ma lembaga manjalankan politik lua nagari bebas-aktif untuak kadamaian dunia?",
      },
      "negara-hukum": {
        name: "Nagara Hukum (Rechtsstaat)",
        question:
          "Sajauah ma lembaga tunduk pado konstitusi, jalan hukum nan bana, sarato kamardekaan pangadilan?",
      },
      "checks-balances": {
        name: "Saling Mancaliak jo Mambimbiang (Checks and Balances)",
        question:
          "Sajauah ma lembaga maharagoi bateh kakuasoan jo manangkal panumpukan kakuasoan?",
      },
      "kedaulatan-rakyat": {
        name: "Kadaulatan di Tangan Rakyat",
        question:
          "Sajauah ma pemilu bajalan jujua sarato pamarentah batenggang raso ka sagalo kahandak rakyat?",
      },
    },
  },
};

/**
 * Mengambil nama dimensi yang disesuaikan dengan bahasa aktif.
 */
export function getTranslatedDimensionName(
  dimId: string,
  locale: string,
  defaultName: string
): string {
  if (locale === "id") return defaultName;
  const locData = SUBSTANTIVE_I18N[locale];
  return locData?.dimensions[dimId]?.name ?? defaultName;
}

/**
 * Mengambil pertanyaan panduan dimensi yang disesuaikan dengan bahasa aktif.
 */
export function getTranslatedDimensionQuestion(
  dimId: string,
  locale: string,
  defaultQuestion: string
): string {
  if (locale === "id") return defaultQuestion;
  const locData = SUBSTANTIVE_I18N[locale];
  return locData?.dimensions[dimId]?.question ?? defaultQuestion;
}
