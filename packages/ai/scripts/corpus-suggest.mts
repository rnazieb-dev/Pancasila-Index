#!/usr/bin/env tsx
/**
 * corpus-suggest — bangun batch.json dari korpus JDIH (fase 6b).
 *
 * Sumber kandidat: packages/data/raw/index.jsonl (metadata resmi JDIH
 * Setneg). Instrumen yang sudah bersumber di dataset otomatis dilewati.
 * Output kompatibel dengan scripts/import.mts.
 *
 * Pemakaian:
 *   pnpm --filter @pancasila-index/ai corpus-suggest --out batch-corpus.json
 *   pnpm --filter @pancasila-index/ai import --file batch-corpus.json          # pratinjau
 *   pnpm --filter @pancasila-index/ai import --file batch-corpus.json --append # terapkan
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import {
  generateCorpusBatch,
  type IndexRecord,
} from "../src/corpus";

const AI_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(AI_ROOT, "..", "data", "data");
const RAW_INDEX = join(AI_ROOT, "..", "data", "raw", "index.jsonl");

const args = parseArgs({
  options: { out: { type: "string", default: "batch-corpus.json" } },
});

const records: IndexRecord[] = readFileSync(RAW_INDEX, "utf8")
  .split("\n")
  .filter((l) => l.trim())
  .map((l) => JSON.parse(l) as IndexRecord);

const sourcesText = readFileSync(join(DATA, "sources.yaml"), "utf8");
const knownSourceIds = new Set(
  [...sourcesText.matchAll(/^- id:\s*(\S+)/gm)].map((m) => m[1]!.trim().toLowerCase())
);

const { items, skipped } = generateCorpusBatch(records, { knownSourceIds });

const batch = {
  sources: items.map((i) => i.source),
  events: items.map((i) => i.event),
};

writeFileSync(args.values.out!, JSON.stringify(batch, null, 2) + "\n");
console.log(`Korpus: ${records.length} baris index`);
console.log(`Kandidat: ${items.length} peristiwa -> ${args.values.out}`);
console.log(`Lewat: ${skipped.length}`);
for (const s of skipped) console.log(`  - ${s.key}: ${s.reason}`);
