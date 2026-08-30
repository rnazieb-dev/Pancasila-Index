import fs from 'fs';

const path = 'apps/web/src/app/bandingkan/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const SHORT_LABELS_MAP = `
const SHORT_DIMENSION_LABELS: Record<string, string> = {
  "sila-1": "Sila 1: Ketuhanan",
  "sila-2": "Sila 2: Kemanusiaan",
  "sila-3": "Sila 3: Persatuan",
  "sila-4": "Sila 4: Kerakyatan",
  "sila-5": "Sila 5: Keadilan",
  "tujuan-1": "T1: Lindungi Bangsa",
  "tujuan-2": "T2: Kesejahteraan",
  "tujuan-3": "T3: Cerdaskan",
  "tujuan-4": "T4: Ketertiban Dunia",
  "negara-hukum": "N1: Negara Hukum",
  "checks-balances": "N2: Checks & Balances",
  "kedaulatan-rakyat": "N3: Kedaulatan Rakyat",
};
`;

content = content.replace(
  'const PRESET_COLORS = [',
  `${SHORT_LABELS_MAP}\nconst PRESET_COLORS = [`
);

const oldLabelsLogic = `    const labels =
      mode === "sila"
        ? dims.map((d) => \`Sila \${d.id.replace("sila-", "")}\`)
        : dims.map((d) => d.name_id);`;

const newLabelsLogic = `    const labels = dims.map((d) => SHORT_DIMENSION_LABELS[d.id] || d.name_id);`;

content = content.replace(oldLabelsLogic, newLabelsLogic);

const oldRadarSection = `<div className="w-full flex justify-center py-2 sm:py-4">
          <MultiRadarChart labels={radarLabels} series={visibleSeries} />
        </div>`;

const newRadarSection = `<div className="w-full flex flex-col items-center py-2">
          <MultiRadarChart labels={radarLabels} series={visibleSeries} />
          {mode === "all" && (
            <div className="mt-3 w-full text-[11px] text-[var(--muted)] bg-[var(--bg)] p-2.5 rounded-lg border border-[var(--line)]">
              <div className="font-semibold text-[var(--text)] mb-1">Keterangan Kode Sumbu Radar:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <div><strong>Sila 1–5:</strong> Nilai Pancasila</div>
                <div><strong>T1–T4:</strong> Tujuan Bernegara (Alinea IV)</div>
                <div><strong>N1–N3:</strong> Norma Struktural (UUD 1945)</div>
              </div>
            </div>
          )}
        </div>`;

content = content.replace(oldRadarSection, newRadarSection);

fs.writeFileSync(path, content, 'utf8');
console.log("Bandingkan labels successfully patched!");
