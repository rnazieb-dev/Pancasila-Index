import fs from 'fs';

const path = 'apps/web/src/app/bandingkan/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '<div className="mt-4 flex flex-wrap gap-2">',
  '<div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2 max-h-48 sm:max-h-60 overflow-y-auto p-2 border border-[var(--line)]/50 rounded-lg bg-[var(--bg)]/50">'
);

content = content.replace(
  '<span className="font-medium truncate max-w-[200px]">',
  '<span className="font-medium truncate max-w-[130px] sm:max-w-[220px]">'
);

content = content.replace(
  '<MultiRadarChart labels={radarLabels} series={radarSeries} />',
  '<MultiRadarChart labels={radarLabels} series={visibleSeries} />'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Bandingkan term selector enhanced!");
