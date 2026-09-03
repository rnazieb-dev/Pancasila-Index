import fs from "fs";
import { PDFDocument } from "pdf-lib";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const slugMap = {
  uu: "uu-no",
  pp: "pp-no",
  perpres: "perpres-no",
  keppres: "keppres-no",
  inpres: "inpres-no",
  perppu: "perpu-no",
};

const targets = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

const results = { ok: [], notFound: [], invalidContent: [], fetchError: [] };

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  return await res.text();
}

async function validatePdf(buf) {
  try {
    const doc = await PDFDocument.load(buf, { updateMetadata: false, ignoreEncryption: true });
    const title = doc.getTitle() || "";
    if (/just a moment|attention required|access denied|verify you are human|checking your browser/i.test(title)) {
      return { ok: false, reason: "bot-block title: " + title };
    }
    return { ok: true, pages: doc.getPageCount() };
  } catch (e) {
    // encrypted PDFs still count as real if they parsed as PDF at byte level
    if (buf.slice(0, 4).toString() === "%PDF") return { ok: true, pages: null, note: "encrypted-or-unparseable" };
    return { ok: false, reason: e.message.slice(0, 80) };
  }
}

for (const t of targets) {
  const slug = slugMap[t.prefix];
  const detailUrl = `https://peraturan.go.id/id/${slug}-${t.number}-tahun-${t.year}`;
  try {
    const html = await fetchText(detailUrl);
    if (!html) {
      results.notFound.push({ id: t.id, reason: "detail page fetch failed" });
      continue;
    }
    const pdfMatches = [...html.matchAll(/href="([^"]*\.pdf)"/g)].map((m) => m[1]);
    if (pdfMatches.length === 0) {
      results.notFound.push({ id: t.id, reason: "no pdf link on detail page" });
      continue;
    }
    // prefer the "bt" (batang tubuh) file if multiple, else first
    let pdfPath = pdfMatches.find((p) => /bt\.pdf$/i.test(p)) || pdfMatches[0];
    const pdfUrl = pdfPath.startsWith("http") ? pdfPath : `https://peraturan.go.id${pdfPath}`;
    const pdfRes = await fetch(pdfUrl, { headers: { "User-Agent": UA } });
    if (!pdfRes.ok) {
      results.notFound.push({ id: t.id, reason: `pdf fetch ${pdfRes.status}` });
      continue;
    }
    const buf = Buffer.from(await pdfRes.arrayBuffer());
    if (buf.slice(0, 4).toString() !== "%PDF") {
      results.invalidContent.push({ id: t.id, reason: "not a pdf byte signature" });
      continue;
    }
    const validation = await validatePdf(buf);
    if (!validation.ok) {
      results.invalidContent.push({ id: t.id, reason: validation.reason });
      continue;
    }
    fs.writeFileSync(`raw/pdf/${t.id}.pdf`, buf);
    results.ok.push({ id: t.id, url: pdfUrl, bytes: buf.length, pages: validation.pages });
  } catch (e) {
    results.fetchError.push({ id: t.id, reason: e.message.slice(0, 100) });
  }
}

console.log("=== SUMMARY ===");
console.log("ok:", results.ok.length);
console.log("notFound:", results.notFound.length);
console.log("invalidContent:", results.invalidContent.length);
console.log("fetchError:", results.fetchError.length);
fs.writeFileSync(process.argv[3], JSON.stringify(results, null, 1));
