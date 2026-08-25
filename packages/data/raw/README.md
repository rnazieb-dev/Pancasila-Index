# data/raw — korpus mentah (fase 6a)

Korpus terkini: **51 dokumen produk hukum** (semua tervalidasi magic bytes
`%PDF-`). 44 berkas kecil ikut dikomit; **7 berkas besar (>15 MB) hanya
tersimpan lokal** dan TIDAK dikomit demi ukuran repo — daftarnya di bawah;
URL unduh permanennya tetap tercatat di `index.jsonl` (`pdf_url`) sehingga
siapa pun bisa melengkapi secara reproduksi:

| key | ukuran | alasan |
|-----|--------|--------|
| PERPU-2-2022 | 64 MB | salinan lampiran raksasa |
| UU-1-2023 (KUHP) | 24 MB | scan satu berkas |
| UU-11-2020 (Cipta Kerja) | 54 MB | idem |
| UU-17-2023 (Kesehatan) | 19 MB | idem |
| UU-23-2014 (Pemda) | 23 MB | idem |
| UU-6-2023 (IKN penetapan Perppu) | 85 MB | idem |
| UU-7-2017 (Pemilu) | 26 MB | idem |

13 instrumen yang disitasi sumber tidak tersedia di mirror ini
(umumnya era pra-1999: UU 1/1946, UU 1/1974, UU 7/1976, UU 8/1985,
KEPPRES 125/1999, KEPPRES 6/2000, UU 2/2002, UU 23-24/2003, UU 27 & 32/2004,
UU 1 & 15/2004). Mereka tetap tercantum di `jdih-manifest.json` agar
kelak bisa dipanen dari sumber lain.

## Isi

- `jdih-manifest.json` — daftar instrumen target (hasil kurasi dari
  `sources.yaml` + tambahan manual). Dikomit agar fetch dapat direproduksi.
- `index.jsonl` — metadata per dokumen (nomor, tahun, tentang, status,
  tanggal, relasi mengubah/dicabut, URL sumber & PDF, `cited_by`,
  `pdf_in_repo`). Dikomit; satu baris JSON per dokumen.
- `pdf/<IDPERATURAN>.pdf` — berkas asli dari JDIH Setneg.

## Sumber & kesopanan

Sumber aktif: **JDIH Kementerian Sekretariat Negara** (`jdih.setneg.go.id`)
— tanpa Cloudflare, robots.txt menandai `search=yes, use=reference`
(pemakaian kita: sitasi/referensi riset). Scraper memakai jeda
antarmintaan (default 1,5 s), UA identitas, dan validasi magic bytes.

Belum terjangkau dari jaringan pengembang ini (jujur: cakupan parsial):
portal BPK `peraturan.bpk.go.id` (Cloudflare challenge) dan portal putusan
MK/MA (`mkri.id`, `putusan3.mahkamahagung.go.id` — koneksi gagal/403).
Scraper untuk keduanya menyusul bila ada akses jaringan yang memungkinkan.

## Pemakaian

```bash
pnpm --filter @pancasila-index/data scrape:jdih manifest  # buat manifest
pnpm --filter @pancasila-index/data scrape:jdih plan      # cek kecocokan
pnpm --filter @pancasila-index/data scrape:jdih fetch     # unduh korpus
```

Idempoten: PDF yang sudah ada tidak diunduh ulang; `index.jsonl`
diperbarui bertahap. Batas ukuran unduh lokal dapat diatur lewat
`SCRAPE_MAX_BYTES` (default 100 MB); batas komit 15 MB disimpan pada
field `pdf_in_repo`.
