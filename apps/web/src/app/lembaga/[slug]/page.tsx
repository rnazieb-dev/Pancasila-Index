import Link from "next/link";
import { notFound } from "next/navigation";

import { dataset, getEventsOfTerm, getInstitution, getTermsOfInstitution } from "@pancasila-index/data";
import { InstitutionLogo } from "@/components/institution-logo";
import { ScaleLegend } from "@/components/scale-legend";

import {
  indexLabel,
  periodLabel,
  scoreColor,
  scoreTextColor,
  summaryIndexLabel,
  summaryQualLabel,
  termSummary,
} from "@/lib/view";

export function generateStaticParams() {
  return dataset.institutions.map((i) => ({ slug: i.slug }));
}

const ERA_LABEL: Record<string, string> = {
  revolusi: "Revolusi",
  "demokrasi-liberal": "Demokrasi Liberal",
  "demokrasi-terpimpin": "Demokrasi Terpimpin",
  "orde-baru": "Orde Baru",
  reformasi: "Reformasi",
};

export default async function LembagaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const institution = getInstitution(dataset, slug);
  if (!institution) notFound();

  const terms = getTermsOfInstitution(dataset, institution.id);
  const termIds = new Set(terms.map((t) => t.id));

  // Ambil semua peristiwa lembaga ini
  const events = dataset.events
    .filter((e) => termIds.has(e.term_id))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Kumpulkan sumber-sumber unik yang menguji lembaga ini
  const sourceIds = new Set(events.flatMap((e) => e.source_ids));

  // Kumpulkan aktor-aktor yang bertugas di lembaga ini
  const actors = dataset.actors.filter((a) =>
    a.roles.some((r) => r.institution_id === institution.id)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Navigasi breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/lembaga" className="hover:text-[var(--text)]">
          ← Semua Lembaga
        </Link>
        <span>/</span>
        <span className="uppercase tracking-wider text-[var(--acc-red)] font-semibold">
          {institution.branch}
        </span>
      </div>

      {/* Header Utama */}
      <div className="mt-5 border-b border-[var(--line)] pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <InstitutionLogo id={institution.id} size="xl" showBadge />
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">{institution.name_id}</h1>
            <p className="mt-2 text-base leading-relaxed text-[var(--muted)] max-w-3xl">
              {institution.description_id}
            </p>
          </div>
        </div>

        {/* Stat counter */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <div className="text-2xl font-bold">{terms.length}</div>
            <div className="text-xs text-[var(--muted)] mt-0.5">Masa Jabatan</div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <div className="text-2xl font-bold">{events.length}</div>
            <div className="text-xs text-[var(--muted)] mt-0.5">Peristiwa Berbukti</div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <div className="text-2xl font-bold">{sourceIds.size}</div>
            <div className="text-xs text-[var(--muted)] mt-0.5">Sumber Primer Tersitasi</div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <div className="text-2xl font-bold">{actors.length}</div>
            <div className="text-xs text-[var(--muted)] mt-0.5">Pimpinan & Tokoh Terdokumentasi</div>
          </div>
        </div>
      </div>

      {/* Daftar Masa Jabatan & Kartu Visual */}
      <section className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-2.5">
          <h2 className="text-xl font-bold">Masa Jabatan & Penilaian Komposit</h2>
          <span className="text-xs text-[var(--muted)]">
            Klik masa jabatan untuk melihat matriks skor per dimensi dan bukti dokumen
          </span>
        </div>

        <div className="mt-3">
          <ScaleLegend compact />
        </div>

        {/*
          Judul kolom hanya tampil sm ke atas: pada mobile tiap baris tetap
          bertumpuk vertikal (grid-cols-1), sehingga label kolom tidak
          relevan di sana.
        */}
        <div className="mt-4 hidden gap-4 px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] sm:grid sm:grid-cols-[minmax(0,280px)_1fr_minmax(0,340px)]">
          <span>Masa Jabatan & Periode</span>
          <span>Indeks Kepatuhan (0–100 · 50 = Netral)</span>
          <span className="text-right">Peristiwa &amp; Skor</span>
        </div>

        {/*
          Grid dengan lebar kolom TETAP (bukan flex + wrap), agar semua
          baris sejajar terlepas dari panjang nama masa jabatan atau apakah
          nama itu membungkus jadi dua baris.
        */}
        <div className="mt-2 space-y-3">
          {terms.map((term) => {
            const summary = termSummary(term.id);
            const index = summary?.index ?? null;
            const pct = index === null ? 0 : Math.min(100, Math.max(0, index));
            const termEvents = getEventsOfTerm(dataset, term.id);
            const eraName = ERA_LABEL[term.era as keyof typeof ERA_LABEL] ?? term.era;
            const qual = summaryQualLabel(summary);

            return (
              <Link
                key={term.id}
                href={`/lembaga/${institution.slug}/${term.id}`}
                className="group grid grid-cols-1 gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-slate-400 hover:shadow-md sm:grid-cols-[minmax(0,280px)_1fr_minmax(0,340px)] sm:items-center sm:gap-4 sm:px-4 sm:py-3.5"
              >
                {/**** Kiri: nama masa jabatan + periode + era ****/}
                <div>
                  <div className="font-bold text-sm sm:text-[15px] leading-snug group-hover:text-[var(--acc-sky)] transition">
                    {term.label_id}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-mono text-[var(--muted)] whitespace-nowrap">
                      {periodLabel(term.start_date, term.end_date)}
                    </span>
                    <span className="truncate text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--line)]/60 text-[var(--muted)]">
                      {eraName}
                    </span>
                  </div>
                </div>

                {/**** Tengah: batang skor dengan garis tengah netral 50% ****/}
                <div className="relative">
                  <div className="h-3 rounded-full bg-[var(--bg)] border border-[var(--line)] overflow-hidden relative">
                    {/* Garis tengah 50% menandai titik netral */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--muted)]/50 z-10" title="Titik Netral: 50" />
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: scoreColor((pct / 100) * 4 - 2),
                      }}
                    />
                  </div>
                </div>

                {/**** Kanan: jumlah peristiwa + skor + predikat ****/}
                <div className="flex items-center gap-3 sm:gap-3.5 sm:justify-end">
                  <span className="text-[11px] text-[var(--muted)] font-medium whitespace-nowrap">
                    {termEvents.length} peristiwa
                  </span>
                  <span
                    className="rounded-full px-2.5 py-1 text-sm font-bold tabular-nums leading-none border shadow-2xs"
                    style={{
                      background:
                        index === null ? "#1e293b" : `${scoreColor(index / 25 - 2)}1f`,
                      borderColor: index === null ? "transparent" : `${scoreColor(index / 25 - 2)}40`,
                      color: index === null ? "var(--score-zero)" : scoreTextColor(index / 25 - 2),
                    }}
                  >
                    {summaryIndexLabel(summary)}{index !== null ? "/100" : ""}
                  </span>
                  <span
                    className="hidden sm:inline text-[10px] font-semibold whitespace-nowrap px-2.5 py-1 rounded-full leading-none"
                    style={{ color: qual.color, background: qual.bg }}
                  >
                    {qual.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Peristiwa Bersejarah Utama Lembaga */}
      {events.length > 0 && (
        <section className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-2.5">
            <h2 className="text-xl font-bold">Peristiwa Bersejarah Utama ({events.length})</h2>
            <Link href={`/cari?q=${encodeURIComponent(institution.short_id)}`} className="text-xs text-[var(--acc-sky)] hover:underline">
              Cari peristiwa lembaga ini →
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {events.slice(0, 8).map((ev) => {
              const term = dataset.terms.find((t) => t.id === ev.term_id);
              return (
                <div
                  key={ev.id}
                  className="flex flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                      <span className="font-mono">{ev.date}</span>
                      <span className="uppercase text-[var(--acc-red)] font-semibold">{ev.category}</span>
                    </div>
                    <h4 className="mt-2 font-bold text-sm leading-snug">{ev.title_id}</h4>
                    <p className="mt-2 text-[var(--muted)] line-clamp-3 leading-relaxed">{ev.summary_id}</p>
                  </div>
                  <div className="mt-4 pt-2.5 border-t border-[var(--line)] flex items-center justify-between">
                    <span className="text-[10px] text-[var(--muted)]">
                      {ev.source_ids.length} sumber primer
                    </span>
                    {term && (
                      <Link
                        href={`/lembaga/${institution.slug}/${term.id}`}
                        className="text-[11px] font-medium text-[var(--acc-sky)] hover:underline"
                      >
                        {term.label_id.slice(0, 24)}... →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tokoh & Pimpinan Kenegaraan */}
      {actors.length > 0 && (
        <section className="mt-12">
          <div className="border-b border-[var(--line)] pb-2.5">
            <h2 className="text-xl font-bold">Pimpinan & Tokoh Terdokumentasi ({actors.length})</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actors.map((actor) => {
              const primaryRole = actor.roles.find((r) => r.institution_id === institution.id) ?? actor.roles[0];
              return (
                <Link
                  key={actor.id}
                  href={`/aktor/${actor.id}`}
                  className="group rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-slate-400 transition"
                >
                  <div className="font-bold group-hover:text-[var(--acc-sky)] text-sm">{actor.name}</div>
                  <div className="text-xs text-[var(--muted)] mt-1">{primaryRole?.title_id ?? "Tokoh Lembaga"}</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

