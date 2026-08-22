#!/usr/bin/env tsx
/**
 * ai-suggest — prototipe pipeline AI untuk menyusun DRAF penilaian.
 *
 * Mode:
 *  1. Heuristik (default): klasifikasi kata-kunci atas peristiwa term.
 *     Output = kerangka YAML dengan dimensi kandidat + bukti, skor
 *     SENGAJA dikosongkan untuk diisi kurator.
 *  2. LLM (bila OPENAI_API_KEY tersedia): mengusulkan skor -2..+2 +
 *     rasional singkat per dimensi kandidat. Output TETAP draf yang
 *     wajib dikurasi manusia sebelum published.
 *
 * Pemakaian:
 *   pnpm --filter @pancasila-index/ai suggest --term presiden-habibie
 *   OPENAI_API_KEY=sk-... pnpm --filter @pancasila-index/ai suggest --term presiden-habibie
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { parse } from "yaml";

import { classifyText } from "../src/heuristic";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_EVENTS = join(ROOT, "..", "data", "data", "events.yaml");
const DATA_TERMS = join(ROOT, "..", "data", "data", "terms-presiden.yaml");

const args = parseArgs({
  options: { term: { type: "string" } },
});

const termId = args.values.term as string | undefined;
if (!termId) {
  console.error("Pemakaian: tsx scripts/suggest.mts --term <term-id>");
  process.exit(1);
}

if (!existsSync(DATA_EVENTS) || !existsSync(DATA_TERMS)) {
  console.error(`Berkas data tidak ditemukan di ${DATA_EVENTS}`);
  process.exit(1);
}

const events = (parse(readFileSync(DATA_EVENTS, "utf8")) as Array<Record<string, unknown>>).filter(
  (e) => e.term_id === termId
);
const terms = parse(readFileSync(DATA_TERMS, "utf8")) as Array<Record<string, unknown>>;
const term = terms.find((t) => t.id === termId);

if (!term) {
  console.error(`Term "${termId}" tidak ada di terms-presiden.yaml`);
  process.exit(1);
}

console.log(`# ----------------------------------------------------------`);
console.log(`# DRAF usulan AI untuk ${termId} — WAJIB DIKURASI MANUSIA`);
console.log(`# Sumber: ${events.length} peristiwa berbukti di events.yaml`);
console.log(`# ----------------------------------------------------------`);

// ---- agregasi heuristik lintas peristiwa ----
const byDim = new Map<string, { hits: Set<string>; evidence: string[] }>();
for (const ev of events) {
  const text = `${ev.title_id ?? ""} ${ev.summary_id ?? ""}`;
  for (const hit of classifyText(text)) {
    const cur = byDim.get(hit.dimension_id) ?? { hits: new Set<string>(), evidence: [] };
    hit.hits.forEach((h) => cur.hits.add(h));
    cur.evidence.push(String(ev.id));
    byDim.set(hit.dimension_id, cur);
  }
}

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  // ---------- mode heuristik ----------
  console.log(`# mode: HEURISTIK (set OPENAI_API_KEY untuk usulan skor LLM)\n`);
  if (byDim.size === 0) {
    console.log("# tidak ada kandidat dimensi terdeteksi");
    process.exit(0);
  }
  console.log(`- id: asm-${termId.replace(/^presiden-/, "")}-ai`);
  console.log(`  term_id: ${termId}`);
  console.log(`  rubric_version: "1.0.0"`);
  console.log(`  status: draft`);
  console.log(`  reviewers: ["Pipeline AI (heuristik)"]`);
  console.log(`  ai_suggested: true`);
  console.log(`  human_confirmed: false`);
  console.log(`  created_at: "${new Date().toISOString().slice(0, 10)}"`);
  console.log(`  dimension_scores:`);
  for (const [dimId, info] of byDim) {
    console.log(`    - dimension_id: ${dimId}`);
    console.log(`      score: null            # TODO kurator`);
    console.log(
      `      confidence: ${(0.2 + info.hits.size * 0.05).toFixed(2)} # kekuatan sinyal heuristik`
    );
    console.log(`      rationale_id: "TODO: tulis rasional berbasis bukti di bawah"`);
    console.log(
      `      event_ids: [${info.evidence.slice(0, 5).join(", ")}]`
    );
    console.log(
      `      # kata kunci pemicu: ${[...info.hits].slice(0, 6).join(", ")}`
    );
  }
} else {
  // ---------- mode LLM (usulan skor; tetap draft) ----------
  console.error("Memanggil model... (mode LLM)");
  const prompt = [
    `Anda peneliti hukum tata negara Indonesia. Nilai masa jabatan "${term["label_id"]}" pada skala -2..+2 per dimensi berdasarkan HANYA peristiwa berikut:`,
    ...events.map((e) => `- [${e.id}] ${e.title_id}: ${e.summary_id}`),
    ``,
    `Dimensi kandidat: ${[...byDim.keys()].join(", ")}`,
    `Balas HANYA JSON array: [{"dimension_id":..,"score":-2..2,"confidence":0..1,"rationale":"<=25 kata","event_ids":[..]}]`,
  ].join("\n");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
      }),
    });
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    const start = content.indexOf("[");
    const end = content.lastIndexOf("]");
    const suggestions = JSON.parse(content.slice(start, end + 1)) as Array<{
      dimension_id: string;
      score: number;
      confidence: number;
      rationale: string;
      event_ids?: string[];
    }>;

    console.log(`- id: asm-${termId.replace(/^presiden-/, "")}-ai`);
    console.log(`  term_id: ${termId}`);
    console.log(`  rubric_version: "1.0.0"`);
    console.log(`  status: draft`);
    console.log(`  reviewers: ["Pipeline AI (LLM gpt-4o-mini)"]`);
    console.log(`  ai_suggested: true`);
    console.log(`  human_confirmed: false`);
    console.log(`  created_at: "${new Date().toISOString().slice(0, 10)}"`);
    console.log(`  dimension_scores:`);
    for (const s of suggestions) {
      console.log(`    - dimension_id: ${s.dimension_id}`);
      console.log(`      score: ${Math.max(-2, Math.min(2, Math.round(s.score)))}`);
      console.log(`      confidence: ${Math.max(0.05, Math.min(0.9, s.confidence)).toFixed(2)}`);
      console.log(`      rationale_id: "${s.rationale.replace(/"/g, "'")}"`);
      if (s.event_ids?.length)
        console.log(`      event_ids: [${s.event_ids.join(", ")}]`);
    }
  } catch (err) {
    console.error("Gagal memanggil LLM:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
