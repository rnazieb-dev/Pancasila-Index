"use client";

import Link from "next/link";
import type { EventRecord, Source, ActorProfile } from "@pancasila-index/core";

interface Props {
  dimensionId: string;
  dimensionName: string;
  events: EventRecord[];
  sources: Source[];
  actorsById: Map<string, ActorProfile>;
}

const CATEGORY_META: Record<string, { label: string; icon: string; badge: string }> = {
  "produk-hukum": {
    label: "Produk Hukum / UU",
    icon: "⚖️",
    badge: "border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/10",
  },
  kebijakan: {
    label: "Kebijakan Publik",
    icon: "📜",
    badge: "border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
  },
  krisis: {
    label: "Krisis Penegakan & HAM",
    icon: "🚨",
    badge: "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10",
  },
  pengadilan: {
    label: "Putusan Peradilan",
    icon: "🏛️",
    badge: "border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10",
  },
  pengangkatan: {
    label: "Suksesi & Jabatan",
    icon: "👥",
    badge: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  peristiwa: {
    label: "Peristiwa Sejarah",
    icon: "📌",
    badge: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
};

const BULAN_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatDateIndo(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  const p0 = parts[0];
  const p1 = parts[1];
  const p2 = parts[2];
  if (parts.length === 3 && p0 && p1 && p2) {
    const day = parseInt(p2, 10);
    const month = parseInt(p1, 10) - 1;
    const year = p0;
    return `${day} ${BULAN_ID[month] || p1} ${year}`;
  }
  if (parts.length === 2 && p0 && p1) {
    const month = parseInt(p1, 10) - 1;
    const year = p0;
    return `${BULAN_ID[month] || p1} ${year}`;
  }
  return dateStr;
}

export function DimensionMilestones({
  dimensionId,
  dimensionName,
  events,
  sources,
  actorsById,
}: Props) {
  // Urutkan peristiwa secara kronologis (tanggal terlama ke terbaru)
  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const count = sortedEvents.length;

  if (count === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg)]/50 p-4 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[var(--muted)] flex items-center gap-1.5">
            <span>🔍</span>
            <span>Trajektori Empiris Belum Terpetakan</span>
          </span>
          <Link
            href="/usulkan-bukti"
            className="text-[11px] text-[var(--acc-sky)] hover:underline font-semibold"
          >
            + Usulkan Peristiwa Berbukti →
          </Link>
        </div>
        <p className="text-[11px] text-[var(--muted)] leading-relaxed">
          Skor dimensi ini didasarkan pada mandat normatif konstitusi umum. Hubungan kausalitas multi-peristiwa spesifik sedang dalam antrean pengayaan bukti.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {/* Header Trajektori */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)]/50 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">🧭</span>
          <span className="font-bold text-xs text-[var(--text)]">
            Linimasa Trajektori Ilmiah ({count} Peristiwa Berbukti Primer)
          </span>
        </div>
        <span className="text-[10px] font-mono text-[var(--muted)]">
          Disusun Berurutan Kronologis
        </span>
      </div>

      {/* Track Milestones Vertikal */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--line)]">
        {sortedEvents.map((ev, index) => {
          const meta = CATEGORY_META[ev.category] ?? {
            label: "Peristiwa",
            icon: "📌",
            badge: "border-slate-500/30 text-slate-500 bg-slate-500/10",
          };

          const eventSources = ev.source_ids
            .map((sid) => sources.find((s) => s.id === sid))
            .filter((s): s is Source => Boolean(s));

          return (
            <div key={ev.id} className="relative group">
              {/* Titik Simpul Milestone */}
              <div className="absolute -left-6 top-1.5 size-5 rounded-full border-2 border-[var(--panel)] bg-[var(--acc-sky)] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {index + 1}
              </div>

              {/* Kartu Milestone */}
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3.5 space-y-2.5 shadow-2xs hover:border-[var(--acc-sky)]/50 transition">
                {/* Baris Atas: Tanggal & Kategori */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold border ${meta.badge}`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[var(--text)]">
                      {formatDateIndo(ev.date)}
                    </span>
                  </div>

                  {eventSources.length > 0 && (
                    <span className="text-[10px] font-mono text-[var(--acc-sky)] bg-[var(--panel)] px-2 py-0.5 rounded border border-[var(--line)]">
                      📄 {eventSources.length} Dokumen Primer
                    </span>
                  )}
                </div>

                {/* Judul Peristiwa */}
                <h5 className="font-bold text-xs sm:text-sm text-[var(--text)] leading-snug">
                  {ev.title_id}
                </h5>

                {/* Analisis Kausalitas Normatif (Summary) */}
                <p className="text-xs text-[var(--text)] leading-relaxed bg-[var(--panel)]/70 p-2.5 rounded-lg border-l-2 border-[var(--acc-sky)]">
                  {ev.summary_id}
                </p>

                {/* Aktor Konstitusional Terkait */}
                {ev.actor_ids.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-[var(--muted)]">Aktor Terlibat:</span>
                    {ev.actor_ids.map((aid) => {
                      const actor = actorsById.get(aid);
                      return (
                        <Link
                          key={aid}
                          href={`/aktor/${aid}`}
                          className="inline-block rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-[var(--acc-amber-strong)] hover:border-amber-400 hover:underline"
                        >
                          👤 {actor?.name || aid}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Sitasi Bukti Primer Resmi */}
                {eventSources.length > 0 && (
                  <div className="pt-2 border-t border-[var(--line)]/50 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">
                      Sitasi Bukti Hukum Primer:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {eventSources.map((src) => {
                        const href = src.detail_url ?? src.resolved_url ?? src.url;
                        return href ? (
                          <a
                            key={src.id}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="max-w-md truncate rounded border border-[var(--line)] bg-[var(--panel)] px-2 py-1 text-[11px] text-[var(--acc-sky)] hover:border-sky-500 hover:underline font-mono"
                            title={src.title_id}
                          >
                            📄 {src.title_id} ↗
                          </a>
                        ) : (
                          <span
                            key={src.id}
                            className="max-w-md truncate rounded border border-[var(--line)] bg-[var(--panel)] px-2 py-1 text-[11px] text-[var(--muted)] font-mono"
                          >
                            📄 {src.title_id}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
