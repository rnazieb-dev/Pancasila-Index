import fs from 'fs';

const path = 'apps/web/src/app/ekspor/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const cardToAdd = `
        {/* 5. Audit Data Terbuka CKAN */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-emerald-500 font-bold">Data Terbuka / CKAN</span>
              <span className="text-xs text-[var(--muted)]">API / JSON</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text)] mt-1">Audit Data Terbuka (CKAN DataStore)</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
              Koleksi hasil audit kritis atas dataset resmi kementerian/lembaga yang telah lolos pengujian independen melalui kuorum 2 peninjau.
            </p>
          </div>
          <div className="flex gap-2 pt-3">
            <a
              href="/api/v1/ckan-audits?status=published"
              target="_blank"
              rel="noreferrer"
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition text-center shadow"
            >
              🌐 Buka REST API v1
            </a>
          </div>
        </div>
`;

content = content.replace(
  '{/* 4. Sumber Primer CSV */}',
  `${cardToAdd}\n\n        {/* 4. Sumber Primer CSV */}`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Ekspor page updated with CKAN audits card!");
