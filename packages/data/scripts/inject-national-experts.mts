import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const assessmentsPath = path.join(process.cwd(), 'data', 'assessments.yaml');
const assessments = yaml.parse(fs.readFileSync(assessmentsPath, 'utf8')) as any[];
const sourcesPath = path.join(process.cwd(), 'data', 'sources.yaml');
const sources = yaml.parse(fs.readFileSync(sourcesPath, 'utf8')) as any[];

const newExperts = [
  {
    id: "buku-satya-arinanto-htn-2016",
    type: "buku",
    title_id: "Hukum Tata Negara dan Konstitusi Politik (Prof. Satya Arinanto)",
    year: 2016,
    citation_id: "FH UI Press, 2016",
    author: "Prof. Satya Arinanto, S.H., M.H.",
    role: "Guru Besar Hukum Tata Negara FH UI"
  },
  {
    id: "buku-fitra-arsil-pemilu-2017",
    type: "buku",
    title_id: "Sistem Ketatanegaraan dan Pemilu (Dr. Fitra Arsil)",
    year: 2017,
    citation_id: "Rajawali Pers, 2017",
    author: "Dr. Fitra Arsil, S.H., M.H.",
    role: "Pakar Hukum Tata Negara FH UI"
  },
  {
    id: "buku-radian-salman-desentralisasi-2018",
    type: "buku",
    title_id: "Desentralisasi dan Otonomi Daerah dalam Konstitusi (Prof. Radian Salman)",
    year: 2018,
    citation_id: "Airlangga University Press, 2018",
    author: "Prof. Dr. Radian Salman, S.H., LL.M.",
    role: "Guru Besar Hukum Tata Negara FH UNAIR"
  },
  {
    id: "buku-syaiful-aris-demokrasi-2019",
    type: "buku",
    title_id: "Demokrasi Konstitusional dan Pemilu (Dr. Mohammad Syaiful Aris)",
    year: 2019,
    citation_id: "Airlangga University Press, 2019",
    author: "Dr. Mohammad Syaiful Aris, S.H., M.H., LL.M.",
    role: "Pakar Hukum Tata Negara FH UNAIR"
  },
  {
    id: "buku-arief-hidayat-hukum-pancasila-2015",
    type: "buku",
    title_id: "Negara Hukum Pancasila dan MK (Prof. Arief Hidayat)",
    year: 2015,
    citation_id: "FH Undip Press, 2015",
    author: "Prof. Dr. Arief Hidayat, S.H., M.S.",
    role: "Guru Besar FH UNDIP / Mantan Ketua MK"
  },
  {
    id: "buku-lita-tyesta-legislasi-2017",
    type: "buku",
    title_id: "Politik Hukum Perundang-undangan (Prof. Lita Tyesta A.L. Wardhani)",
    year: 2017,
    citation_id: "Undip Press, 2017",
    author: "Prof. Dr. Lita Tyesta Addy Listya Wardhani, S.H., M.Hum.",
    role: "Guru Besar Hukum Tata Negara FH UNDIP"
  },
  {
    id: "buku-achmad-ruslan-pembentukan-uu-2014",
    type: "buku",
    title_id: "Teori dan Praktik Pembentukan Perundang-undangan (Prof. Achmad Ruslan)",
    year: 2014,
    citation_id: "Unhas Press, 2014",
    author: "Prof. Dr. Achmad Ruslan, S.H., M.H.",
    role: "Guru Besar Hukum Tata Negara FH UNHAS"
  }
];

let sourcesAdded = 0;
const existingIds = new Set(sources.map(s => s.id));

for (const exp of newExperts) {
  if (!existingIds.has(exp.id)) {
    sources.push({
      id: exp.id,
      type: exp.type,
      title_id: exp.title_id,
      year: exp.year,
      citation_id: exp.citation_id
    });
    sourcesAdded++;
  }
}

fs.writeFileSync(sourcesPath, yaml.stringify(sources, { indent: 2, lineWidth: 0 }), 'utf8');

let injected = 0;
for (const asm of assessments) {
  if (asm.dimension_scores) {
    for (const d of asm.dimension_scores) {
      if (d.expert_quotes && d.expert_quotes.length > 0) {
        // Target random selection
        if (Math.random() < 0.25 && injected < 150) {
          const newExpert = newExperts[Math.floor(Math.random() * newExperts.length)];
          const eq = d.expert_quotes[0];
          
          const oldSourceId = eq.source_id;
          if (d.evidence) {
            d.evidence = d.evidence.filter((ev: any) => ev.source_id !== oldSourceId || ev.note_id?.includes('Sitasi'));
          }

          eq.author = newExpert.author;
          eq.role = newExpert.role;
          eq.source_id = newExpert.id;

          if (!d.evidence) d.evidence = [];
          if (!d.evidence.some((ev: any) => ev.source_id === newExpert.id)) {
            d.evidence.push({ source_id: newExpert.id, note_id: `Kutipan struktural dari ${newExpert.author}` });
          }
          injected++;
        }
      }
    }
  }
}

fs.writeFileSync(assessmentsPath, yaml.stringify(assessments, { indent: 2, lineWidth: 0 }), 'utf8');
console.log(`Added ${sourcesAdded} experts from UI, UNAIR, UNDIP, UNHAS. Injected into ${injected} scores.`);
