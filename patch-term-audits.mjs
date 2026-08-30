import fs from 'fs';

const path = 'apps/web/src/app/lembaga/[slug]/[term]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import db if not present
if (!content.includes('import { db } from "@/lib/db";')) {
  content = `import { db } from "@/lib/db";\n` + content;
}

// Add query for published audits
const queryCode = `
  let publishedCkanAudits: any[] = [];
  try {
    publishedCkanAudits = await db.ckanAudit.findMany({
      where: { status: "published" },
      include: { contributor: { select: { name: true, affiliation: true } } },
      orderBy: { createdAt: "desc" },
      take: 3
    });
  } catch (e) {
    // Graceful fallback if db is offline during SSG
    publishedCkanAudits = [];
  }
`;

content = content.replace(
  'const summary = termSummary(term.id);',
  `const summary = termSummary(term.id);\n${queryCode}`
);

const newAuditSection = `
      <section className="mt-14 rounded-xl border border-[var(--acc-emerald)]/30 bg-[var(--acc-emerald)]/5 p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--acc-emerald)] flex items-center gap-2">
              <span className="text-xl">🗄️</span> Audit Data Terbuka Pemerintah (CKAN DataStore)
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)] leading-relaxed max-w-2xl">
              Hasil uji kritis terhadap data resmi yang dipublikasikan kementerian/lembaga. Setiap temuan telah melalui pengujian independen dengan <strong>Kuorum 2 Reviewer</strong>.
            </p>
          </div>
          <Link
            href="/peer-review/import-data"
            className="shrink-0 bg-[var(--acc-emerald)] text-white px-5 py-2.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Uji Data Pemerintah &rarr;
          </Link>
        </div>

        {publishedCkanAudits.length > 0 ? (
          <div className="grid gap-3 pt-2">
            {publishedCkanAudits.map((item) => (
              <div key={item.id} className="p-4 rounded-lg border border-[var(--line)] bg-[var(--bg)] shadow-sm space-y-2">
                <div className="flex justify-between items-start text-xs">
                  <span className="font-bold text-[var(--text)]">{item.title}</span>
                  <span className="bg-[var(--acc-emerald)]/10 text-[var(--acc-emerald)] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    Terverifikasi Kuorum (2 Reviewer)
                  </span>
                </div>
                <p className="text-xs text-[var(--text)] leading-relaxed bg-[var(--panel)] p-2.5 rounded border-l-2 border-[var(--acc-emerald)]">
                  {item.contextNote}
                </p>
                <div className="flex justify-between items-center text-[11px] text-[var(--muted)] pt-1">
                  <span>Kontributor: <strong>{item.contributor?.name || "Kontributor Terdaftar"}</strong></span>
                  <span className="font-mono text-[10px]">Dimensi: {item.relevantDimension}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-[var(--bg)]/50 rounded-lg border border-[var(--line)] text-xs text-[var(--muted)] italic">
            Belum ada audit CKAN yang dipublikasikan untuk periode ini. Jadilah Kontributor pertama yang menguji data resmi melalui tautan di atas.
          </div>
        )}
      </section>
`;

// Replace old audit section
content = content.replace(/<section className="mt-14 rounded-xl border-2 border-\[var\(--acc-emerald\)\]\/20[\s\S]*?<\/section>/, newAuditSection);

fs.writeFileSync(path, content, 'utf8');
console.log("Term page patched with published audits widget!");
