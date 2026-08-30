import fs from 'fs';

const path = 'apps/web/src/app/arsip/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace CLUSTERS definition with guaranteed key lookup
code = code.replace('const CLUSTERS: Record<string, ClusterDef> = {', 'const CLUSTERS = {');
code = code.replace('const cluster = CLUSTERS[selectedCluster] ?? CLUSTERS.all;', 'const cluster = (CLUSTERS as Record<string, ClusterDef>)[selectedCluster] ?? CLUSTERS.all;');
code = code.replace('const oposisiCount = sources.filter((s) => CLUSTERS.oposisi.match(s)).length;', 'const oposisiCount = sources.filter((s) => CLUSTERS.oposisi.match(s)).length;');
code = code.replace('const intlCount = sources.filter((s) => CLUSTERS.internasional.match(s)).length;', 'const intlCount = sources.filter((s) => CLUSTERS.internasional.match(s)).length;');

fs.writeFileSync(path, code, 'utf8');
console.log("patched!");
