import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const readYaml = (file: string) => yaml.parse(fs.readFileSync(path.join(process.cwd(), 'data', file), 'utf8')) as any;
const writeYaml = (file: string, data: any) => fs.writeFileSync(path.join(process.cwd(), 'data', file), yaml.stringify(data, { indent: 2, lineWidth: 0 }), 'utf8');

const assessments = readYaml('assessments.yaml');
const events = readYaml('events.yaml');

// Gather all orphan events
const assessmentEventIds = new Set<string>();
for (const a of assessments) {
  if (a.dimension_scores) {
    for (const d of a.dimension_scores) {
      if (d.event_ids) {
        for (const e of d.event_ids) assessmentEventIds.add(e);
      }
    }
  }
}

const orphanEvents = events.filter((e: any) => !assessmentEventIds.has(e.id));

console.log(`Found ${orphanEvents.length} orphan events to inject.`);

// Group by term_id
const termToEvents: Record<string, string[]> = {};
for (const e of orphanEvents) {
  if (!termToEvents[e.term_id]) termToEvents[e.term_id] = [];
  termToEvents[e.term_id].push(e.id);
}

for (const asm of assessments) {
  const term = asm.term_id;
  const availableEvents = termToEvents[term] || [];
  if (availableEvents.length === 0) continue;
  
  // Inject evenly or dump in first dimension
  if (asm.dimension_scores && asm.dimension_scores.length > 0) {
    if (!asm.dimension_scores[0].event_ids) asm.dimension_scores[0].event_ids = [];
    asm.dimension_scores[0].event_ids.push(...availableEvents);
  }
}

writeYaml('assessments.yaml', assessments);

