import fs from 'fs';

const path = 'apps/web/src/lib/i18n.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace the ID one
content = content.replace(
  `navMethodology: "Metodologi",`,
  `navMethodology: "Metodologi",\n  navAkarSejarah: "Akar Sejarah",`
);

// We need to match precisely since multiple languages have `navMethodology: "Metodologi",`
// Let's do it with a function replacement over the whole file
content = content.replace(/navMethodology:\s*"([^"]+)",/g, (match) => {
  return match + `\n  navAkarSejarah: "Akar Sejarah",`;
});

// Fix English manually
content = content.replace(
  `navMethodology: "Methodology",\n  navAkarSejarah: "Akar Sejarah",`,
  `navMethodology: "Methodology",\n  navAkarSejarah: "Historical Roots",`
);

// Javanese
content = content.replace(
  `navMethodology: "Metodologi",\n  navAkarSejarah: "Akar Sejarah",\n  navUud: "Peta Pasal UUD",\n  navExport: "Ekspor Dataset",\n  navApiDocs: "REST API Docs",\n  navMyDrafts: "Draf Usulanku",`,
  `navMethodology: "Metodologi",\n  navAkarSejarah: "Oyod Sejarah",\n  navUud: "Peta Pasal UUD",\n  navExport: "Ekspor Dataset",\n  navApiDocs: "REST API Docs",\n  navMyDrafts: "Draf Usulanku",`
);

// Sundanese
content = content.replace(
  `navMethodology: "Métodologi",\n  navAkarSejarah: "Akar Sejarah",`,
  `navMethodology: "Métodologi",\n  navAkarSejarah: "Akar Sajarah",`
);

// Madurese
content = content.replace(
  `navMethodology: "Metodologi",\n  navAkarSejarah: "Akar Sejarah",\n  navUud: "Petâ Pasal UUD",`,
  `navMethodology: "Metodologi",\n  navAkarSejarah: "Akar Sajhârâ",\n  navUud: "Petâ Pasal UUD",`
);

// Minang
content = content.replace(
  `navMethodology: "Metodologi",\n  navAkarSejarah: "Akar Sejarah",\n  navUud: "Peta Pasal UUD",\n  navExport: "Ekspor Dataset",\n  navApiDocs: "REST API Docs",\n  navMyDrafts: "Draf Usulan Ambo",`,
  `navMethodology: "Metodologi",\n  navAkarSejarah: "Aka Sajarah",\n  navUud: "Peta Pasal UUD",\n  navExport: "Ekspor Dataset",\n  navApiDocs: "REST API Docs",\n  navMyDrafts: "Draf Usulan Ambo",`
);

fs.writeFileSync(path, content, 'utf8');
console.log("i18n updated!");
