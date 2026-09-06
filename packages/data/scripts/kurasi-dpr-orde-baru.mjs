import fs from "node:fs";
import { parse, stringify } from "yaml";
const DATA = new URL("../data/", import.meta.url).pathname;

/*
 * Menaikkan lima entri register JDIH menjadi peristiwa TERKURASI: ringkasannya
 * ditulis ulang sebagai analisis ketatanegaraan, bukan lagi metadata Lembaran
 * Negara. Hanya setelah ini mereka boleh dipakai sebagai bukti skor (pagar 5c).
 */
const KURASI = {
  "ev-jdih-uu-3-1975": {
    dimension_ids: ["kedaulatan-rakyat", "sila-4", "checks-balances"],
    summary_id:
      "DPR mengesahkan peleburan paksa sembilan partai hasil Pemilu 1971 menjadi hanya dua - PPP dan PDI - sementara Golongan Karya dibiarkan berdiri di luar kategori partai dan tetap ditopang aparat negara serta korps pegawai negeri. Kontestasi tidak dilarang, melainkan dikurung: rakyat tetap memilih, tetapi hanya dari daftar yang sudah ditentukan negara. Undang-undang inilah fondasi legal yang membuat enam pemilu berikutnya (1977-1997) menghasilkan komposisi yang praktis sama, dan DPR yang mengesahkannya adalah DPR yang diuntungkan olehnya.",
  },
  "ev-jdih-uu-16-1975": {
    dimension_ids: ["kedaulatan-rakyat", "checks-balances"],
    summary_id:
      "Perubahan atas UU 16/1969 mempertahankan kursi yang diisi lewat pengangkatan - terutama jatah ABRI - di MPR, DPR, dan DPRD, sehingga sebagian wakil rakyat tidak pernah melewati kotak suara. Akibatnya sebuah lembaga yang secara konstitusional bersandar pada kedaulatan rakyat menyimpan blok permanen yang loyalitasnya kepada pengangkat, bukan pemilih. DPR menyetujui sendiri aturan yang menentukan siapa boleh duduk di dalamnya.",
  },
  "ev-jdih-uu-15-1975": {
    dimension_ids: ["kedaulatan-rakyat", "sila-4"],
    summary_id:
      "Perubahan UU Pemilihan Umum ini melengkapi UU 3/1975: setelah peserta pemilu dibatasi jadi dua partai plus Golkar, aturan teknis penyelenggaraannya pun ditempatkan di bawah kendali pemerintah, dari pendaftaran pemilih hingga penghitungan suara. Pemilu tetap diselenggarakan tepat waktu setiap lima tahun - keteraturan prosedural yang justru menjadi tameng: yang rutin dijalankan adalah tata caranya, bukan kompetisinya.",
  },
  "ev-jdih-uu-31-1997": {
    dimension_ids: ["negara-hukum", "sila-2"],
    summary_id:
      "UU Peradilan Militer menegaskan bahwa prajurit yang melakukan tindak pidana diadili di lingkungan peradilan militer, termasuk untuk perbuatan yang korbannya warga sipil. Di masa ketika operasi keamanan berlangsung di Aceh, Papua, dan Timor Timur, forum itu menentukan hasil: penyidik, penuntut, dan hakimnya berada dalam satu rantai komando dengan terdakwa. Disahkan pada Oktober 1997, tujuh bulan sebelum kerusuhan Mei 1998 - dan menjadi salah satu sebab mengapa pertanggungjawaban atas kekerasan periode itu tidak pernah sampai ke pengadilan umum.",
  },
  "ev-jdih-uu-5-1999": {
    dimension_ids: ["kedaulatan-rakyat", "negara-hukum"],
    summary_id:
      "Pencabutan UU 5/1985 tentang Referendum - undang-undang yang mensyaratkan referendum dengan ambang persetujuan sangat tinggi sebelum UUD 1945 boleh diubah, dan karenanya secara praktis membekukan konstitusi selama empat belas tahun. Pencabutannya pada Maret 1999 membuka jalan bagi empat kali amandemen 1999-2002. Peristiwa ini merugikan sekaligus meringankan DPR periode ini: ia yang mengesahkan pembekuan itu pada 1985, dan ia pula - dalam bulan-bulan terakhirnya, di bawah tekanan reformasi - yang mencabutnya.",
  },
};

const files = fs.readdirSync(`${DATA}events`).filter((f) => f.endsWith(".yaml") && f !== "kurasi-dpr-orde-baru.yaml");
const dipindah = [];
for (const f of files) {
  const arr = parse(fs.readFileSync(`${DATA}events/${f}`, "utf8"));
  const sisa = arr.filter((e) => {
    if (!KURASI[e.id]) return true;
    dipindah.push({ ...e, ...KURASI[e.id], provenance: "kurasi" });
    return false;
  });
  if (sisa.length !== arr.length) {
    fs.writeFileSync(`${DATA}events/${f}`, fs.readFileSync(`${DATA}events/${f}`, "utf8").split("\n").slice(0, 4).join("\n") + "\n" + stringify(sisa, { lineWidth: 0, defaultStringType: "QUOTE_DOUBLE", defaultKeyType: "PLAIN" }));
  }
}
/*
 * sources.yaml disunting BEDAH, bukan ditulis ulang. Menstringify seluruh
 * berkas mengubah gaya kutip 11.000 baris sekaligus - diff tak terbaca, dan
 * helper yaml-edit yang mengandalkan format baris ikut patah.
 */
const idSumber = new Set(dipindah.map((e) => e.source_ids[0]));
let teksSumber = fs.readFileSync(`${DATA}sources.yaml`, "utf8");
let disunting = 0;
for (const id of idSumber) {
  const re = new RegExp(`^- id: "${id}"$[\\s\\S]*?(?=^- id: |$(?![\\s\\S]))`, "m");
  const m = teksSumber.match(re);
  if (!m) continue;
  const baru = m[0].replace(/^  provenance: "register-jdih"$/m, '  provenance: "kurasi"');
  if (baru === m[0]) continue;
  teksSumber = teksSumber.slice(0, m.index) + baru + teksSumber.slice(m.index + m[0].length);
  disunting++;
}
fs.writeFileSync(`${DATA}sources.yaml`, teksSumber);
console.log("sumber dinaikkan ke kurasi:", disunting);

dipindah.sort((a, b) => String(a.date).localeCompare(String(b.date)));
fs.writeFileSync(
  `${DATA}events/kurasi-dpr-orde-baru.yaml`,
  "# Peristiwa terkurasi: rekam jejak legislatif DPR Orde Baru 1971-1999.\n" +
  "# Dinaikkan dari register JDIH dan ditulis ulang sebagai analisis, sehingga\n" +
  "# sah dipakai sebagai bukti skor dimensi (lihat pagar 5c di build.mts).\n" +
  stringify(dipindah, { lineWidth: 0, defaultStringType: "QUOTE_DOUBLE", defaultKeyType: "PLAIN" })
);
console.log("dikurasi:", dipindah.length, dipindah.map((e) => e.id).join(", "));
