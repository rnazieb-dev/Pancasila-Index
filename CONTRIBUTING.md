# Berkontribusi pada Pancasila Index

Terima kasih ingin berkontribusi! Proyek ini hanya sekuat bukti dan
metodologinya. Aturan mainnya sengaja ketat.

## Filosofi singkat

Skor tanpa bukti adalah opini. Setiap klaim dalam penilaian harus merujuk
sumber primer (produk hukum, putusan pengadilan, dokumen arsip, publikasi
ilmiah). Sumber sekunder (berita, laporan LSM) boleh melengkapi, tidak
menggantikan.

## Jenis kontribusi

### 1. Koreksi fakta & tambahan bukti

- Edit berkas YAML di `packages/data/`.
- Satu PR = satu topik (mis. "tambah peristiwa UU Cipta Kerja").
- Cantumkan sumber primer pada `sources` registry bila belum ada.
- Sertakan tautan resmi bila tersedia (JDIH, putusan3.mkri.id, dsb.).

### 2. Penilaian (assessment)

- Ikuti skema di `packages/core/src/schemas.ts`.
- Skala per dimensi: `-2` (melanggar berat) … `+2` (selaras penuh),
  lengkap dengan `confidence` 0–1 dan `rationale_id`.
- Minimal 1 reviewer; PR akan ditandai "butuh telaah kedua" hingga ada
  reviewer lain yang menyetujui.
- Penilaian berstatus `draft` tampil terpisah dari indeks publik.

### 3. Perubahan rubrik (dimensi, indikator, bobot)

Rubrik adalah inti intelektual proyek. Perubahan besar wajib:

1. Buka *issue* diskusi dulu dengan justifikasi filosofis-hukum.
2. Usulkan versi rubrik baru (semver: ubah bobot = minor, ubah struktur =
   major).
3. Jangan mengubah rubrik lama secara in-place; buat `data/rubric/vN.yaml`.
4. Penilaian lama tetap terikat `rubricVersion` masing-masing — riwayat tidak
   ditulis ulang.

## Gaya teknis

- TypeScript strict, tanpa `any`.
- Commit mengikuti Conventional Commits (`feat:`, `fix:`, `docs:`, `data:`).
- Jalankan `pnpm typecheck && pnpm test && pnpm build` sebelum PR.

## Etika

- Netral lintas era dan ideologi: rubrik yang sama untuk semua aktor.
- Dilarang menyalin konten berhak cipta panjang ke dalam rationale;
  parafrase + kutipan pendek dengan sitasi.
- Hormati Code of Conduct standar komunitas open source.
