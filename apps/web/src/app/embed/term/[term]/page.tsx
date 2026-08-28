import { notFound } from "next/navigation";
import Link from "next/link";
import { dataset, getEventsOfTerm, getInstitution } from "@pancasila-index/data";
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
  return dataset.terms.map((t) => ({ term: t.id }));
}

export default async function EmbedTermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term: termId } = await params;
  const term = dataset.terms.find((t) => t.id === termId);
  if (!term) notFound();

  const institution = getInstitution(dataset, term.institution_id);
  const summary = termSummary(term.id);
  const events = getEventsOfTerm(dataset, term.id);
  const index = summary?.index ?? null;

  const gSila = (summary?.groups ?? []).find((g) => g.group_id === "sila");
  const gTujuan = (summary?.groups ?? []).find((g) => g.group_id === "tujuan");
  const gStruktural = (summary?.groups ?? []).find((g) => g.group_id === "struktural");

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-lg text-[var(--text)] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--acc-red)] bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            {institution?.short_id ?? "Organ Konstitusi"}
          </span>
          <span className="text-xs font-mono text-[var(--muted)]">
            {periodLabel(term.start_date, term.end_date)}
          </span>
        </div>
        <a
          href="https://pancasila.site"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-[var(--muted)] hover:text-[var(--text)]"
        >
          Pancasila<span className="text-[var(--acc-red)]">·</span>Index ↗
        </a>
      </div>

      {/* Title & Score Hero */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold leading-snug">{term.label_id}</h2>
          <div className="text-xs text-[var(--muted)] mt-1">
            {summary ? summaryQualLabel(summary).label : "Draf Penilaian"} · keyakinan {Math.round((summary?.mean_confidence ?? 0.8) * 100)}%
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-center rounded-xl px-3.5 py-2 text-center"
          style={{
            background: index === null ? "#1e293b" : `${scoreColor(index / 25 - 2)}22`,
            border: `1px solid ${index === null ? "#334155" : scoreColor(index / 25 - 2)}44`,
          }}
        >
          <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Indeks</div>
          <div
            className="text-2xl font-black tabular-nums"
            style={{ color: index === null ? "var(--score-zero)" : scoreTextColor(index / 25 - 2) }}
          >
            {summaryIndexLabel(summary)}
          </div>
        </div>
      </div>

      {/* 3-Pillar Splitter Badges */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-[var(--bg)] p-2 border border-[var(--line)]">
          <div className="text-[10px] text-[#22c55e] font-bold">🦅 Sila</div>
          <div className="font-extrabold text-sm tabular-nums mt-0.5">
            {gSila && gSila.coverage > 0 ? `${Math.round(((gSila.score + 2) / 4) * 100)}` : "-"}
          </div>
        </div>

        <div className="rounded-xl bg-[var(--bg)] p-2 border border-[var(--line)]">
          <div className="text-[10px] text-[#38bdf8] font-bold">🏛️ Pembukaan</div>
          <div className="font-extrabold text-sm tabular-nums mt-0.5">
            {gTujuan && gTujuan.coverage > 0 ? `${Math.round(((gTujuan.score + 2) / 4) * 100)}` : "-"}
          </div>
        </div>

        <div className="rounded-xl bg-[var(--bg)] p-2 border border-[var(--line)]">
          <div className="text-[10px] text-[#f59e0b] font-bold">⚖️ Norma UUD</div>
          <div className="font-extrabold text-sm tabular-nums mt-0.5">
            {gStruktural && gStruktural.coverage > 0 ? `${Math.round(((gStruktural.score + 2) / 4) * 100)}` : "-"}
          </div>
        </div>
      </div>

      {/* Top 2 Events */}
      {events.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-[var(--line)] pt-3">
          <div className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">
            Sorotan Bukti Primer ({events.length} peristiwa)
          </div>
          {events.slice(0, 2).map((ev) => (
            <div key={ev.id} className="rounded-lg bg-[var(--bg)] p-2.5 border border-[var(--line)] text-xs">
              <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                <span className="font-mono">{ev.date}</span>
                <span className="text-[var(--acc-sky)] font-medium">📄 {ev.source_ids.length} sumber</span>
              </div>
              <div className="mt-1 font-semibold leading-tight line-clamp-1">{ev.title_id}</div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Link */}
      <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
        <span className="text-[10px] text-[var(--muted)]">
          Cakupan {Math.round((summary?.coverage ?? 0) * 100)}% dimensi UUD 1945
        </span>
        <a
          href={institution ? `/lembaga/${institution.slug}/${term.id}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[var(--acc-sky)] hover:underline"
        >
          Lihat Bukti Lengkap →
        </a>
      </div>
    </div>
  );
}
