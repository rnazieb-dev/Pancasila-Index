"use client";

import type { DimensionScore, Source } from "@pancasila-index/core";
import {
  IconQuote,
  IconScale,
  IconAlertTriangle,
  IconFileText,
  IconExternalLink,
} from "./icons";

interface Props {
  dimensionScore: DimensionScore;
  sources: Source[];
}

export function DialecticalRationale({ dimensionScore, sources }: Props) {
  const {
    rationale_id,
    thesis_id,
    antithesis_id,
    synthesis_id,
    expert_quotes = [],
  } = dimensionScore;

  const hasStructuredDialectic =
    Boolean(thesis_id) || Boolean(antithesis_id) || expert_quotes.length > 0;

  if (!hasStructuredDialectic) {
    return (
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg)]/60 p-3.5 text-sm leading-relaxed text-[var(--text)]">
        {rationale_id.trim()}
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Grid Dialektika Tesis vs Antitesis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Kolom Tesis: Dalil Yuridis & Klaim Kebijakan Formal */}
        {thesis_id && (
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3.5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold text-[11px] uppercase tracking-wider">
                <IconScale size={14} className="shrink-0" />
                <span>Tesis / Dalil Formal Institusi</span>
              </div>
              <p className="text-xs sm:text-[13px] leading-relaxed text-[var(--text)]">
                {thesis_id}
              </p>
            </div>
            <div className="text-[10px] font-mono text-[var(--muted)] pt-1 border-t border-sky-500/15">
              Klaim regulasi resmi &amp; konsiderans formal negara
            </div>
          </div>
        )}

        {/* Kolom Antitesis: Kritik Pakar, Dissenting Opinion, & Realitas Lapangan */}
        {antithesis_id && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                <IconAlertTriangle size={14} className="shrink-0" />
                <span>Antitesis &amp; Fakta Empiris Lapangan</span>
              </div>
              <p className="text-xs sm:text-[13px] leading-relaxed text-[var(--text)]">
                {antithesis_id}
              </p>
            </div>
            <div className="text-[10px] font-mono text-[var(--muted)] pt-1 border-t border-amber-500/15">
              Kritik doktriner, pengawasan independen, &amp; anomali lapangan
            </div>
          </div>
        )}
      </div>

      {/* Kartu Kutipan Langsung Pakar Terkemuka (Expert Quotes) */}
      {expert_quotes.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] flex items-center gap-1.5">
            <IconQuote size={13} className="text-[var(--acc-sky)]" />
            <span>Kutipan Langsung Pakar Hukum &amp; Putusan Peradilan:</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {expert_quotes.map((eq, idx) => {
              const src = eq.source_id
                ? sources.find((s) => s.id === eq.source_id)
                : undefined;
              const href = src?.detail_url ?? src?.resolved_url ?? src?.url;

              return (
                <div
                  key={idx}
                  className="relative rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3.5 pl-4 sm:pl-5 space-y-2 shadow-2xs border-l-3 border-l-[var(--acc-sky)]"
                >
                  <div className="text-xs sm:text-[13px] italic leading-relaxed text-[var(--text)] font-serif">
                    &ldquo;{eq.quote}&rdquo;
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--line)]/50 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[var(--text)]">{eq.author}</span>
                      <span className="text-[var(--muted)]">·</span>
                      <span className="text-[var(--muted)]">{eq.role}</span>
                      {eq.year && (
                        <>
                          <span className="text-[var(--muted)]">·</span>
                          <span className="font-mono text-[var(--muted)]">
                            {eq.year}
                          </span>
                        </>
                      )}
                    </div>

                    {src && (
                      <div className="shrink-0">
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--acc-sky)] hover:underline"
                            title={src.title_id}
                          >
                            <IconFileText size={11} className="shrink-0" />
                            <span className="max-w-[200px] truncate">{src.title_id}</span>
                            <IconExternalLink size={9} className="shrink-0" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--muted)]">
                            <IconFileText size={11} className="shrink-0" />
                            <span className="max-w-[200px] truncate">{src.title_id}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sintesis Konstitusional / Pertimbangan Final */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)]/70 p-3 space-y-1">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
          Sintesis Penilaian Konstitusional:
        </div>
        <p className="text-xs sm:text-[13px] leading-relaxed text-[var(--text)]">
          {synthesis_id ? synthesis_id.trim() : rationale_id.trim()}
        </p>
      </div>
    </div>
  );
}
