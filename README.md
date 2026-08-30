<p align="center">
  <strong>PANCASILA INDEX</strong><br />
  <em>Seberapa Pancasila para pemegang kekuasaan Republik Indonesia?</em>
</p>

<p align="center">
  Indeks kepatuhan konstitusional berbasis bukti untuk 8 organ konstitusional —
  Presiden, DPR, MPR, DPD, MK, MA, BPK, KY — terhadap Pancasila, Pembukaan UUD
  1945, dan norma struktural UUD NRI 1945, dari 1945 hingga hari ini. Setiap skor
  bersitasi bukti primer.
</p>

<p align="center">
  <a href="https://www.pancasila.site"><strong>Kunjungi Situs</strong></a> ·
  <a href="https://www.pancasila.site/api/v1/openapi.json"><strong>REST API</strong></a> ·
  <a href="./docs/"><strong>Dokumentasi</strong></a>
</p>

<p align="center">
  <a href="https://github.com/rnazieb-dev/Pancasila-Index/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/rnazieb-dev/Pancasila-Index/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="Lisensi Kode" src="https://img.shields.io/badge/Kode-AGPL--3.0-blue.svg"></a>
  <a href="LICENSE-DATA.md"><img alt="Lisensi Data" src="https://img.shields.io/badge/Data-CC--BY--SA--4.0-lightgrey.svg"></a>
  <a href="https://github.com/rnazieb-dev/Pancasila-Index/releases"><img alt="Release" src="https://img.shields.io/badge/Release-v1.0.0-9cf.svg"></a>
  <a href="https://nextjs.org"><img alt="Next.js 15" src="https://img.shields.io/badge/Next.js-15-black.svg"></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-blue.svg"></a>
  <a href="https://pnpm.io"><img alt="pnpm" src="https://img.shields.io/badge/pnpm-11-orange.svg"></a>
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frnazieb-dev%2FPancasila-Index"><img alt="Deploy dengan Vercel" src="https://vercel.com/button"></a>
</p>

---

# Sebuah pertanyaan yang tidak pernah selesai dijawab

"Seberapa Pancasila kekuasaan kita?" Selama delapan dekade, jawabannya adalah
pidato, spanduk, dan klaim — bukan audit. Pancasila Index lahir dari kegelisahan
itu: mengubah pertanyaan konstitusional menjadi sesuatu yang bisa diuji.

Cara kerjanya sederhana. Untuk setiap masa jabatan lembaga negara, kami membedah
rekam jejak kebijakan, putusan, dan praktik ketatanegaraannya, lalu membandingkan
dengan tiga pembanding: kelima sila Pancasila, empat tujuan bernegara dalam
Pembukaan UUD 1945 alinea IV, dan norma strukturalnya (negara hukum, checks and
balances, kedaulatan rakyat).

Setiap angka di sini punya alamat. Bukan opini yang menggantung — melainkan UU,
Perppu, putusan MK/MA, keppres, risalah sidang, arsip nasional, jurnal. Bisa
dibuka ulang, bisa diperiksa.

**Dan berjalan itu nyata.** Beberapa keputusan paling baru yang masuk korpus
(dengan rujukan ke peristiwa di `dataset.json`):

- **MK, 28 Agustus 2026** — Putusan No. 282/PUU-XXIII/2025 membatalkan Pasal 240
  dan 241 KUHP (UU 1/2023) yang mengkriminalisasi penghinaan terhadap pemerintah
  dan lembaga negara, karena menciptakan efek gentar bagi kritik dan pendapat yang sah.
  (Peristiwa tercatat di korpus; cari `mk-282-puu-xxiii-2025` di `/cari`.)
- **MK, 30 Juli 2026** — Putusan No. 40/PUU-XXIV/2026: anggaran pendidikan minimum
  20% APBN/APBD hanya untuk komponen utama pendidikan; program makan bergizi gratis
  (MBG) wajib dipisahkan darinya, paling lambat APBN 2028. Skor sila-5
  (Keadilan Sosial) untuk masa jabatan Presiden saat ini teregang ke bawah karena
  keputusan ini.
- **MA, Oktober 2024** — kasasi membatalkan vonis bebas Ronald Tannur menjadi 5 tahun,
  merespons kritik publik atas praktik peradilan.
- **Presiden, 2024–kini** — peluncuran program MBG nasional di bawah Badan Gizi Nasional.
  Penilaian Presidencya masa jabatan ini di korpus membawa trade-off: inisiatif sosial
  vs. tekanan fiskal yang kini menjadi konstitusional setelah Putusan MK 40/PUU-XXIV/2026.

Korpus ini tidak diam. Ia tumbuh setiap kali ada pengujian konstitusional, putusan,
atau kebijakan baru — dan setiap tambahan ditinjau sejawat.

---

## Skala hari ini

Angka-angka di bawah berasal dari hasil `pnpm build:data` terakhir dan
bisa diaudit langsung di `packages/data/generated/dataset.json`. Sumber
rujukan untuk klaim UUD adalah teks otoritatif UUD 1945 dalam satu
naskah (Wikisource, terverifikasi terhadap Risalah Rapat Paripurna ke-5
Sidang Tahunan MPR Tahun 2002).

|  |  |  |  |
|---:|---:|---:|---:|
| **8** organ dinilai | **50** masa jabatan | **695** peristiwa berbukti | **634** sumber primer |
| **12** dimensi penilaian | **123** aktor tertaut | **37** pasal UUD 1945 (batang tubuh, setelah 4 amandemen) | **7** indeks eksternal |

Catatan tentang dua angka:

- **37 pasal** adalah penyebutan lazim untuk UUD 1945 setelah empat
  amandemen (1999-2002). Pasal 37 adalah pasal terakhir di batang
  tubuh (Bab XVI — Perubahan Undang-Undang Dasar). Bila dihitung
  per unit bernomor, batang tubuh sebenarnya memuat **73 pasal**
  (Pasal 1-37 dengan sisipan A/B/C), ditambah 3 Pasal Aturan
  Peralihan (I, II, III) dan 2 Pasal Aturan Tambahan (I, II) menjadi
  total **78 pasal**. Pembagian per bab: 16 bab utama + 5 bab sisipan
  (VIIA DPD, VIIB Pemilu, VIIIA BPK, IXA Wilayah Negara, XA HAM) = 21 bab.
  Sumber verifikasi: teks UUD 1945 dalam satu naskah (Wikisource,
  Risalah Rapat Paripurna ke-5 Sidang Tahunan MPR 2002).
- **50 masa jabatan** adalah jumlah `terms` (periode menjabat) yang
  tercatat di dataset untuk 8 organ UUD. Periode yang sama untuk
  satu aktor dihitung satu term per masa jabatan (mis. Presiden SBY
  Periode I dan Periode II dihitung terpisah). Untuk konteks
  pembacaan, dataset `terms` mencakup masa jabatan yang punya cukup
  peristiwa untuk dinilai, dengan satu term = satu periode
  menjabat.

Dataset mentah untuk indeks eksternal (RSF, WGI Rule of Law, WGI Control of
Corruption, dan empat lainnya) adalah lampiran di
`packages/data/raw/external-indices/`. Lihat [metodologi.md](docs/metodologi.md)
untuk bagaimana indeks eksternal dirangkai ke peristiwa.

## Mengapa berbeda

Indeks Demokrasi Indonesia (BPS/Bawaslu) mengukur demokrasi per wilayah per tahun;
EIU membandingkan antarnegara. Pancasila Index menilai hal yang tak dilakukan
siapa pun: **kesetiaan konstitusional aktor kekuasaan yang spesifik, lintas
sejarah, per masa jabatan, berbasis dokumen primer.**

Ini bukan "seberapa demokratis Indonesia", melainkan "berapa Pancasila presiden
ini, DPR ini, MK ini — dan buktinya apa?"

## Aturan main

Beberapa hal yang tidak kami tawar:

- Tanpa bukti primer, tanpa skor. Klaim bisa diaudit atau tidak masuk.
- Rubrik adalah data di repo ini. Mengubah bobot atau dimensi berarti versi baru — bukan amandemen diam-diam.
- AI membantu menyusun; manusia yang mengesahkan. Draf AI **diterbitkan sebagai pratinjau** agar dikaji para ahli — dan semua orang, termasuk Anda, adalah peninjunya. Label `ai_suggested` vs `human_confirmed` memisahkan draf mesin dari yang telah disahkan manusia.
- Ketidaksetujuan tampil berdampingan, bukan dibuang. Penilaian reviewer berbeda ditampilkan apa adanya.
- Bhinneka tunggal ika sampai ke antarmuka: id, en, jv, su, min — dan seterusnya.
- **Indeks ini bukan dukungan politik.** Pancasila Index adalah audit data
  terbuka untuk kepentingan publik, bukan alat kampanye atau
  pencitraan. Pengelolaan dilakukan oleh [PT Aplikasi Profesi
  Indonesia](LEGAL.md) secara pro bono dan hanya menerima pendanaan
  dari individu. Rincian pada halaman
  [Disclaimer](/disclaimer), [Koreksi / Hak Jawab](/koreksi), dan
  [Transparansi](/transparansi).

## Yang bisa Anda lakukan di dalamnya

- **/arsip/[id]** — halaman dokumen ber-OG untuk setiap sumber, dengan sitasi dan unduhan arsip primer.
- **/cari**, **/bandingkan**, **/timeline/tren**, **/ekspor** — pencarian teks, radar lintas era/organ, grafik tren historis, dan unduhan dataset CSV/JSON.
- **/aktor** — profil 123 pimpinan organ dan tokoh kenegaraan, tertaut ke peristiwa hukumnya.
- **/landasan-uud** — peta 78 pasal konstitusi dan kaitannya ke 12 dimensi.
- **/api-docs** — REST API v1 + OpenAPI, ber-pagination dan rate-limiter.
- **Kurasi dua-reviewer** — penerbitan butuh kuorum, dicatat di AuditLog, dengan webhook opsional.
- **Kepatuhan UU PDP** — kebijakan privasi, hak ekspor & penghapusan data, consent kuki.

## Arsitektur

```
pancasila-index/
├── apps/web/          # Next.js 15 — antarmuka publik & kurasi
├── packages/core/     # Skema Zod + mesin penskoran (pure TypeScript, teruji)
├── packages/data/     # Rubrik & dataset YAML berversi (sumber kebenaran)
├── packages/ai/       # Heuristik klasifikasi + suggest CLI + import massal
└── docs/              # ADR & metodologi
```

Data hidup di git sebagai YAML — setiap perubahan punya jejak audit dan pull
request adalah mekanisme telaah sejawat.

## Mulai cepat

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # unit test mesin penskoran (Vitest)
pnpm build:data # validasi & gabung dataset → generated/dataset.json
pnpm build      # build produksi
```

Pipeline AI & kurasi:

```bash
pnpm --filter @pancasila-index/ai suggest --term presiden-habibie
```

## Berkontribusi

Kontribusi datang dari **manusia yang bertanggung jawab atas bukti yang
ditautkannya.** Koreksi fakta atau tambahan bukti diajukan lewat PR ke
`packages/data/` dengan sitasi primer; perubahan rubrik lengkap dengan
justifikasi; penilaian baru mengikuti skema `Assessment`. Semua kontributor
mematuhi [Code of Conduct](CODE_OF_CONDUCT.md) dan aturan anti-manipulasi di
[CONTRIBUTING.md](CONTRIBUTING.md).

Pagar integritasnya:

- Data hidup di git sebagai YAML — **setiap perubahan punya jejak audit**, dan PR adalah telaah sejawat.
- Penerbitan penilaian butuh **kuorum dua reviewer berbeda nama** dan `human_confirmed`.
- **Pengubahan massal/otomatis tanpa sitasi ditolak.** Bot dan AI agent yang membanjiri PR untuk menggerakkan skor adalah bentuk manipulasi, bukan kontribusi.

Situs ini milik publik — bukan satu kekuasaan, dan tidak boleh diisi satu suara saja.

Temukan celah keamanan atau pola koordinasi? Lihat [SECURITY.md](SECURITY.md) untuk
jalur pelaporan privat.

## Lisensi

- **Kode:** [AGPL-3.0-only](LICENSE) — copyleft kuat agar karya ini tak dieksploitasi tertutup.
- **Data & rubrik:** [CC BY-SA 4.0](LICENSE-DATA.md).

---

<p align="center">
  <em>Kekuasaan yang lolos dari pengawasan adalah kekuasaan yang melupakan
  janjinya. Pancasila Index ada agar janji itu bisa diaudit.</em>
</p>

<p align="center"><strong>Catatan terbuka:</strong> seluruh penilaian saat ini
berstatus draf demonstrasi metodologi dan belum dikurasi dewan editorial. Indeks
bukan vonis akhir.</p>
