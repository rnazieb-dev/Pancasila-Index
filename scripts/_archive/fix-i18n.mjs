import fs from 'fs';

const path = 'apps/web/src/lib/i18n.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `  navAkarSejarah: "Akar Sejarah",\n  navAkarSejarah: "Akar Sejarah",`,
  `  navAkarSejarah: "Akar Sejarah",`
);

fs.writeFileSync(path, content, 'utf8');
console.log("i18n duplicate fixed!");
