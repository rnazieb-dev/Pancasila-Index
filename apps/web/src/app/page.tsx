"use client";

import Link from "next/link";
import { dataset, getEventsOfTerm } from "@pancasila-index/data";
import { useLocale } from "@/components/locale-provider";
import { InstitutionLogo } from "@/components/institution-logo";
import {
  IconSearch,
  IconCompare,
  IconTimeline,
  IconUsers,
  IconScale,
  IconFilePlus,
  IconExport,
  IconArchive,
  IconMethodology,
} from "@/components/icons";
import {
  indexLabel,
  periodLabel,
  scoreColor,
  scoreTextColor,
  summaryIndexLabel,
  termSummary,
} from "@/lib/view";

export default function Beranda() {
  const { t, locale } = useLocale();

  const presidents = dataset.terms
    .filter((t) => t.institution_id === "presiden-ri")
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  const pasalCount = dataset.uud.babs.reduce(
    (acc, bab) => acc + bab.pasal.length,
    0
  );

  const stats = [
    { value: dataset.institutions.length, label: t("statInstitutions") },
    { value: dataset.terms.length, label: t("statTerms") },
    { value: dataset.events.length, label: t("statEvents") },
    { value: dataset.sources.length, label: t("statSources") },
    { value: dataset.external_indices?.reduce((a, b) => a + b.data.length, 0) ?? 0, label: "Indeks Independen" },
    { value: pasalCount, label: t("statArticles") },
  ];

  // Ambil peristiwa-peristiwa kunci penting lintas masa
  const featuredEvents = dataset.events
    .filter((e) => e.source_ids.length > 0)
    .slice(-8)
    .reverse();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero Section */}
      <section className="py-10 border-b border-[var(--line)]">
        <p className="text-xs uppercase tracking-widest text-[var(--acc-red)] font-semibold">
          {t("heroBadge")}
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight">
          {t("heroTitle")}
        </h1>
        <p className="mt-5 max-w-3xl text-[var(--muted)] text-base md:text-lg leading-relaxed">
          {t("heroSubtitle")}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            {dataset.events.length} {t("eventsLabel")} · {dataset.sources.length} {t("sourcesLabel")} · 8 {t("statInstitutions")}
          </div>
          <Link
            href="/metodologi"
            className="text-xs text-[var(--muted)] hover:text-[var(--text)] underline decoration-dotted underline-offset-4"
          >
            {t("heroCtaMethod")} →
          </Link>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-center sm:text-left shadow-sm"
          >
            <div className="text-2xl lg:text-3xl font-extrabold text-[var(--text)]">{stat.value}</div>
            <div className="text-[11px] text-[var(--muted)] mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* 8 Organ Konstitusional Grid */}
      <section className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <h2 className="text-2xl font-bold">{t("secOrgansTitle")}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {t("secOrgansDesc")}
            </p>
          </div>
          <Link href="/lembaga" className="text-sm font-medium text-[var(--acc-sky)] hover:underline">
            {t("heroCtaExplore")} →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dataset.institutions.map((inst) => {
            const terms = dataset.terms.filter((t) => t.institution_id === inst.id);
            const eventsCount = dataset.events.filter((e) =>
              terms.some((t) => t.id === e.term_id)
            ).length;
            const latestTerm = terms[terms.length - 1];
            const latestSummary = latestTerm ? termSummary(latestTerm.id) : null;
            const latestIndex = latestSummary?.index ?? null;

            return (
              <Link
                key={inst.id}
                href={`/lembaga/${inst.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-[var(--acc-red)] hover:shadow-lg transition duration-200"
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
                  <div className="mt-3 flex items-center gap-3">
                    <InstitutionLogo id={inst.id} size="md" />
                    <div>
                      <h3 className="text-base font-bold group-hover:text-[var(--acc-red)] transition leading-snug">
                        {inst.short_id || inst.name_id}
                      </h3>
                      <div className="text-[11px] text-[var(--muted)] line-clamp-1">{inst.name_id}</div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {inst.description_id}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
                  <span className="text-[var(--muted)] font-medium text-[11px]">
                    {eventsCount} {t("eventsLabel")}
                  </span>
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-bold tabular-nums"
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
      </section>

      {/* Linimasa Era Kepresidenan */}
      <section className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <h2 className="text-2xl font-bold">{t("secTimelineTitle")}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {t("secTimelineDesc")}
            </p>
          </div>
          <Link href="/timeline" className="text-sm font-medium text-[var(--acc-sky)] hover:underline">
            {t("heroCtaTimeline")} →
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {presidents.map((tItem) => {
            const summary = termSummary(tItem.id);
            const index = summary?.index ?? null;
            const evs = getEventsOfTerm(dataset, tItem.id);
            const pct = index !== null ? Math.max(0, Math.min(100, index)) : 50;

            return (
              <Link
                key={tItem.id}
                href={`/lembaga/presiden/${tItem.id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-slate-400 hover:shadow transition"
              >
                <div className="min-w-[180px]">
                  <div className="font-bold text-sm text-[var(--text)] group-hover:text-[var(--acc-sky)] transition">
                    {tItem.label_id}
                  </div>
                  <div className="text-xs font-mono text-[var(--muted)]">
                    {periodLabel(tItem.start_date, tItem.end_date)}
                  </div>
                </div>

                <span className="text-[11px] text-[var(--muted)] uppercase font-semibold w-24 shrink-0">
                  {tItem.era}
                </span>

                <div className="w-full sm:flex-1 h-3 rounded-full bg-[var(--bg)] border border-[var(--line)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: scoreColor((pct / 100) * 4 - 2),
                    }}
                  />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-[var(--muted)]">
                    {evs.length} {t("eventsLabel")}
                  </span>
                  <span
                    className="w-14 rounded-md py-0.5 text-center text-xs font-bold tabular-nums"
                    style={{
                      background: index === null ? "#1e293b" : `${scoreColor(index / 25 - 2)}22`,
                      color: index === null ? "var(--score-zero)" : scoreTextColor(index / 25 - 2),
                    }}
                  >
                    {indexLabel(index)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Sorotan Peristiwa Sejarah Konstitusional */}
      <section className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <h2 className="text-2xl font-bold">{t("secEventsTitle")}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {t("secEventsDesc")}
            </p>
          </div>
          <Link href="/cari" className="text-sm font-medium text-[var(--acc-sky)] hover:underline">
            {t("actSearch")} {dataset.events.length} {t("eventsLabel")} →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredEvents.map((ev) => {
            const term = dataset.terms.find((t) => t.id === ev.term_id);
            const inst = term ? dataset.institutions.find((i) => i.id === term.institution_id) : null;
            return (
              <div
                key={ev.id}
                className="flex flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                    <span className="font-mono">{ev.date}</span>
                    <span className="uppercase text-[var(--acc-red)] font-semibold">{inst?.short_id ?? ev.category}</span>
                  </div>
                  <h4 className="mt-2 font-bold text-sm leading-snug line-clamp-2">{ev.title_id}</h4>
                  <p className="mt-2 text-[var(--muted)] line-clamp-3 leading-relaxed">{ev.summary_id}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-[11px]">
                  <span className="text-[var(--acc-sky)] font-semibold flex items-center gap-1">
                    <IconArchive size={13} />
                    <span>{ev.source_ids.length} {t("sourcesLabel")}</span>
                  </span>
                  {term && (
                    <Link
                      href={`/lembaga/${inst?.slug ?? "presiden"}/${term.id}`}
                      className="text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      {t("viewEra")}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Jelajahi Fitur Terpadu Grid */}
      <section className="mt-14 rounded-2xl border border-[var(--line)] bg-gradient-to-b from-[var(--panel)] to-[var(--bg)] p-6 sm:p-8">
        <h2 className="text-xl font-bold">{t("secFeaturesTitle")}</h2>
        <p className="text-xs text-[var(--muted)] mt-1 max-w-xl">
          {t("secFeaturesDesc")}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/cari"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconSearch size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("featSearchTitle")} (/cari)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featSearchDesc")}</p>
          </Link>

          <Link
            href="/bandingkan"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconCompare size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("featCompareTitle")} (/bandingkan)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featCompareDesc")}</p>
          </Link>

          <Link
            href="/timeline/tren"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconTimeline size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("featTrendTitle")} (/timeline/tren)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featTrendDesc")}</p>
          </Link>

          <Link
            href="/aktor"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconUsers size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("featActorsTitle")} (/aktor)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featActorsDesc")}</p>
          </Link>

          <Link
            href="/landasan-uud"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconScale size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("featUudTitle")} (/landasan-uud)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featUudDesc")}</p>
          </Link>

          <Link
            href="/usulkan-bukti"
            className="group rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 hover:border-emerald-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-emerald-500/30 text-emerald-500">
              <IconFilePlus size={20} />
            </div>
            <div className="mt-3 font-bold text-emerald-400">{t("featProposeTitle")} (/usulkan-bukti)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featProposeDesc")}</p>
          </Link>

          <Link
            href="/timeline"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconTimeline size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("navTimeline")} (/timeline)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Kronologi penilaian lintas cabang eksekutif, legislatif, yudikatif, dan eksaminatif dari 1945 s/d kini.
            </p>
          </Link>

          <Link
            href="/ekspor"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconExport size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("featExportTitle")} (/ekspor)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featExportDesc")}</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
