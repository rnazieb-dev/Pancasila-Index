import fs from 'fs';

const path = 'apps/web/src/app/cari/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const AKAR_SEJARAH_DATA = [
  {
    year: "1905",
    title: "Syarikat Dagang Islam (SDI) didirikan di Surakarta",
    summary: "H. Samanhudi mendirikan SDI sebagai pelopor perserikatan pribumi berbasis etika ekonomi Islam dan perlawanan terhadap monopoli kolonial.",
    link: "/akar-sejarah#sdi-1905",
    category: "Pergerakan Nasional"
  },
  {
    year: "1912",
    title: "Syarikat Islam (SI) di bawah H.O.S. Tjokroaminoto",
    summary: "Transformasi SDI menjadi SI yang menyatukan jutaan rakyat bumiputera, meletakkan fondasi kesadaran berbangsa, musyawarah, dan kedaulatan umat.",
    link: "/akar-sejarah#si-1912",
    category: "Genealogi Demokrasi"
  },
  {
    year: "1945",
    title: "Piagam Jakarta (Jakarta Charter) - BPUPK",
    summary: "Konsensus Panitia Sembilan yang menjembatani kelompok kebangsaan dan Islam, memuat kalimat Ketuhanan dan norma keadilan.",
    link: "/akar-sejarah#piagam-jakarta-1945",
    category: "Konsensus Pembukaan UUD"
  },
  {
    year: "1959",
    title: "Dekrit Presiden 5 Juli 1959",
    summary: "Kembali ke UUD 1945 dengan konsiderans bahwa Piagam Jakarta menjiwai UUD 1945 dan merupakan satu kesatuan dengan konstitusi.",
    link: "/akar-sejarah#dekrit-1959",
    category: "Landasan Konstitusi"
  }
];

const newResultsLogic = `
    // 4. Tokoh Bangsa / Aktor
    const matchingActors = (dataset.actors || []).filter((actor) => {
      if (!q) return true;
      return (
        actor.name.toLowerCase().includes(q) ||
        (actor.bio_id && actor.bio_id.toLowerCase().includes(q)) ||
        (actor.role_id && actor.role_id.toLowerCase().includes(q))
      );
    });

    // 5. Akar Sejarah
    const matchingHistory = AKAR_SEJARAH_DATA.filter((h) => {
      if (!q) return true;
      return (
        h.title.toLowerCase().includes(q) ||
        h.summary.toLowerCase().includes(q) ||
        h.year.includes(q) ||
        h.category.toLowerCase().includes(q)
      );
    });

    // 6. Dimensi Rubrik
    const matchingDimensions = dataset.rubric.dimensions.filter((dim) => {
      if (!q) return true;
      return (
        dim.name_id.toLowerCase().includes(q) ||
        dim.question_id.toLowerCase().includes(q) ||
        dim.id.toLowerCase().includes(q)
      );
    });
`;

content = content.replace(
  '// 4. Pasal UUD',
  `${newResultsLogic}\n    // 7. Pasal UUD`
);

content = content.replace(
  'return {\n      events: matchingEvents,\n      sources: matchingSources,\n      terms: matchingTerms,\n      pasal: matchingPasal,\n    };',
  'return {\n      events: matchingEvents,\n      sources: matchingSources,\n      terms: matchingTerms,\n      actors: matchingActors,\n      history: matchingHistory,\n      dimensions: matchingDimensions,\n      pasal: matchingPasal,\n    };'
);

const oldTotalMatches = `const totalMatches =
    results.events.length +
    results.sources.length +
    results.terms.length +
    results.pasal.length;`;

const newTotalMatches = `const totalMatches =
    results.events.length +
    results.sources.length +
    results.terms.length +
    results.actors.length +
    results.history.length +
    results.dimensions.length +
    results.pasal.length;`;

content = content.replace(oldTotalMatches, newTotalMatches);

// Add Top AKAR_SEJARAH_DATA definition
content = content.replace(
  'export default function CariPage() {',
  `const AKAR_SEJARAH_DATA = ${JSON.stringify(AKAR_SEJARAH_DATA, null, 2)};\n\nexport default function CariPage() {`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Cari page search engine expanded!");
