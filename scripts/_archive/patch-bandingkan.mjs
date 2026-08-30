import fs from 'fs';

const path = 'apps/web/src/app/bandingkan/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update MultiRadarChart call (remove size={380})
content = content.replace(
  '<MultiRadarChart labels={radarLabels} series={radarSeries} size={380} />',
  '<MultiRadarChart labels={radarLabels} series={radarSeries} />'
);

// 2. Make Radar Chart Overlay container responsive
const oldRadarSection = `<section className="mt-10 grid lg:grid-cols-[440px_1fr] gap-8 items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <div className="justify-self-center py-4">
          <MultiRadarChart labels={radarLabels} series={radarSeries} />
        </div>`;

const newRadarSection = `<section className="mt-10 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 sm:gap-8 items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-6">
        <div className="w-full flex justify-center py-2 sm:py-4">
          <MultiRadarChart labels={radarLabels} series={radarSeries} />
        </div>`;

content = content.replace(oldRadarSection, newRadarSection);

// 3. Make Summary Cards responsive (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3)
content = content.replace(
  '<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 pt-2">',
  '<div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-2">'
);

// 4. Update Comparison Table for sticky first column on mobile
const oldTableHeader = `<thead className="border-b border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--muted)] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[200px]">Dimensi</th>`;

const newTableHeader = `<thead className="border-b border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--muted)] uppercase tracking-wider sticky top-0 z-20">
              <tr>
                <th className="px-3.5 sm:px-4 py-3 min-w-[150px] sm:min-w-[200px] sticky left-0 bg-[var(--bg)] z-30 border-r border-[var(--line)] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.2)]">Dimensi</th>`;

content = content.replace(oldTableHeader, newTableHeader);

const oldTableRowFirstCell = `<td className="px-4 py-3.5">
                      <div className="font-semibold text-[var(--text)]">{dim.name_id}</div>
                      <div className="text-xs text-[var(--muted)] line-clamp-1">{dim.question_id}</div>
                    </td>`;

const newTableRowFirstCell = `<td className="px-3.5 sm:px-4 py-3.5 sticky left-0 bg-[var(--panel)] z-10 border-r border-[var(--line)] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.2)]">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text)]">{dim.name_id}</div>
                      <div className="text-[11px] sm:text-xs text-[var(--muted)] line-clamp-1">{dim.question_id}</div>
                    </td>`;

content = content.replace(oldTableRowFirstCell, newTableRowFirstCell);

// 5. Update table cells styling for mobile padding
content = content.replace(
  '<th\n                      key={termId}\n                      className="px-4 py-3 min-w-[160px]"',
  '<th\n                      key={termId}\n                      className="px-3 sm:px-4 py-3 min-w-[130px] sm:min-w-[160px]"'
);

content = content.replace(
  '<td key={termId} className="px-4 py-3.5">',
  '<td key={termId} className="px-3 sm:px-4 py-3.5">'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Bandingkan page patched for responsiveness!");
