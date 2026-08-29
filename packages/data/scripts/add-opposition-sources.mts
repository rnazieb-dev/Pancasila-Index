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

const newOppositionSources = [
  {
    id: "anri-ppki-sidang-18-agu-1945",
    type: "arsip-nasional",
    title_id: "Risalah Stenografis Sidang Lengkap PPKI 18 Agustus 1945: Pengesahan UUD & Pemilihan Presiden",
    year: 1945,
    citation_id: "ANRI Koleksi Risalah PPKI No. 01/1945; Setneg RI 1995",
    url: "https://anri.go.id"
  },
  {
    id: "anri-ppki-sidang-19-agu-1945",
    type: "arsip-nasional",
    title_id: "Risalah Sidang PPKI 19 Agustus 1945: Pembagian 8 Wilayah Provinsi & 12 Kementerian Pertama RI",
    year: 1945,
    citation_id: "ANRI Koleksi Risalah PPKI No. 02/1945; Berita Repoeblik Indonesia Th. I",
    url: "https://anri.go.id"
  },
  {
    id: "anri-ppki-sidang-22-agu-1945",
    type: "arsip-nasional",
    title_id: "Risalah Sidang PPKI 22 Agustus 1945: Pembentukan KNIP, Komite Nasional Daerah, & BKR",
    year: 1945,
    citation_id: "ANRI Koleksi Risalah PPKI No. 03/1945; Arsip KNIP",
    url: "https://anri.go.id"
  },
  {
    id: "arsip-nii-proklamasi-1949",
    type: "arsip-nasional",
    title_id: "Naskah Asli Proklamasi Berdirinya Negara Islam Indonesia (NII) 7 Agustus 1949 di Cisayong",
    year: 1949,
    citation_id: "KITLV Leiden Or. 26.850 / ANRI Koleksi Pemberontakan Daerah / Disjarahad",
    url: "https://digitalcollections.universiteitleiden.nl"
  },
  {
    id: "arsip-nii-qanun-asasi-1949",
    type: "arsip-nasional",
    title_id: "Naskah Otentik Qanun Asasi (Undang-Undang Dasar NII) 31 Pasal (SM Kartosoewirjo)",
    year: 1949,
    citation_id: "KITLV Leiden Special Collections / ANRI Dokumen NII No. 04/1949",
    url: "https://digitalcollections.universiteitleiden.nl"
  },
  {
    id: "arsip-nii-ikrar-lamteh-1957",
    type: "arsip-nasional",
    title_id: "Piagam Ikrar Kerukunan Lamteh: Perjanjian Gencatan Senjata DI/TII Aceh (Tgk. Daud Beureueh)",
    year: 1957,
    citation_id: "ANRI Banda Aceh / Dokumen Kodam I/Iskandar Muda 1957",
    url: "https://anri.go.id"
  },
  {
    id: "arsip-nii-vonis-mahadper-1962",
    type: "arsip-nasional",
    title_id: "Berkas Pemeriksaan & Putusan Mahkamah Darurat Perang (Mahadper) Kasus SM Kartosoewirjo 1962",
    year: 1962,
    citation_id: "ANRI Khazanah Peradilan Militer / Disjarahad Berkas No. Kep-01/1962",
    url: "https://anri.go.id"
  },
  {
    id: "iisg-pki-musso-djalan-baru-1948",
    type: "arsip-nasional",
    title_id: "Naskah Resolusi PKI 'Djalan Baru untuk Republik Indonesia' (Musso, Agustus 1948)",
    year: 1948,
    citation_id: "International Institute of Social History (IISG Amsterdam) ARCH01061",
    url: "https://search.iisg.amsterdam"
  },
  {
    id: "iisg-pki-aidit-djalan-rakjat-1954",
    type: "arsip-nasional",
    title_id: "Naskah Pidato Kongres Nasional Ke-V PKI 'Menempuh Djalan Rakjat' (D.N. Aidit, 1954)",
    year: 1954,
    citation_id: "IISG Amsterdam Pamphlet Collection ARCH01062",
    url: "https://search.iisg.amsterdam"
  },
  {
    id: "anri-mahmillub-untung-1966",
    type: "arsip-nasional",
    title_id: "Risalah Stenografis Sidang Mahkamah Militer Luar Biasa (Mahmillub) Kasus Letkol Untung 1966",
    year: 1966,
    citation_id: "ANRI Khazanah Mahmillub / Cornell Modern Indonesia Project CMIP Cornell",
    url: "https://anri.go.id"
  },
  {
    id: "anri-mahmillub-nyono-1966",
    type: "arsip-nasional",
    title_id: "Notulen Sidang Mahmillub Kasus Nyono (Anggota Politbiro CC PKI) Februari 1966",
    year: 1966,
    citation_id: "ANRI Khazanah Mahmillub No. 02/1966; Cornell Modern Indonesia Project",
    url: "https://anri.go.id"
  },
  {
    id: "arsip-permesta-piagam-makassar-1957",
    type: "arsip-nasional",
    title_id: "Naskah Asli Piagam Perjuangan Semesta (Permesta) 2 Maret 1957 di Makassar (Ventje Sumual)",
    year: 1957,
    citation_id: "ANRI Koleksi Gerakan Daerah / Arsip Kodam XIII/Merdeka 1957",
    url: "https://anri.go.id"
  },
  {
    id: "arsip-prri-proklamasi-padang-1958",
    type: "arsip-nasional",
    title_id: "Naskah Piagam Perjuangan Pembentukan PRRI di Padang 15 Februari 1958 (Sjafruddin-Sumitro)",
    year: 1958,
    citation_id: "Nationaal Archief Nederland (NA NL 2.10.36.04) / ANRI PRRI 1958",
    url: "https://www.nationaalarchief.nl"
  },
  {
    id: "anri-prri-keppres-amnesti-1961",
    type: "arsip-nasional",
    title_id: "Keputusan Presiden No. 449/1961 tentang Pemberian Amnesti dan Abolisi Tokoh PRRI/Permesta",
    year: 1961,
    citation_id: "Lembaran Negara RI No. 449 Tahun 1961; ANRI Himpunan Keppres",
    url: "https://anri.go.id"
  },
  {
    id: "kitlv-gam-deklarasi-1976",
    type: "arsip-nasional",
    title_id: "Declaration of Independence of Acheh-Sumatra 4 Desember 1976 (Tengku Hasan di Tiro)",
    year: 1976,
    citation_id: "KITLV Leiden Special Collections D H 1426 / IISG Hasan Tiro Papers",
    url: "https://digitalcollections.universiteitleiden.nl"
  },
  {
    id: "cmi-mou-helsinki-aceh-2005",
    type: "arsip-nasional",
    title_id: "Memorandum of Understanding between Government of RI and Free Aceh Movement (MoU Helsinki 2005)",
    year: 2005,
    citation_id: "Crisis Management Initiative (CMI Helsinki) / Kemenkumham RI Official Records 2005",
    url: "https://cmi.fi"
  },
  {
    id: "uu-pemerintahan-aceh-11-2006",
    type: "undang-undang",
    title_id: "Undang-Undang No. 11 Tahun 2006 tentang Pemerintahan Aceh (UUPA / Otonomi Asimetris)",
    year: 2006,
    citation_id: "Lembaran Negara RI Tahun 2006 No. 62; Tambahan Lembaran Negara No. 4633",
    url: "https://jdih.setneg.go.id"
  },
  {
    id: "nanl-papua-manifesto-1961",
    type: "arsip-nasional",
    title_id: "Naskah Manifesto Komite Nasional Papua & Ketetapan Bendera Bintang Kejora 19 Oktober 1961",
    year: 1961,
    citation_id: "Nationaal Archief Nederland (NA NL 2.10.54 Nieuw-Guinea Beheer)",
    url: "https://www.nationaalarchief.nl"
  },
  {
    id: "un-new-york-agreement-1962",
    type: "arsip-nasional",
    title_id: "Naskah Perjanjian Bilateral RI-Belanda Mengenai Papua Barat (New York Agreement 15 Agustus 1962)",
    year: 1962,
    citation_id: "United Nations Treaty Series Vol. 437 No. 6311; United Nations Archives",
    url: "https://treaties.un.org"
  },
  {
    id: "un-pepera-resolusi-2504-1969",
    type: "arsip-nasional",
    title_id: "Laporan Hasil PEPERA 1969 & Resolusi Majelis Umum PBB No. 2504 (XXIV) Pengesahan Irian Barat",
    year: 1969,
    citation_id: "UN General Assembly Official Records A/PV.1812 (19 Nov 1969); ANRI",
    url: "https://digitallibrary.un.org"
  },
  {
    id: "nanl-rms-proklamasi-1950",
    type: "arsip-nasional",
    title_id: "Naskah Asli Proklamasi Berdirinya Republik Maluku Selatan (RMS) 25 April 1950 (Soumokil)",
    year: 1950,
    citation_id: "Nationaal Archief Nederland (NA NL 2.10.14 Algemene Secretarie)",
    url: "https://www.nationaalarchief.nl"
  },
  {
    id: "anri-petisi-50-pernyataan-1980",
    type: "arsip-nasional",
    title_id: "Naskah 'Pernyataan Keprihatinan' (Petisi 50) 5 Mei 1980 Ditandatangani 50 Tokoh Nasional",
    year: 1980,
    citation_id: "Lembaga Kesadaran Berkonstitusi (LKB) / ANRI Dokumen Petisi 50 No. 01/1980",
    url: "https://anri.go.id"
  },
  {
    id: "nanl-linggarjati-naskah-1946",
    type: "arsip-nasional",
    title_id: "Naskah Resmi Perundingan Linggarjati antara Komisi Jenderal Belanda & Delegasi RI 1946",
    year: 1946,
    citation_id: "Nationaal Archief Nederland (NA NL 2.10.17 Commissie-Generaal)",
    url: "https://www.nationaalarchief.nl"
  },
  {
    id: "iisg-tan-malaka-gerpolek-1948",
    type: "arsip-nasional",
    title_id: "Naskah Asli 'Gerilya, Politik dan Ekonomi' (Gerpolek) Ditulis di Penjara Magelang 1948",
    year: 1948,
    citation_id: "IISG Amsterdam ARCH01460 (Tan Malaka Papers)",
    url: "https://search.iisg.amsterdam"
  },
  {
    id: "kitlv-diponegoro-manuskrip-1831",
    type: "arsip-nasional",
    title_id: "Naskah Asli Babad Diponegoro Tulisan Tangan di Manado/Makassar 1831–1832",
    year: 1831,
    citation_id: "Perpustakaan Nasional RI KBG No. 282 / KITLV Leiden / UNESCO Memory of the World",
    url: "https://digitalcollections.universiteitleiden.nl"
  }
];

let addedCount = 0;
for (const s of newOppositionSources) {
  if (!existingIds.has(s.id)) {
    sources.push(s);
    existingIds.add(s.id);
    addedCount++;
  }
}

const updatedYaml = stringify(sources);
writeFileSync(path, updatedYaml, "utf8");
console.log(`Successfully added ${addedCount} opposition, PPKI, and international archives to sources.yaml! Total sources now: ${sources.length}`);
