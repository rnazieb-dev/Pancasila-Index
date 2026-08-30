import fs from 'fs';

const rubricPath = 'packages/data/data/rubric/v1.yaml';
let content = fs.readFileSync(rubricPath, 'utf8');

// Replace Sila 3 text to include memory collective
content = content.replace(
  `Sentralisasi paksa atau diskriminasi terhadap kelompok/wilayah\n        tertentu; meresahkan kebinekaan demi kepentingan politik.`,
  `Sentralisasi paksa; meresahkan kebinekaan demi politik; ATAU penghapusan memori kolektif/sejarah pergerakan Islam dari narasi nasional (de-historisasi).`
);

content = content.replace(
  `      - id: sila-3-toleransi-sosial\n        name_id: Toleransi sosial dan perlindungan kebinekaan budaya/wilayah\n        legal_anchors_id: ["Semboyan Bhinneka Tunggal Ika", "Pasal 32"]`,
  `      - id: sila-3-toleransi-sosial\n        name_id: Pelestarian memori kolektif sejarah bangsa & perlindungan kebinekaan\n        legal_anchors_id: ["Semboyan Bhinneka Tunggal Ika", "Pasal 32"]`
);

fs.writeFileSync(rubricPath, content, 'utf8');
console.log("Sila 3 updated!");
