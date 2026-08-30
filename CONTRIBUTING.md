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
4. Penilaian lama tetap terikat `rubric_version` masing-masing — riwayat tidak
   ditulis ulang.

**Kapan aturan 3 dan 4 mulai berlaku.** Keduanya melindungi riwayat yang
sudah *dipublikasikan*. Selama belum ada satu pun penilaian berstatus
`published`, tidak ada riwayat yang bisa ditulis ulang, dan rubrik boleh
ditimpa di tempat. Begitu penilaian pertama dipublikasikan, aturan 3 dan 4
berlaku penuh dan **tidak** boleh dilanggar lagi.

Perlu diketahui: penegakannya belum ada di kode. `build.mts` hanya memuat
SATU file rubrik (yang terakhir secara abjad — dan `.sort()` itu per byte,
bukan semver, sehingga `v1.yaml` menang dari `v1.1.0.yaml`), `datasetSchema`
hanya punya satu slot rubrik, dan build menolak penilaian yang
`rubric_version`-nya bukan versi aktif. Menambahkan file rubrik kedua hari
ini akan mematikan build, bukan memulai migrasi. Dukungan multi-versi wajib
dikerjakan sebelum publikasi pertama.

### 3b. Perubahan cara menghitung (bukan isi rubrik)

Mengubah rumus agregasi tidak memindahkan dimensi, indikator, maupun bobot,
jadi tidak menaikkan versi rubrik — tetapi mengubah **setiap angka** yang
diterbitkan. Naikkan `SCORING_METHOD_VERSION` di
`packages/core/src/scoring.ts`, dan sebutkan perubahannya di changelog.
Angka yang diterbitkan selalu membawa `method_version` agar dua nilai dari
rubrik yang sama tidak bisa berbeda tanpa jejak sebabnya.

**Catatan riwayat.** Pada perubahan ke `SCORING_METHOD_VERSION` 2.0.0, bobot
grup rubrik 1.0.0 diubah di tempat dari 5/4/3 menjadi 0.40/0.30/0.30. Sah
menurut ketentuan di atas karena seluruh 45 penilaian saat itu berstatus
`draft` dan `human_confirmed: false`. Angka 40/30/30 bukan penilaian normatif
baru: `docs/metodologi.md` sudah menerbitkannya sejak lama, dan kodenya yang
belum menurutinya.

## Gaya teknis

- TypeScript strict, tanpa `any`.
- Commit mengikuti Conventional Commits (`feat:`, `fix:`, `docs:`, `data:`).
- Jalankan `pnpm typecheck && pnpm test && pnpm build` sebelum PR.

## Etika

- Netral lintas era dan ideologi: rubrik yang sama untuk semua aktor.
- Dilarang menyalin konten berhak cipta panjang ke dalam rationale;
  parafrase + kutipan pendek dengan sitasi.
- Hormati Code of Conduct standar komunitas open source.

## Aturan verifikasi fakta (wajib)

**Selalu lakukan pencarian web sebelum menambah fakta, tanggal, angka,
atau penilaian baru.** Setiap klaim dalam dataset harus bisa dipertanggung-
jawabkan ke sumber primer atau pemberitaan yang dapat ditautkan. Klaim
yang tidak dapat diverifikasi tidak boleh masuk `rationale_id` maupun
peristiwa - termasuk untuk era berjalan.
