# Remediasi Audit Integritas Data — September 2026

> Tindak lanjut atas `audit-kritik-total.md` (4 September 2026).
> Prinsip kerja: **integritas > kuantitas. Lebih baik kosong daripada fiktif.**
> Model pembersih: **Claude Opus 5** (Anthropic). Draf terdahulu dibangkitkan
> Gemini 3.8 Flash High (Google DeepMind) — pembagian peran ini dicatat pada
> `ai_disclosure.remediation` setiap asesmen dan tampil di lencana transparansi.

## Ringkasan angka

| Metrik | Sebelum | Sesudah |
| --- | ---: | ---: |
| Dialektika tesis–antitesis | 579 (554 template) | **25 substantif** |
| Kutipan pakar | 583 (554 template) | **21 bersitasi nyata** |
| Sumber | 1.034 | **673** |
| Peristiwa | 1.112 | **718** |
| Skor dimensi | 579 | 579 (5 kini `evidence_gap: true`) |
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

## Sisa pekerjaan (butuh manusia, bukan model)

- **Menulis antitesis & sintesis per dimensi.** 554 skor kini tanpa dialektika.
  Pengisian ulang wajib manual dan bersitasi terbitan nyata — jangan
  dibangkitkan massal lagi.
- **Kutipan pakar** hanya boleh ditambahkan sebagai kutipan langsung
  terverifikasi dari publikasi yang benar-benar ada.
- **Kuorum dua penelaah manusia** belum terpenuhi untuk 50 asesmen; seluruhnya
  masih berstatus draf.
- 16 sumber yatim (buku akademik nyata) dibiarkan di bibliografi; hapus atau
  tautkan sesuai kebutuhan kurasi.
