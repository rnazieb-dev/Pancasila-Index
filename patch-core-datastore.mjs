import fs from 'fs';

const path = 'packages/core/src/ckan-datastore.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'const headers = lines[0].split(",").map(h => h.replace(/^["\']|["\']$/g, "").trim());',
  'const firstLine = lines[0] || "";\n    const headers = firstLine.split(",").map(h => h.replace(/^["\']|["\']$/g, "").trim());'
);

content = content.replace(
  'const values = lines[i].split(",").map(v => v.replace(/^["\']|["\']$/g, "").trim());',
  'const line = lines[i] || "";\n      const values = line.split(",").map(v => v.replace(/^["\']|["\']$/g, "").trim());'
);

content = content.replace(
  'const metaJson = await metaRes.json();',
  'const metaJson = await metaRes.json() as any;'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Core datastore patched!");
