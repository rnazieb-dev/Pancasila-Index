import fs from 'fs';

const path = 'apps/web/src/app/lembaga/[slug]/[term]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const auditSection = `
      <section className="mt-14 rounded-xl border-2 border-[var(--acc-emerald)]/20 bg-[var(--acc-emerald)]/5 p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--acc-emerald)] flex items-center gap-2">
              <span className="text-xl">🗄️</span> Audit Data Independen (CKAN)
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed max-w-2xl">
              Platform ini tidak sekadar menelan klaim sepihak pemerintah. Para Kontributor dapat menarik <em>Big Data</em> resmi (via CKAN DataStore) dan menyematkan <strong>Konteks/Verifikasi Independen</strong> secara langsung menggunakan 12 Dimensi Pancasila Index.
            </p>
          </div>
          <Link
            href="/peer-review/import-data"
            className="shrink-0 bg-[var(--acc-emerald)] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Uji Data Pemerintah &rarr;
          </Link>
        </div>
      </section>
`;

content = content.replace(
  `      {/* Radar lima sila */}`,
  `${auditSection}\n\n      {/* Radar lima sila */}`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Term page updated!");
