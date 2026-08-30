import fs from 'fs';

const path = 'apps/web/src/app/arsip/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'const cluster = CLUSTERS[selectedCluster] ?? CLUSTERS["all"];',
  'const activeCluster: ClusterDef = CLUSTERS[selectedCluster] ?? CLUSTERS.all ?? { label: "Semua", icon: "📚", match: () => true };'
);
code = code.replace('if (!cluster.match(src)) {', 'if (!activeCluster.match(src)) {');

fs.writeFileSync(path, code, 'utf8');
console.log("patched!");
