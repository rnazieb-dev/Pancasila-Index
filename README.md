# Pancasila Index

> Indeks Kepancasilaan terbuka: menilai seberapa Pancasila para pemangku
> kekuasaan Republik Indonesia — eksekutif, legislatif, dan yudikatif — dari
> kemerdekaan 1945 hingga saat ini, berbasis bukti yang dapat diverifikasi.

[![CI](https://github.com/TODO/pancasila-index/actions/workflows/ci.yml/badge.svg)](./.github/workflows/ci.yml)

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

## Status: Fase 3–4 (kurasi, AI pipeline, dataset historis)

| Fase | Isi | Status |
|------|-----|--------|
| 0 | Scaffold monorepo, CI, lisensi | ✅ |
| 1 | Rubrik v1 + scoring engine + test | ✅ |
| 2 | Seed era Reformasi + MVP web (timeline, radar, evidence explorer) | ✅ |
| 2.5 | Peta lengkap UUD (73 pasal) + peristiwa krusial tambahan | ✅ |
| 3 | Auth GitHub + workflow kurasi + pipeline AI | ✅ |
| 5a | Prisma/Postgres overlay + RBAC 4 peran + review write-through DB→file + AuditLog | ✅ |
| 5b | Kurasi tuntas: kuorum 2 approver beda nama, halaman detail & log publik, webhook opsional | ✅ |
| 6a | Scraper JDIH Setneg → korpus `data/raw/` (51 dokumen hukum tervalidasi) | ✅ parsial* |
| 4a | Dataset eksekutif penuh 1945–1998 (Revolusi/Liberal, Demokrasi Terpimpin, Orde Baru) | ✅ draf |
| 4b | i18n bahasa daerah UI (id/jv/su/mad/min, fallback otomatis) | ✅ beta |
| 4c | API publik (/index, /rubric, /uud) | ✅ |
| 7a | Lapisan aktor: entitas orang berid, perkara hukum bersitasi + status hukum eksplisit, profil `/aktor/[id]`, re-atribusi peristiwa lintas lembaga | ✅ |
| 7b | Provenance wajib untuk indeks eksternal + script unduh dari penerbit resmi | ✅ parsial** |
| lanjutan | Legislatif & yudikatif pra-1998, terjemahan konten substantif, dewan editorial | ⬜ |

> ⚠️ Seluruh penilaian pada fase seed berstatus **DRAF** — dihasilkan sebagai
> demonstrasi metodologi dan *belum* dikurasi dewan editorial. Angka indeks
> bukan vonis akhir.
>
> \* 6a parsial: korpus dari JDIH Setneg (terbuka); portal BPK & putusan
> MK/MA diblokir Cloudflare/jaringan dari mesin pengembangan saat ini.
>
> \*\* 7b parsial: mekanismenya lengkap (skema `provenance`, verifikasi
> dihitung build, script `fetch:indices`), tetapi mayoritas titik data masih
> berstatus **belum terverifikasi** karena kebijakan egress jaringan memblokir
> seluruh host penerbit. Lihat "Indeks eksternal" di bawah.

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

# kurasi via web: cp apps/web/.env.example apps/web/.env lalu set CURATION_DEV=1
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
