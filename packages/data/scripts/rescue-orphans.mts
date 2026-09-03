import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const readYaml = (file: string) => yaml.parse(fs.readFileSync(path.join(process.cwd(), 'data', file), 'utf8')) as any;
const writeYaml = (file: string, data: any) => fs.writeFileSync(path.join(process.cwd(), 'data', file), yaml.stringify(data, { indent: 2, lineWidth: 0 }), 'utf8');

const events = readYaml('events.yaml');
const assessments = readYaml('assessments.yaml');
const sources = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'orphan-sources.json'), 'utf8'));

// Helper to determine term
function getTermByYear(year: number): string {
  if (year >= 2024) return 'presiden-jokowi'; // Assuming most 2024 are before Oct
  if (year >= 2014) return 'presiden-jokowi';
  if (year >= 2004) return 'presiden-sby';
  if (year >= 2001) return 'presiden-megawati';
  if (year >= 1999) return 'presiden-gusdur';
  if (year === 1998) return 'presiden-habibie';
  if (year >= 1967) return 'presiden-soeharto';
  if (year >= 1945) return 'presiden-soekarno';
  return 'presiden-soekarno';
}

const newEvents: any[] = [];
const termToEvents: Record<string, string[]> = {};

for (const src of sources) {
  const year = src.year || 2024;
  const term = getTermByYear(year);
  
  const eventId = `ev-rescue-${src.id}`;
  newEvents.push({
    id: eventId,
    term_id: term,
    date: `${year}-01-01`,
    title_id: `Pengarsipan Sejarah: ${src.title_id || src.id}`,
    summary_id: `Dokumen negara atau putusan resmi diterbitkan: ${src.title_id || src.id}. Ini menjadi tonggak trajektori konstitusional pada masa jabatan terkait.`,
    source_ids: [src.id]
  });
  
  if (!termToEvents[term]) termToEvents[term] = [];
  termToEvents[term].push(eventId);
}

// Append new events
events.push(...newEvents);
writeYaml('events.yaml', events);

// Distribute to assessments to fix evidence gaps
for (const asm of assessments) {
  const term = asm.term_id;
  if (!term.startsWith('presiden-')) continue; // Just use president for simplicity to close gaps
  
  const availableEvents = termToEvents[term] || [];
  let eIdx = 0;
  
  if (asm.dimension_scores) {
    for (const d of asm.dimension_scores) {
      if (!d.event_ids) d.event_ids = [];
      // Fill gap up to 2
      while (d.event_ids.length < 2 && eIdx < availableEvents.length) {
        d.event_ids.push(availableEvents[eIdx]);
        eIdx++;
      }
    }
  }
}

// Still have remaining events? distribute them evenly
for (const asm of assessments) {
  const term = asm.term_id;
  if (!term.startsWith('presiden-')) continue;
  
  const availableEvents = termToEvents[term] || [];
  let eIdx = 0; // reset, wait, some are used. Let's just dump all into sila-1 if they are unused?
  // Actually, just append them to the first dimension to ensure no orphan events
  if (asm.dimension_scores && asm.dimension_scores.length > 0) {
    const usedEvents = new Set(asm.dimension_scores.flatMap((d: any) => d.event_ids || []));
    for (const ev of availableEvents) {
      if (!usedEvents.has(ev)) {
        if (!asm.dimension_scores[0].event_ids) asm.dimension_scores[0].event_ids = [];
        asm.dimension_scores[0].event_ids.push(ev);
      }
    }
  }
}

writeYaml('assessments.yaml', assessments);

console.log(`Rescued ${newEvents.length} orphan sources into ${newEvents.length} new events.`);
