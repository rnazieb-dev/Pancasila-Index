#!/usr/bin/env tsx
/**
 * import — masukkan BATCH peristiwa dari berkas JSON ke events.yaml.
 *
 * Inilah jalur menuju "ratusan peristiwa per sila": AI/kontributor menyiapkan
 * JSON mentah, skrip ini memvalidasi ketat (skema + referensi silang) dan hanya
 * menerima item yang bersih. Satu item gagal = dilaporkan, sisanya tetap bisa
 * diterbitkan dengan flag --skip-invalid.
 *
 * Format input (batch.json):
 * {
 *   "sources": [ { id, type, title_id, year?, url?, citation_id? } ],
 *   "events":  [ { id, term_id, date, category, title_id, summary_id,
 *                  source_ids: [], dimension_ids: [] } ]
 * }
 *
 * Pemakaian:
 *   pnpm --filter @pancasila-index/ai import --file batch.json            # pratinjau ke stdout
 *   pnpm --filter @pancasila-index/ai import --file b.json --append       # tambah ke events.yaml
 */
import { readFileSync, appendFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { parse, stringify } from "yaml";

import {
  rubricSchema,
} from "@pancasila-index/core";

import {
  eventSchema,
  sourceSchema,
} from "@pancasila-index/core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "..", "data", "data");

const args = parseArgs({
  options: {
    file: { type: "string" },
    append: { type: "boolean", default: false },
    "skip-invalid": { type: "boolean", default: false },
  },
});

if (!args.values.file) {
  console.error("Pemakaian: tsx scripts/import.mts --file batch.json [--append] [--skip-invalid]");
  process.exit(1);
}

type Raw = Record<string, unknown>;
const raw = JSON.parse(readFileSync(args.values.file as string, "utf8")) as {
  sources?: Raw[];
  events?: Raw[];
};

// ---- muat kondisi terkini untuk cek duplikat & referensi ----
const currentEventsText = readFileSync(join(DATA, "events.yaml"), "utf8");
const currentSourcesText = readFileSync(join(DATA, "sources.yaml"), "utf8");
const existingEventIds = new Set(
  [...currentEventsText.matchAll(/^- id:\s*(\S+)/gm)].map((m) => m[1]!)
);
const existingSourceIds = new Set(
  [...currentSourcesText.matchAll(/^- id:\s*(\S+)/gm)].map((m) => m[1]!)
);
const existingTermIds = new Set(
  ["terms-presiden.yaml", "terms-dpr.yaml", "terms-mk.yaml"].flatMap((f) =>
    [...readFileSync(join(DATA, f), "utf8").matchAll(/^- id:\s*(\S+)/gm)].map(
      (m) => m[1]!
    )
  )
);

/** Dimensi resmi dibaca langsung dari rubrik aktif agar tidak telat lagi. */
const rubricText = readFileSync(
  join(DATA, "rubric", readdirSync(join(DATA, "rubric")).filter((f) => f.endsWith(".yaml")).sort().at(-1)!),
  "utf8"
);
const rubric = rubricSchema.parse(parse(rubricText));
const knownDimensionIds = new Set(rubric.dimensions.map((d) => d.id));

const errors: string[] = [];
const validSources: unknown[] = [];
const validEvents: unknown[] = [];

for (const [i, s] of (raw.sources ?? []).entries()) {
  const parsed = sourceSchema.safeParse(s);
  if (!parsed.success) {
    errors.push(`sources[${i}] (${(s as Raw).id}): tidak valid`);
    continue;
  }
  if (existingSourceIds.has(parsed.data.id)) {
    errors.push(`sources[${i}]: id "${parsed.data.id}" sudah ada - dilewati`);
    continue;
  }
  validSources.push(s);
}

// sumber baru langsung boleh dirujuk event dalam batch yang sama
const availableSourceIds = new Set([
  ...existingSourceIds,
  ...(validSources as Array<{ id: string }>).map((s) => s.id),
]);

for (const [i, e] of (raw.events ?? []).entries()) {
  const parsed = eventSchema.safeParse(e);
  if (!parsed.success) {
    errors.push(`events[${i}] (${(e as Raw).id}): tidak valid`);
    if (!args.values["skip-invalid"]) continue;
  }
  const ev = e as Raw;
  if (existingEventIds.has(String(ev.id))) {
    errors.push(`events[${i}]: id "${ev.id}" sudah ada - dilewati`);
    continue;
  }
  if (!existingTermIds.has(String(ev.term_id)) && !args.values["skip-invalid"]) {
    errors.push(`events[${i}]: term_id "${ev.term_id}" tidak dikenal`);
    continue;
  }
  const badSrc = ((ev.source_ids as string[]) ?? []).filter(
    (sid) => !availableSourceIds.has(sid)
  );
  if (badSrc.length > 0 && !args.values["skip-invalid"]) {
    errors.push(`events[${i}] (${ev.id}): sumber tidak terdaftar: ${badSrc.join(", ")}`);
    continue;
  }
  const badDim = ((ev.dimension_ids as string[]) ?? []).filter(
    (d) => !knownDimensionIds.has(d)
  );
  if (badDim.length > 0 && !args.values["skip-invalid"]) {
    errors.push(`events[${i}] (${ev.id}): dimensi tak dikenal: ${badDim.join(", ")}`);
    continue;
  }
  validEvents.push(e);
}

console.error(
  `Ringkasan: ${validSources.length} sumber baru, ${validEvents.length} peristiwa valid, ${errors.length} masalah.`
);
for (const err of errors.slice(0, 20)) console.error(`  ! ${err}`);

if (validEvents.length === 0) {
  console.error("Tidak ada yang bisa ditulis.");
  process.exit(errors.length > 0 ? 1 : 0);
}

let yamlOut = "";
if (validSources.length > 0) {
  yamlOut +=
    "# ---- sumber baru (hasil import massal) ----\n" +
    stringify(validSources);
}
yamlOut += "\n# ---- peristiwa baru (hasil import massal, WAJIB DIKURASI) ----\n" + stringify(validEvents);

if (args.values.append) {
  if (validSources.length > 0) {
    const srcOnly = stringify(validSources);
    appendFileSync(join(DATA, "sources.yaml"), "\n" + srcOnly);
    console.error(`${validSources.length} sumber -> sources.yaml`);
  }
  appendFileSync(join(DATA, "events.yaml"), "\n" + stringify(validEvents));
  console.error(`${validEvents.length} peristiwa -> events.yaml - jalankan pnpm build:data lalu KURASI.`);
} else {
  console.log(yamlOut);
}
