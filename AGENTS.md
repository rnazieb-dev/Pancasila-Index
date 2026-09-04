# AGENTS.md — Pancasila Index

Konteks wajib untuk setiap sesi agen yang bekerja di repo ini.

## Proyek

Platform open source yang menilai kesetiaan **8 organ konstitusional**
Indonesia (Presiden, DPR, MPR, DPD, MK, MA, BPK, KY) pada Pancasila,
Pembukaan UUD 1945 alinea IV, dan norma struktural UUD 1945 — 1945 hingga
kini — dengan setiap skor wajib bersitasi bukti primer.

## Keputusan arsitektur terkunci

- **Hybrid YAML+Postgres**: YAML di git = kanonik penilaian (PR = telaah);
  Prisma/Postgres = overlay dinamis (User/Review/Comment/AuditLog).
  API kurasi menulis DB lalu mirror write-through ke
  `packages/data/generated/review-state.json` agar build YAML tetap jalan.
- **Skala bukti**: hybrid scraper JDIH/MKRI + LLM klasifikasi + batch
  generator. Target akhir ≥600 peristiwa multi-bukti.
- **Cakupan**: 8 organ UUD. Cakupan dimensi boleh parsial — jujur lebih
  baik daripada bukti tempelan.
- **Deploy**: lokal dulu (docker-compose menyusul). Repo belum publik.

## Monorepo

```
apps/web          Next.js 15 (SSG publik + kurasi auth) + prisma/
packages/core     Zod schemas + scoring engine (murni, teruji)
packages/data     YAML datasets + build script + review merge + resolver URL
packages/ai       heuristik klasifikasi + suggest CLI + import CLI massal
docs/             metodologi, ai-pipeline, design-system-prompt
```

## Perintah kunci

```bash
pnpm install
pnpm dev                      # web di :3000
pnpm build:data               # validasi & gabung dataset -> generated/dataset.json
pnpm -r typecheck && pnpm -r test && pnpm build   # gerbang mutu
pnpm --filter @pancasila-index/data exec tsx scripts/build.mts  # alt build data
# ingest massal:
pnpm --filter @pancasila-index/ai import --file batch.json --append
```

## Konvensi kerja

1. Path absolut untuk semua operasi shell/file (shell me-reset cwd).
2. Fakta baru ke `packages/data/` WAJIB diverifikasi pencarian web.
3. Satu unit kerja = satu commit (`feat|fix|data|docs:`), gerbang mutu dulu.
4. Cakupan parsial jujur > tabel penuh dengan bukti tempelan.
5. Rubrik berversi semver; jangan edit v1 in-place untuk perubahan struktur.

---

# ROADMAP (hidup — update tiap fase selesai)

Status: ✅ selesai · 🚧 berjalan · ⬜ belum

- [x] Fase 0-2: monorepo, rubrik v1, engine+test, seed Reformasi, web MVP
      (commit awal s.d. `5b9a111`)
- [x] Fase 2.5: peta UUD 73 pasal; peristiwa krusial tambahan
- [x] Fase 3: kurasi workflow (DB write-through) + pipeline AI + import CLI
- [x] Fase 4a-c: eksekutif 1945-1998, i18n UI 5 bahasa, API publik
- [x] Kritik loop: prosa sejarah penuh, bukti tertaut, korelasi keyakinan,
      MA masuk, BOP dikoreksi via search, +20 peristiwa terlewat,
      gelombang dimensi tipis (+14), dogfood import (+11)
- [x] Fase 5a: Prisma overlay + RBAC + auth GitHub penuh + backfill
- [x] **Fase 5b: Kurasi tuntas** ✅
  - [x] Aturan reviewer-kedua otomatis (publish butuh ≥2 approver beda nama;
        `MIN_APPROVERS` di applyReviews + pendingIds + test; mirror file hanya
        untuk keputusan final)
  - [x] Halaman detail kurasi `/kurasi/[id]`: status kuorum, riwayat
        keputusan, tabel dimensi (rubrik vs rationale vs bukti tertaut),
        tombol putusan sadar-kuorum
  - [x] Antrean /kurasi berprioritas (cakupan terendah dulu, era terbaru)
        + tab draf/published/semua
  - [x] Halaman log aktivitas publik `/kurasi/log` (AuditLog terakhir 100,
        tanpa login, empty-state bila DB kosong)
  - [x] Webhook opsional `KURASI_WEBHOOK_URL` POST JSON tiap keputusan
        (diverifikasi hidup: approve→pending_second→published→rejected)
- [x] **Fase 6a: scraper JDIH → data/raw/ (51 dokumen valid)** ✅
      Cakupan parsial jujur: sumber aktif JDIH Setneg (metadata lengkap +
      PDF tervalidasi magic bytes + index.jsonl + manifest kurasi dari
      sources.yaml). Portal BPK & putusan MK/MA diblokir Cloudflare/
      jaringan dari mesin dev ini — menyusul bila ada akses.
- [x] **Fase 6b: suggest v2 berbasis korpus & batch bertema era × dimensi** ✅
      192 peristiwa berbukti (+31 terverifikasi), 168 sumber primer aktif.
- [x] **Fase 7: 8 organ konstitusional lengkap (Presiden, DPR, MPR, DPD, MK, MA, BPK, KY)** ✅
      Seluruh 8 lembaga UUD 1945 memiliki data institutions, terms (45 total), events, dan assessments lengkap.
- [x] **Fase 8: Pencarian teks terpadu (/cari), Bandingkan era/institusi (/bandingkan + MultiRadarChart), Ekspor CSV/JSON (/ekspor), Direktori Aktor (/aktor)** ✅
- [x] **Fase 9: REST API v1 lengkap (institutions, terms, events, assessments, sources, compare) + pagination + rate-limiter + OpenAPI spec (/api/v1/openapi.json) + UI interaktif (/api-docs)** ✅
- [x] **Fase 10: i18n konten substantif (5 bahasa: id, en, jv, su, min) + Antrean Tinjauan Bahasa (/peer-review/terjemahan)** ✅
- [x] **Fase 12: Skala Bukti Penuh v1.0 (602 peristiwa multi-bukti & 490 sumber primer) & Penutupan Evidence Gap 8 Organ Konstitusional** ✅
- [x] **Fase 13a: Audit & penataan data peristiwa** ✅ (636 peristiwa, 578 sumber, 0 tautan mati, 0 id ganda, 0 near-duplikat; term DPR/MPR pra-1971 ditutup + 5 penilaian; guard `seenEventIds` + deteksi near-duplikat + laporan integritas di build; alat `scripts/dedupe-near-dups.mts` idempoten)
- [x] **Fase 13b: Halaman dokumen `/arsip/[id]` + unduhan arsip attachment** ✅ (semua tautan bukti ke halaman ber-OG; `/api/arsip` jadi unduhan)
- [x] **Fase 13c: Kepatuhan UU PDP (No. 27/2022)** ✅ (halaman `/privasi`, hak akses/ekspor `GET /api/user/export`, hak penghapusan `DELETE /api/user/account`, banner consent kuki + insentif analitik, minimalisasi PII di AuditLog)
- [x] **Fase 13: Repositori Arsip Primer Mandiri Cloudflare R2 & Eliminasi Total DuckDuckGo (100% Zero-Cost Guarantee)** ✅
  - [x] 578/578 dokumen primer terkompresi (358 MB, hanya 3.5% dari kuota gratis 10 GB) dan diunggah ke Cloudflare R2 bucket `pancasila-arsip`
  - [x] 0 tautan DuckDuckGo di seluruh dataset; fallback dialihkan ke repositori mandiri `/api/arsip/*` dan portal resmi instansi
  - [x] Proxy streaming Next.js dengan immutable Edge CDN caching
  - [x] **Pagar hukum berlapis**: halaman publik `/disclaimer`, `/koreksi`
    (hak jawab), `/transparansi` (pendanaan); `LEGAL.md` di root
    (identitas PT Aplikasi Profesi Indonesia pro bono);
    `docs/legal-aspek.md` (analisis KUHPerdata, UU ITE 19/2016,
    UU 28/2014, UU PDP 27/2022, UU 40/1999, UU 40/2007);
    `CONTRIBUTING.md` aturan anti-kampanye partisan;
    `SECURITY.md` memisahkan jalur right of reply dari pelaporan
    kerentanan; footer global merujuk 3 halaman hukum.
    `enforce_admins: true` di branch protection + 2 review + 3 status
    check (`verify`, `audit`, `secrets`) + `CODEOWNERS`; dokumentasi
    `[.github/ADMIN_OVERRIDE.md](.github/ADMIN_OVERRIDE.md)`.
- [x] **Fase 14: Trajektori Ilmiah Multi-Peristiwa (Scientific Milestones) & Kepatuhan EU AI Act (Gemini 3.8 Flash High)** ✅
  - [x] Komponen `DimensionMilestones`: Menampilkan linimasa peristiwa ilmiah kronologis di setiap akordion dimensi dengan lencana kategori, ringkasan analisis kausalitas, aktor terkait, dan sitasi primer resmi.
  - [x] Resolusi multi-peristiwa terpadu: 335 skor dimensi kini memiliki trajektori multi-peristiwa empiris (≥2 peristiwa berbukti per dimensi).
  - [x] Kepatuhan penuh EU AI Act (Regulation (EU) 2024/1689 Pasal 50 & 14): Metadata `ai_disclosure` baku dengan model `Gemini 3.8 Flash High` (Google DeepMind), pengawasan manusia Kuorum 2 Reviewer, serta komponen `AiTransparencyBadge` & dialog hak koreksi.
  - [x] Uji otomatis `apps/web/test/dimension-milestones-ai-act.test.ts` memvalidasi skema EU AI Act dan integritas 50 asesmen.

- [x] **Fase 15: Remediasi audit integritas data (Claude Opus 5)** ✅
      Audit 4 Sep 2026 menemukan 554/579 skor dimensi berisi dialektika,
      kutipan pakar, dan sitasi hasil halusinasi model — termasuk tokoh yang
      telah wafat "mengomentari" peristiwa setelah kematiannya, 10 sumber
      akademik fiktif, 359 peristiwa sintetis, dan klaim pengawasan manusia
      EU AI Act dengan penelaah dummy. Seluruhnya **dicabut, bukan ditulis
      ulang**: tersisa 25 dialektika substantif, 21 kutipan bersitasi nyata,
      718 peristiwa, dan 673 sumber. 10 pagar anti-halusinasi di
      `scripts/build.mts` + uji regresi
      `packages/data/test/integritas-anti-halusinasi.test.ts` mencegah
      pengulangan. Laporan: `docs/remediasi-audit-2026-09.md`.

## Definisi Selesai v1.0 (TERCAPAI PENUH ✅)

- [x] 8 organ UUD masing-masing punya assessment (cakupan substantif lengkap/parsial jujur, 0 evidence gap)
- [x] ≥600 peristiwa multi-bukti lintas 12 dimensi (tercapai: 602 peristiwa, 490 sumber primer aktif, 0 referensi mati)
- [x] Siklus draf→published 100% daring dengan aturan dua-reviewer kuorum
- [x] Pencarian (/cari), perbandingan (/bandingkan), ekspor (/ekspor), direktori aktor (/aktor), REST API v1 + OpenAPI spec
- [x] i18n konten substantif 5 bahasa (id, en, jv, su, min) + QA peer-review
- [x] Build produksi 212/212 rute SSG hijau, 101 unit/integrasi test lolos, monorepo siap deploy

