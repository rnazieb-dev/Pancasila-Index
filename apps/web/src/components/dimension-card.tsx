"use client";

import { useState, useMemo } from "react";
import type {
  RubricDimension,
  DimensionScore,
  Assessment,
  Source,
  EventRecord,
  ActorProfile,
} from "@pancasila-index/core";
import {
  renderDimensionIcon,
  IconScale,
  IconTimeline,
  IconFileText,
  IconExternalLink,
  IconCompass,
  IconArchive,
} from "./icons";
import { DialecticalRationale } from "./dialectical-rationale";
import { DimensionMilestones } from "./dimension-milestones";
import { AiTransparencyBadge } from "./ai-transparency-badge";
import { scoreQualLabel } from "@/lib/view";

interface Entry {
  assessmentId: string;
  ds: DimensionScore;
}

interface DimensionCardProps {
  dimension: RubricDimension;
  entries: Entry[];
  assessment?: Assessment | null;
  sources: Source[];
  allEvents: EventRecord[];
  actorsById: Map<string, ActorProfile>;
  termId: string;
}

export function DimensionCard({
  dimension,
  entries,
  assessment,
  sources,
  allEvents,
  actorsById,
  termId,
}: DimensionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dialektika" | "linimasa" | "bukti">(
    "dialektika"
  );

  const avgScore = useMemo(
    () => entries.reduce((acc, e) => acc + e.ds.score, 0) / entries.length,
    [entries]
  );
  const avgConfidence = useMemo(
    () => entries.reduce((acc, e) => acc + e.ds.confidence, 0) / entries.length,
    [entries]
  );

  // Kumpulkan seluruh ID bukti primer
  const totalEvidenceIds = useMemo(
    () =>
      Array.from(
        new Set(entries.flatMap((e) => (e.ds.evidence || []).map((ev) => ev.source_id)))
      ),
    [entries]
  );

  // Kumpulkan seluruh peristiwa terkait
  const dimensionEvents = useMemo(() => {
    const rawIds = entries.flatMap((e) => e.ds.event_ids || []);
    const eventIdSet = new Set(rawIds);

    return allEvents.filter(
      (ev) =>
        ev.term_id === termId &&
        (eventIdSet.has(ev.id) ||
          (rawIds.length === 0 && (ev.dimension_ids || []).includes(dimension.id)))
    );
  }, [allEvents, entries, termId, dimension.id]);

  const scoreIndex = ((avgScore + 2) / 4) * 100;
  const qual = scoreQualLabel(scoreIndex);

  // Ringkasan teaser putusan untuk ditampilkan pada kartu saat tertutup
  const teaserText = useMemo(() => {
    const firstDs = entries[0]?.ds;
    if (!firstDs) return "";
    if (firstDs.synthesis_id) return firstDs.synthesis_id;
    if (firstDs.thesis_id) return firstDs.thesis_id;
    return firstDs.rationale_id || "";
  }, [entries]);

  // Evaluasi jika ada selisih penilai (apabila lebih dari 1 penilaian)
  const skorMin = Math.min(...entries.map((e) => e.ds.score));
  const skorMax = Math.max(...entries.map((e) => e.ds.score));
  const adaSelisih = entries.length > 1 && skorMin !== skorMax;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isOpen
          ? "border-[var(--line)] bg-[var(--bg)] shadow-md ring-1 ring-[var(--line)]"
          : "border-[var(--line)] bg-[var(--bg)] hover:border-slate-400 hover:shadow-xs"
      }`}
    >
      {/* Header Interaktif (Accordion Summary) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 sm:p-5 flex flex-col gap-3.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acc-sky)]"
        aria-expanded={isOpen}
      >
        <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-3 w-full">
          {/* Kolom Kiri: Ikon Semantik + Judul Dimensi + Teaser */}
          <div className="flex items-start gap-3.5 grow min-w-0">
            <div
              className={`p-2.5 rounded-xl border shrink-0 transition-transform ${
                isOpen
                  ? "scale-105 border-[var(--acc-sky)]/40 bg-[var(--acc-sky)]/10 text-[var(--acc-sky)]"
                  : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]"
              }`}
            >
              {renderDimensionIcon(dimension.id, 22, "shrink-0")}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)]">
                  {dimension.group_id === "sila"
                    ? `Sila ${dimension.id.replace("sila-", "")}`
                    : dimension.group_id === "pembukaan"
                    ? `Alinea IV · Mandat ${dimension.id.replace("tujuan-", "")}`
                    : "Norma Struktural"}
                </span>

                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: qual.bg, color: qual.color }}
                >
                  {qual.label} ({avgScore > 0 ? "+" : ""}
                  {avgScore.toFixed(1)})
                </span>

                {adaSelisih && (
                  <span
                    className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--acc-amber)]"
                    title={`${entries.length} penilai berselisih: ${skorMin} s.d. ${skorMax}`}
                  >
                    selisih {skorMin > 0 ? "+" : ""}
                    {skorMin} … {skorMax > 0 ? "+" : ""}
                    {skorMax}
                  </span>
                )}
              </div>

              <h4 className="text-base sm:text-lg font-bold text-[var(--text)] tracking-tight">
                {dimension.name_id}
              </h4>

              {teaserText && (
                <p className="text-xs text-[var(--muted)] line-clamp-1 leading-relaxed max-w-2xl font-normal">
                  {teaserText}
                </p>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Mini-Gauge 5-Segmen + Metrik & Chevron */}
          <div className="flex items-center gap-3 self-center sm:self-start shrink-0">
            {/* 5-Segment Discrete Gauge */}
            <div
              className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-[var(--panel)] border border-[var(--line)]"
              title={`Skor: ${avgScore > 0 ? "+" : ""}${avgScore.toFixed(1)} (-2 s.d. +2)`}
            >
              {[-2, -1, 0, 1, 2].map((step) => {
                const isActive = Math.round(avgScore) === step;
                return (
                  <span
                    key={step}
                    className="w-2.5 h-4 rounded-xs transition-colors"
                    style={{
                      background: isActive
                        ? qual.color
                        : "var(--line)",
                      opacity: isActive ? 1 : 0.35,
                    }}
                  />
                );
              })}
            </div>

            {/* Chip Bukti & Peristiwa */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--panel)] border border-[var(--line)] px-2.5 py-1 text-[var(--acc-sky)] font-semibold">
                <IconFileText size={12} className="shrink-0" />
                <span>{totalEvidenceIds.length} bukti</span>
              </span>

              {dimensionEvents.length > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[var(--panel)] border border-[var(--line)] px-2.5 py-1 text-[var(--muted)] font-medium">
                  <IconTimeline size={12} className="shrink-0" />
                  <span>{dimensionEvents.length} peristiwa</span>
                </span>
              )}
            </div>

            {/* Expand Chevron Icon */}
            <div
              className={`p-1 rounded-full bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)] transition-transform duration-200 ${
                isOpen ? "rotate-180 text-[var(--text)]" : ""
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Content (Body) */}
      {isOpen && (
        <div className="border-t border-[var(--line)] p-4 sm:p-6 space-y-5 bg-[var(--panel)]/40">
          {/* Banner Pertanyaan Uji Konstitusional */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3.5 sm:p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[var(--acc-sky)]">
              <IconCompass size={13} className="shrink-0" />
              <span>Standar Pengujian Konstitusional</span>
            </div>
            <p className="text-xs sm:text-[13px] font-medium text-[var(--text)] leading-relaxed italic">
              &ldquo;{dimension.question_id.trim()}&rdquo;
            </p>
          </div>

          {/* Segmented View / Tab Switcher */}
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
              <button
                type="button"
                onClick={() => setActiveTab("dialektika")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === "dialektika"
                    ? "bg-[var(--panel)] text-[var(--text)] shadow-xs border border-[var(--line)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <IconScale size={13} />
                <span>Dialektika &amp; Doktrin Pakar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("linimasa")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === "linimasa"
                    ? "bg-[var(--panel)] text-[var(--text)] shadow-xs border border-[var(--line)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <IconTimeline size={13} />
                <span>Linimasa Trajektori ({dimensionEvents.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("bukti")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === "bukti"
                    ? "bg-[var(--panel)] text-[var(--text)] shadow-xs border border-[var(--line)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <IconArchive size={13} />
                <span>Pustaka Bukti &amp; Norma ({totalEvidenceIds.length})</span>
              </button>
            </div>

            {/* AI Transparency & Human Oversight Badging */}
            <div className="flex items-center gap-2">
              <AiTransparencyBadge
                disclosure={entries[0]?.ds.ai_disclosure || assessment?.ai_disclosure}
                reviewers={assessment?.reviewers}
                compact
              />
            </div>
          </div>

          {/* TAB 1: DIALEKTIKA & DOKTRIN PAKAR */}
          {activeTab === "dialektika" && (
            <div className="space-y-4 pt-1">
              {entries.map((e, idx) => (
                <div key={`${e.assessmentId}-${idx}`} className="space-y-3">
                  {entries.length > 1 && (
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)] pb-1 border-b border-[var(--line)]">
                      <span className="font-bold">{e.assessmentId}</span>
                      <span>·</span>
                      <span className="tabular-nums">
                        skor {e.ds.score > 0 ? "+" : ""}
                        {e.ds.score} · keyakinan {Math.round(e.ds.confidence * 100)}%
                      </span>
                    </div>
                  )}

                  <DialecticalRationale
                    dimensionScore={e.ds}
                    sources={sources}
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: LINIMASA TRAJEKTORI PERISTIWA */}
          {activeTab === "linimasa" && (
            <div className="pt-1">
              <DimensionMilestones
                dimensionId={dimension.id}
                dimensionName={dimension.name_id}
                events={dimensionEvents}
                sources={sources}
                actorsById={actorsById}
              />
            </div>
          )}

          {/* TAB 3: PUSTAKA BUKTI & NORMA UUD 1945 */}
          {activeTab === "bukti" && (
            <div className="space-y-4 pt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-[var(--muted)] font-bold mb-2">
                  Daftar Bukti Empiris Terverifikasi
                </div>

                {entries[0]?.ds.evidence_gap === true || totalEvidenceIds.length === 0 ? (
                  <p className="text-xs text-[var(--acc-amber)] p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    Belum berbukti empiris — skor ini <strong>dikeluarkan</strong> dari indeks komposit.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {entries.flatMap((e) => e.ds.evidence).map((ev) => {
                      const src = sources.find((s) => s.id === ev.source_id);
                      const href = src?.detail_url ?? src?.resolved_url ?? src?.url;

                      return (
                        <div
                          key={ev.source_id}
                          className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 space-y-1.5 flex flex-col justify-between hover:border-[var(--acc-sky)]/40 transition"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--muted)]">
                              <span className="uppercase font-bold">{src?.type || "sumber"}</span>
                              {src?.year && <span>{src.year}</span>}
                            </div>

                            {href ? (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-[var(--acc-sky)] hover:underline inline-flex items-center gap-1 leading-snug"
                              >
                                <IconFileText size={12} className="shrink-0" />
                                <span>{src?.title_id ?? ev.source_id}</span>
                                <IconExternalLink size={10} className="shrink-0 ml-0.5" />
                              </a>
                            ) : (
                              <div className="text-xs font-semibold text-[var(--text)] inline-flex items-center gap-1 leading-snug">
                                <IconFileText size={12} className="shrink-0 text-[var(--muted)]" />
                                <span>{src?.title_id ?? ev.source_id}</span>
                              </div>
                            )}
                          </div>

                          {ev.note_id && (
                            <div className="text-[11px] text-[var(--muted)] pt-1 border-t border-[var(--line)]/50 leading-relaxed">
                              {ev.note_id}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Landasan Normatif UUD 1945 */}
              {(entries[0]?.ds.normative_anchors ?? []).length > 0 && (
                <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3.5 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                    Landasan Normatif (Pasal UUD 1945):
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {(entries[0]?.ds.normative_anchors ?? []).map((na) => {
                      const src = sources.find((s) => s.id === na);
                      const href = src?.detail_url ?? src?.resolved_url ?? src?.url;
                      return (
                        <span
                          key={na}
                          className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1 text-[11px] font-mono text-[var(--text)]"
                        >
                          {href ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--acc-sky)] hover:underline inline-flex items-center gap-1"
                            >
                              <span>{(src?.title_id || na).replace(/\s*\([^)]*\)\s*/g, " ").slice(0, 50)}</span>
                              <IconExternalLink size={9} />
                            </a>
                          ) : (
                            <span>{na}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
