#!/usr/bin/env tsx
/**
 * Unduh indeks independen pihak ketiga langsung dari penerbitnya, lalu
 * BANDINGKAN dengan angka yang tercatat di data/external-indices.yaml.
 *
 * Script ini sengaja TIDAK menulis ulang YAML. Alasannya ada di README:
 * "AI hanya membantu, manusia yang memutus". Yang dihasilkan adalah
 *
 *   - raw/external-indices/<id>.<ext>            berkas mentah apa adanya
 *   - generated/external-indices-fetched.json    hasil parse + provenance
 *   - laporan selisih di stdout                  angka YAML vs angka penerbit
 *
 * Kurator yang memutuskan angka mana yang masuk, lalu menempelkan blok
 * `provenance` dengan `method: unduh-dataset`.
 *
 * Jalankan: pnpm --filter @pancasila-index/data fetch:indices
 *
 * CATATAN LINGKUNGAN: di lingkungan build tertutup, seluruh host di bawah ini
 * bisa diblokir kebijakan egress (gejalanya: CONNECT tunnel failed 403).
 * Kalau itu terjadi, script berhenti dengan daftar host yang perlu diizinkan -
 * bukan dengan angka karangan.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "data");
const RAW = join(ROOT, "raw", "external-indices");
const OUT = join(ROOT, "generated", "external-indices-fetched.json");

const ISO3 = "IDN";
const COUNTRY = "Indonesia";

interface FetchTarget {
  /** id indeks di external-indices.yaml */
  id: string;
  label: string;
  /** URL berkas yang bisa diparse mesin - bukan halaman HTML kalau ada pilihan */
  url: string;
  ext: string;
  /** Cara mengambil deret Indonesia dari isi berkas. */
  extract: (body: Buffer) => Array<{ year: number; score: number | null; rank?: number }>;
}

/** Sumber-sumber yang menyediakan berkas terstruktur untuk diunduh. */
const TARGETS: FetchTarget[] = [
  {
    id: "wgi-control-of-corruption",
    label: "World Bank WGI - Control of Corruption (estimate)",
    url: `https://api.worldbank.org/v2/country/${ISO3}/indicator/CC.EST?format=json&per_page=200`,
    ext: "json",
    extract: (body) => {
      const json = JSON.parse(body.toString("utf8"));
      const rows: Array<{ date: string; value: number | null }> = json[1] ?? [];
      return rows
        .filter((r) => r.value !== null)
        .map((r) => ({ year: Number(r.date), score: r.value }))
        .sort((a, b) => a.year - b.year);
    },
  },
  {
    id: "wgi-rule-of-law",
    label: "World Bank WGI - Rule of Law (estimate)",
    url: `https://api.worldbank.org/v2/country/${ISO3}/indicator/RL.EST?format=json&per_page=200`,
    ext: "json",
    extract: (body) => {
      const json = JSON.parse(body.toString("utf8"));
      const rows: Array<{ date: string; value: number | null }> = json[1] ?? [];
      return rows
        .filter((r) => r.value !== null)
        .map((r) => ({ year: Number(r.date), score: r.value }))
        .sort((a, b) => a.year - b.year);
    },
  },
  {
    id: "rsf-press-freedom",
    label: "RSF World Press Freedom Index (CSV per tahun)",
    // RSF menerbitkan CSV klasemen per tahun; tahun diganti sesuai kebutuhan.
    url: "https://rsf.org/sites/default/files/import_classement/2026.csv",
    ext: "csv",
    extract: (body) => {
      const text = body.toString("utf8");
      const [head, ...lines] = text.split(/\r?\n/).filter(Boolean);
      const cols = (head ?? "").split(/[;,]/).map((c) => c.trim().toLowerCase());
      const iName = cols.findIndex((c) => c.includes("country") || c.includes("pays"));
      const iScore = cols.findIndex((c) => c.includes("score"));
      const iRank = cols.findIndex((c) => c.includes("rank") || c.includes("classement"));
      const row = lines
        .map((l) => l.split(/[;,]/))
        .find((r) => (r[iName] ?? "").trim().toLowerCase() === COUNTRY.toLowerCase());
      if (!row) return [];
      return [
        {
          year: 2026,
          score: iScore >= 0 ? Number(row[iScore]) : null,
          rank: iRank >= 0 ? Number(row[iRank]) : undefined,
        },
      ];
    },
  },
];

/**
 * Sumber yang belum punya endpoint terstruktur stabil. Didaftarkan supaya
 * kekosongannya terlihat di laporan, bukan hilang tanpa jejak.
 */
const MANUAL_ONLY: Array<{ id: string; label: string; url: string; reason: string }> = [
  {
    id: "cpi-ti",
    label: "Transparency International CPI",
    url: "https://www.transparency.org/en/cpi",
    reason:
      "Berkas lengkap dirilis sebagai XLSX per tahun dengan nama berkas yang berubah tiap edisi; perlu dipilih manual lalu diparse.",
  },
  {
    id: "wjp-rule-of-law",
    label: "WJP Rule of Law Index",
    url: "https://worldjusticeproject.org/rule-of-law-index/downloads/",
    reason: "Data historis tersedia sebagai XLSX di halaman unduhan, tanpa URL berversi yang stabil.",
  },
  {
    id: "vdem-deliberative",
    label: "V-Dem Liberal Democracy Index",
    url: "https://v-dem.net/data/the-v-dem-dataset/",
    reason:
      "Dataset Country-Year Core berupa arsip ZIP besar dan URL-nya memuat nomor versi (v15, v16, ...) yang berubah tiap rilis.",
  },
  {
    id: "obi-ibp",
    label: "Open Budget Survey",
    url: "https://internationalbudget.org/open-budget-survey/rankings",
    reason: "Hasil per negara diterbitkan sebagai PDF; skor agregat perlu diambil dari halaman peringkat.",
  },
  {
    id: "ipi-ercas",
    label: "Index of Public Integrity (ERCAS)",
    url: "https://corruptionrisk.org/country/?country=IDN",
    reason: "Angka disajikan lewat halaman interaktif tanpa berkas unduhan publik yang stabil.",
  },
  {
    id: "oecd-pii",
    label: "OECD Public Integrity Indicators",
    url: "https://oecd-public-integrity-indicators.org/indicators",
    reason: "Indikator disajikan per halaman tanpa endpoint data publik.",
  },
];

// ------------------------------------------------------------------- jalan

const recorded: Array<{
  id: string;
  name: string;
  data: Array<{ year: number; score: number | null; rank?: number; provenance?: unknown }>;
}> = existsSync(join(DATA, "external-indices.yaml"))
  ? (parse(readFileSync(join(DATA, "external-indices.yaml"), "utf8")) as never)
  : [];

const recordedById = new Map(recorded.map((r) => [r.id, r]));

mkdirSync(RAW, { recursive: true });

const blocked: string[] = [];
const fetched: Record<string, unknown> = {};
const retrievedAt = new Date().toISOString().slice(0, 10);

for (const t of TARGETS) {
  process.stdout.write(`→ ${t.label}\n   ${t.url}\n`);
  let body: Buffer;
  try {
    const res = await fetch(t.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    body = Buffer.from(await res.arrayBuffer());
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`   GAGAL: ${msg}`);
    blocked.push(`${new URL(t.url).host} (${t.id}): ${msg}`);
    continue;
  }

  writeFileSync(join(RAW, `${t.id}.${t.ext}`), body);

  let points: Array<{ year: number; score: number | null; rank?: number }> = [];
  try {
    points = t.extract(body);
  } catch (err) {
    console.error(`   GAGAL parse: ${err instanceof Error ? err.message : err}`);
    continue;
  }

  fetched[t.id] = {
    label: t.label,
    provenance: { url: t.url, retrieved_at: retrievedAt, method: "unduh-dataset" },
    points,
  };
  console.log(`   OK: ${points.length} titik data ${COUNTRY}`);

  // ---- laporan selisih terhadap yang tercatat ----
  const rec = recordedById.get(t.id);
  if (!rec) {
    console.log(`   (indeks "${t.id}" belum ada di external-indices.yaml - kandidat baru)`);
    continue;
  }
  for (const p of points) {
    const r = rec.data.find((d) => d.year === p.year);
    if (!r) continue;
    if (r.score !== null && p.score !== null && Math.abs(r.score - p.score) > 1e-9) {
      console.log(`   SELISIH ${p.year}: YAML ${r.score} vs penerbit ${p.score}`);
    }
    if (r.rank !== undefined && p.rank !== undefined && r.rank !== p.rank) {
      console.log(`   SELISIH peringkat ${p.year}: YAML ${r.rank} vs penerbit ${p.rank}`);
    }
  }
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ retrieved_at: retrievedAt, fetched }, null, 2) + "\n");

// ------------------------------------------------------------------ ringkas

console.log("\n--- Sumber yang masih perlu pengambilan manual ---");
for (const m of MANUAL_ONLY) {
  const rec = recordedById.get(m.id);
  const withProv = rec?.data.filter((d) => d.provenance).length ?? 0;
  const total = rec?.data.length ?? 0;
  console.log(`  ${m.id}: ${withProv}/${total} titik berprovenance`);
  console.log(`     ${m.url}`);
  console.log(`     ${m.reason}`);
}

if (blocked.length > 0) {
  console.error("\n--- Host yang tidak bisa dijangkau ---");
  for (const b of blocked) console.error(`  ${b}`);
  console.error(
    "\nIni kebijakan egress, bukan kesalahan data. Izinkan host di atas lalu jalankan ulang.\n" +
      "JANGAN mengisi angkanya secara manual dari ingatan - biarkan kosong sampai bisa diunduh."
  );
  process.exit(1);
}

console.log(`\nOK: hasil unduhan -> ${OUT}`);
