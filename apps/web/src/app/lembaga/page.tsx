"use client";

import Link from "next/link";
import { dataset, getInstitutions } from "@pancasila-index/data";
import { useLocale } from "@/components/locale-provider";
import { InstitutionLogo } from "@/components/institution-logo";
import {
  scoreColor,
  scoreTextColor,
  summaryIndexLabel,
  termSummary,
} from "@/lib/view";

export default function LembagaIndex() {
  const { t, locale } = useLocale();
  const institutions = getInstitutions(dataset);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="border-b border-[var(--line)] pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold">{t("secOrgansTitle")}</h1>
        <p className="mt-2 text-base text-[var(--muted)] max-w-3xl">
          {t("secOrgansDesc")}
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {institutions.map((inst) => {
          const terms = dataset.terms.filter((tItem) => tItem.institution_id === inst.id);
          const eventsCount = dataset.events.filter((e) =>
            terms.some((tItem) => tItem.id === e.term_id)
          ).length;
          const latestTerm = terms[terms.length - 1];
          const latestSummary = latestTerm ? termSummary(latestTerm.id) : null;
          const latestIndex = latestSummary?.index ?? null;

          return (
            <Link
              key={inst.id}
              href={`/lembaga/${inst.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 hover:border-[var(--acc-red)] hover:shadow-lg transition duration-200"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wider text-[var(--acc-red)] font-semibold text-[10px]">
                    {inst.branch}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] font-mono">
                    {terms.length} {t("statTerms")}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3.5">
                  <InstitutionLogo id={inst.id} size="lg" />
                  <div>
                    <h2 className="text-lg font-bold group-hover:text-[var(--acc-red)] transition leading-snug">
                      {inst.short_id || inst.name_id}
                    </h2>
                    <div className="text-xs text-[var(--muted)] line-clamp-1">{inst.name_id}</div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-[var(--muted)] line-clamp-3 leading-relaxed">
                  {inst.description_id}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
                <span className="text-[var(--muted)] font-medium">
                  {eventsCount} {t("eventsLabel")}
                </span>
                <span
                  className="rounded-md px-2.5 py-1 text-xs font-bold tabular-nums"
                  style={{
                    background: latestIndex === null ? "#1e293b" : `${scoreColor(latestIndex / 25 - 2)}22`,
                    color: latestIndex === null ? "var(--score-zero)" : scoreTextColor(latestIndex / 25 - 2),
                  }}
                >
                  {summaryIndexLabel(latestSummary)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
