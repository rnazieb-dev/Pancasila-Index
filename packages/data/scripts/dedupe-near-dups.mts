#!/usr/bin/env tsx
/**
 * Gabungkan peristiwa near-duplikat dengan AMAN (merge-back, nol data hilang).
 *
 * Dua peristiwa yang berbagi sumber + tanggal dan judul mirip (word-set
 * similarity >= 0.85) hampir selalu duplikat. Script ini menyatukan tiap
 * klaster menjadi SATU peristiwa kanonik dengan GABUNGAN (union) semua bidang:
 * source_ids, dimension_ids, actor_ids, subject_term_id, dan mengambil
 * ringkasan terpanjang. Referensi di assessments.yaml di-remap ke kanonik.
 * Idempoten: setelah duplikat hilang, run ulang = no-op.
 *
 * Hanya blok yang digabung yang ditulis ulang; blok lain dipertahankan
 * byte-for-byte agar data tak berubah dan dif kecil.
 *
 * Jalankan: pnpm --filter @pancasila-index/data exec tsx scripts/dedupe-near-dups.mts
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const DATA = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const FILE_EVENTS_LEGACY = join(DATA, "events.yaml");

type Event = {
  id: string;
  term_id: string;
  date: string;
  category: string;
  title_id: string;
  summary_id: string;
  source_ids: string[];
  dimension_ids: string[];
  actor_ids: string[];
  subject_term_id?: string;
  subject_basis_id?: string;
  [k: string]: unknown;
};

const fileList = [
  FILE_EVENTS_LEGACY,
  ...readdirSync(join(DATA, "events"))
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => join(DATA, "events", f)),
];

function splitBlocks(text: string): { id: string; body: string }[] {
  const lines = text.split("\n");
  const starts: number[] = [];
  lines.forEach((l, i) => {
    if (/^\s*- id:\s/.test(l)) starts.push(i);
  });
  const out: { id: string; body: string }[] = [];
  for (let k = 0; k < starts.length; k++) {
    const s = starts[k]!;
    const e = k + 1 < starts.length ? starts[k + 1]! : lines.length;
    let end = e;
    while (end > s && lines[end - 1]!.trim() === "") end--;
    const body = lines.slice(s, end).join("\n");
    const m = lines[s]!.match(/^- id:\s*(.+?)\s*$/);
    out.push({ id: m ? m[1]! : "", body });
  }
  return out;
}

// load all blocks & events
const perFile = new Map<string, { id: string; body: string }[]>();
const eventById = new Map<string, { file: string; event: Event }>();
for (const f of fileList) {
  let text = "";
  try {
    text = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  const blocks = splitBlocks(text);
  perFile.set(f, blocks);
  for (const b of blocks) {
    if (b.id) {
      const arr = parse(b.body) as unknown[];
      if (Array.isArray(arr) && arr.length > 0) eventById.set(b.id, { file: f, event: arr[0] as Event });
    }
  }
}

// assessment references (prefer as canonical)
const assessPath = join(DATA, "assessments.yaml");
let assessText = readFileSync(assessPath, "utf8");
const assessRefs = new Set<string>();
{
  const a = parse(assessText) as Array<{ dimension_scores?: Array<{ event_ids?: string[] }> }>;
  for (const asm of a)
    for (const ds of asm.dimension_scores ?? [])
      for (const eid of ds.event_ids ?? []) assessRefs.add(eid);
}

// near-dup detection (sumber + tanggal + word-sim >= 0.85)
const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const sim = (a: string, b: string) => {
  const wa = new Set(norm(a).split(" ").filter((w) => w.length > 2));
  const wb = new Set(norm(b).split(" ").filter((w) => w.length > 2));
  if (!wa.size || !wb.size) return 0;
  let inter = 0;
  for (const w of wa) if (wb.has(w)) inter++;
  return inter / Math.min(wa.size, wb.size);
};

const parent = new Map<string, string>();
const find = (x: string): string => {
  if (!parent.has(x)) parent.set(x, x);
  let r = x;
  while (parent.get(r) !== r) r = parent.get(r)!;
  let c = x;
  while (parent.get(c) !== c) {
    const n = parent.get(c)!;
    parent.set(c, r);
    c = n;
  }
  return r;
};
const uni = (a: string, b: string) => parent.set(find(a), find(b));

const groups = new Map<string, string[]>();
for (const [id, { event: e }] of eventById) {
  if (!e.source_ids?.length) continue;
  const key = [...e.source_ids].sort().join("|") + "::" + e.date;
  const arr = groups.get(key) ?? [];
  arr.push(id);
  groups.set(key, arr);
}
for (const ids of groups.values()) {
  if (ids.length < 2) continue;
  for (const i of ids)
    for (const j of ids) {
      if (i === j) continue;
      const a = eventById.get(i)!.event;
      const b = eventById.get(j)!.event;
      if (sim(a.title_id, b.title_id) >= 0.85) uni(i, j);
    }
}

const clusters = new Map<string, string[]>();
for (const id of eventById.keys()) {
  const r = find(id);
  const arr = clusters.get(r) ?? [];
  arr.push(id);
  clusters.set(r, arr);
}
const toMerge = [...clusters.values()].filter((c) => c.length > 1);
if (toMerge.length === 0) {
  console.log("Tidak ada near-duplikat tersisa (no-op).");
  process.exit(0);
}

// choose canonical + merge fields
const newBodyById = new Map<string, string>();
const removedIds = new Set<string>();
const removedToCanonical = new Map<string, string>();

for (const ids of toMerge) {
  let canon = ids.find((i) => assessRefs.has(i));
  if (!canon) {
    const era = ids.filter((i) => eventById.get(i)!.file !== FILE_EVENTS_LEGACY);
    canon = era[0];
  }
  if (!canon)
    canon = ids.reduce((a, b) =>
      eventById.get(a)!.event.summary_id.length >= eventById.get(b)!.event.summary_id.length ? a : b,
      ids[0]!,
    );

  const canonEv: Event = { ...eventById.get(canon)!.event };
  const others = ids.filter((i) => i !== canon);

  const union = (f: "source_ids" | "dimension_ids" | "actor_ids") => {
    const set = new Set<string>(canonEv[f] as string[]);
    for (const o of others)
      for (const v of (eventById.get(o)!.event[f] as string[]) ?? []) set.add(v);
    canonEv[f] = [...set];
  };
  union("source_ids");
  union("dimension_ids");
  union("actor_ids");
  for (const o of others) {
    const oe = eventById.get(o)!.event;
    if (!canonEv.subject_term_id && oe.subject_term_id) canonEv.subject_term_id = oe.subject_term_id;
    if (!canonEv.subject_basis_id && oe.subject_basis_id) canonEv.subject_basis_id = oe.subject_basis_id;
  }
  const richest = [canon, ...others].reduce((a, b) =>
    eventById.get(a)!.event.summary_id.length >= eventById.get(b)!.event.summary_id.length ? a : b,
  );
  canonEv.summary_id = eventById.get(richest)!.event.summary_id;

  newBodyById.set(canon, stringify([canonEv]));
  for (const o of others) {
    removedIds.add(o);
    removedToCanonical.set(o, canon);
    console.log(`  merge ${o} -> ${canon}`);
  }
}

// write back events files: skip removed, replace merged canonical
for (const [f, blocks] of perFile) {
  if (!blocks.some((b) => newBodyById.has(b.id) || removedIds.has(b.id))) continue;
  const pieces: string[] = [];
  for (const b of blocks) {
    if (removedIds.has(b.id)) continue;
    if (newBodyById.has(b.id)) pieces.push(newBodyById.get(b.id)!);
    else pieces.push(b.body);
  }
  writeFileSync(f, pieces.join("\n") + "\n", "utf8");
}

// remap assessment references removed -> canonical
for (const [o, canon] of removedToCanonical) {
  const esc = o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assessText = assessText.replace(new RegExp(`-\\s*${esc}\\s*\\n`, "g"), `- ${canon}\n`);
  assessText = assessText.replace(new RegExp(`\\[\\s*${esc}\\s*\\]`, "g"), `[${canon}]`);
  assessText = assessText.replace(new RegExp(`\\[\\s*${esc}\\s*,\\s*`, "g"), `[${canon}, `);
}
writeFileSync(assessPath, assessText, "utf8");

console.log(`Menggabungkan ${toMerge.length} klaster; ${removedIds.size} peristiwa digabung ke kanonik.`);
