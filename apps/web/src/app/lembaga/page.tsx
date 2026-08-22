import Link from "next/link";

import { dataset, getInstitutions } from "@pancasila-index/data";

export default function LembagaIndex() {
  const institutions = getInstitutions(dataset);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Lembaga yang dinilai</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Tiga cabang kekuasaan dinilai dengan rubrik yang sama.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {institutions.map((inst) => {
          const terms = dataset.terms.filter(
            (t) => t.institution_id === inst.id
          );
          return (
            <Link
              key={inst.id}
              href={`/lembaga/${inst.slug}`}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 hover:border-slate-500 transition"
            >
              <div className="text-xs uppercase tracking-wide text-red-500 font-semibold">
                {inst.branch}
              </div>
              <div className="mt-2 font-semibold leading-snug">{inst.name_id}</div>
              <div className="mt-3 text-xs text-[var(--muted)] line-clamp-4">
                {inst.description_id}
              </div>
              <div className="mt-4 text-xs text-[var(--muted)]">
                {terms.length} masa jabatan →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
