import fs from 'fs';

const path = 'apps/web/src/app/peer-review/import-data/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const importsToAdd = `
import { useEffect } from "react";
`;

const stateToAdd = `
  const [radarItems, setRadarItems] = useState<any[]>([]);
  const [radarLoading, setRadarLoading] = useState(true);

  useEffect(() => {
    fetch('/api/kurasi/radar')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRadarItems(data.items);
        }
        setRadarLoading(false);
      })
      .catch(() => setRadarLoading(false));
  }, []);
`;

const radarHtml = `
      {/* Radar AI Section */}
      <div className="mb-8 p-5 rounded-xl border border-[var(--acc-amber)]/30 bg-[var(--acc-amber)]/5">
        <h2 className="text-xl font-bold mb-1 text-[var(--acc-amber)] flex items-center gap-2">
          <span>🤖</span> Radar Audit Terkini (Deteksi AI)
        </h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          AI Watchdog mendeteksi rilis dataset terbaru dari pemerintah yang membutuhkan verifikasi Anda.
        </p>

        {radarLoading ? (
          <div className="text-sm text-[var(--muted)]">Memuat radar...</div>
        ) : radarItems.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">Belum ada dataset baru yang terdeteksi.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {radarItems.map((item) => (
              <div key={item.id} className="p-4 rounded-lg border border-[var(--line)] bg-[var(--bg)] shadow-sm flex flex-col gap-2">
                <div className="text-xs text-[var(--muted)] flex justify-between items-center">
                  <span>{item.agency}</span>
                  <span className="bg-[var(--line)] px-2 py-0.5 rounded-full">{item.status}</span>
                </div>
                <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
                <div className="mt-2 p-3 bg-[var(--panel)] rounded text-xs border-l-2 border-[var(--acc-amber)]">
                  <span className="font-medium">Klaim Terdeteksi:</span> {item.aiExtractedClaim}
                </div>
                <div className="mt-auto pt-3 flex justify-between items-center">
                  <span className="text-xs font-mono text-[var(--muted)] truncate max-w-[150px]" title={item.resourceId}>
                    ID: {item.resourceId}
                  </span>
                  <button 
                    onClick={() => setResourceId(item.resourceId)}
                    className="text-xs font-semibold text-[var(--acc-emerald)] hover:underline"
                  >
                    Audit Data Ini &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

`;

content = content.replace('import { useState } from "react";', `import { useState, useEffect } from "react";`);
content = content.replace('const [error, setError] = useState("");', `const [error, setError] = useState("");\n${stateToAdd}`);
content = content.replace('<div className="grid grid-cols-1 md:grid-cols-3 gap-6">', `${radarHtml}\n      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">`);

fs.writeFileSync(path, content, 'utf8');
console.log("Import data page patched!");
