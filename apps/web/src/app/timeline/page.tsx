import Link from "next/link";

import { dataset } from "@pancasila-index/data";

import {
  indexLabel,
  periodLabel,
  scoreColor, scoreTextColor,
  termSummary,
} from "@/lib/view";

export default function TimelinePage() {
  const branches = [
    { id: "eksekutif", label: "Eksekutif" },
    { id: "legislatif", label: "Legislatif" },
    { id: "yudikatif", label: "Yudikatif" },
    { id: "eksaminatif", label: "Eksaminatif / Pengawasan Keuangan" },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Timeline penilaian</h1>
      <p className="mt-2 text-[var(--muted)] text-sm">
        Penilaian 8 organ konstitusional UUD 1945 dari 1945 hingga kini bersitasi bukti primer.
      </p>

      {branches.map((branch) => {
        const institutions = dataset.institutions.filter(
          (i) => i.branch === branch.id
        );
        if (institutions.length === 0) return null;

        return (
          <section key={branch.id} className="mt-12">
            <h2 className="text-lg font-bold text-[var(--acc-red)] border-b border-[var(--line)] pb-2 uppercase tracking-wide">
              {branch.label}
            </h2>
            <div className="space-y-8 mt-6">
              {institutions.map((institution) => {
                const terms = dataset.terms
                  .filter((t) => t.institution_id === institution.id)
                  .sort((a, b) => a.start_date.localeCompare(b.start_date));

                return (
                  <div key={institution.id} className="space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-base font-semibold text-[var(--text)]">{institution.name_id}</h3>
                      <Link
                        href={`/lembaga/${institution.slug}`}
                        className="text-xs text-[var(--acc-sky)] hover:text-[var(--acc-sky-strong)]"
                      >
                        Lihat profil lembaga →
                      </Link>
                    </div>
                    <ol className="relative border-l border-[var(--line)] ml-2 space-y-4">
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
                                <strong style={{ color: scoreTextColor(index === null ? 0 : index / 25 - 2) }}>
                                  {indexLabel(index)}/100
                                </strong>{" "}
                                · cakupan {Math.round((summary?.coverage ?? 0) * 100)}% dimensi ·{" "}
                                {summary?.assessment_ids.length ?? 0} penilaian
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
