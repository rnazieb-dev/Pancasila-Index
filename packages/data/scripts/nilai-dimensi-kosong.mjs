import fs from "node:fs";
import { parse, stringify } from "yaml";
const DATA = new URL("../data/", import.meta.url).pathname;
const P = `${DATA}assessments.yaml`;
const arr = parse(fs.readFileSync(P, "utf8"));
const E = (...ids) => ids.map((id) => ({ source_id: id }));

/*
 * Mengisi 28 skor dimensi yang kosong pada 6 asesmen lembaga legislatif.
 * Skor 0 dipakai HANYA dalam artinya menurut rubrik - "tidak ada tindakan
 * signifikan" - dan selalu disertai evidence_gap: true, yang mengeluarkannya
 * dari perhitungan indeks. Mengosongkan bukti tidak menguntungkan siapa pun.
 */
const NILAI = {
  "asm-dpd-2024-sekarang": {
    "sila-1": { score: 0, confidence: 0.4, evidence_gap: true, evidence: [],
      rationale_id: "Tidak ditemukan satu pun tindakan DPD periode ini yang menyentuh fasilitasi kehidupan beragama atau relasi negara dengan umat beragama. Kewenangan DPD memang tidak mencakup bidang ini, tetapi ketiadaan tindakan tetap dicatat sebagai ketiadaan temuan, bukan sebagai kinerja netral yang memuaskan.",
      thesis_id: "Dalil formalnya: Pasal 22D UUD 1945 membatasi kewenangan DPD pada rancangan undang-undang tertentu yang berkaitan dengan otonomi daerah dan hubungan pusat-daerah, sehingga urusan keagamaan berada di luar mandat konstitusionalnya.",
      antithesis_id: "Pembatasan mandat tidak menutup fungsi pengawasan dan penyampaian pertimbangan yang tetap dimiliki DPD, dan isu keagamaan di daerah - dari perizinan rumah ibadah sampai konflik kebinekaan - jelas beririsan dengan hubungan pusat-daerah yang menjadi wilayahnya.",
      synthesis_id: "Skor Netral (0) karena tidak ada tindakan signifikan yang tercatat, disertai evidence_gap sehingga dimensi ini dikeluarkan dari perhitungan indeks sampai ada bukti." },
    "sila-2": { score: 1, confidence: 0.6,
      rationale_id: "DPD mengawasi dampak sosial pembangunan Ibu Kota Nusantara terhadap masyarakat adat dan mendorong percepatan pengesahan RUU Masyarakat Hukum Adat masuk Prolegnas. Dua tindakan itu menyasar kelompok yang paling lemah posisinya dalam proyek negara berskala besar, dan dilakukan ketika lembaga lain tidak mengangkatnya.",
      thesis_id: "Dalil formalnya: DPD menjalankan fungsi pengawasan atas pelaksanaan undang-undang yang berkaitan dengan otonomi daerah sebagaimana Pasal 22D ayat (3) UUD 1945, dan menyampaikan hasilnya sebagai pertimbangan kepada DPR.",
      antithesis_id: "Pengawasan DPD berhenti sebagai pertimbangan yang tidak mengikat: RUU Masyarakat Hukum Adat sudah diusulkan lintas periode tanpa pernah disahkan, dan pembangunan IKN berjalan terus tanpa perubahan yang dapat ditelusuri ke temuan DPD.",
      synthesis_id: "Skor Baik (+1) karena isu hak masyarakat adat diangkat secara konkret dan berulang oleh lembaga yang paling sedikit kewenangannya, meski dampaknya terbatas pada agenda, belum pada kebijakan.",
      evidence: E("laporan-dpd-pengawasan-ikn-2024"),
      event_ids: ["ev-dpd-pengawasan-adat-ikn-2024", "ev-dpd-posisi-ruu-masyarakat-adat-2025"] },
    "tujuan-3": { score: 1, confidence: 0.6,
      rationale_id: "DPD mendesak penataan mandat 20 persen anggaran pendidikan dalam APBN agar benar-benar sampai ke sekolah dasar, bukan tersebar ke pos yang secara akuntansi masuk kategori pendidikan tetapi tidak menyentuh ruang kelas. Ini menyasar persoalan yang sudah lama diketahui namun jarang dipersoalkan secara kelembagaan.",
      thesis_id: "Dalil formalnya: Pasal 31 ayat (4) UUD 1945 mewajibkan negara memprioritaskan anggaran pendidikan sekurang-kurangnya 20 persen dari APBN dan APBD, dan pemerintah melaporkan mandat itu terpenuhi setiap tahun.",
      antithesis_id: "Angka 20 persen terpenuhi secara akuntansi tetapi tidak secara substansi: sebagian besar dialokasikan ke transfer daerah dan belanja pegawai, sehingga capaian formal justru menutupi kekurangan pembiayaan pada satuan pendidikan yang dituju perintah konstitusi.",
      synthesis_id: "Skor Baik (+1) karena DPD mempersoalkan mutu pemenuhan mandat konstitusional, bukan sekadar angkanya - persis pembacaan yang dibutuhkan Pasal 31 ayat (4).",
      evidence: E("laporan-dpd-guru-honorer-2022"),
      event_ids: ["ev-dpd-evaluasi-anggaran-pendidikan-2025"] },
    "tujuan-4": { score: 0, confidence: 0.4, evidence_gap: true, evidence: [],
      rationale_id: "Tidak ada catatan keterlibatan DPD periode ini dalam politik luar negeri, diplomasi parlemen, atau pertimbangan atas ratifikasi perjanjian internasional. Ketiadaan ini konsisten dengan mandat Pasal 22D yang tidak menyebut hubungan luar negeri.",
      thesis_id: "Dalil formalnya: kewenangan legislasi DPD dibatasi pada bidang otonomi daerah, pembentukan dan pemekaran daerah, hubungan pusat-daerah, pengelolaan sumber daya alam, serta perimbangan keuangan - hubungan luar negeri berada di luar daftar itu.",
      antithesis_id: "Sejumlah perjanjian internasional yang diratifikasi berdampak langsung pada pengelolaan sumber daya alam dan perimbangan keuangan daerah, sehingga ketiadaan pertimbangan DPD di ranah itu bukan sepenuhnya persoalan mandat melainkan juga pilihan untuk tidak menggunakannya.",
      synthesis_id: "Skor Netral (0) karena tidak ada tindakan signifikan yang tercatat, disertai evidence_gap sehingga dimensi ini tidak ikut menghitung indeks." },
  },

  "asm-mprs-1959-1971": {
    "sila-3": { score: 0, confidence: 0.4, evidence_gap: true, evidence: [],
      rationale_id: "Tidak ditemukan ketetapan MPRS periode ini yang menyentuh keadilan antarwilayah, otonomi daerah, atau pengelolaan kebinekaan. Sidang-sidang MPRS terpusat pada persoalan kekuasaan nasional, sementara pemberontakan daerah pada awal periode ini diselesaikan lewat operasi militer dan penetapan presiden, bukan lewat majelis.",
      thesis_id: "Dalil formalnya: MPRS sebagai lembaga tertinggi negara menetapkan Garis-Garis Besar Haluan Negara yang secara normatif mencakup seluruh bidang penyelenggaraan negara, termasuk pembangunan daerah.",
      antithesis_id: "Haluan yang mencakup segalanya secara normatif tidak berarti ada tindakan yang dapat diperiksa: tidak ada ketetapan MPRS periode ini yang menjadi dasar penataan hubungan pusat-daerah, dan pembentukan serta penghapusan daerah justru berjalan lewat penetapan presiden.",
      synthesis_id: "Skor Netral (0) karena tidak ada tindakan signifikan yang tercatat, disertai evidence_gap sehingga dimensi ini dikeluarkan dari perhitungan indeks." },
    "sila-4": { score: -1, confidence: 0.7,
      rationale_id: "MPRS adalah majelis yang seluruh anggotanya diangkat Presiden, bukan hasil pemilu - lembaga yang menurut UUD memegang kedaulatan rakyat justru dibentuk oleh pihak yang seharusnya diawasinya. Pada 1966-1967 majelis yang sama akhirnya menjalankan fungsi konstitusionalnya: menetapkan Pancasila sebagai sumber tertib hukum lewat TAP XX/MPRS/1966 dan mencabut kekuasaan Presiden Soekarno lewat TAP XXXIII/MPRS/1967. Koreksi itu nyata, tetapi datang setelah delapan tahun.",
      thesis_id: "Dalil formalnya: MPRS dibentuk berdasarkan Dekrit Presiden 5 Juli 1959 sebagai majelis sementara sampai pemilu dapat diselenggarakan, dan seluruh ketetapannya diambil melalui musyawarah untuk mufakat dalam sidang umum.",
      antithesis_id: "Musyawarah di antara orang-orang yang diangkat oleh pihak yang dimusyawarahkan bukan permusyawaratan perwakilan: majelis ini menetapkan Soekarno sebagai presiden seumur hidup lewat TAP III/MPRS/1963, keputusan yang bertentangan dengan pembatasan masa jabatan dan mustahil lahir dari majelis yang mandatnya berasal dari pemilih.",
      synthesis_id: "Skor Buruk (-1) sebagai neto: pengangkatan anggota dan penetapan presiden seumur hidup menggerus kerakyatan secara berat, tetapi majelis yang sama akhirnya memakai kewenangannya untuk mencabut kekuasaan itu - dua temuan berlawanan, bukan nol temuan.",
      evidence: E("anri-risalah-sidang-mprs-1967", "tap-mprs-xxxiii-1967"),
      event_ids: ["ev-mprs-tap-xx-1966", "ev-mpr-tap-xxxiii-1967"] },
    "tujuan-3": { score: 0, confidence: 0.4, evidence_gap: true, evidence: [],
      rationale_id: "Tidak ada ketetapan MPRS periode ini yang tercatat menyentuh pendidikan, kebudayaan, atau ilmu pengetahuan sebagai bidang tersendiri. Kebijakan pendidikan periode ini bergerak lewat undang-undang dan keputusan presiden, tidak lewat majelis.",
      thesis_id: "Dalil formalnya: penetapan haluan negara oleh MPRS secara normatif membawahi seluruh bidang pembangunan, sehingga arah pendidikan nasional dianggap sudah tercakup di dalamnya tanpa perlu ketetapan tersendiri.",
      antithesis_id: "Cakupan normatif tanpa ketetapan yang dapat disitasi tidak bisa dinilai: bila haluan itu sungguh mengarahkan pendidikan, mestinya ada dokumen majelis yang menjadi rujukan kebijakan - dan tidak ada.",
      synthesis_id: "Skor Netral (0) karena tidak ada tindakan signifikan yang tercatat, disertai evidence_gap sehingga dimensi ini tidak ikut menghitung indeks." },
    "tujuan-4": { score: 0, confidence: 0.4, evidence_gap: true, evidence: [],
      rationale_id: "Tidak ditemukan ketetapan MPRS yang menjadi dasar politik luar negeri periode ini. Keputusan besar - konfrontasi dengan Malaysia, keluarnya Indonesia dari PBB pada 1965 - diambil dan diumumkan Presiden, bukan ditetapkan majelis.",
      thesis_id: "Dalil formalnya: haluan negara yang ditetapkan MPRS memuat garis politik luar negeri bebas-aktif sebagai bagian dari arah penyelenggaraan negara secara keseluruhan.",
      antithesis_id: "Keluarnya Indonesia dari Perserikatan Bangsa-Bangsa pada 1965 adalah keputusan politik luar negeri paling berat sepanjang sejarah republik, dan majelis yang mengaku menetapkan haluan negara tidak tercatat membahas, menyetujui, maupun mengoreksinya.",
      synthesis_id: "Skor Netral (0) karena tidak ada tindakan majelis yang dapat dinilai, disertai evidence_gap sehingga dimensi ini dikeluarkan dari perhitungan indeks." },
  },

  "asm-dpr-knip-1945-1950": {
    "sila-5": { score: 1, confidence: 0.6,
      rationale_id: "Di tengah perang kemerdekaan, KNIP mengesahkan pengawasan perburuhan - negara mewajibkan diri memeriksa keselamatan dan syarat kerja di perusahaan. Jangkauannya terbatas pada wilayah yang masih dikuasai republik dan penegakannya minim, tetapi arah normanya menempatkan buruh sebagai pihak yang dilindungi hukum pada saat republik sendiri belum pasti bertahan.",
      thesis_id: "Dalil formalnya: Pasal 27 ayat (2) UUD 1945 menjamin hak setiap warga negara atas pekerjaan dan penghidupan yang layak, dan pengawasan perburuhan adalah instrumen pertama yang dibentuk republik untuk menjalankannya.",
      antithesis_id: "Undang-undang perlindungan yang tidak dapat ditegakkan hanya berlaku di atas kertas: wilayah republik menyusut akibat blokade dan dua agresi militer Belanda, aparat pengawas nyaris tidak ada, dan sebagian besar buruh perkebunan justru berada di wilayah yang dikuasai pihak lawan.",
      synthesis_id: "Skor Baik (+1) karena norma perlindungan buruh ditetapkan lebih dulu daripada kemampuan menegakkannya - pilihan yang menentukan watak republik, meski hasil praktisnya pada masa itu kecil.",
      evidence: E("jdih-uu-23-1948"), event_ids: ["ev-jdih-uu-23-1948"] },
    "tujuan-3": { score: 1, confidence: 0.62,
      rationale_id: "KNIP memusatkan segala urusan sekolah pada kementerian, mengakhiri warisan pendidikan kolonial yang terbelah menurut golongan penduduk dengan mutu dan akses berbeda-beda. Pemusatan inilah yang memungkinkan satu kurikulum kebangsaan, meski pelaksanaannya baru berjalan setelah pengakuan kedaulatan.",
      thesis_id: "Dalil formalnya: Pasal 31 UUD 1945 menyatakan tiap warga negara berhak mendapat pengajaran dan pemerintah mengusahakan satu sistem pengajaran nasional yang diatur undang-undang.",
      antithesis_id: "Satu sistem pengajaran ditetapkan ketika sebagian besar sekolah berada di wilayah pendudukan, guru terserap ke perjuangan bersenjata, dan anggaran republik tidak mencukupi - sehingga yang lahir adalah kerangka hukum, bukan sistem yang benar-benar beroperasi.",
      synthesis_id: "Skor Baik (+1) karena pembelahan pendidikan menurut golongan penduduk dihapus di tingkat norma, langkah yang menjadi dasar seluruh sistem pendidikan nasional sesudahnya.",
      evidence: E("jdih-uu-32-1947"), event_ids: ["ev-jdih-uu-32-1947"] },
    "tujuan-4": { score: 1, confidence: 0.58,
      rationale_id: "KNIP meratifikasi perjanjian persahabatan dengan negara lain ketika pengakuan atas republik masih diperebutkan. Tiap traktat berfungsi ganda: perjanjian bilateral sekaligus bukti bahwa Indonesia bertindak sebagai subjek hukum internasional yang cakap - argumen yang dipakai melawan klaim Belanda bahwa republik hanyalah pemberontakan dalam negeri.",
      thesis_id: "Dalil formalnya: Pembukaan UUD 1945 alinea IV menempatkan keikutsertaan melaksanakan ketertiban dunia sebagai tujuan bernegara, dan pengesahan perjanjian internasional oleh lembaga perwakilan adalah bentuk paling awal pelaksanaannya.",
      antithesis_id: "Diplomasi periode ini berjalan dalam posisi yang sangat lemah: republik menandatangani Linggarjati dan Renville dari posisi terdesak, kehilangan wilayah pada tiap perundingan, dan pengakuan kedaulatan baru datang setelah tekanan internasional atas Agresi Militer II - bukan karena keberhasilan traktat-traktat itu sendiri.",
      synthesis_id: "Skor Baik (+1) karena republik konsisten memilih jalur hukum internasional bahkan dari posisi tawar terlemah, dan kecakapannya sebagai subjek hukum itulah yang akhirnya diakui.",
      evidence: E("jdih-uu-2-1948"), event_ids: ["ev-jdih-uu-2-1948"] },
    "checks-balances": { score: 1, confidence: 0.65,
      rationale_id: "Susunan dan kekuasaan Mahkamah Agung ditetapkan pada Februari 1947, ketika ibu kota baru pindah ke Yogyakarta dan pengadilan republik nyaris tanpa gedung maupun arsip. KNIP tetap mendirikan puncak kekuasaan kehakiman yang terpisah dari eksekutif - menetapkan bahwa republik memilih bentuk negara hukum sebelum ia aman secara militer.",
      thesis_id: "Dalil formalnya: Pasal 24 UUD 1945 menyatakan kekuasaan kehakiman dilakukan oleh sebuah Mahkamah Agung dan badan peradilan lain yang susunannya ditetapkan undang-undang - perintah yang dijalankan KNIP pada kesempatan pertama.",
      antithesis_id: "Pada periode yang sama KNIP sendiri berubah fungsi dari badan pembantu presiden menjadi badan legislatif lewat Maklumat X, dan kabinet berganti-ganti dengan cepat; pemisahan kekuasaan yang rapi di atas kertas berjalan di atas struktur ketatanegaraan yang belum mapan dan sering berubah lewat maklumat, bukan undang-undang.",
      synthesis_id: "Skor Baik (+1) karena kemerdekaan kekuasaan kehakiman dilembagakan sejak awal dan bertahan sebagai rujukan, meski keseimbangan antarlembaga lain periode ini masih berubah-ubah.",
      evidence: E("jdih-uu-7-1947"), event_ids: ["ev-jdih-uu-7-1947"] },
  },

  "asm-dpr-1950-1960": {
    "sila-3": { score: 2, confidence: 0.7,
      rationale_id: "UU No. 1 Tahun 1957 meletakkan otonomi daerah seluas-luasnya: daerah memilih sendiri kepala daerahnya dan menjalankan urusan rumah tangganya, kebalikan dari pola pengangkatan dari pusat. Parlemen juga menata pembentukan daerah lewat undang-undang, bukan keputusan sepihak - prosedur yang sepenuhnya ditinggalkan pada era berikutnya.",
      thesis_id: "Dalil formalnya: Pasal 18 UUD 1945 dan ketentuan UUDS 1950 memerintahkan pembagian daerah atas daerah besar dan kecil dengan memandang dasar permusyawaratan dalam sistem pemerintahan negara serta hak asal-usul daerah yang bersifat istimewa.",
      antithesis_id: "Otonomi seluas-luasnya diberikan ketika sebagian daerah justru sedang bergerak ke arah pemberontakan bersenjata - PRRI dan Permesta pecah tidak lama sesudahnya - sehingga desentralisasi berjalan bersamaan dengan krisis keutuhan wilayah dan akhirnya dipakai sebagai alasan untuk membatalkannya lewat Dekrit 1959.",
      synthesis_id: "Skor Sangat Baik (+2) karena keadilan antarwilayah dijawab dengan penyerahan kewenangan sungguhan disertai pemilihan kepala daerah, tingkat desentralisasi yang belum pernah dilampaui republik sesudahnya.",
      evidence: E("uu-1-1957-pemda", "jdih-uu-17-1950"),
      event_ids: ["ev-uu-pemda-desentralisasi-1957", "ev-jdih-uu-17-1950"] },
    "sila-5": { score: 1, confidence: 0.58,
      rationale_id: "Pengawasan perburuhan yang lahir di masa revolusi dinyatakan berlaku untuk seluruh wilayah Indonesia setelah pengakuan kedaulatan, termasuk bekas daerah negara-negara bagian RIS. Satu norma perlindungan buruh menggantikan aturan yang sebelumnya berbeda-beda antarwilayah.",
      thesis_id: "Dalil formalnya: pemulihan negara kesatuan mensyaratkan unifikasi hukum, dan pemberlakuan satu aturan perlindungan buruh di seluruh wilayah adalah pelaksanaan langsung dari asas persamaan kedudukan warga negara.",
      antithesis_id: "Unifikasi norma tidak diikuti pemerataan kemampuan menegakkannya: pengawas perburuhan terkonsentrasi di Jawa, sementara buruh perkebunan di Sumatera dan Indonesia bagian timur - yang justru paling rentan - berada jauh dari jangkauan aparat pengawas.",
      synthesis_id: "Skor Baik (+1) karena perlindungan buruh diperluas menjadi hak yang sama di seluruh wilayah, meski penegakannya timpang antardaerah.",
      evidence: E("jdih-uu-3-1951"), event_ids: ["ev-jdih-uu-3-1951"] },
    "tujuan-3": { score: 0, confidence: 0.42, evidence_gap: true, evidence: [],
      rationale_id: "Tidak ditemukan undang-undang periode ini yang menata sistem pendidikan nasional secara menyeluruh; yang ada bersifat penyerahan urusan administratif. Perluasan sekolah rakyat pada dasawarsa ini berjalan lewat kebijakan kementerian, bukan lewat legislasi parlemen yang dapat dinilai di sini.",
      thesis_id: "Dalil formalnya: pengaturan pengajaran nasional telah ditetapkan lewat undang-undang pendidikan warisan periode sebelumnya, sehingga parlemen periode ini menganggap kerangka dasarnya sudah tersedia dan cukup.",
      antithesis_id: "Anggapan bahwa kerangka lama memadai tidak diuji: angka buta huruf pada awal 1950-an masih di atas separuh penduduk, dan persoalan sebesar itu tidak menghasilkan satu pun undang-undang pendidikan baru dari parlemen sepanjang sepuluh tahun.",
      synthesis_id: "Skor Netral (0) karena tidak ada tindakan legislatif signifikan yang tercatat, disertai evidence_gap sehingga dimensi ini dikeluarkan dari perhitungan indeks." },
    "tujuan-4": { score: 0, confidence: 0.42, evidence_gap: true, evidence: [],
      rationale_id: "Undang-undang bidang luar negeri periode ini didominasi pengesahan perjanjian pinjaman dan pembebasan bea - urusan teknis-ekonomi, bukan sikap politik luar negeri. Konferensi Asia-Afrika 1955, capaian diplomasi terbesar periode ini, adalah inisiatif pemerintah dan tidak lahir dari produk legislasi parlemen.",
      thesis_id: "Dalil formalnya: politik luar negeri merupakan ranah eksekutif, dan peran parlemen terbatas pada pengesahan perjanjian internasional yang diajukan pemerintah kepadanya.",
      antithesis_id: "Batasan peran itu tidak menghalangi parlemen menyatakan sikap atas persoalan besar - sengketa Irian Barat berlangsung sepanjang periode ini tanpa satu pun produk legislasi yang menjadi dasar posisi Indonesia, sehingga ketiadaan ini bukan semata soal pembagian kewenangan.",
      synthesis_id: "Skor Netral (0) karena tidak ada tindakan legislatif yang dapat dinilai sebagai sikap politik luar negeri, disertai evidence_gap sehingga tidak ikut menghitung indeks." },
    "checks-balances": { score: 1, confidence: 0.62,
      rationale_id: "Susunan, kekuasaan, dan jalan pengadilan Mahkamah Agung disusun ulang bagi negara kesatuan yang baru dipulihkan dari bentuk federal RIS. Parlemen menetapkan sendiri batas kewenangan puncak yudikatif termasuk kasasi atas seluruh lingkungan peradilan - fondasi yang bertahan sampai reformasi.",
      thesis_id: "Dalil formalnya: pemulihan negara kesatuan pada 17 Agustus 1950 menuntut penataan ulang lembaga-lembaga warisan RIS, dan penataan kekuasaan kehakiman dilakukan lewat undang-undang yang dibahas di parlemen.",
      antithesis_id: "Keseimbangan antarlembaga periode ini rapuh di sisi lain: kabinet parlementer berganti tujuh kali dalam sembilan tahun, sehingga pengawasan parlemen atas eksekutif lebih sering berwujud penjatuhan kabinet daripada koreksi kebijakan yang berkelanjutan.",
      synthesis_id: "Skor Baik (+1) karena kemerdekaan dan jangkauan kekuasaan kehakiman ditetapkan secara tegas lewat undang-undang, meski hubungan eksekutif-legislatif periode ini sendiri tidak stabil.",
      evidence: E("jdih-uu-1-1950"), event_ids: ["ev-jdih-uu-1-1950"] },
  },

  "asm-dpr-gr-1960-1971": {
    "sila-2": { score: -2, confidence: 0.7,
      rationale_id: "DPR-GR lahir dari pembubaran DPR hasil Pemilu 1955 oleh Presiden setelah parlemen menolak anggaran - lembaga perwakilan dibubarkan karena menggunakan haknya, lalu diganti dengan lembaga yang seluruh anggotanya diangkat. Sepanjang periode ini penahanan tanpa proses pengadilan berlangsung luas, dan tidak ada satu pun produk legislasi DPR-GR yang menyediakan mekanisme perlindungan atau pemulihan bagi korbannya.",
      thesis_id: "Dalil formalnya: pembentukan DPR-GR didasarkan pada Penetapan Presiden yang dinyatakan sebagai pelaksanaan Dekrit 5 Juli 1959, dan lembaga ini tetap menjalankan fungsi legislasi bersama pemerintah sebagaimana diperintahkan UUD 1945.",
      antithesis_id: "Lembaga yang anggotanya diangkat oleh pihak yang seharusnya diawasinya tidak dapat melindungi warga dari pihak itu: ketika penahanan politik berlangsung tanpa pengadilan sepanjang periode ini, dan memuncak pada pembunuhan massal 1965-1966, tidak ada satu pun inisiatif legislasi dari DPR-GR yang menyentuhnya.",
      synthesis_id: "Skor pelanggaran berat (-2) karena lembaga perwakilan tidak berfungsi sama sekali sebagai pelindung hak warga pada periode dengan pelanggaran hak asasi paling berat dalam sejarah republik.",
      evidence: E("jdih-uu-13-1964"), event_ids: ["ev-jdih-uu-13-1964"] },
    "sila-3": { score: -1, confidence: 0.62,
      rationale_id: "Fungsi legislasi DPR-GR bergeser menjadi peratifikasi: Presiden menerbitkan Peraturan Pemerintah Pengganti Undang-Undang lebih dulu, lembaga perwakilan mengesahkannya belakangan - pola yang berulang sepanjang 1964. Akibatnya penataan wilayah dan hubungan pusat-daerah ditentukan sepihak dari pusat, membalik desentralisasi UU 1/1957 yang baru berumur beberapa tahun.",
      thesis_id: "Dalil formalnya: Pasal 22 UUD 1945 membolehkan Presiden menetapkan Peraturan Pemerintah Pengganti Undang-Undang dalam kegentingan yang memaksa, dengan persetujuan DPR pada persidangan berikutnya - dan persetujuan itu memang diberikan.",
      antithesis_id: "Kegentingan yang memaksa berubah menjadi cara kerja sehari-hari: 120 Perpu terbit pada periode kepresidenan ini, sepuluh kali lipat presiden mana pun, sehingga persetujuan DPR-GR bukan pengujian melainkan pengesahan atas norma yang sudah berlaku dan tidak mungkin ditolak.",
      synthesis_id: "Skor Buruk (-1) karena penataan hubungan pusat-daerah ditarik kembali ke pusat lewat instrumen sepihak, menggerus otonomi yang baru saja diletakkan tanpa mekanisme pengganti.",
      evidence: E("jdih-uu-13-1964"), event_ids: ["ev-jdih-uu-13-1964"] },
    "tujuan-3": { score: 0, confidence: 0.5,
      rationale_id: "UU Perguruan Tinggi 1961 menetapkan kerangka universitas nasional - otonomi keilmuan, tridarma, dan pembinaan negara. Pada periode yang sama kampus menjadi arena mobilisasi politik dan tekanan agar perguruan tinggi menyelaraskan diri dengan garis politik negara berlangsung terbuka. Penguatan kelembagaan dan penggerusan kebebasan akademik berjalan bersamaan.",
      thesis_id: "Dalil formalnya: undang-undang ini untuk pertama kalinya memberi dasar hukum nasional bagi perguruan tinggi Indonesia, menetapkan tridarma dan mengakui otonomi keilmuan sebagai asas penyelenggaraannya.",
      antithesis_id: "Otonomi keilmuan yang dijanjikan pasal-pasalnya berjalan bersamaan dengan keharusan menyelaraskan diri pada garis politik negara: organisasi mahasiswa berafiliasi partai menguasai kampus, dan pengangkatan pimpinan perguruan tinggi tidak lepas dari pertimbangan politik.",
      synthesis_id: "Skor Netral (0) sebagai neto dari dua temuan yang berlawanan dan sebanding: kerangka hukum perguruan tinggi nasional berdiri untuk pertama kalinya, sementara kebebasan akademik yang menjadi syarat hidupnya justru tertekan pada periode yang sama.",
      evidence: E("jdih-uu-22-1961"), event_ids: ["ev-jdih-uu-22-1961"] },
    "tujuan-4": { score: -1, confidence: 0.6,
      rationale_id: "DPR-GR mengesahkan perjanjian ekonomi internasional berdampak jangka panjang di sektor sumber daya alam tanpa lembaga perwakilan hasil pemilu. Pada periode yang sama Indonesia berkonfrontasi dengan Malaysia dan keluar dari Perserikatan Bangsa-Bangsa pada 1965 - keputusan politik luar negeri terberat sepanjang sejarah republik, yang tidak tercatat dibahas maupun dikoreksi lembaga ini.",
      thesis_id: "Dalil formalnya: pengesahan perjanjian internasional oleh DPR-GR memenuhi syarat konstitusional bahwa perjanjian yang menimbulkan akibat luas bagi negara memerlukan persetujuan lembaga perwakilan.",
      antithesis_id: "Persetujuan dari lembaga yang anggotanya diangkat tidak memberi legitimasi tambahan apa pun: politik luar negeri bebas-aktif justru ditinggalkan pada periode ini lewat poros yang memihak dan penarikan diri dari PBB, tanpa satu pun keberatan dari lembaga yang secara formal menyetujuinya.",
      synthesis_id: "Skor Buruk (-1) karena keikutsertaan melaksanakan ketertiban dunia ditinggalkan justru saat lembaga perwakilan kehilangan kemampuan mengoreksinya.",
      evidence: E("jdih-uu-14-1963"), event_ids: ["ev-jdih-uu-14-1963"] },
  },

  "asm-dpr-1971-1999": {
    "sila-1": { score: 1, confidence: 0.6,
      rationale_id: "UU Perkawinan 1974 mengakhiri pluralisme hukum perkawinan warisan kolonial dan menegaskan sah tidaknya perkawinan ditentukan hukum agama masing-masing, dengan pencatatan negara sebagai syarat administratif. Kewenangan peradilan agama diperkuat. Pada akhir periode ini menyusul UU Pengelolaan Zakat dan UU Penyelenggaraan Ibadah Haji.",
      thesis_id: "Dalil formalnya: Pasal 29 UUD 1945 menyatakan negara berdasar atas Ketuhanan Yang Maha Esa dan menjamin kemerdekaan tiap penduduk memeluk agamanya, sehingga pengakuan hukum agama dalam urusan perkawinan adalah pelaksanaan langsung dari pasal itu.",
      antithesis_id: "Rancangan awalnya justru hendak menyeragamkan perkawinan secara sekuler dan memicu penolakan luas sampai terjadi insiden di gedung DPR pada 1973; naskah akhirnya adalah hasil tekanan dari luar parlemen, bukan inisiatif DPR sendiri. Ketentuan poligami dan batas usia kawin yang lolos di dalamnya meninggalkan persoalan perlindungan perempuan selama lima dasawarsa.",
      synthesis_id: "Skor Baik (+1) karena kedudukan hukum agama dan peradilan agama memperoleh dasar undang-undang yang bertahan sampai kini, meski capaian itu datang lewat koreksi dari luar parlemen dan menyisakan cacat perlindungan.",
      evidence: E("jdih-uu-1-1974"), event_ids: ["ev-jdih-uu-1-1974"] },
    "sila-3": { score: -2, confidence: 0.72,
      rationale_id: "UU Pemerintahan Desa 1979 menyeragamkan seluruh satuan pemerintahan terendah mengikuti satu model tunggal, menghapus nagari di Sumatera Barat, marga di Sumatera Selatan, dan puluhan bentuk pemerintahan adat lain yang berumur lebih tua dari republik. Keseragaman memudahkan pusat mengawasi desa, tetapi memutus struktur adat yang menjadi penopang identitas kewilayahan - dan pemulihannya setelah 1999 tidak pernah sepenuhnya berhasil karena satu generasi kepemimpinan adat sudah terputus.",
      thesis_id: "Dalil formalnya: penyeragaman pemerintahan desa dimaksudkan untuk memperkuat pemerintahan terendah agar mampu menggerakkan pembangunan dan memberi kepastian bentuk bagi seluruh desa di Indonesia.",
      antithesis_id: "Kepastian bentuk dibeli dengan penghapusan kebinekaan yang justru menjadi dasar Pasal 18 UUD 1945, yang memerintahkan negara memandang hak asal-usul daerah yang bersifat istimewa; nagari dan marga bukan variasi administratif melainkan susunan asli yang secara tegas dilindungi konstitusi.",
      synthesis_id: "Skor pelanggaran berat (-2) karena sentralisasi paksa menghapus susunan asli daerah yang dilindungi konstitusi, sesuai jangkar rubrik -2 tentang peresahan kebinekaan demi kemudahan politik pusat.",
      evidence: E("jdih-uu-5-1979"), event_ids: ["ev-jdih-uu-5-1979"] },
    "sila-5": { score: -1, confidence: 0.65,
      rationale_id: "Ketentuan pokok transmigrasi menjadikan pemindahan penduduk dari Jawa ke luar Jawa sebagai kebijakan negara berskala besar. Sebagian transmigran memang memperoleh tanah yang tidak mungkin mereka miliki di Jawa. Namun undang-undang ini tidak mengatur perlindungan hak masyarakat adat di daerah tujuan, sehingga pemerataan bagi satu kelompok dijalankan di atas tanah yang bagi kelompok lain adalah wilayah adat.",
      thesis_id: "Dalil formalnya: transmigrasi ditujukan untuk pemerataan penduduk, pembukaan lahan produktif, dan peningkatan taraf hidup - pelaksanaan Pasal 33 UUD 1945 tentang penggunaan bumi dan air bagi sebesar-besar kemakmuran rakyat.",
      antithesis_id: "Sebesar-besar kemakmuran rakyat tidak boleh dihitung dengan mengabaikan sebagian rakyat: undang-undang ini sama sekali tidak memuat mekanisme pengakuan atau ganti rugi atas tanah ulayat di daerah tujuan, dan konflik agraria yang lahir darinya masih berlangsung sampai hari ini.",
      synthesis_id: "Skor Buruk (-1) karena keadilan distributif dikejar dengan memindahkan beban ke kelompok lain yang haknya tidak diatur sama sekali - pemerataan yang menciptakan ketimpangan baru.",
      evidence: E("jdih-uu-3-1972"), event_ids: ["ev-jdih-uu-3-1972"] },
    "tujuan-1": { score: -2, confidence: 0.7,
      rationale_id: "UU Kepolisian 1997 menegaskan Polri sebagai bagian dari ABRI, bukan lembaga sipil tersendiri - penegakan hukum terhadap warga berada dalam satu struktur komando dengan kekuatan pertahanan, tepat pada tahun terakhir sebelum krisis 1998. Bersama UU Peradilan Militer yang disahkan pekan yang sama, dua undang-undang ini menutup jalur pertanggungjawaban sipil atas kekerasan aparat.",
      thesis_id: "Dalil formalnya: integrasi Polri dalam ABRI dipandang sebagai bentuk kesatuan pertahanan dan keamanan negara yang menyeluruh, sesuai doktrin pertahanan keamanan rakyat semesta yang berlaku sepanjang periode ini.",
      antithesis_id: "Menyatukan aparat penegak hukum terhadap warga dengan kekuatan tempur menghapus perbedaan antara musuh dan warga negara: pemisahan Polri dari TNI dua tahun kemudian lewat Ketetapan MPR adalah pengakuan resmi bahwa kerangka 1997 memang keliru, dan koreksi itu datang setelah kekerasan Mei 1998 terjadi.",
      synthesis_id: "Skor pelanggaran berat (-2) karena aparat yang seharusnya melindungi warga ditempatkan dalam struktur yang memperlakukan warga sebagai objek keamanan, sesuai jangkar rubrik -2.",
      evidence: E("jdih-uu-28-1997", "jdih-uu-31-1997"),
      event_ids: ["ev-jdih-uu-28-1997", "ev-jdih-uu-31-1997"] },
    "tujuan-2": { score: -1, confidence: 0.6,
      rationale_id: "DPR mengesahkan undang-undang APBN tiap tahun anggaran sepanjang Orde Baru tanpa satu kali pun menolak atau mengubahnya secara berarti. Fungsi anggaran dijalankan lengkap secara prosedural, tetapi persetujuan parlemen atas belanja negara berhenti pada pengesahan dan tidak sampai pada pengendalian - sementara temuan penyimpangan pengelolaan keuangan negara berulang tanpa konsekuensi politik.",
      thesis_id: "Dalil formalnya: Pasal 23 UUD 1945 mensyaratkan anggaran pendapatan dan belanja negara ditetapkan dengan undang-undang setiap tahun, dan syarat itu dipenuhi tanpa terputus selama hampir tiga dasawarsa.",
      antithesis_id: "Pemenuhan syarat tanpa pengujian membuat pasal itu kehilangan maksudnya: hak budget adalah alat kendali parlemen atas eksekutif, dan alat yang tidak pernah sekali pun dipakai untuk menolak atau memangkas berarti pengawasan atas belanja negara hanya ada di atas kertas.",
      synthesis_id: "Skor Buruk (-1) karena belanja negara disahkan tanpa kendali, sehingga kesejahteraan umum bergantung sepenuhnya pada kehendak eksekutif tanpa penyeimbang.",
      evidence: E("jdih-uu-1-1972"), event_ids: ["ev-jdih-uu-1-1972"] },
    "tujuan-3": { score: 0, confidence: 0.45, evidence_gap: true, evidence: [],
      rationale_id: "Undang-undang sistem pendidikan nasional periode ini tidak tercakup dalam korpus yang sudah terverifikasi, sehingga penilaian atas dimensi ini belum memiliki dasar bukti primer yang dapat disitasi. Kekosongan ini dinyatakan terbuka, bukan diisi dengan penilaian tanpa dasar.",
      thesis_id: "Dalil formalnya: pendidikan dasar diperluas secara masif sepanjang periode ini lewat program pembangunan sekolah dasar berskala nasional, dan angka partisipasi kasar meningkat tajam menurut laporan pemerintah.",
      antithesis_id: "Perluasan akses berjalan bersamaan dengan penyeragaman isi: penataran ideologi diwajibkan bagi guru dan siswa, dan penulisan sejarah nasional dikendalikan negara - sehingga menilai dimensi ini hanya dari angka partisipasi akan menutupi persoalan indoktrinasi yang justru disebut jangkar -2 rubrik.",
      synthesis_id: "Skor Netral (0) dengan evidence_gap: dua temuan berlawanan sama-sama kuat tetapi belum satu pun didukung dokumen primer dalam korpus, sehingga dimensi ini dikeluarkan dari perhitungan indeks sampai buktinya ada." },
    "tujuan-4": { score: -1, confidence: 0.6,
      rationale_id: "DPR mengesahkan perjanjian persahabatan bilateral pada 1976 - tahun yang sama ketika Timor Timur diintegrasikan lewat undang-undang setelah operasi militer yang tidak pernah memperoleh pengakuan Perserikatan Bangsa-Bangsa. Diplomasi persahabatan berjalan di satu meja sementara di meja lain Indonesia menghadapi resolusi Dewan Keamanan yang menyerukan penarikan pasukan.",
      thesis_id: "Dalil formalnya: Indonesia menjalankan politik luar negeri bebas-aktif, kembali ke Perserikatan Bangsa-Bangsa, menjadi pendiri ASEAN, dan meratifikasi rangkaian perjanjian persahabatan bilateral yang seluruhnya disahkan lewat undang-undang.",
      antithesis_id: "Rangkaian ratifikasi itu berjalan sementara Dewan Keamanan PBB mengeluarkan resolusi yang menyerukan penarikan pasukan Indonesia dari Timor Timur, dan DPR mengesahkan integrasinya tanpa perdebatan yang tercatat - keikutsertaan melaksanakan ketertiban dunia dijalankan selektif, pada perkara yang tidak menyentuh kepentingan sendiri.",
      synthesis_id: "Skor Buruk (-1) karena kewajiban internasional dipenuhi pada perkara yang mudah dan diabaikan pada perkara yang paling disorot dunia, tanpa satu pun koreksi dari lembaga perwakilan.",
      evidence: E("jdih-uu-6-1976"), event_ids: ["ev-jdih-uu-6-1976"] },
  },
};

let tambah = 0;
for (const [aid, dims] of Object.entries(NILAI)) {
  const a = arr.find((x) => x.id === aid);
  if (!a) throw new Error(`asesmen tidak ditemukan: ${aid}`);
  for (const [dim, isi] of Object.entries(dims)) {
    if (a.dimension_scores.some((s) => s.dimension_id === dim)) { console.log(`  lewat (sudah ada): ${aid}/${dim}`); continue; }
    a.dimension_scores.push({ dimension_id: dim, ...isi });
    tambah++;
  }
  a.dimension_scores.sort((x, y) => x.dimension_id.localeCompare(y.dimension_id));
}

// Suntingan bedah per asesmen: hanya blok dimension_scores yang diganti.
let teks = fs.readFileSync(P, "utf8");
for (const aid of Object.keys(NILAI)) {
  const a = arr.find((x) => x.id === aid);
  const mulai = teks.indexOf(`\n- id: ${aid}\n`);
  if (mulai < 0) throw new Error(`blok tidak ditemukan: ${aid}`);
  const kepala = teks.indexOf("\n  dimension_scores:\n", mulai);
  const awalIsi = kepala + "\n  dimension_scores:\n".length;
  let akhir = teks.length, pos = awalIsi;
  while (pos < teks.length) {
    const eol = teks.indexOf("\n", pos);
    const baris = teks.slice(pos, eol < 0 ? teks.length : eol);
    if (baris.trim() !== "" && !/^ {4}/.test(baris)) { akhir = pos - 1; break; }
    if (eol < 0) break;
    pos = eol + 1;
  }
  const blok = stringify(a.dimension_scores, { lineWidth: 0 })
    .replace(/\s*$/, "").split("\n").map((l) => "    " + l).join("\n");
  teks = teks.slice(0, kepala) + "\n  dimension_scores:\n" + blok + "\n" + teks.slice(akhir + 1);
}
fs.writeFileSync(P, teks);
console.log(`skor dimensi ditambahkan: ${tambah}`);
