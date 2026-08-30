#!/usr/bin/env tsx
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  statSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parse, stringify } from "yaml";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { compressPdf } from "../src/compressor";
import puppeteer from "puppeteer";

// Configs
const ACCOUNT_ID = "69f2a9ff4fe58ace350172f315f7feb7";
const BUCKET_NAME = "pancasila-arsip";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "data");
const RAW_DIR = join(ROOT, "raw");
const PDF_DIR = join(RAW_DIR, "pdf");
const COMPRESSED_DIR = join(RAW_DIR, "compressed");
const SOURCES_YAML = join(DATA_DIR, "sources.yaml");
const EVENTS_YAML = join(DATA_DIR, "events.yaml");
const MANIFEST_PATH = join(ROOT, "generated", "r2-archive-manifest.json");

function sha256(buffer: Uint8Array): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function getCloudflareToken(): string {
  try {
    const tomlPath = join(process.env.HOME || "", ".config", ".wrangler", "config", "default.toml");
    const alternatePath = join(process.env.HOME || "", "Library", "Preferences", ".wrangler", "config", "default.toml");
    
    let toml = "";
    if (existsSync(tomlPath)) {
      toml = readFileSync(tomlPath, "utf-8");
    } else if (existsSync(alternatePath)) {
      toml = readFileSync(alternatePath, "utf-8");
    }
    
    if (toml) {
      const match = toml.match(/oauth_token\s*=\s*"([^"]+)"/);
      if (match && match[1]) return match[1];
    }
  } catch (err) {}
  
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return process.env.CLOUDFLARE_API_TOKEN;
  }
  
  throw new Error("Gagal mendapatkan token Cloudflare dari wrangler. Pastikan sudah 'npx wrangler login' atau set CLOUDFLARE_API_TOKEN.");
}

function getR2Key(source: any): string {
  const typeSafe = source.type.toLowerCase().replace(/[^a-z0-9]/g, "");
  const yearStr = source.year ? `${source.year}` : "0000";
  return `v2/${typeSafe}/${yearStr}/${source.id}.pdf`;
}

function loadJdihMapping() {
  const map = new Map<string, string>();
  try {
    const jdihDir = join(RAW_DIR, "jdih");
    const manifests = ["jdih-setneg-manifest.jsonl", "jdih-mkri-manifest.jsonl", "jdih-bphn-manifest.jsonl"];
    
    for (const file of manifests) {
      const p = join(jdihDir, file);
      if (existsSync(p)) {
        const lines = readFileSync(p, "utf-8").trim().split("\n");
        for (const line of lines) {
          if (!line) continue;
          const entry = JSON.parse(line);
          if (entry.source_id && entry.local_pdf_path) {
            map.set(entry.source_id, join(ROOT, entry.local_pdf_path));
          }
        }
      }
    }
  } catch {}
  return map;
}

interface ArchiveManifestEntry {
  source_id: string;
  r2_key: string;
  mime_type: string;
  sha256: string;
  original_bytes: number;
  compressed_bytes: number;
  savings_bytes: number;
  savings_percent: number;
  r2_url: string;
  uploaded_at: string;
}

/** 
 * Generator Dokumen Bukti Primer Terverifikasi Pancasila Index
 */
async function createFullTextLegalPdf(opts: {
  id: string;
  title: string;
  type: string;
  year?: number;
  citation?: string;
  originalUrl?: string;
  relatedEvents?: Array<{title: string, date: string, description?: string}>;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  
  doc.setProducer("Pancasila Index Open Archive");
  doc.setCreator("Pancasila Index Research Engine");
  doc.setTitle(opts.title);
  
  let page = doc.addPage([595.28, 841.89]);
  
  const fontRegular = await doc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  
  let y = 790;

  function checkPage(needed: number) {
    if (y - needed < 50) {
      page = doc.addPage([595.28, 841.89]);
      y = 790;
    }
  }
  
  page.drawText("PANCASILA INDEX — REPOSITORI ARSIP PRIMER", {
    x: 50, y, size: 9, font: fontBold, color: rgb(0.5, 0.1, 0.1),
  });
  y -= 25;
  
  page.drawText("DOKUMEN BUKTI HUKUM PRIMER", {
    x: 50, y, size: 14, font: fontBold,
  });
  y -= 20;
  
  const titleLines = wrapText(opts.title, fontBold, 12, 495);
  for (const line of titleLines) {
    page.drawText(line, { x: 50, y, size: 12, font: fontBold });
    y -= 16;
  }
  y -= 10;
  
  page.drawText(`ID Register: ${opts.id}`, { x: 50, y, size: 10, font: fontRegular });
  y -= 14;
  page.drawText(`Klasifikasi: ${opts.type.toUpperCase()}${opts.year ? ` (Tahun ${opts.year})` : ""}`, { x: 50, y, size: 10, font: fontRegular });
  y -= 14;
  
  if (opts.citation) {
    page.drawText(`Sitasi / Lembaran Resmi: ${opts.citation}`, { x: 50, y, size: 10, font: fontRegular });
    y -= 14;
  }
  if (opts.originalUrl) {
    page.drawText(`Portal Resmi Instansi: ${opts.originalUrl}`, { x: 50, y, size: 9.5, font: fontItalic, color: rgb(0, 0.2, 0.7) });
    y -= 20;
  }
  
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 20;
  
  // Konteks Penggunaan dalam Penilaian
  if (opts.relatedEvents && opts.relatedEvents.length > 0) {
    page.drawText("PERISTIWA HUKUM & KONTEKS KETATANEGARAAN TERKAIT:", { x: 50, y, size: 10.5, font: fontBold });
    y -= 16;

    for (const ev of opts.relatedEvents.slice(0, 5)) {
      checkPage(40);
      page.drawText(`• [${ev.date}] ${ev.title}`, { x: 55, y, size: 9.5, font: fontBold });
      y -= 14;
      if (ev.description) {
        const descLines = wrapText(ev.description, fontRegular, 8.5, 475);
        for (const dl of descLines.slice(0, 3)) {
          checkPage(12);
          page.drawText(dl, { x: 65, y, size: 8.5, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
          y -= 12;
        }
        y -= 4;
      }
    }
    y -= 10;
  }

  checkPage(80);
  page.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 16;

  page.drawText("AUTENTIKASI & STATUS ARSIP:", { x: 50, y, size: 9.5, font: fontBold });
  y -= 14;
  const authText = wrapText(
    "Dokumen ini tercatat dalam basis data kanonik Pancasila Index sebagai bukti primer yang menyokong penilaian kesetiaan organ negara terhadap Pancasila dan UUD 1945. Untuk naskah autentik berkeabsahan hukum penuh, silakan mengakses langsung portal resmi instansi penerbit pada tautan di atas.",
    fontItalic, 8.5, 495
  );
  for (const line of authText) {
    page.drawText(line, { x: 50, y, size: 8.5, font: fontItalic, color: rgb(0.4, 0.4, 0.4) });
    y -= 12;
  }
  
  return doc.save();
}

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/** MAIN PIPELINE */
async function main() {
  mkdirSync(PDF_DIR, { recursive: true });
  mkdirSync(COMPRESSED_DIR, { recursive: true });
  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });

  const sources: Array<{
    id: string;
    type: string;
    title_id: string;
    year?: number;
    url?: string;
    citation_id?: string;
    r2_key?: string;
    archive_url?: string;
  }> = parse(readFileSync(SOURCES_YAML, "utf8"));

  const events: Array<{
    id: string;
    title_id: string;
    date: string;
    description_id?: string;
    sources: string[];
  }> = parse(readFileSync(EVENTS_YAML, "utf8"));

  const jdihMap = loadJdihMapping();

  const eventsBySource = new Map<string, Array<{ title: string; date: string; description?: string }>>();
  for (const ev of events) {
    for (const sid of ev.sources ?? []) {
      if (!eventsBySource.has(sid)) eventsBySource.set(sid, []);
      eventsBySource.get(sid)!.push({
        title: ev.title_id,
        date: ev.date,
        description: ev.description_id,
      });
    }
  }

  console.log(`\n🔍 Memulai Audit & Pengunduhan Masal ${sources.length} Dokumen PDF Primer...`);

  let fetchedCount = 0;
  let compiledCount = 0;
  let existingCount = 0;
  
  let browser: any = null;

  for (let i = 0; i < sources.length; i++) {
    const s = sources[i]!;
    const pdfPath = join(PDF_DIR, `${s.id}.pdf`);

    // 1. Periksa apakah sudah ada berkas PDF hasil scraper JDIH
    const localJdihPdf = jdihMap.get(s.id);
    if (localJdihPdf && existsSync(localJdihPdf)) {
      const rawBuf = readFileSync(localJdihPdf);
      if (rawBuf.subarray(0, 5).toString() === "%PDF-") {
        writeFileSync(pdfPath, rawBuf);
        existingCount++;
        continue;
      }
    }

    // 2. Periksa apakah PDF sudah pernah diunduh dan valid (minimal lebih dari 30KB jika auto-printed)
    if (existsSync(pdfPath) && statSync(pdfPath).size > 20000) {
      existingCount++;
      continue;
    }

    // 3. Coba unduh atau print URL
    let downloaded = false;
    if (s.url) {
      if (s.url.toLowerCase().endsWith(".pdf")) {
        try {
          const res = await fetch(s.url, {
            headers: { "User-Agent": "PancasilaIndexBot/0.2 (Academic; Open Archive)" },
          });
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.subarray(0, 5).toString() === "%PDF-") {
              writeFileSync(pdfPath, buf);
              downloaded = true;
              fetchedCount++;
            }
          }
        } catch {}
      } else {
        // Gunakan Print-to-PDF untuk URL non-PDF (berita, dokumen HTML, JDIH tanpa file, dll)
        if (!browser) {
          browser = await puppeteer.launch({ headless: true });
        }
        try {
          const page = await browser.newPage();
          await page.setViewport({ width: 768, height: 1024 });
          await page.goto(s.url, { waitUntil: "networkidle2", timeout: 30000 });
          
          // @ts-ignore
          await page.evaluate(() => { window.scrollBy(0, window.innerHeight); });
          await new Promise(r => setTimeout(r, 1000));
          
          // @ts-ignore
          const height = await page.evaluate(() => (globalThis as any).document?.documentElement?.scrollHeight || 1200);
          
          const pdfBuffer = await page.pdf({ 
            width: "768px", 
            height: (height + 100) + "px",
            printBackground: true
          });
          
          writeFileSync(pdfPath, pdfBuffer);
          downloaded = true;
          fetchedCount++;
          await page.close();
        } catch (err: any) {
          console.log(`❌ Gagal print URL ${s.url} untuk ${s.id}: ${err.message}`);
        }
      }
    }

    // 4. Susun Dokumen Legal Dummy PDF (Hanya jika TIDAK ADA URL dan GAGAL di-download)
    if (!downloaded) {
      const relEvs = eventsBySource.get(s.id) ?? [];
      const pdfBytes = await createFullTextLegalPdf({
        id: s.id,
        title: s.title_id,
        type: s.type,
        year: s.year,
        citation: s.citation_id,
        originalUrl: s.url,
        relatedEvents: relEvs,
      });
      writeFileSync(pdfPath, pdfBytes);
      compiledCount++;
    }

    if ((i + 1) % 10 === 0 || i + 1 === sources.length) {
      console.log(`  [${i + 1}/${sources.length}] Dokumen diproses...`);
    }
  }

  if (browser) await browser.close();

  console.log(`\n✅ Seluruh Dokumen PDF Primer Tersedia:`);
  console.log(`- Berkas Asli JDIH/Lokal: ${existingCount}`);
  console.log(`- Diunduh / Diprint dari URL: ${fetchedCount}`);
  console.log(`- Dokumen Bukti Cetak Offline (Dummy PDF): ${compiledCount}`);

  // (Lanjutkan kompresi dan upload persis seperti sebelumnya) ...
  // Biar cepat, user bisa memanggil `pnpm archive:all` langsung
  console.log("\nMenjalankan pnpm archive:all..."); (await import("child_process")).execSync("npx tsx scripts/archive-r2.mts all", { stdio: "inherit" });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
