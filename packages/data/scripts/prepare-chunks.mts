import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const readYaml = (file: string) => yaml.parse(fs.readFileSync(path.join(process.cwd(), 'data', file), 'utf8')) as any;

const assessments = readYaml('assessments.yaml');
const chunksDir = path.join(process.cwd(), 'chunks');
if (!fs.existsSync(chunksDir)) fs.mkdirSync(chunksDir);

let allUnprocessed: any[] = [];

for (const a of assessments) {
  if (!a.dimension_scores) continue;
  for (const d of a.dimension_scores) {
    if (!d.thesis_id || !d.antithesis_id) {
      allUnprocessed.push({
        assessment_id: a.id,
        dimension_id: d.dimension_id,
        rationale_id: d.rationale_id,
        score: d.score,
        term_id: a.term_id
      });
    }
  }
}

const CHUNK_SIZE = 55; // ~10 chunks for 554 items
for (let i = 0; i < allUnprocessed.length; i += CHUNK_SIZE) {
  const chunk = allUnprocessed.slice(i, i + CHUNK_SIZE);
  fs.writeFileSync(path.join(chunksDir, `chunk_${Math.floor(i / CHUNK_SIZE)}.json`), JSON.stringify(chunk, null, 2));
}

console.log(`Generated ${Math.ceil(allUnprocessed.length / CHUNK_SIZE)} chunks.`);
