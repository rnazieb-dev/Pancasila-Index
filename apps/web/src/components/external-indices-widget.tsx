"use client";

import { useState } from "react";
import type { ExternalIndex, Term } from "@pancasila-index/core";
import { IconGlobe, IconBarChart, IconInfo, IconPin, IconExternalLink } from "./icons";

interface Props {
  term: Term;
  /**
   * HANYA indeks yang relevan bagi periode term, sudah dipilih di server
   * dengan externalIndicesForPeriod(). Komponen ini perender murni: aturan
   * periodenya tidak diulang di sini agar tidak menyimpang dari server.
   */
  indices: ExternalIndex[];
  /** Tahun paling awal yang tersedia di seluruh indeks; untuk keadaan kosong. */
  earliestAvailableYear: number | null;
}

/**
 * Parsing rentang skala dari teks `idx.scale`.
 * Contoh: "0.00 - 1.00 (...)" -> min: 0, max: 1
 * Contoh: "1.0 - 10.0 (...)" -> min: 1, max: 10
 * Contoh: "0 - 100 (...)" -> min: 0, max: 100
 */
function parseScale(scaleStr: string) {
  const match = scaleStr.match(/^([\d.]+)\s*-\s*([\d.]+)/);
  if (match && match[1] !== undefined && match[2] !== undefined) {
    return {
      min: parseFloat(match[1]),
      max: parseFloat(match[2]),
      label: `${match[1]} – ${match[2]}`,
    };
  }
  return { min: 0, max: 100, label: "0 – 100" };
}

/**
 * Menormalkan skor ke persentase 0–100% agar dapat dibandingkan secara adil.
 */
function normalizeTo100(score: number, min: number, max: number): number {
  if (max <= min) return Math.round(score);
  const pct = ((score - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

/**
 * Predikat kualitatif standar internasional untuk skor ternormalisasi (0–100%).
 */
function getBenchmarkLabel(normPct: number) {
  if (normPct < 40) {
    return {
      label: "Kritis / Rendah",
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.12)",
      badge: "border-red-500/30 text-red-500 bg-red-500/10",
    };
  }
  if (normPct < 60) {
    return {
      label: "Moderat / Rentan",
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.12)",
      badge: "border-amber-500/30 text-amber-500 bg-amber-500/10",
    };
  }
  if (normPct < 75) {
    return {
      label: "Cukup / Memadai",
      color: "#84cc16",
      bg: "rgba(132, 204, 22, 0.12)",
      badge: "border-lime-500/30 text-lime-600 dark:text-lime-400 bg-lime-500/10",
    };
  }
  return {
    label: "Tinggi / Baik",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.12)",
    badge: "border-emerald-500/30 text-emerald-500 bg-emerald-500/10",
  };
}

export function ExternalIndicesWidget({
  term,
  indices,
  earliestAvailableYear,
}: Props) {
  // Rentang tahun dari term
  const startYear = parseInt(term.start_date.slice(0, 4), 10);
  const endYear = term.end_date ? parseInt(term.end_date.slice(0, 4), 10) : new Date().getFullYear();
  const isShortTransition = endYear - startYear <= 2;

  const relevantIndices = indices
    .map((idx) => {
      const scaleInfo = parseScale(idx.scale);
      const displayPoints = idx.data;
      const scored = displayPoints.filter(
        (p): p is typeof p & { score: number } => p.score !== null
      );
      const rawAvg =
        scored.length > 0
          ? scored.reduce((acc, p) => acc + p.score, 0) / scored.length
          : null;

      const avgScoreStr =
        rawAvg !== null
          ? rawAvg.toFixed(scaleInfo.max <= 1 ? 2 : scaleInfo.max <= 10 ? 2 : 1)
          : null;

      const normScore =
        rawAvg !== null
          ? normalizeTo100(rawAvg, scaleInfo.min, scaleInfo.max)
          : null;

      const benchmark = normScore !== null ? getBenchmarkLabel(normScore) : null;

      return {
        ...idx,
        scaleInfo,
        displayPoints,
        rawAvg,
        avgScoreStr,
        normScore,
        benchmark,
      };
    })
    .filter((idx) => idx.displayPoints.length > 0);

  /*
    Tidak ada indeks eksternal yang mencakup periode ini.
  */
  if (relevantIndices.length === 0) {
    const awal = earliestAvailableYear;
    return (
      <section className="mt-12 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)]/40 p-6 space-y-2">
        <div className="flex items-center gap-2">
          <IconGlobe size={16} className="text-[var(--muted)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Konteks Indeks Eksternal ({startYear}–{term.end_date ? endYear : "kini"})
          </span>
        </div>
        <p className="text-xs leading-relaxed text-[var(--muted)] max-w-2xl">
          Tidak ada indeks independen pihak ketiga yang mengukur periode {startYear}–
          {term.end_date ? endYear : "kini"}
          {awal !== null ? ` (indeks komposit global yang tersedia dalam arsip baru dimulai tahun ${awal})` : ""}.
          Penilaian pada era ini sepenuhnya bersandar secara objektif pada bukti hukum primer (Lembaran Negara, Putusan Peradilan, dan Risalah Resmi).
        </p>
      </section>
    );
  }

  const typeLabels: Record<string, { label: string; bg: string; text: string }> = {
    "hard-data": {
      label: "Hard Data (Bebas Survei ASN)",
      bg: "bg-emerald-500/10 border-emerald-500/30",
      text: "text-[var(--acc-emerald-strong)]",
    },
    "expert-coded": {
      label: "Double-Blind Expert Coded",
      bg: "bg-sky-500/10 border-sky-500/30",
      text: "text-[var(--acc-sky)]",
    },
    "civil-society": {
      label: "Survei Praktisi & Masyarakat",
      bg: "bg-purple-500/10 border-purple-500/30",
      text: "text-[var(--acc-purple)]",
    },
    "official-self-assessment": {
      label: "Laporan Internal Formal",
      bg: "bg-amber-500/10 border-amber-500/30",
      text: "text-[var(--acc-amber)]",
    },
  };

  return (
    <section className="mt-14 rounded-2xl border-2 border-[var(--line)] bg-[var(--panel)] p-6 sm:p-7 space-y-6 shadow-sm">
      {/* Header Widget */}
      <div className="border-b border-[var(--line)] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[var(--acc-sky)]/10 text-[var(--acc-sky)]">
              <IconGlobe size={16} />
            </span>
            <span className="text-xs uppercase tracking-wider text-[var(--acc-sky)] font-bold">
              Validasi Silang Independen Global
            </span>
          </div>
          <span className="rounded-full bg-[var(--bg)] border border-[var(--line)] px-3 py-1 text-[11px] font-mono text-[var(--muted)]">
            Tahun Kalender {startYear}–{term.end_date ? endYear : "Kini"}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[var(--text)] mt-2">
          7 Indikator Integritas, Tata Kelola &amp; Demokrasi Dunia
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-3xl">
          Tolok ukur independen internasional yang dirilis oleh lembaga riset dunia (seperti World Justice Project, Transparency International, V-Dem Institute, dan ERCAS Berlin).
          Karena setiap lembaga menggunakan skala pengukuran yang berbeda, sistem menyajikan <strong>skor asli resmi</strong> sekaligus <strong>konversi terstandardisasi 0–100%</strong> agar perbandingan dapat dibaca secara logis dan objektif.
        </p>

        {/* Catatan Khusus Masa Transisi Singkat */}
        {isShortTransition && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] p-3.5 text-xs text-[var(--muted)] leading-relaxed">
            <IconInfo size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Catatan Masa Transisi Kepemimpinan:</strong> Indeks internasional dirilis tahunan (Januari–Desember). Untuk masa jabatan transisi ({term.label_id}), angka kalender tahun {startYear} dan {endYear} merefleksikan peristiwa transisi kepemimpinan nasional secara gabungan.
            </span>
          </div>
        )}
      </div>

      {/* DASHBOARD IKHTISAR KOMPARATIF (Ternormalisasi ke 0-100%) */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)]/60 pb-3">
          <div>
            <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <span className="p-1 rounded-md bg-[var(--acc-sky)]/10 text-[var(--acc-sky)]">
                <IconBarChart size={15} />
              </span>
              <span>Ikhtisar Komparatif Terstandardisasi (Skala Setara 0–100%)</span>
            </h3>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              Seluruh skor disetarakan ke persentase 0–100% dengan garis batas tengah 50% sebagai referensi median.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1 text-[#ef4444]">
              <span className="size-2 rounded-full bg-[#ef4444]" /> &lt;40% Kritis
            </span>
            <span className="inline-flex items-center gap-1 text-[#f59e0b]">
              <span className="size-2 rounded-full bg-[#f59e0b]" /> 40–59% Moderat
            </span>
            <span className="inline-flex items-center gap-1 text-[#22c55e]">
              <span className="size-2 rounded-full bg-[#22c55e]" /> &ge;60% Cukup/Tinggi
            </span>
          </div>
        </div>

        <div className="space-y-3.5 pt-1">
          {relevantIndices.map((idx) => {
            const pct = idx.normScore ?? 0;
            const b = idx.benchmark || getBenchmarkLabel(pct);

            return (
              <div key={idx.id} className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text)]">{idx.name}</span>
                    <span className="text-[10px] text-[var(--muted)] font-medium">({idx.publisher})</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    {/* Skor Asli Resmi */}
                    <span className="text-[11px] text-[var(--muted)]">
                      Skor resmi: <strong className="text-[var(--text)]">{idx.avgScoreStr ?? "—"}</strong>
                      <span className="text-[10px]"> / {idx.scaleInfo.max}</span>
                    </span>

                    {/* Skor Setara 0-100% */}
                    <span
                      className="rounded px-2 py-0.5 text-[11px] font-bold tabular-nums"
                      style={{ background: b.bg, color: b.color }}
                    >
                      {pct}%
                    </span>

                    {/* Label Kualitatif */}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${b.badge}`}
                    >
                      {b.label}
                    </span>
                  </div>
                </div>

                {/* Meteran Bar Horizontal */}
                <div className="relative h-3 rounded-full bg-[var(--panel)] border border-[var(--line)] overflow-hidden">
                  {/* Garis tengah 50% */}
                  <div
                    className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--muted)]/40 z-10"
                    title="Garis Tengah 50%"
                  />
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: b.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RINCIAN PER KARTU DOKUMEN INDEKS */}
      <div className="space-y-3 pt-2">
        <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--muted)]">
          Rincian Metodologis &amp; Titik Data Historis Tiap Lembaga ({relevantIndices.length} Indeks)
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          {relevantIndices.map((idx) => {
            const typeBadge = typeLabels[idx.type] ?? {
              label: "Indeks Independen",
              bg: "bg-sky-500/10 border-sky-500/30",
              text: "text-[var(--acc-sky)]",
            };

            const b = idx.benchmark || getBenchmarkLabel(idx.normScore ?? 50);

            return (
              <div
                key={idx.id}
                className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-5 space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-[var(--line)] pb-3">
                    <div>
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold ${typeBadge.bg} ${typeBadge.text}`}
                      >
                        {typeBadge.label}
                      </span>
                      <h4 className="font-bold text-base text-[var(--text)] mt-1.5">{idx.name}</h4>
                      <p className="text-[11px] text-[var(--muted)]">{idx.publisher}</p>
                    </div>

                    <a
                      href={idx.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1 text-[11px] text-[var(--acc-sky)] hover:border-sky-500 hover:underline shrink-0 font-medium"
                    >
                      Sumber Resmi ↗
                    </a>
                  </div>

                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {idx.description}
                  </p>

                  {/* Panel Skor Rata-rata Era Ini */}
                  <div className="rounded-lg bg-[var(--panel)] p-3 text-xs border border-[var(--line)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--muted)] font-medium">
                        Rerata Periode ({startYear}–{endYear}):
                      </span>
                      <div className="text-right">
                        <span className="font-extrabold text-base text-[var(--text)] tabular-nums">
                          {idx.avgScoreStr ?? "—"}
                        </span>
                        <span className="text-xs text-[var(--muted)] font-mono"> / {idx.scaleInfo.max}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-[var(--line)]/50 text-[11px]">
                      <span className="text-[var(--muted)]">Skala baku penerbit: <strong className="font-mono text-[var(--text)]">{idx.scaleInfo.label}</strong></span>
                      <span className="font-bold tabular-nums" style={{ color: b.color }}>
                        Setara {idx.normScore}% ({b.label})
                      </span>
                    </div>
                  </div>

                  {/* Rincian Titik Data per Tahun */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">
                      Titik Data Tahun Kalender ({idx.displayPoints.length} tahun tercakup):
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {idx.displayPoints.map((p) => {
                        const prov = p.provenance;
                        const pointNorm = p.score !== null ? normalizeTo100(p.score, idx.scaleInfo.min, idx.scaleInfo.max) : null;
                        const pointB = pointNorm !== null ? getBenchmarkLabel(pointNorm) : null;

                        return (
                          <div
                            key={p.year}
                            className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-2.5 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span className="font-bold text-[var(--text)]">Tahun {p.year}</span>
                              <div className="flex items-center gap-2">
                                {p.rank && (
                                  <span className="text-[10px] text-[var(--muted)]">
                                    Peringkat #{p.rank}{p.total_countries ? `/${p.total_countries}` : ""}
                                  </span>
                                )}
                                <span
                                  className="rounded px-2 py-0.5 font-bold"
                                  style={{
                                    background: pointB ? pointB.bg : "rgba(148, 163, 184, 0.1)",
                                    color: pointB ? pointB.color : "var(--muted)",
                                  }}
                                >
                                  Skor {p.score ?? "—"}
                                  {pointNorm !== null && <span className="font-normal opacity-80 text-[10px]"> ({pointNorm}%)</span>}
                                </span>
                              </div>
                            </div>

                            {/* Catatan Kontekstual Era Ini */}
                            {p.note && (
                              <p className="text-[11px] text-[var(--muted)] leading-relaxed pt-0.5 flex items-start gap-1">
                                <IconPin size={11} className="shrink-0 mt-0.5 text-[var(--muted)]" />
                                <span>{p.note}</span>
                              </p>
                            )}

                            {prov && (
                              <div className="text-[10px] text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--line)]">
                                <span className="truncate max-w-[180px]">Metode: {prov.method}</span>
                                <a
                                  href={prov.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[var(--acc-sky)] hover:underline truncate max-w-[140px]"
                                >
                                  <span>Arsip Laporan</span>
                                  <IconExternalLink size={10} className="shrink-0" />
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
