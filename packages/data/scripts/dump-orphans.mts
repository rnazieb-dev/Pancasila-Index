import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const readYaml = (file: string) => yaml.parse(fs.readFileSync(path.join(process.cwd(), 'data', file), 'utf8')) as any;

const assessments = readYaml('assessments.yaml');
const events = readYaml('events.yaml');
const sources = readYaml('sources.yaml');

const eventIds = new Set(events.map((e: any) => e.id));
const sourceIds = new Set(sources.map((s: any) => s.id));

const usedEventIds = new Set<string>();
const usedSourceIds = new Set<string>();

for (const a of assessments) {
  if (!a.dimension_scores) continue;
  for (const d of a.dimension_scores) {
    const evIds = d.evidence_event_ids || d.event_ids || [];
    for (const id of evIds) usedEventIds.add(id);
    if (d.expert_quotes) {
      for (const q of d.expert_quotes) usedSourceIds.add(q.source_id);
    }
    if (d.evidence) {
      for (const e of d.evidence) usedSourceIds.add(e.source_id);
    }
  }
}

for (const e of events) {
  if (e.sources) {
    for (const s of e.sources) usedSourceIds.add(s);
  }
  // WAIT, what if events have source_ids instead of sources?
  if (e.source_ids) {
    for (const s of e.source_ids) usedSourceIds.add(s);
  }
}

const orphanEvents = events.filter((e: any) => !usedEventIds.has(e.id));
const orphanSources = sources.filter((s: any) => !usedSourceIds.has(s.id));

fs.writeFileSync('orphan-events.json', JSON.stringify(orphanEvents, null, 2));
fs.writeFileSync('orphan-sources.json', JSON.stringify(orphanSources, null, 2));

console.log(`Orphan events: ${orphanEvents.length}`);
console.log(`Orphan sources: ${orphanSources.length}`);

