import fs from 'fs';

const rubricPath = 'packages/data/data/rubric/v1.yaml';
let content = fs.readFileSync(rubricPath, 'utf8');

// Insert a new indicator for Sila 3
const indicatorTarget = `      - id: sila-3-konflik
        name_id: Pengelolaan konflik dan integrasi nasional
        legal_anchors_id: ["Pembukaan alinea IV"]`;

const newIndicator = `      - id: sila-3-konflik
        name_id: Pengelolaan konflik dan integrasi nasional
        legal_anchors_id: ["Pembukaan alinea IV"]
      - id: sila-3-memori-sejarah
        name_id: Pelestarian memori kolektif sejarah pergerakan (Piagam Jakarta & Syarikat Islam)
        legal_anchors_id: ["Bhinneka Tunggal Ika", "Dekrit Presiden 1959"]`;

content = content.replace(indicatorTarget, newIndicator);
fs.writeFileSync(rubricPath, content, 'utf8');
console.log("Sila 3 indicator updated!");
