import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const sourcesPath = path.join(process.cwd(), 'data', 'sources.yaml');
const sources = yaml.parse(fs.readFileSync(sourcesPath, 'utf8')) as any[];

const newSources = [
  // JURNAL
  {
    id: "jurnal-konstitusi-mk-2015",
    type: "literatur",
    title_id: "Jurnal Konstitusi: Menakar Kewenangan Konstitusional Lembaga Negara Independen",
    year: 2015,
    citation_id: "Jurnal Konstitusi, Vol. 12, No. 4, 2015",
    url: "https://jurnalkonstitusi.mkri.id/"
  },
  {
    id: "jurnal-ius-quia-iustum-2018",
    type: "literatur",
    title_id: "Jurnal Hukum Ius Quia Iustum: Problematika Presidential Threshold dalam Pemilu Serentak",
    year: 2018,
    citation_id: "Jurnal Hukum Ius Quia Iustum (UII), Vol. 25, No. 2, 2018"
  },
  {
    id: "mimbar-hukum-ugm-2019",
    type: "literatur",
    title_id: "Mimbar Hukum: Independensi Peradilan dan Dinamika Hakim Konstitusi",
    year: 2019,
    citation_id: "Mimbar Hukum (UGM), Vol. 31, No. 1, 2019"
  },
  {
    id: "padjadjaran-jurnal-ilmu-hukum-2020",
    type: "literatur",
    title_id: "Padjadjaran Jurnal Ilmu Hukum: Desentralisasi Asimetris dan Kelembagaan DPD",
    year: 2020,
    citation_id: "PJIH (UNPAD), Vol. 7, No. 3, 2020"
  },
  {
    id: "jurnal-hukum-peradilan-ma-2017",
    type: "literatur",
    title_id: "Jurnal Hukum dan Peradilan: Restorative Justice dalam Sistem Pemasyarakatan",
    year: 2017,
    citation_id: "Jurnal Hukum dan Peradilan (MA RI), Vol. 6, No. 2, 2017"
  },
  {
    id: "constitutional-review-mk-2021",
    type: "literatur",
    title_id: "Constitutional Review: The Erosion of Democratic Norms in Post-Reformasi Indonesia",
    year: 2021,
    citation_id: "Constitutional Review, Vol. 7, No. 1, 2021"
  },
  // BUKU AKADEMIK BARU
  {
    id: "buku-nimatul-huda-htn-2014",
    type: "buku",
    title_id: "Hukum Tata Negara Indonesia (Prof. Dr. Ni'matul Huda, S.H., M.Hum.)",
    year: 2014,
    citation_id: "Rajawali Pers, 2014"
  },
  {
    id: "buku-zainal-arifin-lembaga-independen-2016",
    type: "buku",
    title_id: "Lembaga Negara Independen: Dinamika Ketatanegaraan Pasca-Amandemen (Dr. Zainal Arifin Mochtar)",
    year: 2016,
    citation_id: "Rajawali Pers, 2016"
  },
  {
    id: "buku-denny-indrayana-amandemen-2007",
    type: "buku",
    title_id: "Amandemen UUD 1945: Antara Mitos dan Pembongkaran (Prof. Dr. Denny Indrayana)",
    year: 2007,
    citation_id: "Mizan, 2007"
  },
  {
    id: "buku-bintan-saragih-lembaga-perwakilan-2006",
    type: "buku",
    title_id: "Lembaga Perwakilan dan Pemilihan Umum di Indonesia (Prof. Dr. Bintan R. Saragih)",
    year: 2006,
    citation_id: "Gaya Media Pratama, 2006"
  },
  {
    id: "buku-mukthie-fadjar-tipe-negara-2004",
    type: "buku",
    title_id: "Tipe Negara Hukum (Prof. Dr. A. Mukthie Fadjar)",
    year: 2004,
    citation_id: "Bayumedia, 2004"
  },
  {
    id: "buku-titik-triwulan-konstruksi-htn-2010",
    type: "buku",
    title_id: "Konstruksi Hukum Tata Negara Indonesia Pasca-Amandemen (Prof. Dr. Titik Triwulan Tutik)",
    year: 2010,
    citation_id: "Kencana, 2010"
  },
  {
    id: "buku-yance-arizona-konstitusionalisme-agraria-2018",
    type: "buku",
    title_id: "Konstitusionalisme Agraria (Dr. Yance Arizona)",
    year: 2018,
    citation_id: "STH Jentera, 2018"
  },
  {
    id: "buku-bivitri-susanti-autocratic-legalism-2020",
    type: "buku",
    title_id: "Autocratic Legalism dan Pembentukan Peraturan Perundang-undangan (Bivitri Susanti)",
    year: 2020,
    citation_id: "STH Jentera, 2020"
  },
  {
    id: "jurnal-masalah-hukum-undip-2016",
    type: "literatur",
    title_id: "Masalah-Masalah Hukum: Sinkronisasi Kebijakan Pemerintah Pusat dan Daerah",
    year: 2016,
    citation_id: "Masalah-Masalah Hukum (UNDIP), Vol. 45, No. 3, 2016"
  },
  {
    id: "jurnal-dinamika-hukum-unsoed-2015",
    type: "literatur",
    title_id: "Jurnal Dinamika Hukum: Eksistensi Komisi Yudisial dalam Pengawasan Hakim",
    year: 2015,
    citation_id: "Jurnal Dinamika Hukum (UNSOED), Vol. 15, No. 1, 2015"
  }
];

const existingIds = new Set(sources.map(s => s.id));
let added = 0;
for (const ns of newSources) {
  if (!existingIds.has(ns.id)) {
    sources.push(ns);
    added++;
  }
}

fs.writeFileSync(sourcesPath, yaml.stringify(sources, { indent: 2, lineWidth: 0 }), 'utf8');
console.log(`Added ${added} new rich academic sources.`);
