import Link from "next/link";
import { notFound } from "next/navigation";

import { dataset, getInstitution, getTermsOfInstitution } from "@pancasila-index/data";

import {
  periodLabel,
  scoreColor,
  scoreLabel,
  termSummary,
} from "@/lib/view";

export function generateStaticParams() {
  return dataset.institutions.map((i) => ({ slug: i.slug }));
}

export default async function LembagaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const institution = getInstitution(dataset, slug);
  if (!institution) notFound();

  const terms = getTermsOfInstitution(dataset, institution.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs uppercase tracking-wide text-red-500 font-semibold">
        {institution.branch}
      </p>
      <h1 className="mt-1 text-3xl font-bold">{institution.name_id}</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] max-w-2xl">
        {institution.description_id}
      </p>

      <h2 className="mt-10 text-lg font-semibold">Masa jabatan & indeks draf</h2>
      <div className="mt-4 space-y-2">
        {terms.map((term) => {
          const summary = termSummary(term.id);
          const index = summary?.index ?? null;
          return (
            <Link
              key={term.id}
              href={`/lembaga/${institution.slug}/${term.id}`}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 hover:border-slate-500 transition"
            >
              <span className="font-medium grow">{term.label_id}</span>
              <span className="text-xs text-[var(--muted)]">
                {periodLabel(term.start_date, term.end_date)}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{
                  background:
                    index === null ? "#1e293b" : `${scoreColor(index / 25 - 2)}22`,
                  color: index === null ? "#94a3b8" : scoreColor(index / 25 - 2),
                }}
              >
                {scoreLabel(index)}
              </span>
              <span className="text-xs text-[var(--muted)] w-24 text-right">
                cakupan {Math.round((summary?.coverage ?? 0) * 100)}%
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
