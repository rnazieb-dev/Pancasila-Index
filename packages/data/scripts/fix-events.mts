import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const readYaml = (file: string) => yaml.parse(fs.readFileSync(path.join(process.cwd(), 'data', file), 'utf8')) as any;
const writeYaml = (file: string, data: any) => fs.writeFileSync(path.join(process.cwd(), 'data', file), yaml.stringify(data, { indent: 2, lineWidth: 0 }), 'utf8');

const events = readYaml('events.yaml');

for (const e of events) {
  if (!e.category) {
    if (e.id.includes('uu-') || e.id.includes('perpres') || e.id.includes('keppres')) {
      e.category = 'produk-hukum';
    } else if (e.id.includes('putusan') || e.id.includes('dakwaan')) {
      e.category = 'pengadilan';
    } else {
      e.category = 'peristiwa';
    }
  }
}

writeYaml('events.yaml', events);
