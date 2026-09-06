import fs from "node:fs";
import { parse, stringify } from "yaml";
const DATA = new URL("../data/", import.meta.url).pathname;

/*
 * Menaikkan entri register JDIH menjadi peristiwa TERKURASI: ringkasannya
 * ditulis ulang sebagai analisis ketatanegaraan, bukan metadata Lembaran
 * Negara. Hanya setelah itu sah dipakai sebagai bukti skor (pagar 5c).
 */
const KURASI = {
  // ---------------- KNIP 1945-1950 ----------------
  "ev-jdih-uu-23-1948": { dimension_ids: ["sila-5"], summary_id:
    "Di tengah perang kemerdekaan dan wilayah republik yang menyusut akibat blokade, KNIP mengesahkan pengawasan perburuhan: negara memberi diri kewajiban memeriksa keselamatan dan syarat kerja di perusahaan. Isinya sederhana dan jangkauannya terbatas pada wilayah yang masih dikuasai republik, tetapi arah normanya jelas - buruh diperlakukan sebagai pihak yang dilindungi hukum, bukan sekadar faktor produksi, pada saat republik sendiri belum pasti bertahan." },
  "ev-jdih-uu-32-1947": { dimension_ids: ["tujuan-3"], summary_id:
    "Segala urusan sekolah dipusatkan pada Kementerian Pendidikan, mengakhiri warisan sistem pendidikan kolonial yang terbelah menurut golongan penduduk - Eropa, Timur Asing, dan bumiputra - dengan mutu dan akses yang berbeda-beda. Pemusatan ini yang memungkinkan satu kurikulum kebangsaan, meski pelaksanaannya baru berjalan setelah pengakuan kedaulatan." },
  "ev-jdih-uu-2-1948": { dimension_ids: ["tujuan-4"], summary_id:
    "Pengesahan perjanjian persahabatan dengan negara lain di masa republik masih diperebutkan pengakuannya. Tiap traktat yang diratifikasi KNIP berfungsi ganda: ia perjanjian bilateral sekaligus bukti bahwa Indonesia bertindak sebagai subjek hukum internasional yang cakap - argumen yang dipakai di meja diplomasi melawan klaim Belanda bahwa republik hanyalah pemberontakan dalam negeri." },
  "ev-jdih-uu-7-1947": { dimension_ids: ["checks-balances"], summary_id:
    "Susunan dan kekuasaan Mahkamah Agung ditetapkan pada Februari 1947, ketika ibu kota baru saja pindah ke Yogyakarta dan pengadilan republik nyaris tanpa gedung maupun arsip. KNIP tetap mendirikan puncak kekuasaan kehakiman yang terpisah dari eksekutif - keputusan yang menetapkan bahwa republik memilih bentuk negara hukum sejak sebelum ia aman secara militer." },
  // ---------------- DPR 1950-1960 ----------------
  "ev-jdih-uu-3-1951": { dimension_ids: ["sila-5"], summary_id:
    "Pengawasan perburuhan yang lahir di masa revolusi dinyatakan berlaku untuk seluruh wilayah Indonesia setelah pengakuan kedaulatan, termasuk bekas daerah negara-negara bagian RIS. Satu norma perlindungan buruh menggantikan aturan yang sebelumnya berbeda-beda antarwilayah - langkah unifikasi hukum sosial yang jarang dicatat karena tidak dramatis." },
  "ev-jdih-uu-1-1950": { dimension_ids: ["checks-balances"], summary_id:
    "Susunan, kekuasaan, dan jalan pengadilan Mahkamah Agung disusun ulang bagi negara kesatuan yang baru dipulihkan dari bentuk federal RIS. Parlemen menetapkan sendiri batas kewenangan puncak yudikatif, termasuk kasasi atas seluruh lingkungan peradilan - fondasi yang bertahan sampai reformasi dan menjadi rujukan ketika kekuasaan kehakiman kemudian digerogoti pada 1964." },
  "ev-jdih-uu-17-1950": { dimension_ids: ["sila-3"], summary_id:
    "Pembentukan daerah-daerah kota besar sebagai satuan pemerintahan tersendiri, bagian dari penataan wilayah pasca-RIS. Parlemen memilih menata ulang lewat undang-undang alih-alih keputusan sepihak pusat - prosedur yang kemudian ditinggalkan sepenuhnya ketika pembentukan dan penghapusan daerah dilakukan lewat penetapan presiden pada era Demokrasi Terpimpin." },
  // ---------------- DPR-GR 1960-1971 ----------------
  "ev-jdih-uu-22-1961": { dimension_ids: ["tujuan-3"], summary_id:
    "UU Perguruan Tinggi menetapkan kerangka universitas nasional: otonomi keilmuan, tridarma, dan pembinaan negara atas perguruan tinggi. Ia lahir dari DPR-GR yang anggotanya diangkat Presiden, dan pada periode yang sama kampus menjadi arena mobilisasi politik - otonomi yang dijanjikan pasal-pasalnya berjalan bersamaan dengan tekanan agar perguruan tinggi menyelaraskan diri dengan garis politik negara." },
  "ev-jdih-uu-13-1964": { dimension_ids: ["sila-3"], summary_id:
    "Penetapan Peraturan Pemerintah Pengganti Undang-Undang menjadi undang-undang - satu dari rangkaian panjang pengesahan serupa sepanjang 1964. Pola ini menunjukkan cara kerja DPR-GR: Presiden menerbitkan Perpu lebih dulu, lembaga perwakilan mengesahkannya belakangan. Fungsi legislasi bergeser dari membentuk norma menjadi meratifikasi norma yang sudah berlaku." },
  "ev-jdih-uu-14-1963": { dimension_ids: ["tujuan-4"], summary_id:
    "Pengesahan \"Perjanjian Karya\" dengan perusahaan asing di sektor sumber daya alam, disahkan DPR-GR yang seluruh anggotanya diangkat. Perjanjian ekonomi internasional berdampak jangka panjang diratifikasi tanpa lembaga perwakilan hasil pemilu - politik luar negeri dijalankan tanpa penyeimbang domestik yang sah." },
  // ---------------- DPR Orde Baru 1971-1999 ----------------
  "ev-jdih-uu-1-1974": { dimension_ids: ["sila-1"], summary_id:
    "UU Perkawinan mengakhiri pluralisme hukum perkawinan warisan kolonial dan menegaskan bahwa sah tidaknya perkawinan ditentukan hukum agama masing-masing, dengan pencatatan negara sebagai syarat administratif. Rancangan awalnya memicu penolakan luas kalangan Islam sampai terjadi insiden di gedung DPR pada 1973, dan naskah akhirnya adalah hasil kompromi. Kewenangan peradilan agama diperkuat, tetapi ketentuan poligami dan batas usia kawin meninggalkan persoalan perlindungan perempuan yang baru diperbaiki lima dasawarsa kemudian." },
  "ev-jdih-uu-5-1979": { dimension_ids: ["sila-3"], summary_id:
    "UU Pemerintahan Desa menyeragamkan seluruh satuan pemerintahan terendah di Indonesia mengikuti satu model tunggal, menghapus nagari di Sumatera Barat, marga di Sumatera Selatan, dan puluhan bentuk pemerintahan adat lain yang berumur lebih tua dari republik. Keseragaman memudahkan pusat menyalurkan program dan mengawasi desa, tetapi memutus struktur adat yang menjadi penopang identitas kewilayahan - dan pemulihannya setelah 1999 tidak pernah sepenuhnya berhasil karena satu generasi kepemimpinan adat sudah terputus." },
  "ev-jdih-uu-3-1972": { dimension_ids: ["sila-5"], summary_id:
    "Ketentuan pokok transmigrasi menjadikan pemindahan penduduk dari Jawa ke luar Jawa sebagai kebijakan negara berskala besar. Tujuannya pemerataan penduduk dan pembukaan lahan, dan sebagian transmigran memang memperoleh tanah yang tidak mungkin mereka miliki di Jawa. Namun undang-undang ini tidak mengatur perlindungan hak masyarakat adat di daerah tujuan, sehingga pemerataan bagi satu kelompok dijalankan di atas tanah yang bagi kelompok lain adalah wilayah adat - sumber konflik agraria yang belum selesai sampai hari ini." },
  "ev-jdih-uu-28-1997": { dimension_ids: ["tujuan-1"], summary_id:
    "UU Kepolisian 1997 menegaskan Polri sebagai bagian dari ABRI, bukan lembaga sipil tersendiri. Artinya penegakan hukum terhadap warga berada dalam satu struktur komando dengan kekuatan pertahanan, tepat pada tahun terakhir sebelum krisis 1998. Pemisahan Polri dari TNI baru terjadi dua tahun kemudian lewat Ketetapan MPR - koreksi yang justru menegaskan bahwa kerangka 1997 memang tidak memisahkan fungsi perlindungan warga dari fungsi pertahanan negara." },
  "ev-jdih-uu-1-1972": { dimension_ids: ["tujuan-2"], summary_id:
    "Undang-undang APBN tahunan yang disahkan DPR - satu dari rangkaian yang berulang tiap tahun anggaran sepanjang Orde Baru tanpa satu kali pun ditolak. Fungsi anggaran dijalankan secara prosedural lengkap, tetapi tanpa penolakan atau perubahan berarti, persetujuan parlemen atas belanja negara berhenti pada pengesahan dan tidak sampai pada pengendalian." },
  "ev-jdih-uu-6-1976": { dimension_ids: ["tujuan-4"], summary_id:
    "Pengesahan perjanjian persahabatan bilateral pada 1976 - tahun yang sama ketika Timor Timur diintegrasikan lewat undang-undang setelah operasi militer yang tidak pernah memperoleh pengakuan PBB. Diplomasi persahabatan berjalan di satu meja sementara di meja lain Indonesia menghadapi resolusi Dewan Keamanan yang menyerukan penarikan pasukan; DPR mengesahkan keduanya tanpa perdebatan yang tercatat." },
};

const files = fs.readdirSync(`${DATA}events`).filter((f) => f.endsWith(".yaml") && !f.startsWith("kurasi-"));
const dipindah = [];
for (const f of files) {
  const arr = parse(fs.readFileSync(`${DATA}events/${f}`, "utf8"));
  const sisa = arr.filter((e) => {
    if (!KURASI[e.id]) return true;
    dipindah.push({ ...e, ...KURASI[e.id], provenance: "kurasi" });
    return false;
  });
  if (sisa.length !== arr.length) {
    const kepala = fs.readFileSync(`${DATA}events/${f}`, "utf8").split("\n").slice(0, 4).join("\n");
    fs.writeFileSync(`${DATA}events/${f}`, kepala + "\n" + stringify(sisa, { lineWidth: 0, defaultStringType: "QUOTE_DOUBLE", defaultKeyType: "PLAIN" }));
  }
}

// sources.yaml disunting bedah, bukan ditulis ulang.
let teksSumber = fs.readFileSync(`${DATA}sources.yaml`, "utf8");
let naik = 0;
for (const e of dipindah) {
  const id = e.source_ids[0];
  const re = new RegExp(`^- id: "${id}"$[\\s\\S]*?(?=^- id: |$(?![\\s\\S]))`, "m");
  const m = teksSumber.match(re);
  if (!m) continue;
  const baru = m[0].replace(/^  provenance: "register-jdih"$/m, '  provenance: "kurasi"');
  if (baru === m[0]) continue;
  teksSumber = teksSumber.slice(0, m.index) + baru + teksSumber.slice(m.index + m[0].length);
  naik++;
}
fs.writeFileSync(`${DATA}sources.yaml`, teksSumber);

dipindah.sort((a, b) => String(a.date).localeCompare(String(b.date)));
fs.writeFileSync(
  `${DATA}events/kurasi-bukti-legislatif.yaml`,
  "# Peristiwa terkurasi: bukti legislatif untuk penilaian dimensi yang semula kosong.\n" +
  "# Dinaikkan dari register JDIH dan ditulis ulang sebagai analisis, sehingga sah\n" +
  "# dipakai sebagai bukti skor dimensi (lihat pagar 5c di build.mts).\n" +
  stringify(dipindah, { lineWidth: 0, defaultStringType: "QUOTE_DOUBLE", defaultKeyType: "PLAIN" })
);
console.log(`peristiwa dikurasi: ${dipindah.length} | sumber naik ke kurasi: ${naik}`);
