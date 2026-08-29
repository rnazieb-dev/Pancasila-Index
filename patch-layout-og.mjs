import fs from 'fs';

const path = 'apps/web/src/app/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

const newMetadata = `export const metadata: Metadata = {
  metadataBase: new URL("https://www.pancasila.site"),
  title: {
    default: "Pancasila Index — Penilaian Kepatuhan Konstitusional Berbasis Bukti",
    template: "%s | Pancasila Index"
  },
  description:
    "Platform penilaian independen kesetiaan 8 organ kekuasaan Indonesia terhadap Pancasila, Pembukaan UUD 1945 alinea IV, dan norma struktural UUD 1945 (1945–kini) berbasis bukti primer berkuorum.",
  keywords: [
    "Pancasila Index",
    "UUD 1945",
    "Konstitusi",
    "Presiden",
    "DPR",
    "Mahkamah Konstitusi",
    "Audit Data Terbuka",
    "Akar Sejarah",
    "Syarikat Islam",
    "Piagam Jakarta"
  ],
  authors: [{ name: "Pancasila Index Contributors" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://www.pancasila.site",
    siteName: "Pancasila Index",
    title: "Pancasila Index — Penilaian Kepatuhan Konstitusional Berbasis Bukti",
    description: "Menilai kesetiaan 8 organ konstitusional Indonesia pada Pancasila dan UUD 1945 (1945–kini) dengan setiap skor wajib bersitasi bukti primer.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancasila Index — Penilaian Kepatuhan Konstitusional Berbasis Bukti",
    description: "Menilai kesetiaan 8 organ konstitusional Indonesia pada Pancasila dan UUD 1945 berbasis bukti primer berkuorum.",
  },
};`;

content = content.replace(/export const metadata: Metadata = {[\s\S]*?};/, newMetadata);

fs.writeFileSync(path, content, 'utf8');
console.log("Root layout OpenGraph metadata enhanced!");
