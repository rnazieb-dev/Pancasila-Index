# legacy/

Skrip sekali-jalan (one-shot) yang dipakai selama pengembangan awal untuk
menerapkan perubahan besar ke data dan UI. **Perubahan yang dilakukan
skrip-skrip ini sudah masuk ke basis kode utama** — file di sini
dipertahankan hanya untuk jejak audit.

Direktori ini dipisahkan dari `scripts/` (skrip aktif) dan `packages/data/scripts/`
(generator resmi) agar pemindai otomatis dan kontributor baru tidak
mengira file di sini adalah skrip yang dimaksudkan untuk dijalankan ulang.

## Jangan dijalankan ulang

Skrip di direktori ini ditulis untuk keadaan basis kode pada saat skrip
itu dibuat. Menjalankannya sekarang akan:

- Menerapkan perubahan yang sudah ada (idempoten atau duplikat).
- Mengganggu `build:data` dan pipeline CI.
- Memicu deteksi id ganda / near-duplikat.

Bila Anda butuh logika di salah satu skrip, salin ke skrip baru yang
disesuaikan dengan struktur saat ini.

## Kategori

- `patch-*.mjs` — tambalan UI/teks/i18n yang sudah digabung ke `apps/web/src/`.
- `fix-*.mjs` — koreksi rubrik/sila/i18n/arsip yang sudah digabung ke `packages/data/`.
- `add-anri-sources.mjs` — penambangan sumber primer ANRI; logikanya sudah
  direplikasi sebagai `packages/data/scripts/add-anri.mts`.
- `upload-loop.sh` — loop unggah PDF ke R2 saat peluncuran repositori arsip;
  sudah selesai. Versi terkini memakai `pnpm --filter @pancasila-index/data exec tsx scripts/archive-r2.mts`.
- `fix-archive.patch` — diff yang sudah diterapkan pada `archive-r2.mts`; disimpan sebagai jejak.

## Skrip resmi saat ini

Skrip yang dimaksudkan untuk dipakai ulang (bukan arsip) berada di:

- `packages/data/scripts/` — `build.mts`, `archive-r2.mts`,
  `dedupe-near-dups.mts`, `add-anri.mts`, `add-opposition-sources.mts`, dll.
- `packages/ai/scripts/` — `import.ts`, `suggest.ts`.
