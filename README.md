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

## Status: Fase 2 (MVP)

| Fase | Isi | Status |
|------|-----|--------|
| 0 | Scaffold monorepo, CI, lisensi | ✅ |
| 1 | Rubrik v1 + scoring engine + test | ✅ |
| 2 | Seed era Reformasi + MVP web (timeline, radar, evidence explorer) | 🚧 |
| 3 | Auth + workflow kurasi + pipeline AI | ⬜ |
| 4 | Dataset historis penuh (Orba, Demokrasi Terpimpin/Liberal) + bahasa daerah + API publik | ⬜ |

> ⚠️ Seluruh penilaian pada fase seed berstatus **DRAF** — dihasilkan sebagai
> demonstrasi metodologi dan *belum* dikurasi dewan editorial. Angka indeks
> bukan vonis akhir.

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
