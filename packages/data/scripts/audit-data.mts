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

const evidenceGaps: any[] = [];
const missingDialectics: any[] = [];

for (const a of assessments) {
  if (!a.dimension_scores) continue;
  for (const d of a.dimension_scores) {
    const dimensionName = d.dimension_id;
    
    // Check evidence
    const evIds = d.evidence_event_ids || d.event_ids || [];
    if (evIds.length < 2) {
      evidenceGaps.push({ assessment: a.id, dimension: dimensionName, count: evIds.length });
    }
    
    for (const id of evIds) {
      usedEventIds.add(id);
    }

    // Check dialectics
    if (!d.thesis_id || !d.antithesis_id || !d.expert_quotes || d.expert_quotes.length === 0) {
      missingDialectics.push({ assessment: a.id, dimension: dimensionName, has_thesis: !!d.thesis_id, has_antithesis: !!d.antithesis_id, quotes_count: d.expert_quotes?.length || 0 });
    }
    
    if (d.expert_quotes) {
      for (const q of d.expert_quotes) {
        usedSourceIds.add(q.source_id);
      }
    }
    
    if (d.evidence) {
      for (const e of d.evidence) {
        usedSourceIds.add(e.source_id);
      }
    }
  }
}

for (const e of events) {
  if (e.sources) {
    for (const s of e.sources) {
      usedSourceIds.add(s);
    }
  }
}

const orphanEvents = [...eventIds].filter(id => !usedEventIds.has(id));
const orphanSources = [...sourceIds].filter(id => !usedSourceIds.has(id));

console.log(`--- AUDIT REPORT ---`);
console.log(`Total Assessments: ${assessments.length}`);
console.log(`Total Scores (Dimensions): ${assessments.reduce((acc: number, a: any) => acc + (a.dimension_scores?.length || 0), 0)}`);
console.log(`\n1. EVIDENCE GAPS (Scores with < 2 events): ${evidenceGaps.length}`);
const sampleGaps = evidenceGaps.slice(0, 5);
console.log(`Sample:`, sampleGaps);

console.log(`\n2. DIALECTIC GAPS (Missing thesis, antithesis, or expert quotes): ${missingDialectics.length}`);
const sampleDialectics = missingDialectics.slice(0, 5);
console.log(`Sample:`, sampleDialectics);

console.log(`\n3. ORPHAN EVENTS: ${orphanEvents.length}`);
console.log(`Sample:`, orphanEvents.slice(0, 10));

console.log(`\n4. ORPHAN SOURCES: ${orphanSources.length}`);
console.log(`Sample:`, orphanSources.slice(0, 10));

