import fs from "node:fs";
import { parse, stringify } from "yaml";
const DATA = new URL("../data/", import.meta.url).pathname;
const p = `${DATA}assessments.yaml`;
const arr = parse(fs.readFileSync(p, "utf8"));
const a = arr.find((x) => x.id === "asm-dpr-1971-1999");
if (!a) throw new Error("asm-dpr-1971-1999 tidak ditemukan");

const E = (...ids) => ids.map((id) => ({ source_id: id }));

const SKOR = {
  "negara-hukum": {
    score: -2, confidence: 0.72,
    rationale_id:
      "Selama 28 tahun DPR ini mengesahkan kerangka hukum yang menjadikan hukum alat kekuasaan, bukan pembatasnya - puncaknya UU 31/1997 yang menempatkan prajurit pelaku pidana terhadap warga sipil di forum peradilan militer, satu rantai komando dengan terdakwanya. Laju legislasinya 8,9 UU per tahun, terendah dari seluruh periode DPR dalam sejarah Indonesia dan seperlima laju parlemen 1950-an. TAP MPR XI/MPR/1998 tentang penyelenggara negara bebas KKN memang lahir dari periode ini, tetapi pada bulan-bulan terakhirnya dan di bawah tekanan jalanan - satu tindakan korektif tidak menyeimbangkan tiga dasawarsa pembentukan impunitas.",
    thesis_id:
      "Dalil formalnya: seluruh instrumen represi Orde Baru berbentuk undang-undang yang sah menurut prosedur, disahkan lembaga perwakilan hasil pemilu yang diselenggarakan teratur setiap lima tahun; dan pada 1998 DPR yang sama menetapkan dasar hukum pemberantasan KKN lewat Sidang Istimewa MPR.",
    antithesis_id:
      "Keabsahan prosedural justru inti persoalannya: UU 31/1997 memindahkan pertanggungjawaban kekerasan aparat terhadap warga sipil ke forum yang diadili sesama korps, sehingga impunitas bukan penyimpangan dari hukum melainkan produk hukum. Laju 8,9 UU per tahun - terendah sepanjang sejarah DPR - menunjukkan lembaga yang tidak menjalankan fungsi legislasinya, dan tidak sekali pun tercatat menolak rancangan pemerintah.",
    synthesis_id:
      "Skor pelanggaran berat (-2) karena hukum dijadikan senjata politik dan impunitas elite dilembagakan lewat undang-undang yang disahkan DPR ini sendiri, sesuai jangkar rubrik -2 'rule by law'. Penetapan TAP MPR XI/MPR/1998 dicatat sebagai fakta yang meringankan, bukan yang mengubah skor.",
    evidence: E("jdih-uu-31-1997", "tap-mpr-xi-1998"),
    event_ids: ["ev-jdih-uu-31-1997"],
  },
  "kedaulatan-rakyat": {
    score: -2, confidence: 0.78,
    rationale_id:
      "DPR ini mengesahkan sendiri aturan yang menentukan siapa boleh menjadi pesaingnya dan siapa boleh duduk tanpa dipilih. UU 3/1975 melebur sembilan partai hasil Pemilu 1971 menjadi dua sementara Golkar dibiarkan di luar kategori partai dengan topangan aparat negara; UU 16/1975 mempertahankan kursi pengangkatan terutama jatah ABRI; UU 15/1975 menempatkan teknis penyelenggaraan pemilu di bawah kendali pemerintah. Pada 1985 kerangka itu dikunci dengan UU Referendum yang mensyaratkan ambang persetujuan sangat tinggi sebelum UUD boleh diubah - membekukan konstitusi empat belas tahun sampai dicabut lewat UU 5/1999.",
    thesis_id:
      "Dalil formalnya: pemilu tetap diselenggarakan tepat waktu setiap lima tahun sepanjang 1977-1997 tanpa satu kali pun ditunda, rakyat tetap memberikan suara, dan seluruh pembatasan peserta pemilu dituangkan dalam undang-undang yang disahkan lembaga perwakilan.",
    antithesis_id:
      "Yang rutin dijalankan adalah tata caranya, bukan kompetisinya: peleburan paksa partai lewat UU 3/1975 membuat enam pemilu berikutnya menghasilkan komposisi yang praktis sama, dan kursi pengangkatan dalam UU 16/1975 memastikan sebagian wakil rakyat tidak pernah melewati kotak suara. Kedaulatan rakyat yang dijamin Pasal 1 ayat (2) UUD 1945 direduksi menjadi partisipasi tanpa pilihan.",
    synthesis_id:
      "Skor pelanggaran berat (-2) karena lembaga yang mandatnya bersandar pada kedaulatan rakyat justru mengesahkan undang-undang yang mengurung pilihan rakyat dan membekukan konstitusi, lalu diuntungkan sendiri oleh aturan itu selama enam pemilu berturut-turut.",
    evidence: E("jdih-uu-3-1975", "jdih-uu-16-1975", "jdih-uu-15-1975", "jdih-uu-5-1999"),
    event_ids: ["ev-jdih-uu-3-1975", "ev-jdih-uu-16-1975", "ev-jdih-uu-15-1975", "ev-jdih-uu-5-1999"],
  },
  "checks-balances": {
    score: -2, confidence: 0.7,
    rationale_id:
      "Fungsi pengawasan praktis padam: sepanjang 1971-1999 tidak ada catatan DPR menolak rancangan undang-undang pemerintah, tidak ada hak angket yang tuntas menghasilkan konsekuensi politik, dan laju legislasinya 8,9 UU per tahun - terendah dari sepuluh periode DPR yang diukur indeks ini. Lembaga yang secara konstitusional menjadi penyeimbang eksekutif berfungsi sebagai ruang pengesahan.",
    thesis_id:
      "Dalil formalnya: DPR tetap bersidang secara teratur, membahas rancangan undang-undang bersama pemerintah, dan menjalankan fungsi anggaran melalui pengesahan APBN setiap tahun anggaran sebagaimana diperintahkan UUD 1945.",
    antithesis_id:
      "Pembahasan yang tidak pernah berujung penolakan bukan pengawasan melainkan formalitas. Laju 8,9 undang-undang per tahun - seperlima parlemen 1950-an yang mencapai 44,7 - menunjukkan lembaga yang inisiatif legislasinya nyaris nihil, sementara UU 16/1975 memastikan blok kursi pengangkatan yang loyalitasnya kepada pengangkat, bukan pemilih, ada di dalam lembaga itu sendiri.",
    synthesis_id:
      "Skor pelanggaran berat (-2) karena penyeimbang konstitusional atas kekuasaan eksekutif tidak berfungsi selama hampir tiga dasawarsa, dan komposisi lembaganya sendiri dirancang lewat undang-undang agar tidak mungkin menyeimbangkan.",
    evidence: E("jdih-uu-16-1975", "jdih-uu-3-1975"),
    event_ids: ["ev-jdih-uu-16-1975"],
  },
  "sila-4": {
    score: -2, confidence: 0.75,
    rationale_id:
      "Kerakyatan yang dipimpin hikmat kebijaksanaan dalam permusyawaratan perwakilan direduksi menjadi mufakat yang hasilnya sudah diketahui sebelum musyawarah dimulai. UU 3/1975 menghapus pluralitas politik hasil Pemilu 1971 dengan melebur sembilan partai menjadi dua, sehingga permusyawaratan berlangsung di antara pihak-pihak yang komposisinya ditentukan negara, bukan pemilih.",
    thesis_id:
      "Dalil formalnya: pengambilan keputusan di DPR sepanjang periode ini justru dijalankan dengan asas musyawarah untuk mufakat dan nyaris tanpa pemungutan suara - yang secara tekstual paling dekat dengan rumusan sila keempat.",
    antithesis_id:
      "Mufakat tanpa perbedaan bukan musyawarah melainkan keseragaman yang dilembagakan. Setelah UU 3/1975 melebur peserta politik menjadi dua partai plus Golkar dan UU 16/1975 menyisipkan kursi pengangkatan, ketiadaan pemungutan suara bukan tanda kebijaksanaan kolektif melainkan tanda tidak ada lagi pihak yang berbeda pendapat di dalam ruangan.",
    synthesis_id:
      "Skor pelanggaran berat (-2) karena bentuk lahiriah sila keempat dipertahankan sementara syarat yang membuatnya bermakna - adanya perbedaan yang harus dimusyawarahkan - dihapus lewat undang-undang yang disahkan DPR ini sendiri.",
    evidence: E("jdih-uu-3-1975", "jdih-uu-15-1975"),
    event_ids: ["ev-jdih-uu-3-1975", "ev-jdih-uu-15-1975"],
  },
  "sila-2": {
    score: -1, confidence: 0.68,
    rationale_id:
      "TAP MPR XVII/MPR/1998 tentang Hak Asasi Manusia yang lahir dari periode ini adalah tonggak nyata dan menjadi dasar UU 39/1999 serta Bab XA UUD 1945. Namun ia ditetapkan pada November 1998, bulan-bulan terakhir masa jabatan, setelah DPR yang sama mengesahkan UU 31/1997 yang menempatkan prajurit pelaku pidana terhadap warga sipil di peradilan militer - tujuh bulan sebelum kekerasan Mei 1998. Sesuai rubrik, dua temuan berlawanan diberi skor netonya, bukan nol.",
    thesis_id:
      "Dalil formalnya: Sidang Istimewa MPR November 1998 menetapkan TAP MPR No. XVII/MPR/1998, piagam hak asasi manusia pertama Indonesia, yang mengadopsi semangat Deklarasi Universal HAM dan menjadi payung seluruh legislasi HAM sesudahnya.",
    antithesis_id:
      "Piagam itu datang setelah, bukan sebelum: UU 31/1997 yang disahkan DPR yang sama pada Oktober 1997 memastikan pertanggungjawaban kekerasan aparat terhadap warga sipil tidak sampai ke pengadilan umum, dan itulah kerangka yang berlaku ketika kerusuhan Mei 1998 terjadi. Pengakuan hak di atas kertas ditandatangani jauh sebelum di meja pengadilan.",
    synthesis_id:
      "Skor Buruk (-1) sebagai neto: piagam HAM pertama adalah capaian sungguhan, tetapi tidak menutup kerangka impunitas yang disahkan DPR yang sama setahun sebelumnya dan yang justru berlaku saat pelanggaran terberat periode ini terjadi.",
    evidence: E("tap-mpr-xvii-1998", "jdih-uu-31-1997"),
    event_ids: ["ev-jdih-uu-31-1997"],
  },
};

let ubah = 0, tambah = 0;
for (const [dim, isi] of Object.entries(SKOR)) {
  const ada = a.dimension_scores.find((s) => s.dimension_id === dim);
  if (ada) { Object.assign(ada, isi); ubah++; }
  else { a.dimension_scores.push({ dimension_id: dim, ...isi }); tambah++; }
}
a.dimension_scores.sort((x, y) => x.dimension_id.localeCompare(y.dimension_id));

/*
 * SUNTINGAN BEDAH. Menstringify seluruh assessments.yaml mengubah gaya kutip
 * 14.000 baris sekaligus: diff tak terbaca oleh penelaah manusia, dan helper
 * yaml-edit yang mengandalkan format baris ikut patah (5 uji gagal). Yang
 * diganti hanya blok dimension_scores milik asesmen ini.
 */
const teks = fs.readFileSync(p, "utf8");
const mulai = teks.indexOf("\n- id: asm-dpr-1971-1999\n");
if (mulai < 0) throw new Error("blok asm-dpr-1971-1999 tidak ditemukan");
const kepalaIdx = teks.indexOf("\n  dimension_scores:\n", mulai);
if (kepalaIdx < 0) throw new Error("dimension_scores tidak ditemukan");
/*
 * Batas akhir blok BUKAN asesmen berikutnya: di dalam satu asesmen masih ada
 * kunci lain sesudah dimension_scores (ai_disclosure, limitations_notice).
 * Menyapu sampai "- id: " berikutnya akan ikut menghapusnya. Berhenti pada
 * baris pertama beriindentasi dua spasi yang bukan bagian daftar.
 */
const barisAwal = kepalaIdx + "\n  dimension_scores:\n".length;
let akhir = teks.length;
let pos = barisAwal;
while (pos < teks.length) {
  const eol = teks.indexOf("\n", pos);
  const baris = teks.slice(pos, eol < 0 ? teks.length : eol);
  if (baris.trim() !== "" && !/^ {4}/.test(baris)) { akhir = pos - 1; break; }
  if (eol < 0) break;
  pos = eol + 1;
}

const blokBaru = stringify(a.dimension_scores, { lineWidth: 0 })
  .replace(/\s*$/, "")
  .split("\n")
  .map((l) => "    " + l)
  .join("\n");

const hasil =
  teks.slice(0, kepalaIdx) + "\n  dimension_scores:\n" + blokBaru + "\n" + teks.slice(akhir + 1);
fs.writeFileSync(p, hasil);
console.log(`skor diubah: ${ubah} | ditambah: ${tambah} | total dimensi kini: ${a.dimension_scores.length}`);
