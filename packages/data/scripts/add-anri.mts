import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const path = join(__dirname, "../data/sources.yaml");

const fileContent = readFileSync(path, "utf8");
const sources: any[] = parse(fileContent) || [];

const existingIds = new Set(sources.map((s) => s.id));

const newAnriSources = [
  {
    id: "anri-piagam-jakarta-1945",
    type: "arsip-nasional",
    title_id: "Naskah Asli Piagam Jakarta (Jakarta Charter) 22 Juni 1945",
    year: 1945,
    citation_id: "ANRI Koleksi No. 17 / Pandji Soerachman; Risalah BPUPKI",
    url: "https://anri.go.id"
  },
  {
    id: "anri-risalah-bpupk-pringgodigdo-1945",
    type: "arsip-nasional",
    title_id: "Notulen Stenografis Sidang Panitia Perancang UUD BPUPK 11-16 Juli 1945",
    year: 1945,
    citation_id: "ANRI Notulen Mr. A.G. Pringgodigdo; Setneg RI 1995",
    url: "https://anri.go.id"
  },
  {
    id: "anri-maklumat-wakil-presiden-x-1945",
    type: "arsip-nasional",
    title_id: "Maklumat Pemerintah No. X tanggal 3 November 1945 tentang Pendirian Partai Politik",
    year: 1945,
    citation_id: "Berita Repoeblik Indonesia Th. I No. 2; ANRI Koleksi Maklumat",
    url: "https://anri.go.id"
  },
  {
    id: "anri-maklumat-kabinet-parlementer-1945",
    type: "arsip-nasional",
    title_id: "Maklumat Pemerintah 14 November 1945 tentang Pertanggungjawaban Menteri kepada Parlemen",
    year: 1945,
    citation_id: "Berita Repoeblik Indonesia Th. I No. 2; ANRI Koleksi Kabinet",
    url: "https://anri.go.id"
  },
  {
    id: "anri-mandat-kawat-pdri-1948",
    type: "arsip-nasional",
    title_id: "Kawat Telegram Mandat Pembentukan Pemerintah Darurat Republik Indonesia (PDRI) 19 Desember 1948",
    year: 1948,
    citation_id: "ANRI Dokumen Kawat Sandi Militer Bukittinggi 1948",
    url: "https://anri.go.id"
  },
  {
    id: "anri-mandat-diplomasi-maramis-1948",
    type: "arsip-nasional",
    title_id: "Kawat Mandat Pemerintahan Pengasingan Luar Negeri di New Delhi (Maramis-Palar) 19 Desember 1948",
    year: 1948,
    citation_id: "ANRI Arsip Diplomasi RI di India / PBB 1948",
    url: "https://anri.go.id"
  },
  {
    id: "anri-perjanjian-linggarjati-1947",
    type: "arsip-nasional",
    title_id: "Naskah Asli Perjanjian Linggarjati antara Republik Indonesia dan Kerajaan Belanda 25 Maret 1947",
    year: 1947,
    citation_id: "ANRI Koleksi Perjanjian Internasional RI No. 01/1947",
    url: "https://anri.go.id"
  },
  {
    id: "anri-perjanjian-renville-1948",
    type: "arsip-nasional",
    title_id: "Naskah Resmi Persetujuan Renville di Atas Kapal Perang USS Renville 17 Januari 1948",
    year: 1948,
    citation_id: "ANRI Arsip Delegasi RI Komisi Tiga Negara (KTN) 1948",
    url: "https://anri.go.id"
  },
  {
    id: "anri-perjanjian-roem-roijen-1949",
    type: "arsip-nasional",
    title_id: "Naskah Asli Pernyataan Bersama Roem-Roijen (Pernyataan Roem & Van Roijen) 7 Mei 1949",
    year: 1949,
    citation_id: "ANRI Koleksi Naskah Perundingan RI-Belanda 1949",
    url: "https://anri.go.id"
  },
  {
    id: "anri-konferensi-antar-indonesia-1949",
    type: "arsip-nasional",
    title_id: "Piagam Hasil Konferensi Antar-Indonesia antara RI dan BFO di Kaliurang & Batavia Juli–Agustus 1949",
    year: 1949,
    citation_id: "ANRI Koleksi Risalah Konferensi Antar-Indonesia 1949",
    url: "https://anri.go.id"
  },
  {
    id: "anri-kmb-den-haag-1949",
    type: "arsip-nasional",
    title_id: "Naskah Resmi Piagam Penyerahan dan Pengakuan Kedaulatan Konferensi Meja Bundar Den Haag 27 Desember 1949",
    year: 1949,
    citation_id: "Lembaran Negara RIS 1949 No. 1; ANRI Koleksi KMB",
    url: "https://anri.go.id"
  },
  {
    id: "anri-piagam-persetujuan-nkri-1950",
    type: "arsip-nasional",
    title_id: "Piagam Persetujuan Pembentukan Kembali Negara Kesatuan Republik Indonesia 19 Mei 1950",
    year: 1950,
    citation_id: "Lembaran Negara RIS No. 37 Tahun 1950; ANRI",
    url: "https://anri.go.id"
  },
  {
    id: "anri-dasasila-bandung-kaa-1955",
    type: "arsip-nasional",
    title_id: "Naskah Deklarasi Final Konferensi Tingkat Tinggi Asia-Afrika (Dasa Sila Bandung) 24 April 1955",
    year: 1955,
    citation_id: "ANRI Koleksi Konferensi Asia Afrika 1955 / Museum KAA Bandung",
    url: "https://anri.go.id"
  },
  {
    id: "anri-risalah-konstituante-natsir-1957",
    type: "arsip-nasional",
    title_id: "Risalah Sidang Pleno Konstituante: Pidato M. Natsir tentang Doktrin Piagam Madinah 12 November 1957",
    year: 1957,
    citation_id: "Risalah Resmi Sidang Konstituante RI Jilid I, Bandung, 1957; ANRI",
    url: "https://anri.go.id"
  },
  {
    id: "anri-risalah-konstituante-ham-1958",
    type: "arsip-nasional",
    title_id: "Risalah Komisi Hak-Hak Asasi Manusia dan Hak Warga Negara Majelis Konstituante RI 1956–1958",
    year: 1958,
    citation_id: "Dokumen Komisi I Konstituante; Arsip Nasional RI",
    url: "https://anri.go.id"
  },
  {
    id: "anri-dekrit-presiden-5-juli-1959",
    type: "arsip-nasional",
    title_id: "Naskah Resmi Dekrit Presiden 5 Juli 1959 Kembali ke Undang-Undang Dasar 1945",
    year: 1959,
    citation_id: "Lembaran Negara RI No. 75 Tahun 1959; Depernas & ANRI",
    url: "https://anri.go.id"
  },
  {
    id: "anri-uupa-5-1960",
    type: "arsip-nasional",
    title_id: "Undang-Undang Pokok Agraria (UUPA) No. 5 Tahun 1960 tentang Peraturan Dasar Pokok-Pokok Agraria",
    year: 1960,
    citation_id: "Lembaran Negara RI No. 104 Tahun 1960; Tambahan Lembaran Negara No. 2043",
    url: "https://anri.go.id"
  },
  {
    id: "anri-supersemar-1966",
    type: "arsip-nasional",
    title_id: "Surat Perintah 11 Maret 1966 (Koleksi Arsip Nasional Republik Indonesia)",
    year: 1966,
    citation_id: "ANRI Koleksi Supersemar 1966; Puspen AD",
    url: "https://anri.go.id"
  },
  {
    id: "anri-risalah-sidang-mprs-1967",
    type: "arsip-nasional",
    title_id: "Risalah Sidang Istimewa Majelis Permusyawaratan Rakyat Sementara (MPRS) Maret 1967",
    year: 1967,
    citation_id: "Sekretariat MPRS; TAP MPRS No. XXXIII/MPRS/1967",
    url: "https://anri.go.id"
  },
  {
    id: "anri-risalah-si-mpr-1998",
    type: "arsip-nasional",
    title_id: "Risalah Resmi Sidang Istimewa Majelis Permusyawaratan Rakyat (MPR) RI November 1998",
    year: 1998,
    citation_id: "Sekretariat Jenderal MPR RI; TAP MPR No. XVII/MPR/1998",
    url: "https://anri.go.id"
  },
  {
    id: "anri-naskah-komprehensif-uud-buku-1",
    type: "arsip-nasional",
    title_id: "Naskah Komprehensif Perubahan UUD 1945 Buku I: Latar Belakang, Proses, dan Hasil Pembahasan",
    year: 2002,
    citation_id: "Sekretariat Jenderal Mahkamah Konstitusi & MPR RI, 2010; ANRI",
    url: "https://anri.go.id"
  },
  {
    id: "anri-naskah-komprehensif-uud-buku-2",
    type: "arsip-nasional",
    title_id: "Naskah Komprehensif Perubahan UUD 1945 Buku II: Sendi-Sendi Dasar dan Kedaulatan Negara",
    year: 2002,
    citation_id: "Sekretariat Jenderal Mahkamah Konstitusi & MPR RI, 2010; ANRI",
    url: "https://anri.go.id"
  },
  {
    id: "anri-naskah-komprehensif-uud-buku-4",
    type: "arsip-nasional",
    title_id: "Naskah Komprehensif Perubahan UUD 1945 Buku IV: Kekuasaan Kehakiman, MK, dan KY",
    year: 2002,
    citation_id: "Sekretariat Jenderal Mahkamah Konstitusi & MPR RI, 2010; ANRI",
    url: "https://anri.go.id"
  },
  {
    id: "anri-naskah-komprehensif-uud-buku-8",
    type: "arsip-nasional",
    title_id: "Naskah Komprehensif Perubahan UUD 1945 Buku VIII: Hak Asasi Manusia (Pasal 28A–28J)",
    year: 2002,
    citation_id: "Sekretariat Jenderal Mahkamah Konstitusi & MPR RI, 2010; ANRI",
    url: "https://anri.go.id"
  },
  {
    id: "anri-naskah-komprehensif-uud-buku-10",
    type: "arsip-nasional",
    title_id: "Naskah Komprehensif Perubahan UUD 1945 Buku X: Kompilasi Risalah Rapat PAH I dan PAH II BP MPR",
    year: 2002,
    citation_id: "Sekretariat Jenderal Mahkamah Konstitusi & MPR RI, 2010; ANRI",
    url: "https://anri.go.id"
  }
];

let addedCount = 0;
for (const s of newAnriSources) {
  if (!existingIds.has(s.id)) {
    sources.push(s);
    existingIds.add(s.id);
    addedCount++;
  }
}

const updatedYaml = stringify(sources);
writeFileSync(path, updatedYaml, "utf8");
console.log(`Successfully added ${addedCount} primary national archives to sources.yaml! Total sources now: ${sources.length}`);
