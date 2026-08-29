import fs from 'fs';

const path = 'apps/web/src/app/cari/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update category tabs in filter
const oldTabs = `<div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: "all", label: "Semua Kategori" },
            { id: "event", label: "Peristiwa" },
            { id: "source", label: "Sumber Primer" },
            { id: "term", label: "Masa Jabatan" },
            { id: "pasal", label: "Pasal UUD" },
          ].map((cat) => (`;

const newTabs = `<div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: "all", label: "Semua", count: totalMatches },
            { id: "event", label: "Peristiwa", count: results.events.length },
            { id: "actor", label: "Tokoh Bangsa", count: results.actors.length },
            { id: "history", label: "Akar Sejarah", count: results.history.length },
            { id: "source", label: "Sumber Primer", count: results.sources.length },
            { id: "term", label: "Masa Jabatan", count: results.terms.length },
            { id: "dimension", label: "Dimensi Rubrik", count: results.dimensions.length },
            { id: "pasal", label: "Pasal UUD", count: results.pasal.length },
          ].map((cat) => (`;

content = content.replace(oldTabs, newTabs);

content = content.replace(
  '<span>{cat.label}</span>',
  '<span>{cat.label} ({cat.count})</span>'
);

const newSections = `
        {/* Tokoh Bangsa */}
        {(categoryFilter === "all" || categoryFilter === "actor") && results.actors.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-amber-500 uppercase tracking-wide">
              Tokoh Bangsa & Aktor ({results.actors.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {results.actors.slice(0, 30).map((actor) => (
                <Link
                  key={actor.id}
                  href={\`/aktor/\${actor.id}\`}
                  className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-slate-500 transition block space-y-1"
                >
                  <div className="font-bold text-sm text-[var(--text)]">{actor.name}</div>
                  {actor.roles && actor.roles.length > 0 && (
                    <div className="text-xs text-[var(--acc-amber)]">
                      {actor.roles.map(r => r.title_id).filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {actor.bio_id && (
                    <p className="text-xs text-[var(--muted)] line-clamp-2 mt-1 leading-relaxed">
                      {actor.bio_id}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Akar Sejarah */}
        {(categoryFilter === "all" || categoryFilter === "history") && results.history.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-emerald-500 uppercase tracking-wide">
              Akar Sejarah & Genealogi Konstitusi ({results.history.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {results.history.map((h) => (
                <Link
                  key={h.year}
                  href={h.link}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 hover:border-emerald-400 transition block space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-400">{h.year} · {h.category}</span>
                    <span className="text-[10px] text-emerald-400 underline">Lihat Linimasa &rarr;</span>
                  </div>
                  <div className="font-bold text-sm text-[var(--text)]">{h.title}</div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{h.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Dimensi Rubrik */}
        {(categoryFilter === "all" || categoryFilter === "dimension") && results.dimensions.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-purple-400 uppercase tracking-wide">
              Dimensi Rubrik UUD 1945 ({results.dimensions.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {results.dimensions.map((dim) => (
                <div
                  key={dim.id}
                  className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 space-y-1"
                >
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                    {dim.id}
                  </div>
                  <div className="font-bold text-sm text-[var(--text)]">{dim.name_id}</div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mt-1">{dim.question_id}</p>
                </div>
              ))}
            </div>
          </section>
        )}
`;

content = content.replace(
  '{/* 4. Pasal UUD */}',
  `${newSections}\n        {/* 4. Pasal UUD */}`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Cari page UI successfully patched with full historical and actor sections!");
