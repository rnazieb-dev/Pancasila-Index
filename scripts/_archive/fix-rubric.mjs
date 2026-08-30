import fs from 'fs';

const rubricPath = 'packages/data/data/rubric/v1.yaml';
let content = fs.readFileSync(rubricPath, 'utf8');

// --- Replace Sila 1 ---
content = content.replace(
  `Sejauh mana tindakan lembaga memperkuat jaminan kebebasan beragama dan\n      hubungan negara-agama yang adil bagi seluruh warga?`,
  `Sejauh mana negara memfasilitasi kehidupan beragama, mengintegrasikan hukum dan etika agama (berakar pada sejarah bangsa dan inspirasi Piagam Jakarta), sekaligus menjamin kemerdekaan tiap penduduk untuk beribadah?`
);

content = content.replace(
  `Diskriminasi atau penganiayaan sistemik atas keyakinan; negara\n        memaksakan keyakinan tertentu kepada warga.`,
  `Diskriminasi sistemik; peminggiran peran historis dan nilai agama dari ruang publik; atau negara berubah menjadi sekuler-represif.`
);

content = content.replace(
  `Netralitas goyah; aturan atau praktik yang memberatkan kelompok\n        keyakinan tertentu tanpa dasar proporsional.`,
  `Negara abai memfasilitasi umat beragama; kebijakan yang memusuhi identitas religius sejarah bangsa (seperti Islam) tanpa dasar konstitusional.`
);

content = content.replace(
  `Perlindungan konkret terhadap minoritas beragama; penyelesaian\n        sengketa keagamaan secara adil.`,
  `Fasilitasi kehidupan beragama berjalan baik (misal: peradilan agama, zakat, jaminan halal); penyelesaian sengketa secara adil.`
);

content = content.replace(
  `Penguatan teladan kebebasan beragama; harmonisasi antarumat secara\n        institusional dan berkelanjutan.`,
  `Harmoni simbiotik paripurna: nilai-nilai agama sukses diintegrasikan ke dalam hukum nasional dengan penghormatan penuh pada sejarah dan keberagaman.`
);

content = content.replace(
  `      - id: sila-1-layanan-netral\n        name_id: Netralitas layanan publik terkait agama (pendidikan agama, rumah ibadah, administrasi kependudukan)\n        legal_anchors_id: ["Pasal 29 ayat (2)", "Pasal 31"]`,
  `      - id: sila-1-fasilitasi-agama\n        name_id: Fasilitasi negara terhadap kehidupan beragama & pengakuan hukum/etika agama\n        legal_anchors_id: ["Pasal 29 ayat (1)-(2)", "Dekrit Presiden 1959"]`
);

// --- Replace Sila 4 ---
content = content.replace(
  `Sejauh mana demokrasi konstitusional berjalan: integritas pemilu,\n      kebebasan sipil dan pers, serta partisipasi publik dalam kebijakan?`,
  `Sejauh mana keputusan didasarkan pada musyawarah mufakat yang dijiwai hikmat kebijaksanaan (etika kenegarawanan), bukan sekadar mayoritarianisme (voting)?`
);

content = content.replace(
  `Pembajakan kehendak rakyat; kecurangan elektoral sistemik; represi\n        terhadap kritik, oposisi, atau media.`,
  `Pembajakan kehendak rakyat oleh oligarki; mayoritarianisme ugal-ugalan; keputusan dipaksakan tanpa musyawarah mufakat yang bermakna.`
);

content = content.replace(
  `Erosi berulang: legislasi menghindari partisipasi; ruang sipil\n        menyempit; integritas pemilu dipertanyakan.`,
  `Erosi musyawarah: legislasi dibuat terburu-buru menghindari deliberasi publik; hilangnya etika (hikmat kebijaksanaan) dalam tata kelola.`
);

content = content.replace(
  `Pemilu kredibel; partisipasi publik nyata; kebebasan pers dan\n        berserikat dilindungi konsisten.`,
  `Praktik demokrasi berjalan baik; kebebasan sipil dilindungi; musyawarah dan partisipasi publik dalam kebijakan nyata.`
);

content = content.replace(
  `Konsolidasi demokrasi teladan: akuntabilitas tinggi dan ruang\n        sipil yang melembaga.`,
  `Konsensus beradab teladan: pertentangan tajam diselesaikan melalui musyawarah mufakat dengan kedalaman etika (hikmat kebijaksanaan) para negarawan.`
);

content = content.replace(
  `      - id: sila-4-integritas-pemilu\n        name_id: Integritas pemilu dan penyelenggaraan pemilihan\n        legal_anchors_id: ["Pasal 22E", "Pasal 23G"]`,
  `      - id: sila-4-musyawarah-mufakat\n        name_id: Praktik musyawarah mufakat & etika kenegarawanan (hikmat kebijaksanaan)\n        legal_anchors_id: ["Pembukaan UUD 1945", "Pasal 20A"]`
);

fs.writeFileSync(rubricPath, content, 'utf8');
console.log("Rubric updated successfully!");
