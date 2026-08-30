## Deskripsi perubahan

<!-- Ringkas apa yang diubah dan mengapa. Satu PR = satu topik. -->

## Jenis perubahan

- [ ] Data (`packages/data/`): koreksi fakta / tambahan bukti / penilaian
- [ ] Rubrik (`packages/core/`): perubahan dimensi / indikator / bobot
- [ ] Web (`apps/web/`): perbaikan fitur atau tampilan
- [ ] Dokumentasi
- [ ] Lainnya: ...

## Bukti & referensi

<!-- Untuk perubahan data: cantumkan source_id & tautan primer yang mendukung.
Skor tanpa bukti primer adalah opini dan tidak akan diterima. -->

## Langkah verifikasi

- [ ] `pnpm build:data` lolos (validasi referensi silang & integritas)
- [ ] `pnpm -r typecheck` lolos
- [ ] `pnpm -r test` lolos
- [ ] `pnpm build` lolos

## Relevansi

<!-- Dimensi/lembaga/era mana yang disentuh perubahan ini? -->
