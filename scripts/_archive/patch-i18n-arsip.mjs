import fs from 'fs';

const path = 'apps/web/src/lib/i18n.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('navAkarSejarah: "Akar Sejarah",', 'navAkarSejarah: "Akar Sejarah",\n  navArsip: "Khazanah Arsip ANRI",');
content = content.replace('navAkarSejarah: "Historical Roots",', 'navAkarSejarah: "Historical Roots",\n  navArsip: "National Archives",');
content = content.replace('navAkarSejarah: "Oyod Sejarah",', 'navAkarSejarah: "Oyod Sejarah",\n  navArsip: "Khazanah Arsip ANRI",');
content = content.replace('navAkarSejarah: "Akar Sajarah",', 'navAkarSejarah: "Akar Sajarah",\n  navArsip: "Khazanah Arsip ANRI",');
content = content.replace('navAkarSejarah: "Akar Sajhârâ",', 'navAkarSejarah: "Akar Sajhârâ",\n  navArsip: "Khazanah Arsip ANRI",');
content = content.replace('navAkarSejarah: "Aka Sajarah",', 'navAkarSejarah: "Aka Sajarah",\n  navArsip: "Khazanah Arsip ANRI",');

fs.writeFileSync(path, content, 'utf8');

const chromePath = 'apps/web/src/components/app-chrome.tsx';
let chromeContent = fs.readFileSync(chromePath, 'utf8');

chromeContent = chromeContent.replace(
  '{ href: "/akar-sejarah", key: "navAkarSejarah" },',
  '{ href: "/akar-sejarah", key: "navAkarSejarah" },\n  { href: "/arsip", key: "navArsip" },'
);

fs.writeFileSync(chromePath, chromeContent, 'utf8');
console.log("i18n and app-chrome updated with /arsip!");
