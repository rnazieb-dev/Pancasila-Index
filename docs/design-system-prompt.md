# Prompt Design System — Pancasila Index

> Dokumen ini adalah **prompt siap-tempel** untuk desainer atau AI generatif
> (v0, Figma AI, Claude, dll.) agar menghasilkan UI yang konsisten dengan
> identitas Pancasila Index. Salin blok di bawah garis pemisah.

---

## PROMPT: Desain UI "Pancasila Index"

Anda adalah desainer sistem senior yang menguasai antarmuka data-jurnalistik.
Rancang antarmuka untuk **Pancasila Index** — platform open source yang menilai
kesetiaan lembaga negara Indonesia (eksekutif, legislatif, yudikatif) dari
1945 hingga kini terhadap Pancasila, Pembukaan UUD 1945 alinea IV, dan norma
struktural UUD 1945, dengan setiap skor wajib bersitasi bukti primer.

### 1. Karakter visual

Gaya keseluruhan: **"arsip negara bertemu data journalism"** — serius,
tenang, terpercaya seperti lembar fakta; bukan dashboard SaaS yang ramai,
bukan situs berita yang sensasional.

- Tema gelap sederhana: latar `#0B0F1A`, panel `#121828`, garis `#232C44`,
  teks `#E7ECF5`, teks sekunder `#8B96AD`.
- Satu warna aksen identitas: **merah bendera** (`#EF4444` dan varian) hanya
  untuk elemen brand, titik timeline, dan label kategori — **tidak pernah**
  dipakai untuk menyatakan nilai baik/buruk.
- Tanpa gradien dekoratif, tanpa drop shadow besar, tanpa ilustrasi figuratif.
  Kedalaman dibuat dari border 1px + kontras panel, bukan bayangan.
- Radius konsisten: `rounded-md` (6px) untuk kontrol, `rounded-lg/xl` (8–12px)
  untuk kartu. Pill penuh (`rounded-full`) hanya untuk badge status/skor.

### 2. Semantik warna skor (sangat penting)

Skala penilaian bersifat **bipolar −2..+2** (indeks 0–100, pusat 50 = netral).
Warna adalah data, jadi harus deterministik:

| Rentang skor | Warna | Hex |
|---|---|---|
| ≤ −1.5 (melanggar berat) | merah | `#EF4444` |
| < 0 (menggerus) | oranye | `#FB923C` |
| 0 (netral) | abu slate | `#94A3B8` |
| ≤ +1 (memperkuat) | lime | `#A3E635` |
| > +1 (selaras penuh/teladan) | hijau | `#22C55E` |

Aturan wajib:
1. **Jangan andal pada warna saja** — selalu sertakan angka (`+1.5`,
   `−2.0`) dan/atau tanda arah (▲▼●). Pengguna buta warna harus tetap bisa
   membaca.
2. Netral (0) harus terlihat *sengaja* (abu), bukan seperti error/loading.
3. Skor tampil dalam kontainer gelap-transparan warna sama (`${warna}22`
   sebagai latar, `${warna}` sebagai teks) — jangan pakai warna solid pekat.

### 3. Tipografi

- Sans-serif sistem (Inter/system-ui); tanpa font display eksternal.
- Hierarki ketat: H1 36–48px bold · H2 18–20px semibold · body 14px ·
  meta/keterangan 11–12px `#8B96AD`.
- Angka skor selalu `tabular-nums` dan monospace-ish agar kolom rapi.
- Teks rasional hukum/sejarah memakai leading longgar (leading-relaxed);
  kutipan pasal memakai italic.

### 4. Komponen inti (wajib tersedia)

1. **ScorePill** — badge skor: latar transparan 13%, teks warna semantik,
   lebar minimum agar `−2.0`…`+2.0` sejajar.
2. **IndexBar** — bar horizontal tipis (h-8px) di atas track `#232C44`;
   panjang = persentase indeks; ujung bulat; nilai numerik di kanan.
3. **RadarChart** — SVG poligon 5 sumbu (Sila 1–5), pusat = −2, tepi = +2,
   cincin tiap 1 poin, cincin nol bergaris putus; label di luar;
   stroke poligon = warna semantik rata-rata.
4. **Timeline vertikal** — garis 1px di kiri, titik berwarna semantik
   dengan ring warna latar; kartu masa jabatan: nama, periode,
   ScorePill, persen cakupan dimensi.
5. **Kartu Bukti/Sitasi** — chip kecil dengan awalan 📄 + judul sumber,
   truncate satu baris, tooltip judul penuh; daftar bullet untuk bukti
   per dimensi. Sitasi adalah wajib visual: **skor tanpa chip bukti
   dianggap cacat desain**.
6. **Badge Draf** — pill amber (`amber-400` di atas latar `amber-500/10`,
   titik berdenyut) menandai "belum dikurasi". Harus terlihat di setiap
   halaman bernilai draf; jangan pernah membuat draf tampak final.
7. **Accordion Dimensi** — `<details>` per dimensi rubrik: header =
   ScorePill + nama dimensi + keyakinan%; isi = pertanyaan rubrik
   (italic), rasional, daftar bukti, peristiwa terkait.
8. **StatCard** — kartu angka besar (24px bold) + label kecil; grid 5
   kolom di desktop, 2 di mobile.
9. **LocaleSwitcher** — deretan tombol kode bahasa 2 huruf (ID/JV/SU/
   MAD/MIN), aktif = latar `red-500/20`; bahasa non-Indonesia berlabel
   beta via tooltip.
10. **EmptyState** — pesan tenang untuk data belum ada ("belum dinilai"),
    tanpa ilustrasi lucu.

### 5. Tata letak

- Container maksimum 1152px (max-w-6xl), padding horizontal 16px.
- Halaman detail: header (breadcrumb ← lembaga, judul besar, periode,
  aktor), kartu ringkasan indeks besar, lalu radar + skor grup berdampingan
  (grid `320px_1fr` di ≥md), lalu accordion dimensi, lalu daftar peristiwa.
- Mobile-first: semua baris fleksibel membungkus (`flex-wrap`), navigasi
  scroll horizontal, radar max-width layar.
- Spasi antar-seksi besar (mt-10..12); di dalam kartu rapat (gap-2..3).

### 6. Aksesibilitas & etika tampilan

- Kontras teks minimal WCAG AA pada tema gelap.
- Setiap grafik punya aria-label; accordion dapat dioperasikan keyboard.
- Jangan gunakan metafora medali/jempol/muka untuk skor — ini penilaian
  analitis, bukan kompetisi.
- Disclaimer draf & lisensi selalu ada di footer setiap halaman.
- Jangan tampilkan indeks agregat lintas era tanpa label versi rubrik.

### 7. Nada bahasa (Bahasa Indonesia)

Formal-netral, presisi hukum, tanpa kata sifat menjilat/menjelekkan.
Sebut sumber dengan nomor lengkap ("UU No. 40 Tahun 2008 tentang…").
Frasa pembatas wajib: "dinilai", "tercatat", "menurut temuan X" — hindari
"terbukti", "pasti", "scandal".

### 8. Deliverable yang diminta

Hasilkan: (a) palet token CSS/Tailwind, (b) spesifikasi komponen 10 item
di atas dengan state default/hover/disabled, (c) mockup halaman detail
masa jabatan (desktop + mobile), (d) catatan pelanggaran aturan jika ada.
Gunakan Tailwind utility; tanpa library komponen eksternal.

---
*Akhir prompt. Versi hidup dari sistem ini ada di `apps/web/src/app/globals.css`
dan komponen `src/components/`.*
