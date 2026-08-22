import Link from "next/link";

import { dataset } from "@pancasila-index/data";

import {
  periodLabel,
  scoreColor,
  scoreLabel,
  termSummary,
} from "@/lib/view";

export default function TimelinePage() {
  const branches = [
    { id: "eksekutif", label: "Eksekutif — Presiden RI" },
    { id: "legislatif", label: "Legislatif — DPR RI" },
    { id: "yudikatif", label: "Yudikatif — Mahkamah Konstitusi" },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Timeline penilaian</h1>
      <p className="mt-2 text-[var(--muted)] text-sm">
        Masa jabatan era Reformasi (seed). Era sebelumnya menyusul pada fase 4.
      </p>

      {branches.map((branch) => {
        const institution = dataset.institutions.find(
          (i) => i.branch === branch.id
        );
        if (!institution) return null;
        const terms = dataset.terms
          .filter((t) => t.institution_id === institution.id)
          .sort((a, b) => a.start_date.localeCompare(b.start_date));

        return (
          <section key={branch.id} className="mt-10">
            <h2 className="text-lg font-semibold">{branch.label}</h2>
            <ol className="mt-4 relative border-l border-[var(--line)] ml-2 space-y-6">
              {terms.map((term) => {
                const summary = termSummary(term.id);
                const index = summary?.index ?? null;
                return (
                  <li key={term.id} className="ml-6 relative">
                    <span
                      className="absolute -left-[27px] top-1.5 size-2.5 rounded-full ring-4 ring-[var(--bg)]"
                      style={{
                        background:
                          index === null ? "#475569" : scoreColor(index / 25 - 2),
                      }}
                    />
                    <Link
                      href={`/lembaga/${institution.slug}/${term.id}`}
                      className="block rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 hover:border-slate-500 transition"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium">{term.label_id}</span>
                        <span className="text-xs text-[var(--muted)]">
                          {periodLabel(term.start_date, term.end_date)}
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs text-[var(--muted)]">
                        Indeks draf{" "}
                        <strong style={{ color: scoreColor((index ?? 50 / 25 - 2)) }}>
                          {scoreLabel(index)}
                        </strong>{" "}
                        · cakupan {Math.round((summary?.coverage ?? 0) * 100)}% dimensi ·{" "}
                        {summary?.assessment_ids.length ?? 0} penilaian
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
