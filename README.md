# Pancasila Index

> **Indeks kepatuhan konstitusional Indonesia berbasis bukti.** Menilai kesetiaan
> **8 organ konstitusional** (Presiden, DPR, MPR, DPD, MK, MA, BPK, KY) terhadap
> Pancasila, Pembukaan UUD 1945 alinea IV, dan norma struktural UUD 1945 — dari
> kemerdekaan 1945 hingga kini. **Setiap skor wajib bersitasi bukti primer.**

**Produksi:** [www.pancasila.site](https://www.pancasila.site) · **REST API:** `/api/v1` (+ [OpenAPI](https://www.pancasila.site/api/v1/openapi.json)) · **Dokumen:** [docs/](docs/)

[![CI](https://github.com/rnazieb-dev/Pancasila-Index/actions/workflows/ci.yml/badge.svg)](https://github.com/rnazieb-dev/Pancasila-Index/actions/workflows/ci.yml)
[![Kode: AGPL-3.0](https://img.shields.io/badge/Kode-AGPL--3.0-blue.svg)](LICENSE)
[![Data: CC BY-SA 4.0](https://img.shields.io/badge/Data-CC--BY--SA--4.0-lightgrey.svg)](LICENSE-DATA.md)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org)
[![pnpm 11](https://img.shields.io/badge/pnpm-11-orange.svg)](https://pnpm.io)
[![Release v1.0.0](https://img.shields.io/badge/Release-v1.0.0-9cf.svg)](https://github.com/rnazieb-dev/Pancasila-Index/releases)

## Skala saat ini

| | |
|---|---|
| **8** organ konstitusional | **50** masa jabatan dinilai |
| **695** peristiwa berbukti | **634** sumber primer aktif |
| **12** dimensi (5 sila + 4 tujuan + 3 struktur) | **0** referensi mati |

## Mengapa proyek ini ada

Pertanyaan "seberapa Pancasila penguasa kita?" selama ini dijawab dengan
retorika. Pancasila Index mengubahnya menjadi pertanyaan empiris yang dapat
diuji: untuk setiap lembaga negara pada setiap periode, bagaimana rekam jejak
kebijakan dan praktik ketatatanagaannya dibandingkan dengan:

1. **Kelima Sila** Pancasila,
2. **Empat tujuan bernegara** pada Pembukaan UUD 1945 alinea IV, dan
3. **Norma struktural UUD 1945** (negara hukum, checks and balances, kedaulatan rakyat).

Berbeda dengan Indeks Demokrasi Indonesia (BPS/Bawaslu) yang mengukur demokrasi
per wilayah/tahun, atau EIU Democracy Index yang membandingkan antarnegara,
Pancasila Index menilai *kesetiaan konstitusional aktor kekuasaan spesifik
lintas sejarah* — dan setiap skor wajib bersitasi bukti primer.

## Prinsip

- **Bebas bukti, bebas skor.** Tidak ada penilaian tanpa sitasi (UU, Perppu,
  Putusan MK/MA, Keppres, arsip, jurnal).
- **Metodologi terbuka & berversi.** Rubrik tersimpan sebagai data di repo ini;
  perubahan bobot/dimensi = versi baru (`rubricVersion`), tidak diam-diam.
- **AI hanya membantu, manusia yang memutus.** Pipeline AI boleh mengusulkan
  klasifikasi dan draf rasional, tetapi tidak pernah dipublikasi tanpa kurasi
  manusia (`ai_suggested` vs `human_confirmed`).
- **Ketidaksetujuan ditampilkan, bukan disembunyikan.** Penilaian ganda dari
  reviewer berbeda ditampilkan berdampingan.
- **Bhinneka Tunggal Ika.** UI dirancang multibahasa: Indonesia lebih dahulu,
  kemudian bahasa-bahasa daerah (Jawa, Sunda, Madura, Minangkabau, Bugis, …).

## Status: v1.0 — platform lengkap (Fase 0–13)

| Fase | Isi | Status |
|------|-----|--------|
| 0 | Scaffold monorepo, CI, lisensi | ✅ |
| 1 | Rubrik v1 + scoring engine + test | ✅ |
| 2 | Seed era Reformasi + MVP web (timeline, radar, evidence explorer) | ✅ |
| 2.5 | Peta lengkap UUD (73 pasal) + peristiwa krusial tambahan | ✅ |
| 3 | Auth GitHub + workflow kurasi + pipeline AI | ✅ |
| 4a–c | Dataset eksekutif 1945–1998, i18n 5 bahasa, API publik | ✅ |
| 5a–b | Prisma/Postgres overlay + RBAC 4 peran + kurasi kuorum 2 reviewer + AuditLog + webhook | ✅ |
| 6a–b | Scraper JDIH Setneg → korpus `data/raw/` + suggest v2 & batch bertema | ✅ |
| 7 | 8 organ konstitusional lengkap (terms, events, assessments) + lapisan aktor & provenance | ✅ |
| 8–9 | Pencarian /bandingkan /ekspor /aktor + REST API v1 + OpenAPI + rate-limiter | ✅ |
| 10 | i18n konten substantif 5 bahasa (id, en, jv, su, min) + tinjauan bahasa | ✅ |
| 12–13 | Skala bukti 600+ peristiwa, arsip primer Cloudflare R2, audit data, halaman dokumen `/arsip/[id]`, kepatuhan UU PDP | ✅ |
| lanjutan | Dewan editorial publik, terjemahan substantif penuh | ⬜ |

> **Catatan:** Seluruh penilaian saat ini berstatus **DRAF-PRATINJAU** — dihasilkan
> sebagai demonstrasi metodologi dan *belum* dikurasi dewan editorial. Angka indeks
> bukan vonis akhir. Setiap perubahan skor mengikuti telaah sejawat melalui pull
> request dan kuorum dua reviewer (lihat prinsip di bawah).

## Fitur utama

- **Penilaian per masa jabatan & per dimensi** — matriks skor −2..+2 per sila/tujuan/norma struktural, dengan rasional dan bukti tertaut yang dapat diverifikasi.
- **Halaman dokumen** (`/arsip/[id]`) — setiap sumber punya halaman ber-OG berisi metadata, sitasi, dan unduhan arsip primer.
- **Pencarian, perbandingan, ekspor** — `/cari`, `/bandingkan` (radar 8 organ), `/ekspor` (CSV/JSON), direktori aktor `/aktor`.
- **REST API v1 + OpenAPI** — `/api/v1/institutions|terms|events|assessments|sources|compare|index` dengan pagination, rate-limiter, dan UI `/api-docs`.
- **Kurasi dua-reviewer** — publish butuh kuorum ≥2 approver berbeda nama, dengan jejak audit (AuditLog) dan webhook opsional.
- **i18n konten substantif** — id, en, jv, su, min (+ antrean tinjauan bahasa `/peer-review/terjemahan`).
- **Kepatuhan UU PDP (No. 27/2022)** — halaman kebijakan privasi, hak akses/ekspor & penghapusan data, consent kuki, minimalisasi data.

### Lapisan aktor (siapa, bukan cuma lembaga apa)

Indeks tetap dinilai **per masa jabatan lembaga**, bukan per kepala — itu unit
analisis rubrik dan tidak berubah. Yang ditambahkan adalah lapisan identitas di
atasnya, supaya perkara tidak lagi hilang dari halaman orangnya:

- `data/actors.yaml` — entitas orang kanonik berid. Satu orang satu entri meski
  menjabat lintas periode/lembaga. Pejabat di luar pimpinan 8 organ (menteri,
  hakim non-ketua) boleh masuk **hanya** bila sudah ada dokumen di `sources.yaml`.
- `data/actor-cases.yaml` — perkara hukum. Skema menolak perkara tanpa sumber,
  dan `status` wajib eksplisit: `terlapor` / `tersangka` / `terdakwa` /
  `terpidana` / `inkracht` / `bebas` / `dihentikan`. UI menampilkan status ini
  berdampingan dengan nama supaya asas praduga tak bersalah tidak tergilas
  tampilan indeks yang terlihat tegas.
- `event.actor_ids` — peristiwa menunjuk orang secara terstruktur, bukan lewat
  nama yang terselip di prosa `summary_id`.
- `event.subject_term_id` + `subject_basis_id` — audit BPK atau putusan MA atas
  perbuatan pejabat periode lain kini tampil **di kedua halaman**: yang
  membongkar dan yang diperiksa. `subject_basis_id` wajib diisi agar
  re-atribusinya bisa diaudit, bukan jadi tebakan sejarah.

Kekosongan sengaja dibiarkan terlihat: profil tanpa perkara berbunyi "belum ada
dokumen yang masuk korpus", bukan "bersih".

### Indeks eksternal

```bash
# unduh dari penerbit resmi, bandingkan dengan angka yang tercatat
pnpm --filter @pancasila-index/data fetch:indices
```

Script ini **tidak** menulis ulang YAML — ia mengunduh, membandingkan, dan
melaporkan selisih; kurator yang memutuskan (lihat prinsip "AI hanya membantu").
Sebuah angka baru dianggap sah bila punya blok `provenance` (tautan + tanggal
ambil + cara ambil), dan derajat verifikasi tiap indeks **dihitung build** dari
kelengkapan provenance sehingga tidak bisa diklaim manual.

Host yang perlu diizinkan agar script bisa jalan: `transparency.org`,
`worldjusticeproject.org`, `rsf.org`, `v-dem.net`, `internationalbudget.org`,
`corruptionrisk.org`, `oecd-public-integrity-indicators.org`,
`api.worldbank.org`.

### Workflow kurasi & AI

```bash
# usulkan draf penilaian dari peristiwa berbukti (heuristik / LLM)
pnpm --filter @pancasila-index/ai suggest --term presiden-habibie

# kurasi via web (LOKAL SAJA): cp apps/web/.env.example apps/web/.env lalu set CURATION_DEV=1
#   CURATION_DEV memberi peran KURATOR tanpa login. Diabaikan bila
#   NODE_ENV=production, tetapi JANGAN pernah menaruhnya di environment
#   deployment: penolakan penilaian hanya butuh satu keputusan, bukan kuorum.
pnpm dev   # buka /kurasi → Setujui/Tolak → review-state.json (jejak audit)

# terapkan keputusan kurasi ke dataset publik
pnpm build:data && pnpm build
```

Detail: [docs/ai-pipeline.md](docs/ai-pipeline.md).

## Struktur repo

```
pancasila-index/
├── apps/web/          # Next.js 15 — antarmuka publik
├── packages/core/     # skema Zod + mesin penskoran (pure TypeScript)
├── packages/data/     # rubrik & dataset YAML berversi (sumber kebenaran)
└── docs/              # arsitektur keputusan (ADR), metodologi
```

Data hidup di git sebagai YAML → setiap perubahan penilaian punya jejak audit,
dan pull request menjadi mekanisme telaah sejawat. Integrasi database (Prisma)
menyusul di Fase 3 untuk mendukung workflow kurasi daring.

## Menjalankan lokal

```bash
pnpm install
pnpm dev        # aplikasi web di http://localhost:3000
pnpm test       # unit test scoring engine (Vitest)
pnpm build      # build produksi
```

## Berkontribusi

Lihat [CONTRIBUTING.md](CONTRIBUTING.md). Ringkasnya:

- **Koreksi fakta / tambah bukti**: PR ke `packages/data/` dengan sitasi primer.
- **Perbaikan rubrik**: usulkan perubahan dimensi/indikator/bobot beserta
  justifikasi; akan dinaikkan versinya.
- **Penilaian baru**: ikuti skema `Assessment`; minimal satu reviewer, idealnya dua.

## Lisensi

- Kode: [AGPL-3.0-only](LICENSE)
- Data & rubrik: [CC BY-SA 4.0](LICENSE-DATA.md)
