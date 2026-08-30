<p align="center">
  <strong>PANCASILA INDEX</strong><br />
  <em>Seberapa Pancasila para pemegang kekuasaan Republik Indonesia?</em>
</p>

<p align="center">
  Sebuah <strong>indeks kepatuhan konstitusional berbasis bukti</strong> yang
  menilai <strong>8 organ konstitusional</strong> — Presiden, DPR, MPR, DPD, MK, MA,
  BPK, dan KY — terhadap <strong>Pancasila</strong>, <strong>Pembukaan UUD 1945</strong>,
  dan norma struktural UUD NRI 1945. Dari Proklamasi 1945 hingga hari ini.
  <strong>Setiap skor wajib bersitasi bukti primer.</strong>
</p>

<p align="center">
  <a href="https://www.pancasila.site"><strong>Kunjungi Situs</strong></a> ·
  <a href="https://www.pancasila.site/api/v1/openapi.json"><strong>REST API</strong></a> ·
  <a href="./docs/"><strong>Dokumentasi</strong></a>
</p>

<p align="center">
  <a href="https://github.com/rnazieb-dev/Pancasila-Index/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/rnazieb-dev/Pancasila-Index/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="Lisensi Kode" src="https://img.shields.io/badge/Kode-AGPL--3.0-blue.svg" /></a>
  <a href="LICENSE-DATA.md"><img alt="Lisensi Data" src="https://img.shields.io/badge/Data-CC--BY--SA--4.0-lightgrey.svg" /></a>
  <a href="https://github.com/rnazieb-dev/Pancasila-Index/releases"><img alt="Release" src="https://img.shields.io/badge/Release-v1.0.0-9cf.svg" /></a>
  <a href="https://nextjs.org"><img alt="Next.js 15" src="https://img.shields.io/badge/Next.js-15-black.svg" /></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-blue.svg" /></a>
  <a href="https://pnpm.io"><img alt="pnpm" src="https://img.shields.io/badge/pnpm-11-orange.svg" /></a>
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frnazieb-dev%2FPancasila-Index"><img alt="Deploy dengan Vercel" src="https://vercel.com/button" /></a>
</p>

---

# Ini lebih dari sekadar indeks. Ini pertanyaan berusia 80 tahun.

Setiap 17 Agustus kita menyanyikan janji yang sama. Tetapi pertanyaan yang
menggantung sejak 1945 jarang dijawab dengan jujur:

> **"Seberapa Pancasila sebenarnya para pemegang kekuasaan kita?"**

Jawaban selama ini adalah retorika. Pidato. Spanduk. Klaim.

**Pancasila Index mengubah itu.** Bukan dengan opini, melainkan dengan metode —
menjadikan pertanyaan konstitusional itu **empiris dan dapat diuji**. Untuk setiap
lembaga negara pada setiap masa jabatan, kami membedah rekam jejak kebijakan,
putusan, dan praktik ketatanegaraannya — lalu membandingkannya dengan:

| | |
|---|---|
| **Kelima Sila** | **Empat tujuan bernegara** (Pembukaan UUD 1945 alinea IV) |
| **Norma struktural UUD 1945** | negara hukum · checks & balances · kedaulatan rakyat |

Dan yang terpenting: **setiap angka wajib bertanggung jawab pada bukti.** UU,
Perppu, putusan MK/MA, Keppres, risalah sidang, arsip nasional, jurnal — semua
tertaut dan dapat dibuka kembali.

---

## Skala hari ini

|  |  |  |  |
|---:|---:|---:|---:|
| **8** organ dinilai | **50** masa jabatan | **695** peristiwa berbukti | **634** sumber primer |
| **12** dimensi penilaian | **5** bahasa | **0** referensi mati | **0** rahasia bocor |

---

## Mengapa berbeda dari indeks lain?

Indeks Demokrasi Indonesia (BPS/Bawaslu) mengukur demokrasi *per wilayah/per tahun*.
EIU Democracy Index membandingkan *antarnegara*. Pancasila Index menilai satu hal
yang tak dilakukan siapa pun:

> **Kesetiaan konstitusional aktor kekuasaan spesifik — lintas sejarah, per masa
> jabatan, berbasis dokumen primer.**

Bukan "berapa demokratis Indonesia", melainkan **"berapa Pancasila presiden ini,
DPR ini, MK ini — dan buktinya apa?"**

---

## Prinsip yang tidak bisa ditawar

- **Bebas bukti, bebas skor.** Tidak ada penilaian tanpa sitasi primer. Sekali pun subjektif, ia bisa diaudit.
- **Metodologi terbuka & berversi.** Rubrik hidup di git sebagai data. Perubahan bobot/dimensi = versi baru (`rubricVersion`), tidak pernah diam-diam.
- **AI membantu, manusia memutus.** Pipeline AI boleh mengusulkan draf, tetapi **tidak pernah** dipublikasi tanpa kurasi manusia (`ai_suggested` vs `human_confirmed`).
- **Ketidaksetujuan ditampilkan, bukan disembunyikan.** Penilaian ganda dari reviewer berbeda tampil berdampingan.
- **Bhinneka Tunggal Ika.** UI multibahasa — Indonesia lebih dulu, disusul Jawa, Sunda, Madura, Minangkabau, Bugis, dan seterusnya.

---

## Fitur utama

- **Halaman dokumen** (`/arsip/[id]`) — setiap sumber punya halaman ber-OG dengan metadata, sitasi, dan unduhan arsip primer dari repositori mandiri (Cloudflare R2).
- **Pencarian, perbandingan, ekspor** — `/cari`, `/bandingkan` (radar 8 organ), `/ekspor` (CSV/JSON), direktori aktor `/aktor`.
- **REST API v1 + OpenAPI** — `/api/v1/institutions|terms|events|assessments|sources|compare|index` dengan pagination, rate-limiter, dan UI `/api-docs`.
- **Kurasi dua-reviewer** — penerbitan butuh kuorum ≥2 approver berbeda nama, dengan jejak AuditLog dan webhook opsional.
- **i18n konten substantif** — id · en · jv · su · min (+ antrean tinjauan bahasa).
- **Kepatuhan UU PDP (No. 27/2022)** — kebijakan privasi, hak akses/ekspor & penghapusan data, consent kuki, minimalisasi data.

---

## Arsitektur

```
pancasila-index/
├── apps/web/          # Next.js 15 — antarmuka publik & kurasi
├── packages/core/     # Skema Zod + mesin penskoran (pure TypeScript, teruji)
├── packages/data/     # Rubrik & dataset YAML berversi (sumber kebenaran)
├── packages/ai/       # Heuristik klasifikasi + suggest CLI + import massal
└── docs/              # ADR & metodologi
```

Data hidup di git sebagai YAML → setiap perubahan punya jejak audit, dan **pull
request adalah mekanisme telaah sejawat**.

---

## Mulai cepat

```bash
pnpm install
pnpm dev        # aplikasi web di http://localhost:3000
pnpm test       # unit test mesin penskoran (Vitest)
pnpm build:data # validasi & gabung dataset → generated/dataset.json
pnpm build      # build produksi
```

Pipeline AI & kurasi:

```bash
# usulkan draf penilaian dari peristiwa berbukti
pnpm --filter @pancasila-index/ai suggest --term presiden-habibie
```

---

## Berkontribusi

Baik Anda manusia, **AI agent**, atau bot — kontribusi Anda kami sambut.
Lihat [CONTRIBUTING.md](CONTRIBUTING.md). Ringkasnya:

- **Koreksi fakta / tambah bukti** → PR ke `packages/data/` dengan sitasi primer.
- **Perbaikan rubrik** → usulkan perubahan dimensi/indikator/bobot + justifikasi; akan dinaikkan versinya.
- **Penilaian baru** → ikuti skema `Assessment`; satu reviewer minimum, idealnya dua.

Semua kontributor wajib mematuhi [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Lisensi

- **Kode:** [AGPL-3.0-only](LICENSE) — copyleft kuat agar karya ini tak dieksploitasi secara tertutup.
- **Data & rubrik:** [CC BY-SA 4.0](LICENSE-DATA.md).

---

<p align="center">
  <em>Kekuasaan yang lolos dari pengawasan adalah kekuasaan yang melupakan
  janjinya. Pancasila Index ada agar janji itu bisa diaudit.</em><br /><br />
  <strong>Berikan bintang — cara terbaik mengatakan: "platform ini penting."</strong>
</p>
