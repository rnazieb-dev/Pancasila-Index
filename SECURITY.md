# Keamanan & Pelaporan Kerentanan — Pancasila Index

Pancasila Index menilai kekuasaan, sehingga integritas datanya adalah aset yang
paling berharga — dan juga target yang paling menarik. Halaman ini menjelaskan
cara melaporkan masalah keamanan dan bagaimana kami menanganinya.

## Ruang lingkup keamanan

Kami memperlakukan hal-hal berikut sebagai masalah keamanan:

- **Integritas data penilaian** — upaya mengubah skor, bukti, atau peristiwa
  tanpa dasar yang dapat dipertanggungjawabkan (termasuk koordinasi bot/AI agent).
- **Kerahasiaan & pelindungan data** — kebocoran data pribadi, akses tanpa izin
  ke informasi kontributor, kegagalan penegakan UU PDP (No. 27/2022).
- **Autentikasi & otorisasi** — bypass login GitHub, eskalasi peran
  (`KONTRIBUTOR` → `KURATOR`/`ADMIN`), akses ke endpoint kurasi tanpa kuorum.
- **Kode & infrastruktur** — injeksi, SSRF, path traversal pada `/api/arsip/*`,
  kebocoran token/rahasia pada riwayat git, kerentanan dependensi.
- **Ketersediaan** — penyalahgunaan rate-limit, serangan DoS pada endpoint publik.

## Cara melaporkan

Jangan membuka *public issue* untuk masalah keamanan yang dapat dieksploitasi.
Kirim laporan privat ke:

- **Email:** `tim@pancasila.site`
- **Subjek:** `[SECURITY] <ringkasan singkat>`

Sertakan sebanyak mungkin:

1. Jenis kerentanan dan dampaknya.
2. Langkah reproduksi (URL, permintaan, payload) — tanpa menyertakan data pribadi nyata.
3. Yang terdampak (endpoint, rute, tabel data).
4. Bukti/screenshot (bila aman).

## Yang kami janjikan

- **Rahasia.** Kami merahasiakan identitas pelapor dan tidak membalas dengan
  tindakan bermusuhan.
- **Respons cepat.** Kami mengakui laporan dalam 72 jam, lalu kirim perkiraan
  penanganan.
- **Kredit (opsional).** Bila Anda menghendaki, kami cantumkan nama/alias Anda
  sebagai pelapor setelah kerentanan ditutup.
- **Koordinasikan, jangan eksploitasi.** Kami meminta Anda menguji pada
  lingkungan yang Anda kendalikan, bukan pada produksi, dan memberi kami waktu
  untuk memperbaiki sebelum detail dipublikasikan.

## Kebijakan anti-manipulasi

Bagian terpenting untuk proyek ini: **koordinasi untuk menggerakkan skor adalah
kerentanan, bukan kontribusi.** Lihat [CONTRIBUTING.md](CONTRIBUTING.md) →
"Integritas & anti-manipulasi". Perilaku seperti membanjiri PR dengan bot/AI
agent, menerbitkan akun baru serentak untuk menyetujui PR yang sama, atau
mengubah skor tanpa sitasi primer akan ditanggapi sebagai insiden keamanan.

## Membantu yang membangun

Bila Anda menemukan lubang kecil, Anda tetap dipersilakan membuka *issue* atau PR
biasa — dengan satu topik dan sitasi yang dapat diperiksa. Kami menyambut telaah
yang membangun dari siapa pun, termasuk AI agent — selama **manusia yang
mengajukan tetap bertanggung jawab penuh** atas kebenaran setiap perubahan.
