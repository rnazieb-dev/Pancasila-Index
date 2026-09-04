#!/usr/bin/env tsx
/**
 * Cetak konteks yang dibutuhkan untuk menulis antitesis & sintesis per dimensi.
 * Pemakaian: tsx scripts/dialektika-dump.mts asm-habibie asm-gusdur
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const DATA = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const A = parse(readFileSync(join(DATA, "assessments.yaml"), "utf8")) as any[];
const S = new Map(
  (parse(readFileSync(join(DATA, "sources.yaml"), "utf8")) as any[]).map((s) => [s.id, s])
);
const E = new Map<string, any>();
for (const f of ["events.yaml", ...readdirSync(join(DATA, "events")).map((x) => `events/${x}`)]) {
  for (const e of parse(readFileSync(join(DATA, f), "utf8")) as any[]) E.set(e.id, e);
}

/** Berapa kali rasional yang sama dipakai di seluruh dataset. */
const kembar = new Map<string, number>();
for (const a of A) for (const d of a.dimension_scores) {
  const key = d.rationale_id.trim();
  kembar.set(key, (kembar.get(key) ?? 0) + 1);
}

const want = new Set(process.argv.slice(2));
for (const a of A) {
  if (want.size && !want.has(a.id)) continue;
  for (const d of a.dimension_scores) {
    if (!process.env.SEMUA && (d.antithesis_id || d.synthesis_id)) continue;
    const ev = (d.event_ids ?? [])
      .map((id: string) => E.get(id))
      .filter(Boolean)
      .map((e: any) => `${e.date} ${e.title_id}`);
    const src = (d.evidence ?? [])
      .map((x: any) => S.get(x.source_id)?.title_id ?? x.source_id)
      .slice(0, 6);
    console.log(
      JSON.stringify({
        k: `${a.id}::${d.dimension_id}`,
        score: d.score,
        rationale: d.rationale_id,
        kembar: kembar.get(d.rationale_id.trim()) ?? 1,
        events: ev,
        sources: src,
      })
    );
  }
}
