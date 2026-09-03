import fs from 'fs';
import path from 'path';

const sources = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'orphan-sources.json'), 'utf8'));

const groups: Record<number, string[]> = {};
for (const s of sources) {
  const y = s.year || 0;
  if (!groups[y]) groups[y] = [];
  groups[y].push(s.id);
}

for (const y of Object.keys(groups).sort()) {
  console.log(`Year ${y}: ${groups[Number(y)].length} sources`);
}
