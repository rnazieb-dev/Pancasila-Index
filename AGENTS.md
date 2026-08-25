# AGENTS.md — Pancasila Index

Konteks wajib untuk setiap sesi agen yang bekerja di repo ini.

## Proyek

Platform open source yang menilai kesetiaan **8 organ konstitusional**
Indonesia (Presiden, DPR, MPR, DPD, MK, MA, BPK, KY) pada Pancasila,
Pembukaan UUD 1945 alinea IV, dan norma struktural UUD 1945 — 1945 hingga
kini — dengan setiap skor wajib bersitasi bukti primer.

## Keputusan arsitektur terkunci

- **Hybrid YAML+Postgres**: YAML di git = kanonik penilaian (PR = telaah);
  Prisma/SQLite(→Postgres) = overlay dinamis (User/Review/Comment/AuditLog).
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
- [ ] **Fase 6a: scraper JDIH + MKRI → data/raw/ (≥50 dokumen)** ← BERIKUTNYA
- [ ] Fase 6b: LLM suggest v2 berbasis korpus; +250 peristiwa terverifikasi
- [ ] Fase 7: lembaga MPR, DPD, BPK, KY lengkap (term/peristiwa/assessment)
- [ ] Fase 8: pencarian teks; Bandingkan era/institusi (radar overlay);
      ekspor CSV/PDF; halaman aktor
- [ ] Fase 9: API lengkap + pagination/filter + OpenAPI UI + rate-limit
- [ ] Fase 10: i18n konten substantif (mesin → antrean tinjauan manusia)
- [ ] Fase 11: docker-compose + Dockerfile; Playwright e2e 5 jalur;
      Lighthouse ≥90; SECURITY.md; CODE_OF_CONDUCT.md

## Definisi Selesai v1.0

- 8 organ UUD masing-masing punya assessment (boleh cakupan parsial jujur)
- ≥600 peristiwa multi-bukti lintas 12 dimensi; 0 referensi mati
- Siklus draf→published 100% daring dengan aturan dua-reviewer
- Pencarian, perbandingan, ekspor hidup; API lengkap berdokumen OpenAPI
- i18n konten lolos QA sampel 5 bahasa; e2e hijau; compose up = utuh
