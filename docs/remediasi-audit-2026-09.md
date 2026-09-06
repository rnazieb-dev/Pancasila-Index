# Remediasi Audit Integritas Data — September 2026

> Tindak lanjut atas `audit-kritik-total.md` (4 September 2026).
> Prinsip kerja: **integritas > kuantitas. Lebih baik kosong daripada fiktif.**
>
> **Yang dipersoalkan di sini bukan AI yang menganalisis dan memberi skor.**
> Analisis dan skor pada indeks ini memang disusun model AI, dan itu sah
> selama pembacanya tahu — karena itu setiap blok analisis kini membawa
> penanda "Analisis & skor disusun AI" di tempat analisisnya dibaca, bukan
> hanya di dialog transparansi. Yang dicabut adalah **fabrikasi**: sumber
> yang tidak ada, kutipan verbatim yang diatribusikan ke akademisi nyata
> padahal tidak pernah diucapkan, tanggal dan URL yang dikarang, serta satu
> kalimat template yang diulang ratusan kali seolah analisis per dimensi.
> Model pembersih: **Claude Opus 5** (Anthropic). Draf terdahulu dibangkitkan
> Gemini 3.8 Flash High (Google DeepMind) — pembagian peran ini dicatat pada
> `ai_disclosure.remediation` setiap asesmen dan tampil di lencana transparansi.

## Ringkasan angka

| Metrik | Sebelum | Sesudah |
| --- | ---: | ---: |
| Dialektika tesis–antitesis–sintesis | 579 (554 template, 25 bertesis) | **569 lengkap bertiga** |
| Kutipan pakar | 583 (554 template) | **21 bersitasi nyata** |
| Sumber | 1.034 | **648** |
| Peristiwa | 1.112 | **711** |
| Sumber ber-URL 404 / medan verifikasi hantu | 25 / 254 | **0 / 0** |
| Skor dimensi | 579 | 569 (5 kini `evidence_gap: true`) |
| Rasional kembar antarmasa jabatan | 248 skor | **0** |
| Blok skor `+1` seragam (penilaian template) | 12 asesmen | **0** |
| Klaim EU AI Act "verified" tanpa penelaah | 50 | **0** |

## Yang dikerjakan

### P0 — dialektika & kutipan halusinasi
- 554 blok `thesis/antithesis/synthesis` + 554 kutipan pakar hasil template
  **dicabut**, bukan ditulis ulang. `rationale_id` bersitasi dokumen primer
  tetap utuh; UI jatuh ke prosa rasional apa adanya.
- 63 `thesis_id` yang terpotong di tengah nomor dokumen ("…UU No.") hilang
  bersama blok templatenya — penyebabnya pemenggalan kalimat pada titik
  setelah "No.".
- Anakronisme fatal (Soepomo †1958 "mengomentari" putusan 2021; Adnan Buyung
  Nasution †2015 "mengomentari" pemerintahan 2024) seluruhnya berada di dalam
  blok template dan ikut tercabut. 20 kutipan tersisa diselaraskan tahunnya ke
  tahun terbit sumbernya.
- 4 label skor pada `synthesis_id` diselaraskan dengan `score` kanonik;
  4 sintesis yang **arah penilaiannya berlawanan** dengan skor dihapus
  (mis. `asm-mk08/negara-hukum`: skor -2 tetapi narasi memuji MK).
  Skor tidak diubah — nilainya sudah ada jauh sebelum pengayaan LLM
  (lihat `7fdb17b`), jadi yang keliru adalah teks, bukan angka.
- `ai_disclosure`: `human_oversight.status: draft`, `approver_count: 0`,
  approver dummy ("Pakar Hukum Tata Negara", "Penelaah Sejarah") dihapus.
  Skema menolak `verified` tanpa approver bernama, dan `AiTransparencyBadge`
  tidak lagi mengarang nama penelaah.

### P1 — sumber & peristiwa
- 8 jurnal fiktif dicabut (judul artikel tidak ada pada volume yang diklaim).
- 2 monograf tak terverifikasi dicabut (Susi Dwi Harijanti 2021, Radian
  Salman 2018); 1 duplikat fantom Bivitri Susanti dilebur ke policy paper
  aslinya.
- 10 buku nyata dikoreksi metadatanya lewat verifikasi katalog: Wirjono
  (Dian Rakyat 1974), Satya Arinanto (2003), Fitra Arsil (2017), Syaiful Aris
  (Setara Press 2022), Achmad Ruslan (Rangkang Education 2013), Bagir Manan
  (Djambatan 2009), Bintan Saragih (1988), Yance Arizona (STPN Press 2014),
  Risalah BPUPKI-PPKI (Setneg 1992 — bukan karya Soepomo 1945), Harun Alrasid
  (Pustaka Utama Grafiti).
- Placeholder `literatur-sejarah-nasional` dipecah menjadi Kahin (1952) dan
  Ricklefs (1981).
- 573 entri `evidence` hasil penempelan massal dicabut. 359 peristiwa sintetis
  (Pergub/Perda daerah bernomor seri + laporan lembaga bernomor seri dengan
  ringkasan boilerplate identik) dihapus beserta 351 sumber yatimnya.
- 35 catatan ganda dilebur menjadi 27 peristiwa kanonik; 5 tautan
  peristiwa–dimensi yang tidak nyambung diperbaiki.

### Yang **tidak** dilebur (dan alasannya)
Catatan lintas organ atas satu produk hukum — UU MK 2003 tercatat pada DPR
yang mengesahkannya *dan* pada MK yang lahir darinya — **bukan duplikasi**.
Itu linimasa masing-masing lembaga dan sengaja dipertahankan; audit
menghitungnya sebagai duplikat, di sini tidak.

## Pagar pencegah (P3)

`packages/data/scripts/build.mts` kini menggagalkan build bila:

1. satu kalimat `antithesis_id`/`synthesis_id`/`expert_quote` identik dipakai
   lebih dari 3 kali;
2. `evidence.note_id` berpola template "Kutipan struktural dari …";
3. `expert_quotes[].year` menyimpang dari tahun terbit sumbernya
   (anti-anakronisme);
4. penutur kutipan berupa nama terbitan, bukan orang;
5. label skor pada `synthesis_id` tidak cocok dengan angka `score`;
6. kalimat terpotong di tengah nomor dokumen hukum;
7. dokumen administratif daerah / peristiwa "Dokumentasi Historis:" dipakai
   sebagai bukti organ nasional;
8. dua peristiwa berbagi ringkasan identik;
9. dua peristiwa dalam satu masa jabatan dan tanggal yang sama menunjuk nomor
   dokumen hukum yang sama (sidik jari nomor dokumen — kunci lama
   `source::date` melewatkan 20 klaster yang kini tertangkap);
10. `human_oversight` berstatus `verified` tanpa approver bernama, atau
    `human_confirmed: true` sementara pengawasan masih `draft`.

Uji regresi: `packages/data/test/integritas-anti-halusinasi.test.ts` (9 invarian)
dan `apps/web/test/dimension-milestones-ai-act.test.ts`.

## Gelombang lanjutan (setelah laporan pertama)

- **25 sumber ber-URL fabrikasi dicabut.** Pemeriksaan tautan langsung atas
  seluruh sumber menemukan URL hasil tebakan pola yang semuanya HTTP 404 —
  `https://www.bpk.go.id/publikasi/lhp/2024/kemenkeu`,
  `https://komnasham.go.id/investigasi/penyiksaan/2024/1`,
  `https://jdih.jatengprov.go.id/peraturan/2024/24`, dan sejenisnya — dengan
  judul serta nomor dokumen yang ikut dibangkitkan. Enam peristiwa yang
  seluruh sumbernya fabrikasi semacam itu ikut dihapus.
- **`source_verified` ternyata medan hantu**: dipakai 254 sumber tetapi tidak
  ada di `sourceSchema`, jadi selalu dibuang saat build — klaim verifikasi
  yang tidak pernah sampai ke UI mana pun. Diganti `verification_tier` yang
  memang ada di skema (615 `official_source`, 33 `unverified`, nol
  `human_verified`). Halaman `/arsip/[id]` dulu menampilkan lencana hijau
  "Terverifikasi" pada SETIAP dokumen tanpa memandang keadaannya; kini
  lencana itu mengikuti `verification_tier`.
- **10 tanggal placeholder `YYYY-01-01` diperbaiki** lewat verifikasi web
  (Keppres 181/1998 → 9 Okt 1998; Perpres 83/2024 → 15 Agu 2024; Piagam
  Jakarta → 22 Jun 1945; Proklamasi NII → 7 Agu 1949; vonis Mahadper atas
  Kartosoewirjo → 16 Agu 1962; PKI Madiun → 18 Sep 1948; Petisi 50 → 5 Mei
  1980). Dua yang tidak dapat dipastikan diturunkan presisinya menjadi tahun.
- **Satu salah atribusi masa jabatan**: UU 23/2014 tercatat pada
  presiden-jokowi-ii padahal diundangkan 2 Oktober 2014, sebelum pelantikan
  Jokowi 20 Oktober — dikoreksi ke presiden-sby-ii.
- **Penanda AI diperjelas**: lencana tingkat penilaian tidak lagi berbunyi
  "Kuorum 2 Reviewer" (tidak pernah terjadi) melainkan "Analisis & Skor
  Disusun AI: <model> · Belum ditinjau manusia", berwarna amber selama belum
  ada penelaah; dan setiap blok analisis dimensi membawa penandanya sendiri.

## Gelombang ketiga: rasional kembar & pengisian ulang dialektika

Saat menulis ulang dialektika ditemukan lapisan kesalahan yang lebih dalam
daripada yang diaudit: **248 dari 569 skor memakai `rationale_id` kembar** —
uraian tugas lembaga yang disalin ke SETIAP masa jabatan organ yang sama.
Akibatnya MK 2003–2008 "menghasilkan" Putusan 85/PUU-XI/2013, MPR 1971–1999
"menetapkan" TAP IX/MPR/2001, dan BPK 1947–1998 "menyerahkan IHPS kepada DPD"
— lembaga yang baru ada 2004. Selain itu `asm-dpr-1971-1999` ternyata berisi
rasional milik DPD RI, lengkap dengan sitasi Putusan MK 79/PUU-XII/2014 dan
peristiwa 2024–2025.

Seluruhnya dibereskan per organ, dengan urutan: **perbaiki rasional dulu, baru
tulis dialektika.**

| Organ | Rasional ditulis ulang | Dialektika ditulis |
| --- | ---: | ---: |
| Presiden (11 masa jabatan) | 0 | 117 |
| DPR (11 masa jabatan) | 0 | 96 |
| MK (5) | 30 | 56 |
| MA (3) | 26 | 35 |
| BPK (4) | 39 | 47 |
| KY (4) | 40 | 47 |
| DPD (5) | 40 | 56 |
| MPR + MPRS (8) | 64 | 92 |
| **Total** | **239** | **546** |

Hasil: **569 dari 569 skor** kini memiliki antitesis dan sintesis yang ditulis
per dimensi, dan **nol** rasional kembar. Setiap antitesis membawa argumen
tandingan yang spesifik — untuk skor tinggi berupa sanggahan kritis, untuk skor
rendah berupa capaian yang tidak boleh diabaikan — sehingga sintesis benar-benar
menimbang dua kutub alih-alih mengulang tesis.

**Analisis dan skor ini disusun AI dan bertanda AI di UI.** Yang tetap tidak
boleh dibangkitkan AI adalah `expert_quotes`: menaruh kalimat karangan dalam
tanda kutip atas nama orang sungguhan adalah atribusi palsu, bukan soal
pelabelan. Jumlahnya tetap 21 kutipan bersitasi terbitan nyata.

Perkakasnya: `scripts/dialektika-dump.mts` (cetak konteks per skor) dan
`scripts/dialektika-apply.mts` (terapkan patch dengan penolakan menyeluruh bila
label skor tidak cocok, teks terpotong, rasional kembar, atau kalimat dipakai
lebih dari 3 kali).

## Gelombang keempat: rescoring 201 skor yang terinflasi

Setelah rasional dibereskan, terlihat penyakit yang sama pada **angkanya**:
blok skor `+1` seragam di seluruh dimensi — tanda penilaian template, bukan
penilaian. MPR pasca-2004 bahkan rata-rata **lebih tinggi** (1.17–1.42)
daripada MPR 1999–2004 (1.33) yang benar-benar mengerjakan empat tahap
amandemen, padahal kerjanya sebagian besar sosialisasi Empat Pilar,
sidang tahunan, dan pelantikan.

Anchor rubrik untuk skor `0` dipakai sebagai patokan: *"tidak ada tindakan
signifikan yang mengubah keadaan."* Memelihara norma yang ditetapkan periode
lain bukan capaian periode ini.

| Blok | Sebelum | Sesudah |
| --- | ---: | ---: |
| MPR 2004–2009 | 1.33 | **0.25** |
| MPR 2009–2014 | 1.42 | **0.08** |
| MPR 2014–2019 | 1.33 | **0.00** |
| MPR 2019–2024 | 1.17 | **0.17** |
| MPR 2024–sekarang | 1.25 | **0.00** |
| KY (4 periode) | 0.92–1.00 | **0.17–0.50** |
| DPD (5 periode) | 0.75–1.00 | **0.00–0.33** |
| BPK 1947–1998 | 0.75 | **0.08** |
| BPK 2009–2019 | 0.67 | **0.33** |
| MA revolusi–liberal | 0.92 | **0.33** |
| MA Demokrasi Terpimpin–Orde Baru | 0.33 | **−0.25** |
| DPR/KNIP 1945–1950 | 1.00 | **0.50** |

**201 skor disetel ulang**, sintesisnya ditulis ulang agar labelnya cocok.
Distribusi global berubah dari didominasi `+1` menjadi: `0` = 234, `+1` = 217,
`+2` = 27, `−1` = 51, `−2` = 40. Rata-rata global 0.246.

Rata-rata per organ sesudahnya: MK 0.80 · KY 0.33 · BPK 0.29 · DPR 0.28 ·
MPR 0.26 · DPD 0.20 · MA 0.06 · Presiden −0.02.

Pagar baru: build menolak asesmen yang seluruh dimensinya berskor sama pada
nilai positif atau negatif. Seragam **nol** dikecualikan — "tidak ada tindakan
signifikan" memang dapat berlaku menyeluruh bagi lembaga yang kewenangannya
nyaris nihil (DPD 2019–2024 dan MPR 2024–sekarang adalah dua kasus itu).

> Skor ini disusun AI dan bertanda AI. Alurnya: **AI menilai → kontributor
> manusia menelaah.** Angka mana pun di sini adalah usulan yang menunggu
> koreksi penelaah, bukan putusan final.

## Gelombang kelima: diam bukan kenetralan

Koreksi atas gelombang keempat. Skor `0` diberikan terlalu harfiah kepada MPR
dan DPD dengan alasan "tidak ada tindakan signifikan". Itu keliru: bagi organ
konstitusional yang **memegang forum dan instrumen**, diam di hadapan
pelanggaran adalah tindakan, bukan ketiadaan tindakan.

Rubrik v1 sendiri sudah menyediakan dasarnya pada anchor `-1`:

- checks-balances: *"Pengabaian berkala terhadap fungsi pengawasan"*
- sila-2: *"Pengabaian berulang; penanganan korban lambat dan setengah hati"*
- negara-hukum: *"Supremasi hukum goyah: kasus besar mengendur"*

MPR memegang **Sidang Tahunan** — satu-satunya forum konstitusional tempat
seluruh lembaga negara melapor — dan berwenang menerbitkan rekomendasi. DPD
memegang pertimbangan, pengawasan, dan rekomendasi atas urusan daerah. Tidak
memakai instrumen itu ketika konstitusi dilanggar di depan matanya adalah
pengabaian, dan pengabaian bernilai negatif.

**26 skor disetel ulang dari 0 menjadi −1**, masing-masing ditambatkan pada
pelanggaran yang terdokumentasi pada periodenya:

| Asesmen | Diam atas |
| --- | --- |
| MPR 2004–2009 | SKB Ahmadiyah 2008; bailout Century & kriminalisasi pimpinan KPK |
| MPR 2009–2014 | pengusiran Syiah Sampang 2012; Gayus, Hambalang, konflik penegak hukum |
| MPR 2014–2019 | UU MD3 2018 (pemanggilan paksa pengkritik); pelemahan KPK 2019 |
| MPR 2019–2024 | Kanjuruhan 135 tewas; TWK KPK; Wadas & Rempang; pemekaran Papua tanpa MRP; **Putusan MK 90/2023, vonis MKMK, dan pembangkangan DPR atas putusan MK** |
| MPR 2024–sekarang | korban aksi Agustus 2025; perwira aktif di jabatan sipil; Danantara; seleksi hakim MK kilat |
| DPD 2014–2019 | fungsi pengawasan berhenti selama dualisme kepemimpinan & OTT ketuanya |
| DPD 2019–2024 | **ikut merekomendasikan** pemekaran Papua alih-alih membela syarat konsultasi MRP |

Juga dimoderasi: MPR 1971–1999 tidak lagi berskor `+2` pada negara-hukum dan
tujuan-3. Koreksi Sidang Istimewa 1998 nyata, tetapi diambil setelah rezimnya
lengser — 27 tahun sebelumnya MPR justru mengesahkan produk hukum yang
melanggengkannya. Skor `+2` ("teladan") tidak dapat dipertahankan.

Rata-rata sesudahnya: MPR 2009–2014 **−0.25** · MPR 2014–2019 **−0.17** ·
MPR 2019–2024 **−0.33** · MPR 2024–sekarang **−0.42** · DPD 2019–2024 **−0.25**.
Distribusi global: `0`=213, `+1`=216, `+2`=27, `−1`=73, `−2`=40.

## Gelombang keenam: dialektika yang tidak lengkap dan salah tempat

Pengisian dialektika pada gelombang ketiga menyisakan dua cacat struktural.

**Tidak lengkap.** 544 dari 569 skor sama sekali tidak punya `thesis_id`.
Dialektika tanpa tesis bukan dialektika: pembaca hanya melihat kritik dan
kesimpulan tanpa dalil yang dikritik.

**Salah tempat.** Untuk skor negatif, yang ditulis di `antithesis_id` justru
pembelaan resmi lembaga. Menurut skema, itu `thesis_id` — *"dalil yuridis
formal / pembelaan kebijakan resmi lembaga pembuat keputusan"* — sedangkan
`antithesis_id` adalah *"sanggahan kritis doktriner para pakar, dissenting
opinion, dan realitas empiris lapangan"*. Isinya terbalik.

Seluruh 8 organ dibereskan: **569 tesis ditulis** dan **77 antitesis yang
berisi pembelaan dipindahkan ke tesis lalu diganti kritik yang sesungguhnya.**

| Organ | Tesis ditulis | Antitesis ditukar |
| --- | ---: | ---: |
| Presiden | 117 | 20 |
| DPR | 96 | 22 |
| MK | 56 | 7 |
| MA | 35 | 7 |
| BPK | 47 | 4 |
| KY | 47 | 3 |
| DPD | 55 | 9 |
| MPR + MPRS | 91 | 21 |

Contoh perbaikan pada `asm-prabowo/sila-5`:

- **Tesis** — "Pemerintah mendalilkan bahwa Makan Bergizi Gratis adalah program
  redistribusi terbesar yang pernah dijalankan republik…"
- **Antitesis** — "Putusan MK No. 40/PUU-XXIV/2026 menyatakan pembiayaannya
  wajib dipisahkan dari anggaran pendidikan…"
- **Sintesis** — "Skor Buruk (-1) karena keadilan sosial tidak sah bila
  dibangun dengan memindahkan beban ke hak dasar lain."

Pagar baru: build menolak skor dimensi yang tesis, antitesis, atau sintesisnya
kosong; menolak tesis yang sama persis dengan rasional atau antitesis; dan
tesis kini ikut diawasi ambang pengulangan >3 kali.

## Gelombang ketujuh: pengungkapan AI yang tidak jujur tentang dirinya sendiri

Enam gelombang sebelumnya membersihkan **isi** indeks. Gelombang ini
membersihkan lapisan yang seharusnya paling jujur: pengungkapan AI itu sendiri.

**Sertifikasi-mandiri kepatuhan hukum.** `article_50_compliant` bertipe
`z.literal(true)` — secara tipe, ketidakpatuhan mustahil dinyatakan — dan UI
menampilkannya sebagai lencana hijau *"EU AI Act Art. 50 Compliant"* pada 50
penilaian. Tidak ada pihak ketiga yang pernah menilainya. Penerbit tidak boleh
menyatakan dirinya patuh hukum; yang boleh dinyatakan hanya fakta yang dapat
diperiksa. Diganti `article_50_disclosed` (pengungkapan sudah dilakukan) dan
`independently_audited: false`. Lencana kini amber: *"Diungkap · belum diaudit
independen"*.

**Pengungkapan yang mengecilkan peran AI.** Dialog transparansi menyatakan AI
*"hanya digunakan sebagai alat bantu klasifikasi heuristik dan sintesis awal
dokumen"*. Terbalik dari kenyataan: model mengarang seluruh skor, rasional,
tesis, antitesis, dan sintesis. Mengecilkan peran AI **di dalam lembar
transparansi** adalah kebalikan dari transparansi. `analysis_type` juga
menyimpan `llm-assisted-synthesis`, yang menyiratkan manusia sebagai penyusun;
ditambahkan nilai jujur `llm-authored-draft`.

**Default skema yang mengklaim verifikasi manusia.** Default
`limitations_notice` berbunyi *"sepenuhnya diverifikasi oleh penelaah manusia"*
padahal `approver_count = 0` di seluruh dataset. Ranjau diam: berlaku otomatis
pada penilaian baru mana pun yang tidak menuliskan catatannya sendiri.

**Skrip yang mengarang penelaah.** `enrich-milestones-eu-ai.mts` menulis
`status: "verified"`, `approver_count: 2`, dan dua nama karangan — *"Pakar
Hukum Tata Negara"* dan *"Penelaah Sejarah"*. Kombinasi itu **lolos validasi
skema** karena jumlah nama cocok dengan hitungannya. Sekali skrip itu
dijalankan ulang, seluruh remediasi enam gelombang terhapus diam-diam.

Perbaikan lain pada gelombang ini:

| Cacat | Sebelum | Sesudah |
| --- | --- | --- |
| Label sumber | "Dokumen Primer Terverifikasi" (648, nol `human_verified`) | "Dokumen Primer Tersitasi" + "33 belum terverifikasi" |
| Angka prosa basi | 578 / 634 sumber, 695 / 636 peristiwa | dibaca dari `dataset.*.length` |
| Penanda AI per dimensi | teks "belum ditinjau" dihardcode | dibaca dari `human_oversight` |
| Sintesis pada cabang fallback | tidak pernah tampil | ikut tampil |
| `*Human-in-the-Loop*` | asterisk tampil harfiah di JSX | `<em>` |

Pagar baru (build guard 7b, diuji negatif — build gagal saat dilanggar) menolak
`analysis_type` yang mengecilkan peran AI selagi `approver_count = 0`,
`limitations_notice` yang mengklaim verifikasi manusia, dan
`independently_audited` yang dinaikkan sendiri tanpa audit pihak ketiga.

## Gelombang kedelapan: verifikasi 33 sumber & panen register JDIH

**Verifikasi 33 sumber tak terverifikasi.** Diperiksa satu per satu, bukan
dinaikkan statusnya begitu saja. 28 buku dicocokkan ke OneSearch/Perpusnas,
OpenLibrary, dan Google Books; 23 ketemu (mayoritas padanan judul 1,00) dan
kini membawa tautan rekaman katalog yang dapat dibuka, plus `author` dan
`publisher` menurut katalog. Sebelumnya 14 di antaranya berURL
`google.com/search?q=...` - URL pencarian bukan sitasi, dan pada 5 buku yang
TIDAK ketemu placeholder itu dicabut tanpa diganti apa pun.

Tier baru **`catalog_verified`**: metadata cocok dengan katalog perpustakaan
publik - membuktikan karyanya ada dan metadatanya benar, bukan membuktikan
isinya. Buku tidak pernah boleh berstatus `official_source`; ia literatur
ilmiah, bukan dokumen resmi negara.

Temuan sampingan: seluruh domain `kemdikbud.go.id` sudah mati (kementerian
menjadi Kemendikdasmen), dan `pusako.or.id` memang salah - PUSaKO berada di
`pusako.unand.ac.id`. Hasil akhir: 23 catalog_verified, 2 naik
official_source, **8 jujur tetap unverified**.

**Panen register JDIH.** 9.827 peraturan dipanen langsung dari
`peraturan.bpk.go.id` (JDIH BPK, 308.200 peraturan). Peristiwa 711 -> 10.533,
sumber 648 -> 10.475. Tiap entri membawa metadata yang dapat diperiksa sendiri:
judul resmi, nomor, tanggal penetapan dan pengundangan, sitasi Lembaran
Negara/TLN berikut jumlah halaman, status berlaku, dan tautan PDF resmi.
Ringkasannya hanya menyusun ulang metadata itu - tidak ada kalimat analisis
yang dikarang.

| Instrumen | Jumlah | Diatribusikan ke |
| --- | ---: | --- |
| UU | 1.838 | periode DPR (produk legislatif) |
| Perpu | 170 | masa jabatan Presiden |
| UU Darurat | 174 | masa jabatan Presiden |
| PP / Perpres / Keppres / Inpres | 7.639 | masa jabatan Presiden |
| TAP MPR | 2 | masa jabatan MPR |

Field baru `provenance` membedakan `kurasi` dari `register-jdih`, dan **pagar
build 5c menolak entri register dipakai sebagai bukti skor tanpa kurasi
eksplisit**. Tanpa itu, ribuan peraturan tarif dan pengangkatan pejabat akan
tampak seolah bukti empiris penilaian konstitusional - itu pengisian metrik,
bukan bukti.

**Penilaian ulang DPR Orde Baru.** `asm-dpr-1971-1999` hanya punya 2 skor
dimensi untuk 28 tahun - rasio tertipis di seluruh indeks - dan keduanya
positif, keduanya bersumber dari 1998, bulan-bulan terakhir masa jabatannya.
Skor `negara-hukum` +1 bahkan bertentangan dengan antitesisnya sendiri.

Dinilai ulang menjadi 5 dimensi, rata-rata **+1,00 -> -1,80**, dengan lima
peraturan Orde Baru yang dinaikkan ke `kurasi` sebagai bukti: UU 3/1975
(peleburan paksa sembilan partai), UU 16/1975 (kursi pengangkatan), UU 15/1975,
UU 31/1997 (peradilan militer), UU 5/1999 (pencabutan UU Referendum 1985).
Temuan empiris yang baru terlihat dari korpus: laju **8,9 UU per tahun**,
terendah dari sepuluh periode DPR dan seperlima parlemen 1950-an.

Catatan metodologis penting: **volume bukan mutu.** Perpu Soeharto justru
rendah (0,26/tahun) karena DPR-nya patuh - angka rendah di sini bukan tanda
menahan diri. Sebaliknya 120 Perpu Soekarno II (15,6/tahun) *mengukuhkan*
skor -2 yang sudah ada, bukan mengubahnya.

**Atribusi model.** Penulis utama kini `claude-opus-5` (Anthropic, tingkat
penalaran `max`) karena seluruh isi penilaian sudah ditulis ulang pada
gelombang 1-7. Draf Gemini 3.8 Flash High disimpan di `prior_draft`, bukan
dihapus: provenance adalah fakta.

## Sisa pekerjaan (butuh manusia, bukan model)

- **Menelaah 201 skor hasil rescoring AI.** Seluruhnya sudah disetel ulang
  dengan alasan yang tertulis di sintesis masing-masing, tetapi tetap berstatus
  usulan sampai penelaah manusia menyetujuinya lewat mekanisme kuorum dua
  penelaah.
- **Kutipan pakar** hanya boleh ditambahkan sebagai kutipan langsung
  terverifikasi dari publikasi yang benar-benar ada. Ini satu-satunya bagian
  yang TIDAK boleh dibangkitkan AI: menaruh kalimat karangan di dalam tanda
  kutip atas nama orang sungguhan bukan lagi soal pelabelan, melainkan
  atribusi palsu.
- **Kuorum dua penelaah manusia** belum terpenuhi untuk 50 asesmen; seluruhnya
  masih berstatus draf.
- 16 sumber yatim (buku akademik nyata) dibiarkan di bibliografi; hapus atau
  tautkan sesuai kebutuhan kurasi.
