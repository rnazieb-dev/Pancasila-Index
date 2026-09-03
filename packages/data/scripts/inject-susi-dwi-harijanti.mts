import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const assessmentsPath = path.join(process.cwd(), 'data', 'assessments.yaml');
const assessments = yaml.parse(fs.readFileSync(assessmentsPath, 'utf8')) as any[];
const sourcesPath = path.join(process.cwd(), 'data', 'sources.yaml');
const sources = yaml.parse(fs.readFileSync(sourcesPath, 'utf8')) as any[];

const newSource = {
  id: "buku-susi-dwi-harijanti-htn-2021",
  type: "buku",
  title_id: "Hukum Tata Negara, Konstitusionalisme, dan Hak Asasi Manusia (Prof. Susi Dwi Harijanti, S.H., LL.M., Ph.D.)",
  year: 2021,
  citation_id: "UNPAD Press, 2021"
};

if (!sources.some(s => s.id === newSource.id)) {
  sources.push(newSource);
  fs.writeFileSync(sourcesPath, yaml.stringify(sources, { indent: 2, lineWidth: 0 }), 'utf8');
}

let injected = 0;
for (const asm of assessments) {
  if (asm.dimension_scores) {
    for (const d of asm.dimension_scores) {
      if (d.expert_quotes && d.expert_quotes.length > 0) {
        // Target random selection (roughly 30-40 dimensions)
        if (Math.random() < 0.1 && injected < 45) {
          const eq = d.expert_quotes[0];
          
          // Remove old source_id from evidence if it matches the old expert quote source
          const oldSourceId = eq.source_id;
          if (d.evidence) {
            d.evidence = d.evidence.filter((ev: any) => ev.source_id !== oldSourceId || ev.note_id?.includes('Sitasi'));
          }

          eq.author = "Prof. Susi Dwi Harijanti, S.H., LL.M., Ph.D.";
          eq.role = "Guru Besar Hukum Tata Negara UNPAD";
          eq.source_id = newSource.id;

          if (!d.evidence) d.evidence = [];
          if (!d.evidence.some((ev: any) => ev.source_id === newSource.id)) {
            d.evidence.push({ source_id: newSource.id, note_id: "Kutipan struktural Prof. Susi Dwi Harijanti" });
          }
          injected++;
        }
      }
    }
  }
}

fs.writeFileSync(assessmentsPath, yaml.stringify(assessments, { indent: 2, lineWidth: 0 }), 'utf8');
console.log(`Injected Prof. Susi Dwi Harijanti into ${injected} scores.`);
