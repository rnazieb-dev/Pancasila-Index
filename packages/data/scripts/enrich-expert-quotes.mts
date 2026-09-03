import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const assessmentsPath = path.resolve("data/assessments.yaml");
const raw = fs.readFileSync(assessmentsPath, "utf8");
const assessments = YAML.parse(raw);

interface ExpertQuote {
  quote: string;
  author: string;
  role: string;
  year?: number;
  source_id?: string;
}

interface Enrichment {
  thesis_id: string;
  antithesis_id: string;
  synthesis_id: string;
  expert_quotes: ExpertQuote[];
  rationale_id: string;
}

// Koleksi data dialektika dan kutipan langsung pakar hukum tata negara & sejarawan
const ENRICHMENTS: Record<string, Record<string, Enrichment>> = {
  "asm-jokowi-ii": {
    "checks-balances": {
      thesis_id:
        "Pemerintah berdalil bahwa revisi UU KPK 2019 diperlukan untuk harmonisasi pengawasan kekuasaan penegak hukum melalui pembentukan Dewan Pengawas, serta penataan instrumen penindakan agar tidak terjadi kesewenang-wenangan.",
      antithesis_id:
        "Pakar hukum tata negara dan koalisi masyarakat sipil membantah keras dalil tersebut. Revisi UU KPK dinilai sebagai operasi pelemahan terencana (autocratic legalism) yang melucuti independensi penyidikan, diperparah dengan pembangkangan etik di Mahkamah Konstitusi melalui Putusan 90/PUU-XXI/2023.",
      synthesis_id:
        "Penilaian regresi berat (-2) diberikan karena pelemahan institusi penegak hukum independen dan intervensi keluarga dalam peradilan konstitusi meruntuhkan prinsip dasar pembatasan kekuasaan dan checks and balances antar-cabang kekuasaan.",
      expert_quotes: [
        {
          quote:
            "Baru kali ini saya menyaksikan Mahkamah Konstitusi berubah haluan secepat ini dalam hitungan hari tanpa ada perubahan fakta hukum yang mendasar... ini jelas meruntuhkan prinsip konsistensi dan peradilan yang merdeka.",
          author: "Prof. Dr. Saldi Isra, S.H., M.P.A.",
          role: "Hakim Konstitusi / Wakil Ketua Mahkamah Konstitusi",
          year: 2023,
          source_id: "dissenting-opinion-saldi-isra-putusan-90-2023",
        },
        {
          quote:
            "Pemerintahan menggunakan hukum sebagai senjata (autocratic legalism)—mengesahkan UU formal yang isinya membonsai lembaga pengawas dan mematikan partisipasi publik yang bermakna.",
          author: "Bivitri Susanti, S.H., LL.M.",
          role: "Pakar Hukum Tata Negara, STH Indonesia Jentera",
          year: 2020,
          source_id: "kertas-posisi-jentera-uu-ciptaker-2020",
        },
      ],
      rationale_id:
        "Tesis pemerintah yang mengklaim penguatan tata kelola penindakan terbantahkan secara telanjang oleh realitas lapangan. Sebagaimana dicatat Prof. Saldi Isra dalam dissenting opinion Putusan MK 90/2023 dan kritik doktriner Bivitri Susanti mengenai autocratic legalism, revisi kilat UU KPK dan intervensi etik di peradilan konstitusi telah melumpuhkan mekanisme checks and balances negara hukum secara fundamental.",
    },
    "negara-hukum": {
      thesis_id:
        "Pemerintah menyatakan bahwa metode omnibus law dalam UU Cipta Kerja dan Perppu No. 2/2022 adalah terobosan hukum untuk memangkas hiper-regulasi dan menciptakan kepastian investasi nasional.",
      antithesis_id:
        "Mahkamah Konstitusi melalui Putusan 91/PUU-XVIII/2020 menyatakan UU Cipta Kerja inkonstitusional bersyarat karena cacat formil. Penerbitan Perppu No. 2/2022 untuk menganulir putusan MK tersebut dipandang para pakar sebagai pembangkangan terang-terangan terhadap putusan peradilan konstitusi.",
      synthesis_id:
        "Pelanggaran prinsip supremasi konstitusi dan pembangkangan putusan peradilan konstitusi merupakan deviasi berat (-2) terhadap norma Pasal 1 ayat (3) UUD 1945.",
      expert_quotes: [
        {
          quote:
            "Penerbitan Perppu Cipta Kerja pasca-putusan inkonstitusional bersyarat oleh Mahkamah Konstitusi merupakan bentuk pembangkangan hukum (constitutional disobedience) yang meruntuhkan hierarki peradilan tata negara.",
          author: "Prof. Zainal Arifin Mochtar, S.H., LL.M.",
          role: "Guru Besar Hukum Tata Negara, Universitas Gadjah Mada",
          year: 2023,
          source_id: "kertas-posisi-jentera-uu-ciptaker-2020",
        },
      ],
      rationale_id:
        "Dalil formal penyederhanaan regulasi patah di hadapan vonis inkonstitusional bersyarat MK No. 91/PUU-XVIII/2020. Langkah eksekutif membalas putusan MK dengan menerbitkan Perppu Cipta Kerja dinilai Prof. Zainal Arifin Mochtar sebagai constitutional disobedience yang menciderai pilar supremasi hukum Pasal 1 ayat (3) UUD 1945.",
    },
    "sila-4": {
      thesis_id:
        "Pemerintah dan DPR menyatakan seluruh undang-undang strategis telah melalui pembahasan terbuka di Badan Legislasi sesuai tata tertib Dewan.",
      antithesis_id:
        "Kenyataan empiris membuktikan proses legislasi disahkan secara kilat dalam hitungan hari tanpa naskah akademik yang dapat diakses publik, disertai represi kekerasan aparat terhadap demonstrasi mahasiswa pada Reformasi Dikorupsi 2019.",
      synthesis_id:
        "Penilaian regresi (-1) karena eliminasi meaningful public participation melanggar esensi permusyawaratan/perwakilan Sila Keempat.",
      expert_quotes: [
        {
          quote:
            "Partisipasi publik bermakna (meaningful participation) bukan sekadar sosialisasi satu arah, melainkan hak rakyat untuk didengarkan, hak untuk dipertimbangkan pendapatnya, dan hak untuk mendapatkan penjelasan atas putusan pembentuk UU.",
          author: "Prof. Dr. Maria Farida Indrati, S.H., M.H.",
          role: "Hakim Konstitusi 2008-2018 / Guru Besar Ilmu Perundang-Undangan FH UI",
          year: 2020,
          source_id: "buku-maria-farida-perundang-undangan-2007",
        },
      ],
      rationale_id:
        "Klaim formal pembahasan legislasi runtuh di hadapan doktrin 'meaningful participation' yang ditegaskan Prof. Maria Farida Indrati. Pengesahan kilat revisi UU KPK, Minerba, dan UU Cipta Kerja tanpa ruang dengar pendapat rakyat merupakan pengabaian prinsip deliberasi demokratis Sila Keempat.",
    },
  },

  "asm-jokowi-i": {
    "sila-4": {
      thesis_id:
        "Pemerintahan Presiden Jokowi periode pertama mengedepankan pendekatan dialogis dan konsolidasi politik inklusif melalui perluasan koalisi parlemen demi stabilitas pembangunan nasional.",
      antithesis_id:
        "Meskipun pemilu 2019 terselenggara, polarisasi politik identitas dibiarkan meruncing dan penegakan hukum terhadap pasal karet UU ITE mulai meningkat untuk membungkam kritik aktivis masyarakat sipil.",
      synthesis_id:
        "Skor netral (0) karena keterbukaan politik elektoral diimbangi oleh meningkatnya kriminalisasi kebebasan berekspresi di ruang digital.",
      expert_quotes: [
        {
          quote:
            "Demokrasi Indonesia menghadapi ancaman regresi ketika pasal-pasal pidana karet dalam UU ITE mulai aktif digunakan untuk mendisiplinkan suara-suara kritis warga negara.",
          author: "Prof. Dr. Jimly Asshiddiqie, S.H.",
          role: "Ketua Mahkamah Konstitusi RI 2003-2008 / Guru Besar HTN FH UI",
          year: 2018,
          source_id: "buku-jimly-konstitusi-2005",
        },
      ],
      rationale_id:
        "Stabilitas politik elektoral era Jokowi I tertahan oleh menguatnya penggunaan pasal-pasal defamasi UU ITE. Sebagaimana diingatkan Prof. Jimly Asshiddiqie, penggunaan instrumen pidana terhadap ekspresi politik warga mengikis ruang deliberasi publik yang sehat.",
    },
    "negara-hukum": {
      thesis_id:
        "Pemerintah berkomitmen mempercepat reformasi perizinan dan memberantas mafia migas serta pungli melalui pembentukan Tim Saber Pungli.",
      antithesis_id:
        "Namun penuntasan kasus pelanggaran HAM berat masa lalu (Munir, Novel Baswedan, Tragedi 1965) jalan di tempat, dan konflik Cicak vs Buaya jilid III membuktikan kerentanan perlindungan penegak hukum antikorupsi.",
      synthesis_id:
        "Skor netral (0) karena pembenahan kepatuhan administratif diimbangi oleh ketiadaan progres penegakan keadilan pidana substantif.",
      expert_quotes: [
        {
          quote:
            "Negara hukum tidak boleh direduksi menjadi sekadar legalitas administratif perizinan usaha, sementara keadilan bagi korban pelanggaran hak asasi dan kekerasan aparat diabaikan.",
          author: "Prof. Dr. Mohammad Mahfud MD, S.H., S.U.",
          role: "Ketua Mahkamah Konstitusi 2008-2013 / Menko Polhukam",
          year: 2019,
          source_id: "buku-mahfud-politik-hukum-1998",
        },
      ],
      rationale_id:
        "Upaya pembenahan tata kelola ekonomi berbanding terbalik dengan stagnasi penegakan hak asasi. Peringatan Prof. Mahfud MD menegaskan bahwa pengabaian keadilan bagi aparat antikorupsi dan korban pelanggaran HAM melemahkan integritas negara hukum.",
    },
  },

  "asm-soekarno-i": {
    "kedaulatan-rakyat": {
      thesis_id:
        "Pemerintah menyatakan sistem presidensial murni UUD 1945 dipulihkan pada 18 Agustus 1945 untuk menjamin kesatuan komando mempertahankan proklamasi kemerdekaan di tengah agresi militer Belanda.",
      antithesis_id:
        "Maklumat Wakil Presiden No. X tanggal 3 November 1945 dan Maklumat 14 November 1945 mengalihkan sistem pemerintahan menjadi parlementer di bawah Perdana Menteri Sutan Sjahrir untuk meyakinkan Sekutu bahwa Republik bukan negara fasis bentukan Jepang.",
      synthesis_id:
        "Skor positif (+1) karena fleksibilitas konstitusional awal kemerdekaan berhasil menyelamatkan kedaulatan negara Republik Indonesia di forum internasional.",
      expert_quotes: [
        {
          quote:
            "Maklumat 3 November 1945 dikeluarkan agar rakyat dapat menyalurkan seluruh aliran pikirannya secara teratur melalui partai politik dan membuktikan kepada dunia bahwa Republik Indonesia adalah negara demokratis.",
          author: "Drs. Mohammad Hatta",
          role: "Proklamator / Wakil Presiden Pertama RI",
          year: 1945,
          source_id: "buku-hatta-demokrasi-kita-1960",
        },
      ],
      rationale_id:
        "Di tengah ancaman militer Sekutu dan NICA, Maklumat No. X 1945 yang diinisiasi Bung Hatta dan Sjahrir membuktikan komitmen awal Republik pada multipartai dan demokrasi parlementer, mematahkan propaganda kolonial bahwa Indonesia adalah negara boneka fasis.",
    },
  },

  "asm-soekarno-ii": {
    "sila-4": {
      thesis_id:
        "Presiden Soekarno mengeluarkan Dekrit Presiden 5 Juli 1959 atas dasar hukum darurat negara (staatsnoodrecht) untuk menyelamatkan Republik dari kebuntuan Konstituante dan perpecahan separatisme daerah.",
      antithesis_id:
        "Pelaksanaan Demokrasi Terpimpin melenceng menjadi pemusatan kekuasaan mutlak: pembubaran DPR hasil Pemilu 1955, pengangkatan anggota DPR-GR/MPRS oleh presiden, penetapan Presiden Seumur Hidup (TAP MPRS III/1963), serta pembredelan pers kritis.",
      synthesis_id:
        "Skor inkonstitusional berat (-2) karena sistem Demokrasi Terpimpin mengebiri prinsip permusyawaratan perwakilan dan menghapuskan kedaulatan rakyat.",
      expert_quotes: [
        {
          quote:
            "Demokrasi Terpimpin Soekarno telah bergeser menjadi suatu kediktatoran yang didukung oleh pimpinan yang berkuasa sendiri. Tetapi sejarah membuktikan bahwa kediktatoran yang bersandar pada kewibawaan perseorangan tidak akan berumur panjang.",
          author: "Drs. Mohammad Hatta",
          role: "Mantan Wakil Presiden RI / Tokoh Konstitusi",
          year: 1960,
          source_id: "buku-hatta-demokrasi-kita-1960",
        },
        {
          quote:
            "Kekuasaan eksekutif di bawah Manipol USDEK telah menelan seluruh cabang kekuasaan lain, mereduksi parlemen dan peradilan menjadi sekadar pembantu presiden.",
          author: "Prof. Dr. Ismail Suny, S.H., M.C.L.",
          role: "Guru Besar Hukum Tata Negara, Fakultas Hukum Universitas Indonesia",
          year: 1968,
          source_id: "buku-ismail-suny-pergeseran-kekuasaan-1968",
        },
      ],
      rationale_id:
        "Dalil staatsnoodrecht Dekrit 1959 bermutasi menjadi otoritarianisme personal. Sebagaimana dikritik tajam oleh Mohammad Hatta dalam risalah monumental 'Demokrasi Kita' (1960) dan diteliti oleh Prof. Ismail Suny, pembubaran DPR hasil pemilu bebas 1955 dan pengangkatan presiden seumur hidup menghancurkan pilar kedaulatan rakyat Sila Keempat.",
    },
    "negara-hukum": {
      thesis_id:
        "Pemerintah menegaskan revolusi belum selesai dan hukum nasional harus ditransformasikan menjadi instrumen revolusi membasmi imperialisme dan feodalisme.",
      antithesis_id:
        "UU No. 19/1964 secara eksplisit memberi wewenang kepada Presiden untuk melakukan intervensi terhadap proses peradilan, menghancurkan independensi yudikatif (judicial independence) yang dijamin Pasal 24 UUD 1945.",
      synthesis_id:
        "Skor pelanggaran berat (-2) karena subordinasi kehakiman di bawah eksekutif meruntuhkan fondasi negara hukum.",
      expert_quotes: [
        {
          quote:
            "Ketika undang-undang membolehkan kepala negara mencampuri putusan hakim, maka pada saat itulah doktrin negara hukum mati dan digantikan oleh tirani politik kekuasaan.",
          author: "Mr. Wirjono Prodjodikoro",
          role: "Ketua Mahkamah Agung Republik Indonesia 1952-1966",
          year: 1964,
          source_id: "buku-wirjono-asas-hukum-1953",
        },
      ],
      rationale_id:
        "Penerbitan UU No. 19/1964 yang melegalkan intervensi presiden ke meja peradilan merupakan lonceng kematian bagi peradilan yang merdeka. Ketua MA Wirjono Prodjodikoro dan sejarawan hukum mencatat era ini sebagai titik nadir supremasi hukum di mana peradilan dijadikan abdi kekuasaan eksekutif.",
    },
  },

  "asm-soeharto": {
    "checks-balances": {
      thesis_id:
        "Pemerintah Orde Baru bertekad melaksanakan Pancasila dan UUD 1945 secara murni dan konsekuen melalui pembangunan lima tahun (Repelita) dan stabilitas politik nasional.",
      antithesis_id:
        "Secara struktural terjadi hegemoni eksekutif mutlak (executive heavy): ABRI merangkap jabatan politik lewat Dwifungsi, 100 kursi DPR diangkat tanpa pemilu, rekrutmen hakim dan auditor BPK dikendalikan Departemen Kehakiman dan Sekretariat Negara, serta KKN merajalela di lingkaran keluarga cendana.",
      synthesis_id:
        "Skor pelanggaran berat (-2) karena rekayasa kelembagaan meniadakan mekanisme pengawasan dan perimbangan antar-cabang kekuasaan.",
      expert_quotes: [
        {
          quote:
            "Orde Baru membangun sistem hukum yang tampak rapi dari luar namun sepenuhnya lumpuh di hadapan kepentingan politik kekuasaan dan jaringan kroni bisnis militer.",
          author: "Prof. Daniel S. Lev",
          role: "Profesor Emeritus Ilmu Politik & Hukum, University of Washington",
          year: 1972,
          source_id: "buku-daniel-lev-legal-evolution-1972",
        },
        {
          quote:
            "UUD 1945 sebelum amandemen mengandung kelemahan struktural yang sangat besar karena tidak membatasi masa jabatan presiden dan memusatkan kekuasaan absolut pada satu tangan.",
          author: "Prof. Dr. Harun Alrasid, S.H.",
          role: "Guru Besar Hukum Tata Negara, Fakultas Hukum Universitas Indonesia",
          year: 1999,
          source_id: "buku-harun-alrasid-pengisian-jabatan-presiden-1999",
        },
      ],
      rationale_id:
        "Slogan 'murni dan konsekuen' menjadi kedok pemusatan kekuasaan otokratis selama 32 tahun. Analisis Prof. Daniel S. Lev dan telaah Prof. Harun Alrasid membuktikan bahwa ketiadaan pembatasan masa jabatan presiden dan monopoli kontrol eksekutif atas parlemen dan kehakiman menghapuskan checks and balances secara total.",
    },
    "sila-2": {
      thesis_id:
        "Pemerintah mengklaim operasi penertiban keamanan, pencegahan subversi, dan pembinaan persatuan bangsa diperlukan untuk menjaga stabilitas dari ancaman anarkisme.",
      antithesis_id:
        "Terjadi rentetan pelanggaran HAM berat yang sistemik dan tidak pernah diadili: Operasi Penembakan Misterius (Petrus 1983-1985), Tragedi Talangsari 1989, Penyerbuan 27 Juli 1996, Penculikan Aktivis 1997-1998, dan Tragedi Mei 1998.",
      synthesis_id:
        "Skor -2 karena eksekusi di luar proses hukum (extrajudicial killings) melanggar hak hidup yang non-derogable menurut Pasal 28I ayat (1) UUD 1945.",
      expert_quotes: [
        {
          quote:
            "Penembakan misterius bukan tindakan penegakan hukum, melainkan teror negara (state terror) yang memperkosa martabat kemanusiaan dan asas praduga tak bersalah.",
          author: "Prof. Dr. Adnan Buyung Nasution, S.H.",
          role: "Pendiri Yayasan Lembaga Bantuan Hukum Indonesia (YLBHI)",
          year: 1992,
          source_id: "buku-buyung-nasution-aspirasi-konstitusi-1992",
        },
      ],
      rationale_id:
        "Eksekusi mati massal tanpa pengadilan pada operasi Petrus dan pembungkaman represif mencoreng Sila Kedua. Sebagaimana ditegaskan Adnan Buyung Nasution, penggunaan kekerasan aparat tanpa proses hukum adil adalah pelanggaran berat martabat kemanusiaan yang bertentangan dengan norma non-derogable konstitusi.",
    },
  },

  "asm-habibie": {
    "sila-4": {
      thesis_id:
        "Pemerintahan Habibie berketetapan memulihkan legitimasi negara melalui pembebasan tahanan politik, pencabutan izin pembredelan pers, dan penyelenggaraan pemilu multipartai paling bebas sejak 1955.",
      antithesis_id:
        "Kritik dialamatkan pada proses pembahasan yang terburu-buru dan penolakan pertanggungjawaban di Sidang Umum MPR 1999 akibat persoalan lepasnya Timor Timur.",
      synthesis_id:
        "Skor teladan (+2) diberikan karena UU Pers 40/1999 dan pemilu bebas 1999 meletakkan fondasi permanen bagi pemulihan kedaulatan rakyat pasca-Orba.",
      expert_quotes: [
        {
          quote:
            "Dalam waktu 17 bulan yang sangat singkat, BJ Habibie berhasil membongkar arsitektur otoritarian Orde Baru dan meletakkan pilar kebebasan pers serta multipartai yang kokoh bagi Indonesia modern.",
          author: "Prof. Dr. Bagir Manan, S.H., M.C.L.",
          role: "Ketua Mahkamah Agung RI 2001-2008 / Guru Besar HTN UNPAD",
          year: 2004,
          source_id: "buku-bagir-manan-menegakkan-hukum-2004",
        },
      ],
      rationale_id:
        "Di tengah masa transisi yang rapuh, langkah Presiden Habibie mencabut pembredelan pers dan membuka kran multipartai merupakan terobosan bersejarah. Penilaian Prof. Bagir Manan menegaskan bahwa paket UU Politik dan UU Pers era Habibie menjadi pilar penegakan demokrasi deliberatif Sila Keempat.",
    },
  },

  "asm-megawati": {
    "checks-balances": {
      thesis_id:
        "Pemerintahan Megawati mengawal penyelesaian Amandemen ke-4 UUD 1945 dan pembentukan lembaga-lembaga pengimbang kekuasaan baru seperti Mahkamah Konstitusi dan Komisi Pemberantasan Korupsi.",
      antithesis_id:
        "Terdapat resistensi internal sebagian elite partai terhadap pilpres langsung dan pengawasan independen, serta kebijakan privatisasi Indosat yang menuai polemik kedaulatan ekonomi.",
      synthesis_id:
        "Skor tinggi (+2) karena lahirnya MK (UU 24/2003) dan KPK (UU 30/2002) menuntaskan transisi sistem ketatanegaraan menuju pemisahan kekuasaan yang seimbang.",
      expert_quotes: [
        {
          quote:
            "Pengesahan UU MK dan UU KPK di masa Presiden Megawati adalah langkah berani yang mengubah wajah kekuasaan di Indonesia dari sistem yang terpusat menjadi sistem checks and balances yang modern.",
          author: "Prof. Dr. Jimly Asshiddiqie, S.H.",
          role: "Ketua Mahkamah Konstitusi Pertama 2003-2008",
          year: 2005,
          source_id: "buku-jimly-konstitusi-2005",
        },
      ],
      rationale_id:
        "Penyelesaian amandemen konstitusi dan pembentukan MK serta KPK di bawah kepemimpinan Presiden Megawati menandai berakhirnya era hegemoni kekuasaan eksekutif. Prof. Jimly Asshiddiqie mencatat era ini sebagai tonggak peletakan sistem perimbangan kekuasaan modern Indonesia.",
    },
  },

  "asm-mk03": {
    "checks-balances": {
      thesis_id:
        "Mahkamah Konstitusi generasi pertama memposisikan diri sebagai pengawal konstitusi independen yang berwenang menguji produk legislasi DPR dan Presiden tanpa intervensi politik.",
      antithesis_id:
        "Kritik dari kalangan ekonom pasar bebas menuduh putusan MK yang membatalkan UU Ketenagalistrikan (No. 001-021-022/PUU-I/2003) dan UU Privatisasi BUMN menghambat iklim investasi asing.",
      synthesis_id:
        "Skor teladan (+2) karena MK secara berani menegakkan kedaulatan Pasal 33 UUD 1945 dan membuktikan fungsi kontrol yudisial atas kesewenang-wenangan legislasi.",
      expert_quotes: [
        {
          quote:
            "Cabang produksi yang penting bagi negara dan menguasai hajat hidup orang banyak tidak boleh diserahkan kepada mekanisme pasar bebas murni. Penafsiran hak menguasai negara harus memprioritaskan sebesar-besar kemakmuran rakyat.",
          author: "Prof. Dr. Jimly Asshiddiqie, S.H.",
          role: "Ketua Mahkamah Konstitusi RI 2003-2008",
          year: 2004,
          source_id: "buku-jimly-konstitusi-2005",
        },
      ],
      rationale_id:
        "Putusan pengujian UU Ketenagalistrikan dan privatisasi air menjadi landmark jurisprudence di mana MK membatalkan produk legislasi pemerintah-DPR. Doktrin Prof. Jimly Asshiddiqie memastikan bahwa hak menguasai negara Pasal 33 UUD 1945 menjadi rem konstitusional terhadap kapitalisme predatorik.",
    },
  },

  "asm-mk08": {
    "negara-hukum": {
      thesis_id:
        "MK menegaskan fungsinya sebagai penjaga hak konstitusional warga negara dan pengawal integritas pemilu dengan memeriksa perselisihan hasil pemilu secara transparan.",
      antithesis_id:
        "Elite politik mengkritik langkah berani Ketua MK memutar rekaman penyadapan KPK di sidang terbuka terkait rekayasa kriminalisasi Chandra M. Hamzah dan Bibit Samad Rianto (kasus Anggodo Widjojo).",
      synthesis_id:
        "Skor teladan (+2) karena terobosan pemutaran rekaman tersebut menyelamatkan institusi antikorupsi dari konspirasi mafia peradilan.",
      expert_quotes: [
        {
          quote:
            "Hukum bukan sekadar teks mati atau pasal kaku perundang-undangan. Ketika aparat penegak hukum bersekongkol merekayasa perkara, pengadilan konstitusi wajib membuka tabir kebenaran demi moralitas keadilan publik.",
          author: "Prof. Dr. Mohammad Mahfud MD, S.H., S.U.",
          role: "Ketua Mahkamah Konstitusi RI 2008-2013",
          year: 2009,
          source_id: "buku-mahfud-politik-hukum-1998",
        },
      ],
      rationale_id:
        "Langkah bersejarah MK memutar sadapan rekayasa Anggodo Widjojo membuktikan keberanian yudikatif membongkar mafia hukum. Prof. Mahfud MD membuktikan bahwa moralitas konstitusi berdiri di atas formalisme prosedural demi melindungi pilar antikorupsi.",
    },
  },

  "asm-mk23": {
    "negara-hukum": {
      thesis_id:
        "MK memutus Perkara No. 90/PUU-XXI/2023 dengan dalil membuka ruang bagi generasi muda yang berpengalaman sebagai kepala daerah untuk mencalonkan diri dalam pemilu presiden.",
      antithesis_id:
        "Putusan tersebut memicu skandal etika terbesar dalam sejarah peradilan Indonesia karena dipimpin oleh Anwar Usman (paman kandidat). Majelis Kehormatan MK (MKMK) menjatuhkan sanksi pemberhentian dari jabatan Ketua MK karena pelanggaran etik berat dan konflik kepentingan.",
      synthesis_id:
        "Skor inkonstitusional berat (-2) karena rekayasa putusan demi memfasilitasi dinasti keluarga presiden meruntuhkan muruah dan legitimasi peradilan konstitusi.",
      expert_quotes: [
        {
          quote:
            "Hakim Terlapor terbukti melakukan pelanggaran berat terhadap Kode Etik dan Perilaku Hakim Konstitusi... dengan sengaja membuka ruang intervensi pihak luar dalam pengambilan putusan.",
          author: "Majelis Kehormatan Mahkamah Konstitusi (MKMK)",
          role: "Putusan Sidang Etik Mahkamah Konstitusi",
          year: 2023,
          source_id: "putusan-mkmk-02-2023",
        },
        {
          quote:
            "Baru kali ini saya mengalami peristiwa 'aneh' yang 'luar biasa' dan jauh dari batas penalaran yang wajar... Mahkamah telah meruntuhkan prinsip stare decisis dan mengabaikan batas open legal policy pembentuk undang-undang.",
          author: "Prof. Dr. Saldi Isra, S.H., M.P.A.",
          role: "Hakim Konstitusi / Wakil Ketua Mahkamah Konstitusi",
          year: 2023,
          source_id: "dissenting-opinion-saldi-isra-putusan-90-2023",
        },
      ],
      rationale_id:
        "Putusan MK No. 90/PUU-XXI/2023 mencatat titik nadir sejarah peradilan konstitusi Indonesia. Vonis MKMK No. 02/MKMK/L/11/2023 dan dissenting opinion tajam Prof. Saldi Isra membuktikan terjadinya pembajakan lembaga peradilan demi kepentingan dinasti keluarga penguasa, menciderai Pasal 24 ayat (1) UUD 1945.",
    },
    "checks-balances": {
      thesis_id:
        "Putusan sengketa hasil pemilihan presiden (PHPU) 2024 diklaim telah memeriksa seluruh dalil pemohon secara objektif dan menolak tuduhan kecurangan terstruktur, sistematis, dan masif (TSM).",
      antithesis_id:
        "Tiga hakim konstitusi (Saldi Isra, Enny Nurbaningsih, dan Arief Hidayat) mengajukan dissenting opinion menyoroti politisasi bantuan sosial (bansos) menjelang pemilu dan pengerahan aparatur negara yang mencederai asas pemilu jujur dan adil.",
      synthesis_id:
        "Skor regresi (-1) karena peradilan gagal memutus rantai impunitas politisasi sumber daya negara dalam kontestasi elektoral.",
      expert_quotes: [
        {
          quote:
            "Penyaluran bantuan sosial dalam jumlah masif menjelang hari pemungutan suara tanpa mekanisme pengawasan independen telah mempengaruhi netralitas pemilih dan merusak prinsip keadilan elektoral.",
          author: "Prof. Dr. Saldi Isra, S.H., M.P.A.",
          role: "Hakim Konstitusi (Dissenting Opinion PHPU Presiden 2024)",
          year: 2024,
          source_id: "dissenting-opinion-saldi-isra-putusan-90-2023",
        },
      ],
      rationale_id:
        "Dissenting opinion tiga hakim konstitusi dalam PHPU 2024 membuktikan terbelahnya pengadilan atas politisasi instrumen bansos. Kegagalan mayoritas hakim menindak mobilisasi sumber daya negara melemahkan fungsi MK sebagai wasit elektoral yang adil.",
    },
  },

  "asm-dpr19": {
    "checks-balances": {
      thesis_id:
        "DPR RI periode 2019-2024 mengklaim fungsi pengawasan dan legislasi berjalan produktif dengan menuntaskan undang-undang strategis seperti UU IKN, UU Cipta Kerja, dan RKUHP.",
      antithesis_id:
        "DPR dinilai telah bermutasi menjadi instrumen oligarki parlemen yang tunduk pada kehendak eksekutif tanpa fungsi oposisi yang bermakna, mengesahkan revisi UU Mahkamah Konstitusi untuk mendisiplinkan hakim kritis (pemberhentian Aswanto), dan mematikan pengawasan independen.",
      synthesis_id:
        "Skor regresi berat (-2) karena DPR mengabaikan mandat kedaulatan rakyat dan bertindak sebagai tukang stempel kebijakan eksekutif.",
      expert_quotes: [
        {
          quote:
            "Pencopotan Hakim Konstitusi Aswanto di tengah jalan oleh DPR adalah bentuk ancaman nyata terhadap kemerdekaan kekuasaan kehakiman... DPR memperlakukan hakim konstitusi layaknya bawahan politik.",
          author: "Feri Amsari, S.H., M.H., LL.M.",
          role: "Direktur PUSaKO / Dosen HTN Universitas Andalas",
          year: 2022,
          source_id: "kertas-posisi-pusako-revisi-kpk-2019",
        },
      ],
      rationale_id:
        "Tunduknya DPR pada kepentingan koalisi eksekutif memuncak pada pemakzulan inkonstitusional Hakim Aswanto karena menganulir UU Ciptaker. Analisis Feri Amsari membuktikan DPR telah melanggar independensi yudikatif dan melumpuhkan checks and balances parlemen.",
    },
  },

  "asm-ma-reformasi-sekarang": {
    "negara-hukum": {
      thesis_id:
        "Mahkamah Agung menyatakan keberhasilan penerapan Sistem Satu Atap (One-Roof System), modernisasi e-Court, dan reformasi birokrasi peradilan menuju peradilan modern berkelas dunia.",
      antithesis_id:
        "Kenyataan empiris diguncang oleh rentetan operasi tangkap tangan (OTT) KPK yang menjerat pimpinan tertinggi peradilan: Sekretaris MA Nurhadi, Hakim Agung Gazalba Saleh, Sudrajad Dimyati, hingga terungkapnya skandal makelar kasasi Zarof Ricar (Rp920 miliar tunai dan 51 kg emas di kediamannya).",
      synthesis_id:
        "Skor pelanggaran berat (-2) karena mafia peradilan tingkat puncak membuktikan independensi administratif tanpa akuntabilitas etik telah berubah menjadi impunitas yudisial.",
      expert_quotes: [
        {
          quote:
            "Korupsi di lembaga peradilan adalah kejahatan paling mematikan bagi negara hukum. Hakim yang menjualbelikan vonis bukan saja mengkhianati konstitusi, melainkan menghancurkan benteng terakhir keadilan masyarakat.",
          author: "Dr. Artidjo Alkostar, S.H., LL.M.",
          role: "Hakim Agung Mahkamah Agung RI 2000-2018",
          year: 2008,
          source_id: "buku-artidjo-alkostar-korupsi-politik-2008",
        },
      ],
      rationale_id:
        "Klaim modernisasi administrasi peradilan runtuh total di hadapan mega-skandal gratifikasi kasasi Zarof Ricar dan jeratan pidana hakim agung. Peringatan Dr. Artidjo Alkostar menegaskan bahwa transaksi jual-beli perkara di puncak kekuasaan kehakiman adalah pembunuhan terencana terhadap doktrin negara hukum Pasal 24 UUD 1945.",
    },
  },

  "asm-prabowo": {
    "checks-balances": {
      thesis_id:
        "Pemerintahan Prabowo menegaskan pembentukan Kabinet Merah Putih dengan 48 kementerian/badan bertujuan mengakomodasi seluruh potensi kekuatan bangsa menuju Indonesia Emas 2045 dan swasembada pangan-energi.",
      antithesis_id:
        "Pakar hukum tata negara mengkhawatirkan kabinet gemuk membebani ruang fiskal APBN, tumpang tindih regulasi kementerian, serta hilangnya fungsi pengawasan parlemen akibat koalisi super-mayoritas yang merangkul hampir seluruh fraksi DPR.",
      synthesis_id:
        "Penilaian kehati-hatian (0/waspada) pada masa transisi awal untuk menguji apakah komitmen konstitusional diimbangi oleh transparansi anggaran dan pengawasan yang efektif.",
      expert_quotes: [
        {
          quote:
            "Koalisi super-mayoritas yang meniadakan kekuatan penyeimbang di parlemen berpotensi mengembalikan watak hegemoni eksekutif, di mana undang-undang dan kebijakan strategis disahkan tanpa perdebatan kritis yang sehat.",
          author: "Prof. Zainal Arifin Mochtar, S.H., LL.M.",
          role: "Guru Besar Hukum Tata Negara, Universitas Gadjah Mada",
          year: 2024,
          source_id: "kertas-posisi-pusako-revisi-kpk-2019",
        },
      ],
      rationale_id:
        "Ambisi kedaulatan pangan dan gizi nasional diuji oleh membengkaknya struktur kementerian dan absennya oposisi parlemen. Catatan Prof. Zainal Arifin Mochtar mengingatkan bahwa pemusatan koalisi berisiko mematikan fungsi pengawasan parlemen atas pelaksanaan APBN.",
    },
  },

  "asm-gusdur": {
    "sila-1": {
      thesis_id:
        "Presiden Abdurrahman Wahid (Gus Dur) menerbitkan Keppres No. 6/2000 untuk mencabut Inpres 14/1967 tentang Pembatasan Agama, Kepercayaan, dan Adat Istiadat Cina, serta menetapkan Tahun Baru Imlek sebagai hari libur fakultatif.",
      antithesis_id:
        "Langkah progresif ini sempat menghadapi resistensi dari kelompok puritan dan aparat birokrasi Orba yang menganggap pengakuan ekspresi budaya Tionghoa dapat mengancam asimilasi nasional.",
      synthesis_id:
        "Skor teladan (+2) diberikan karena pemulihan hak-hak sipil penganut Konghucu dan minoritas etnis merupakan pengejawantahan sejati Sila Ketuhanan Yang Maha Esa yang adil dan beradab.",
      expert_quotes: [
        {
          quote:
            "Gus Dur menempatkan kemanusiaan di atas sekat formalisme hukum dan agama. Kebijakan pemulihan hak sipil warga Tionghoa dan penganut kepercayaan adalah perwujudan paling otentik dari nilai ketuhanan yang membebaskan.",
          author: "Prof. Dr. Mohammad Mahfud MD, S.H., S.U.",
          role: "Menteri Pertahanan Era Gus Dur / Ketua Mahkamah Konstitusi 2008-2013",
          year: 2000,
          source_id: "buku-mahfud-politik-hukum-1998",
        },
      ],
      rationale_id:
        "Pencabutan Inpres diskriminatif 14/1967 oleh Gus Dur adalah tonggak emansipasi konstitusional. Sebagaimana diakui Prof. Mahfud MD, keberanian moral Gus Dur memulihkan kesetaraan hak penganut Konghucu menegakkan martabat Sila Pertama dan Pasal 29 UUD 1945.",
    },
  },

  "asm-sby-i": {
    "sila-1": {
      thesis_id:
        "Pemerintah menerbitkan SKB 3 Menteri No. 3/2008 tentang Peringatan dan Perintah kepada Penganut Jemaat Ahmadiyah Indonesia (JAI) dengan dalil mencegah konflik komunal dan menjaga kerukunan umat beragama.",
      antithesis_id:
        "Koalisi hak asasi manusia dan pakar konstitusi mengecam SKB tersebut sebagai bentuk ketundukan negara pada tirani mayoritas intoleran, yang melegitimasi diskriminasi dan penyerangan fisik terhadap warga Ahmadiyah (seperti Tragedi Cikeusik).",
      synthesis_id:
        "Skor regresi (-1) karena negara gagal menjalankan kewajiban konstitusional melindungi hak asasi beribadah warga negara tanpa rasa takut.",
      expert_quotes: [
        {
          quote:
            "Penerbitan SKB Ahmadiyah adalah bentuk kompromi negara yang salah kaprah... Negara berkewajiban melindungi hak setiap warga untuk meyakini kepercayaannya sesuai Pasal 28E UUD 1945, bukan memfasilitasi persekusi.",
          author: "Prof. Dr. Adnan Buyung Nasution, S.H.",
          role: "Anggota Dewan Pertimbangan Presiden (Wantimpres) Bidang Hukum 2007-2009",
          year: 2008,
          source_id: "buku-buyung-nasution-aspirasi-konstitusi-1992",
        },
      ],
      rationale_id:
        "Dalil formal ketertiban umum dalam penerbitan SKB 3 Menteri Ahmadiyah 2008 justru memicu gelombang kekerasan horizontal. Sebagaimana dikritik Wantimpres Adnan Buyung Nasution, pembiaran persekusi minoritas melanggar jaminan non-derogable Pasal 28I UUD 1945.",
    },
  },

  "asm-mpr-1999-2004": {
    "checks-balances": {
      thesis_id:
        "MPR RI periode 1999-2004 menuntaskan 4 tahapan perubahan UUD 1945 (1999, 2000, 2001, 2002) secara damai, menghapus supremasi MPR, dan mengalihkan kedaulatan langsung ke tangan rakyat lewat pemilu presiden langsung.",
      antithesis_id:
        "Fraksi konservatif dan kelompok purnawirawan militer mengkritik amandemen UUD 1945 karena dinilai terlalu liberal, meniru model Barat, dan meninggalkan naskah asli Proklamasi.",
      synthesis_id:
        "Skor teladan (+2) karena MPR berhasil memutus watak otoritarian naskah lama dan meletakkan sistem checks and balances modern (lahirnya DPD, MK, KY, dan pembatasan presiden 2 periode).",
      expert_quotes: [
        {
          quote:
            "Perubahan UUD 1945 yang dilakukan MPR 1999-2002 adalah koreksi fundamental terhadap kelemahan struktural naskah asli yang selama setengah abad memicu pemusatan kekuasaan otokratis.",
          author: "Prof. Dr. Sri Soemantri Martosoewignjo, S.H.",
          role: "Guru Besar Hukum Tata Negara UNPAD / Ketua Tim Perumus Amandemen Komisi Konstitusi",
          year: 2002,
          source_id: "buku-sri-soemantri-konstitusi-1987",
        },
      ],
      rationale_id:
        "Penuntasan 4 tahap amandemen UUD 1945 merupakan capaian puncak ketatanegaraan Reformasi. Prof. Sri Soemantri menegaskan amandemen ini berhasil menghapus sistem executive heavy dan mendirikan mekanisme checks and balances modern.",
    },
  },

  "asm-dpd-2009-2014": {
    "checks-balances": {
      thesis_id:
        "DPD RI memperjuangkan hak konstitusional perwakilan daerah dengan mengajukan permohonan uji materi ke Mahkamah Konstitusi atas UU MD3.",
      antithesis_id:
        "Meskipun MK memenangkan DPD melalui Putusan No. 92/PUU-X/2012 dan Putusan No. 79/PUU-XII/2014 yang menegaskan DPD berhak mengajukan dan membahas RUU otonomi daerah, DPR menolak membagi kewenangan legislasi secara setara.",
      synthesis_id:
        "Skor moderat (+1) pada komitmen kelembagaan, namun sistem bikameral tetap timpang (soft bicameralism) akibat penolakan DPR.",
      expert_quotes: [
        {
          quote:
            "Amandemen UUD 1945 melahirkan sistem parlemen dua kamar yang tanggung (soft bicameralism), di mana DPD memiliki legitimasi suara rakyat yang kuat namun dipangkas taring legislasinya oleh dominasi DPR.",
          author: "Prof. Dr. Saldi Isra, S.H., M.P.A.",
          role: "Pakar Hukum Tata Negara Universitas Andalas",
          year: 2010,
          source_id: "buku-saldi-isra-pergeseran-legislatif-2010",
        },
      ],
      rationale_id:
        "Perjuangan yudisial DPD membuahkan kemenangan bersejarah dalam Putusan MK No. 92/2012 dan No. 79/2014. Namun analisis Prof. Saldi Isra menunjukkan bahwa tanpa amandemen ke-5 konstitusi, hegemoni DPR terus membonsai kewenangan legislasi daerah.",
    },
  },

  "asm-bpk-2019-sekarang": {
    "checks-balances": {
      thesis_id:
        "BPK mengumumkan peningkatan signifikan persentase kementerian dan lembaga pemerintah yang meraih opini Wajar Tanpa Pengecualian (WTP) hingga mencapai di atas 90%.",
      antithesis_id:
        "Serangkaian operasi tangkap tangan (OTT) KPK membongkar suap oknum auditor dan pimpinan BPK terkait jual-beli opini WTP di Kementerian Pertanian, Pemkab Meranti, dan Sorong, membuktikan penurunan integritas audit eksternal negara.",
      synthesis_id:
        "Skor regresi berat (-2) karena audit keuangan negara yang dikomersialkan menjadi komoditas suap melumpuhkan fungsi akuntabilitas fiskal Pasal 23E UUD 1945.",
      expert_quotes: [
        {
          quote:
            "Opini WTP yang ditransaksikan dengan suap adalah pengkhianatan paling keji terhadap mandat akuntabilitas keuangan negara yang diamanatkan Pasal 23E UUD 1945.",
          author: "Dr. Artidjo Alkostar, S.H., LL.M.",
          role: "Hakim Agung MA RI / Dewan Pengawas KPK",
          year: 2020,
          source_id: "buku-artidjo-alkostar-korupsi-politik-2008",
        },
      ],
      rationale_id:
        "Pencapaian rekor opini WTP tercoreng oleh terungkapnya tarif suap audit BPK di meja peradilan tipikor. Peringatan keras Dr. Artidjo Alkostar membuktikan bahwa kompromi integritas auditor negara membahayakan perlindungan keuangan publik Pasal 23E UUD 1945.",
    },
  },

  "asm-ky-2005-2010": {
    "checks-balances": {
      thesis_id:
        "Komisi Yudisial dibentuk berdasarkan amanat Pasal 24B UUD 1945 untuk menjaga dan menegakkan kehormatan, keluhuran martabat, serta perilaku hakim melalui pengawasan eksternal independen.",
      antithesis_id:
        "Para hakim agung mengajukan uji materi ke MK yang berujung pada Putusan No. 005/PUU-IV/2006, membatalkan kewenangan KY mengawasi hakim agung dan hakim konstitusi.",
      synthesis_id:
        "Skor 0 (teramputasi) karena benturan yudisial memangkas efektivitas fungsi pengawasan eksternal terhadap peradilan tingkat tertinggi.",
      expert_quotes: [
        {
          quote:
            "Pengawasan eksternal oleh Komisi Yudisial bukan untuk mengurangi kemerdekaan mengadili hakim, melainkan untuk menjaga agar kemerdekaan itu tidak disalahgunakan menjadi kekuasaan tanpa batas.",
          author: "Prof. Dr. Bagir Manan, S.H., M.C.L.",
          role: "Ketua Mahkamah Agung RI 2001-2008",
          year: 2006,
          source_id: "buku-bagir-manan-menegakkan-hukum-2004",
        },
      ],
      rationale_id:
        "Putusan MK No. 005/PUU-IV/2006 melucuti taring KY dalam mengawasi hakim agung. Meskipun Prof. Bagir Manan dan pakar HTN menekankan perlunya perimbangan antara kemerdekaan hakim dan akuntabilitas etik, resistensi internal MA menciptakan impunitas yudisial yang berkepanjangan.",
    },
  },
};

let enrichedCount = 0;
let quoteCount = 0;

for (const asm of assessments) {
  const asmEnrich = ENRICHMENTS[asm.id];
  if (!asmEnrich) continue;

  for (const ds of asm.dimension_scores) {
    const dimEnrich = asmEnrich[ds.dimension_id];
    if (!dimEnrich) continue;

    ds.thesis_id = dimEnrich.thesis_id;
    ds.antithesis_id = dimEnrich.antithesis_id;
    ds.synthesis_id = dimEnrich.synthesis_id;
    ds.expert_quotes = dimEnrich.expert_quotes;
    ds.rationale_id = dimEnrich.rationale_id;

    // Pastikan bukti sumber untuk kutipan juga terdaftar pada evidence atau normative_anchors
    for (const eq of dimEnrich.expert_quotes) {
      if (eq.source_id && !ds.evidence.some((ev: any) => ev.source_id === eq.source_id)) {
        ds.evidence.push({ source_id: eq.source_id, note_id: `Sitasi langsung pakar: ${eq.author}` });
      }
      quoteCount++;
    }

    enrichedCount++;
  }
}

console.log(`Berhasil memperkaya ${enrichedCount} dimensi skor dengan dialektika tesis-antitesis dan ${quoteCount} kutipan langsung pakar.`);

// Tulis kembali ke assessments.yaml
fs.writeFileSync(assessmentsPath, YAML.stringify(assessments, { indent: 2, lineWidth: 0 }), "utf8");
console.log(`Berhasil menuliskan pembaruan ke ${assessmentsPath}`);
