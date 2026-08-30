# Aspek Hukum Pengelolaan Pancasila Index

> **Tujuan dokumen.** Memberikan kerangka hukum yang menjadi dasar
> pengelolaan Pancasila Index oleh **PT Aplikasi Profesi Indonesia** (pro
> bono), sehingga admin, kontributor, dan publik memiliki acuan yang
> sama tentang posisi hukum platform.

> **Batasan.** Dokumen ini bukan nasihat hukum (legal opinion) yang
> mengikat. Untuk pertanyaan yuridis spesifik, konsultasikan dengan
> advokat berlisensi. Rujukan UU merujuk pada versi yang berlaku per
> tanggal pembaruan dokumen.

---

## Ringkasan eksekutif

Pancasila Index adalah platform penilaian terbuka yang mengukur
kesetiaan 8 organ konstitusional Indonesia terhadap Pancasila dan UUD
1945, berbasis bukti primer. Pengelolaan dilakukan oleh badan hukum
**PT Aplikasi Profesi Indonesia** yang bekerja secara **pro bono** dan
hanya menerima pendanaan dari individu (crowdfunding).

Risiko hukum yang melekat pada platform seperti ini berasal dari tiga
sumber:

1. **Risiko perdata** (gugatan ganti rugi atas pencemaran nama baik
   atau perbuatan melawan hukum — KUHPerdata).
2. **Risiko pidana** (delik aduan atas tuduhan penghinaan atau
   penyebaran informasi yang menyerang kehormatan — UU ITE).
3. **Risiko administratif** (ketidakpatuhan terhadap regulasi
   penyelenggara sistem elektronik — UU ITE jo. PP 71/2019).

Mitigasi yang dibangun pada platform:

| Mitigasi | Risiko yang dijawab | Tanggung jawab hukum |
|---|---|---|
| Sitasi bukti primer untuk setiap skor | Risiko perdata & pidana | Beban pembuktian terbalik untuk klaim |
| Kuorum 2 reviewer berbeda nama | Risiko perdata | Itikad baik kolektif |
| Audit log publik | Risiko perdata & pidana | Jejak keputusan yang tidak dapat dihapus |
| Lisensi AGPL-3.0 + CC BY-SA 4.0 | Risiko perdata & eksploitasi tertutup | Karya turunan wajib terbuka |
| Halaman `/disclaimer`, `/koreksi`, `/transparansi` | Risiko perdata & pidana | Representasi itikad baik publik |
| Transaparansi pendanaan | Risiko pencitraan disponsori | Pembuktian independensi |
| Pelaporan privat (`SECURITY.md`) | Risiko keamanan | Pelacakan pola koordinasi |

---

## 1. Risiko hukum & pembelaan yang tersedia

### 1.1 Risiko perdata (KUHPerdata)

**Sumber risiko:**

- **Pasal 1365 KUHPerdata** (perbuatan melawan hukum): setiap tindakan
  melawan hukum yang menimbulkan kerugian dapat menjadi dasar gugatan
  ganti rugi.
- **Pasal 1371 KUHPerdata**: penghinaan terhadap nama baik seseorang.
- **Pasal 1915 KUHPerdata**: asumsi bahwa setiap orang berstatus
  "beritikad baik" sampai terbukti sebaliknya.

**Pembelaan yang tersedia:**

1. **Itikad baik** (Pasal 1367 KUHPerdata): pengelola bertindak dengan
   itikad baik, berdasarkan bukti primer, dan membuka ruang koreksi
   (`/koreksi`). Pembuktian itikad baik dilakukan lewat audit log
   publik (`/kurasi/log`).
2. **Beban pembuktian terbalik untuk reputasi baik** (Pasal 1915):
   pihak yang merasa dirugikan harus membuktikan adanya kesalahan,
   bukan pengelola yang membuktikan ketiadaan kesalahan. Adanya
   **bukti primer** dan **kuorum 2 reviewer** adalah alat bukti
   untuk melawan tuduhan tanpa dasar.
3. **Bukti primer** (produk hukum, putusan): setiap skor memiliki
   rujukan ke dokumen publik resmi. Skor adalah **interpretasi**
   atas dokumen publik, bukan opini tanpa dasar.
4. **Hak berpendapat di muka umum** (Pasal 26 UU ITE 19/2016):
   penilaian terhadap kebijakan publik adalah bagian dari
   kebebasan berpendapat.
5. **Kepentingan publik** (Pasal 43 UU 28/2014 tentang Hak Cipta):
   penggunaan dokumen publik untuk kepentingan publik dengan
   sitasi diizinkan.

**Risiko residual:**

- Hakim dapat memiliki penafsiran berbeda terhadap "itikad baik"
  dan "kepentingan publik".
- Gugatan perdata umumnya terkait ganti rugi material (bisa
  dihitung) dan immateriell (jumlah ditentukan hakim).
- **Mitigasi tambahan**: hak jawab (`/koreksi`) dan transparansi
  pendanaan (`/transparansi`) memperjelas itikad baik.

### 1.2 Risiko pidana (UU ITE)

**Sumber risiko:**

- **Pasal 27 ayat (3) UU ITE 19/2016**: larangan menghina atau
  mencemarkan nama baik.
- **Pasal 28 ayat (1) dan (2)**: larangan menyebarkan berita bohong
  (hoaks), fitnah, atau informasi yang menyerang kehormatan.
- **Pasal 45A jo. 27/28**: ancaman pidana penjara dan/atau denda.

**Pembelaan yang tersedia:**

1. **Setiap skor memiliki bukti primer** — bukan hoaks, bukan
   fitnah. Klaim adalah interpretasi atas dokumen publik.
2. **Hak berpendapat** (Pasal 26 UU ITE 19/2016): UU ITE sendiri
   mengakui hak menyampaikan pendapat, dengan batasan yang sama.
3. **Asumsi praduga tak bersalah** (KUHP Pasal 66): beban pembuktian
   pada penuduh, bukan pengelola.
4. **Itikad baik & ruang koreksi** (`/koreksi`): pengelola
   menyediakan jalur formal untuk klarifikasi.

**Risiko residual:**

- Polisi/jaksa bisa memiliki penafsiran berbeda.
- Proses pidana, walau akhirnya dihentikan, sudah menjadi beban
  psikologis dan finansial.
- **Mitigasi tambahan**: audit log publik dan kuorum 2 reviewer
  adalah bukti itikad baik kolektif.

### 1.3 Risiko administratif (UU ITE jo. PP 71/2019)

**Sumber risiko:**

- **Pasal 32 UU 19/2016**: Penyelenggara Sistem Elektronik (PSE)
  wajib mendaftarkan diri.
- **PP 71/2019**: pengaturan lebih lanjut tentang PSE.
- **Kominfo**: bisa mengenakan sanksi administratif (denda,
  pemutusan akses).

**Status platform:**

- Pancasila Index menggunakan infrastruktur komputasi awan
  (Vercel untuk aplikasi web, Cloudflare R2 untuk arsip) dan
  terdaftar sebagai aplikasi OAuth GitHub (untuk autentikasi
  kontributor).
- Pendaftaran sebagai PSE Kominfo merupakan keputusan terpisah
  yang melibatkan badan hukum (PT Aplikasi Profesi Indonesia)
  dan pertimbangan biaya kepatuhan.

**Risiko residual:**

- Ketidakpatuhan administratif bisa berujung pada sanksi
  (denda, pemutusan akses). Risiko ini **tidak langsung terkait**
  dengan gugatan perdata/pidana atas isi skor.

---

## 2. Pagar struktural

### 2.1 Pagar proses (governance)

- **Kuorum 2 reviewer berbeda nama** (`MIN_APPROVERS=2`) sebelum
  status `published`.
- **Branch protection** di GitHub: 2 approval + 3 status checks
  (`verify`, `audit`, `secrets`) + 1 codeowner approval + linear
  history. Push langsung ke `main` ditolak untuk admin sekalipun
  (`enforce_admins: true`).
- **Audit log publik** (`/kurasi/log`): setiap keputusan kurasi
  tercatat dengan jejak tidak terhapuskan.
- **AI vs manusia**: draf AI selalu berstatus `ai_suggested: true`
  dan tidak pernah dihitung sampai `human_confirmed`.

### 2.2 Pagar konten (data integrity)

- **Setiap skor bersitasi bukti primer**: produk hukum, putusan
  pengadilan, atau dokumen arsip resmi.
- **Setiap perubahan data** harus lewat PR + review + merge ke
  `main` (yang sekarang butuh 2 review).
- **Deteksi id ganda & near-duplikat** di pipeline `build:data`.
- **Build menolak** referensi yang tidak terdaftar, dan skor tanpa
  bukti empiris dikeluarkan dari indeks.

### 2.3 Pagar hukum (legal)

- **Lisensi AGPL-3.0** (kode) — copyleft kuat untuk mencegah
  eksploitasi tertutup.
- **Lisensi CC BY-SA 4.0** (data & rubrik) — derivatif wajib
  terbuka.
- **Halaman publik**: `/disclaimer`, `/koreksi` (hak jawab),
  `/transparansi` (pendanaan), `/privasi` (UU PDP), `SECURITY.md`
  (pelaporan).
- **Identitas badan hukum** jelas: PT Aplikasi Profesi Indonesia
  (akta notaris, NPWP, terdaftar Kemenkumham).

### 2.4 Pagar teknis (security & privacy)

- **Kepatuhan UU PDP 27/2022**: `/privasi`, `GET /api/user/export`,
  `DELETE /api/user/account`, consent banner, minimalisasi PII di
  audit log.
- **Pelaporan keamanan privat** lewat GitHub Security Advisories
  (lihat `SECURITY.md`).
- **Secret scanning** (gitleaks) dan **dependency audit** (`pnpm
  audit`) di CI, di-require di branch protection.

---

## 3. Identitas pengelola

**PT Aplikasi Profesi Indonesia**

- **Status**: badan hukum Indonesia (Perseroan Terbatas) yang didirikan
  berdasarkan Akta Pendirian dan tercatat pada Kementerian Hukum dan
  HAM Republik Indonesia.
- **Tujuan**: aplikasi profesional untuk kepentingan publik,
  termasuk pengelolaan Pancasila Index secara pro bono.
- **Modal**: tidak mengambil keuntungan finansial dari pengelolaan
  platform.
- **Pendanaan**: hanya dari sumbangan individu (crowdfunding),
  dengan transparansi penuh di `/transparansi`.
- **Tanggung jawab**: sebagai badan hukum, PT menanggung risiko
  perdata yang timbul dari pengelolaan platform (Pasal 136 UU 40/2007
  tentang Perseroan Terbatas: tanggung jawab badan hukum).

**Mengapa badan hukum dan bukan perorangan?**

Risiko perdata (ganti rugi) dan pidana (bila ada) lebih tepat
ditanggung oleh badan hukum daripada perorangan. Dengan struktur
ini, admin perorangan (pengelola harian) tidak menanggung
tanggung jawab pribadi sepanjang ia bertindak dalam kapasitas
sebagai organ badan hukum.

---

## 4. Prosedur hak jawab (right of reply)

Hak jawab adalah mekanisme yang memungkinkan subjek yang dinilai
memberikan tanggapan resmi yang ditampilkan berdampingan dengan
skor. Prinsip ini merujuk pada **Pasal 11 UU No. 40 Tahun 1999
tentang Pers**.

**Saluran:**

1. **PR GitHub** untuk koreksi data (paling kuat, menghasilkan
   perubahan permanen).
2. **Halaman `/koreksi`** untuk hak jawab resmi, dengan templat
   yang tersedia.
3. **Kontak badan hukum** untuk klarifikasi umum.

**Prinsip penayangan:**

- Tanggapan ditampilkan apa adanya (tanpa sensor substansial).
- Redaksi hanya berhak menolak: ujaran kebencian SARA, ancaman
  kekerasan, iklan terselubung, pencemaran nama baik pihak ketiga,
  atau pelanggaran UU ITE.
- Identitas penandatangan diverifikasi tetapi tidak dipublikasikan
  tanpa izin.

---

## 5. Audit & akuntabilitas

- **Audit log kurasi** (`/kurasi/log`) — jejak keputusan, publik,
  tidak terhapuskan.
- **Audit pendanaan** (`/transparansi`) — ringkasan akhir tahun
  fiskal tentang penerimaan, pengeluaran, dan saldo.
- **Audit hukum** — tinjauan berkala terhadap dokumen ini dan
  dampaknya terhadap praktik pengelolaan.

---

## 6. Hal yang tidak dijamin oleh dokumen ini

- **Bebas dari gugatan.** Tidak ada platform audit publik yang
  bebas dari kemungkinan gugatan. Dokumen ini adalah **pagar
  pertahanan**, bukan **kebal hukum**.
- **Bebas dari serangan balik non-hukum.** Subjek yang merasa
  dirugikan bisa merespons dengan cara yang tidak menyentuh
  hukum (mis. tekanan ke hosting, doxxing admin, serangan
  terhadap kontributor). Pagar untuk ini: pseudonymity admin,
  dokumentasi serangan, dan koordinasi dengan komunitas open
  source.
- **Akurasi subyektif.** Skor adalah interpretasi; bisa berbeda
  dengan penilaian orang lain. Penyajian skor yang transparan
  (rubrik terbuka, bukti terbuka, kuorum terbuka) adalah
  mekanisme utama untuk menghadapi perbedaan interpretasi.

---

## 7. Pembaruan

Dokumen ini akan diperbarui minimal setahun sekali, atau segera
setelah ada perubahan regulasi yang material. Pembaruan dicatat
di riwayat git.
