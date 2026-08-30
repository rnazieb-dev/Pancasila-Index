# Protokol Admin Override (admin bypass)

Dokumen ini menjelaskan **satu-satunya cara yang sah** bagi admin repo untuk
menggabungkan perubahan ke `main` ketika kuorum dua reviewer + `CODEOWNERS`
belum terpenuhi. Protokol ini ada karena owner tunggal saat ini belum
memiliki kontributor kedua yang bisa menyetujui PR.

## Prinsip

> **Admin boleh bypass — tapi tercatat, bukan diam-diam.**

Kekuatan untuk bypass adalah **risiko keamanan**, bukan privilese. Karena
itu setiap bypass harus meninggalkan jejak audit yang bisa dilacak oleh
siapa pun (termasuk kontributor baru di masa depan).

## Mekanisme

Karena `pancasila-index` adalah **personal repository** (bukan organisasi),
GitHub tidak mengizinkan `bypass_pull_request_allowances.users` —
daftar user yang boleh bypass hanya tersedia untuk repo organisasi.

Untuk personal repo, satu-satunya cara admin override yang tercatat
adalah: **buka PR biasa, lalu admin merge lewat UI dengan opsi
"Merge without waiting for requirements"**. Fitur UI ini tersedia
untuk admin repo walaupun `enforce_admins: true` — ia hanya memastikan
bahwa **push langsung lewat CLI ditolak**, sehingga setiap perubahan
harus lewat PR (yang menciptakan jejak audit).

Override **tidak** berarti:
- `git push origin main` langsung (akan ditolak oleh `enforce_admins`).
- Mengubah aturan tanpa diskusi.

Override **ya** berarti:
- Branch + push seperti biasa (`git push origin chore/...`).
- Buka PR lewat UI: <https://github.com/rnazieb-dev/Pancasila-Index/compare>
- Tunggu CI hijau (`verify`, `audit`, `secrets`).
- Klik **"Merge without waiting for requirements"** (admin override) di
  halaman PR, dengan komentar yang menjelaskan:
  ```
  Admin override: <alasan konkret>. Track: <nomor issue atau deskripsi>.
  ```
- Audit log GitHub merekam: siapa, kapan, PR nomor berapa, dan komentar.

## Kapan boleh dipakai

1. **Self-fix oleh owner** — perbaikan yang jelas (typo, security patch,
   build break) di mana menunggu kontributor kedua = kerugian lebih besar
   dari risiko bypass.
2. **Patch keamanan darurat** — CVE yang memengaruhi produksi.
3. **Dokumentasi yang tidak memengaruhi data/skor** — typo, link rusak,
   klarifikasi bahasa.

## Kapan TIDAK boleh dipakai

- Perubahan pada `packages/data/` yang mengubah skor, peristiwa, atau
  sumber. Untuk ini: tetap butuh 2 reviewer manusia.
- Perubahan rubrik (`data/rubric/v*.yaml`). Untuk ini: butuh diskusi
  terbuka + 2 reviewer manusia.
- Perubahan CI/CD yang melemahkan pagar (audit, secrets, codeowner).
  Untuk ini: butuh diskusi terbuka + 2 reviewer manusia.

## Cara yang benar untuk owner

1. `git checkout -b chore/<deskripsi>` di mesin lokal.
2. Edit file yang relevan.
3. `git commit -m "<conventional commit>"` + `git push origin chore/...`.
4. Buka PR lewat UI: <https://github.com/rnazieb-dev/Pancasila-Index/compare>
5. Tunggu CI hijau (`verify`, `audit`, `secrets`).
6. **Kasus A — kontributor kedua ada**: minta approval.
6. **Kasus B — owner sendirian**: klik **"Merge without waiting for
   requirements"** dengan komentar PR yang menjelaskan:
   ```
   Admin override: <alasan konkret>. Track: <nomor issue atau deskripsi>.
   ```
7. Setelah merge, log tertulis di audit GitHub dan terlihat di halaman PR.

## Cara yang salah (jangan dilakukan)

- `git push origin main` langsung (akan ditolak oleh `enforce_admins`).
- Mematikan `enforce_admins` lalu push, lalu menyalakan lagi, tanpa
  tercatat di PR.
- Meminta kontributor tepercaya untuk menyetujui tanpa review nyata
  ("rubber-stamping").

## Audit & akuntabilitas

- Audit log GitHub merekam semua override — dapat dilihat di
  `Insights → Network` atau via `gh api`.
- Bila pola override terlihat digunakan untuk menerobos pagar integritas,
  ini akan diperlakukan sebagai insiden keamanan (lihat SECURITY.md).
- Bila owner tidak lagi aktif, bypass_actors harus ditinjau ulang —
  kontributor kedua yang ditunjuk harus punya kemampuan untuk **mencabut**
  bypass dari owner jika diperlukan (transisi tata kelola).
