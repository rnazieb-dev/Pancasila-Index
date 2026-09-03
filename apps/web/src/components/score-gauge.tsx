"use client";

import React, { useState } from "react";
import { scoreColor, scoreTextColor, scoreQualLabel, type QualLabel } from "@/lib/view";

interface ScoreGaugeProps {
  score: number | null;
  interval?: { low: number; high: number } | null;
  confidence?: number;
  qual?: QualLabel;
  isCapped?: boolean;
  uncappedScore?: number | null;
  showExplanation?: boolean;
  compact?: boolean;
}

/**
 * Visual Score Gauge yang mengatasi kebingungan masyarakat awam atas angka 50.
 * Menyajikan visualisasi diverging bipolar (skala -2..+2 dipetakan ke 0..100).
 */
export function ScoreGauge({
  score,
  interval,
  confidence,
  qual,
  isCapped,
  uncappedScore,
  showExplanation = true,
  compact = false,
}: ScoreGaugeProps) {
  const [showInfo, setShowInfo] = useState(false);

  const finalScore = score !== null ? Math.min(100, Math.max(0, Math.round(score))) : null;
  const qualBadge = qual || scoreQualLabel(score);

  // Nilai rubrik asal (-2 s.d. +2)
  const rubricScore = score !== null ? ((score - 50) / 25).toFixed(1) : null;
  const rubricDisplay =
    rubricScore !== null
      ? Number(rubricScore) > 0
        ? `+${rubricScore}`
        : rubricScore
      : null;

  return (
    <div className="w-full rounded-2xl border-2 border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 shadow-sm space-y-5">
      {/* Baris Atas: Skor Utama + Predikat + Tombol Bantuan */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Indeks Kepatuhan Konstitusional
            </span>
            <span className="rounded-md bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 text-[10px] font-mono text-[var(--muted)]">
              Skala 0–100
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-3">
            <div
              className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight"
              style={{ color: qualBadge.color }}
            >
              {finalScore !== null ? finalScore : "—"}
            </div>
            <div className="text-lg font-bold text-[var(--muted)]">/ 100</div>

            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm font-bold shadow-sm"
              style={{ background: qualBadge.bg, color: qualBadge.color }}
            >
              <span className="size-2 rounded-full" style={{ background: qualBadge.color }} />
              {qualBadge.label}
            </div>
          </div>

          {/* Sub-label penjelasan nilai rubrik */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
            {rubricDisplay && (
              <span>
                Setara skor rubrik:{" "}
                <strong className="text-[var(--text)] font-mono">{rubricDisplay}</strong> (-2 s.d. +2)
              </span>
            )}
            {interval && (
              <>
                <span>·</span>
                <span className="tabular-nums">
                  Rentang verifikasi:{" "}
                  <strong className="text-[var(--text)]">{interval.low}–{interval.high}</strong>
                </span>
              </>
            )}
            {confidence !== undefined && (
              <>
                <span>·</span>
                <span>Keyakinan bukti: <strong className="text-[var(--text)]">{Math.round(confidence * 100)}%</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Tombol toggle edukasi skala */}
        {showExplanation && (
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400 transition"
          >
            <span>💡</span>
            <span>{showInfo ? "Tutup Panduan Skala" : "Mengapa 50 = Netral?"}</span>
          </button>
        )}
      </div>

      {/* Track Visual Spektrum 5 Zona dengan Penanda Pin */}
      <div className="space-y-2 pt-2">
        <div className="relative pt-6 pb-2">
          {/* Jarum / Penanda Posisi Skor */}
          {finalScore !== null && (
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700 ease-out z-10"
              style={{ left: `${finalScore}%` }}
            >
              <div
                className="rounded-md px-2 py-0.5 text-[11px] font-extrabold text-white shadow-md tabular-nums whitespace-nowrap"
                style={{ background: qualBadge.color }}
              >
                Skor: {finalScore}
              </div>
              <div
                className="w-0 h-0 border-x-4 border-x-transparent border-t-4"
                style={{ borderTopColor: qualBadge.color }}
              />
            </div>
          )}

          {/* Bar Spektrum Bergradasi 5 Zona */}
          <div className="h-4 rounded-full overflow-hidden flex border-2 border-[var(--line)] bg-[var(--bg)] shadow-inner">
            {/* Zona 1: Erosi Berat (0-29) */}
            <div
              className="h-full bg-[#ef4444] transition-opacity"
              style={{ width: "30%", opacity: finalScore !== null && finalScore < 30 ? 1 : 0.65 }}
              title="0–29: Erosi Berat / Inkonstitusional"
            />
            {/* Zona 2: Menggerus (30-45) */}
            <div
              className="h-full bg-[#fb923c] transition-opacity"
              style={{ width: "16%", opacity: finalScore !== null && finalScore >= 30 && finalScore < 46 ? 1 : 0.65 }}
              title="30–45: Cenderung Menggerus"
            />
            {/* Zona 3: Netral (46-55) */}
            <div
              className="h-full bg-[#94a3b8] transition-opacity relative"
              style={{ width: "10%", opacity: finalScore !== null && finalScore >= 46 && finalScore <= 55 ? 1 : 0.65 }}
              title="46–55: Netral / Status Quo (Titik Tengah)"
            >
              {/* Garis batas netral persis di 50% */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white shadow-sm" />
            </div>
            {/* Zona 4: Penguatan (56-74) */}
            <div
              className="h-full bg-[#a3e635] transition-opacity"
              style={{ width: "19%", opacity: finalScore !== null && finalScore > 55 && finalScore < 75 ? 1 : 0.65 }}
              title="56–74: Penguatan Konkret"
            />
            {/* Zona 5: Teladan (75-100) */}
            <div
              className="h-full bg-[#22c55e] transition-opacity"
              style={{ width: "25%", opacity: finalScore !== null && finalScore >= 75 ? 1 : 0.65 }}
              title="75–100: Teladan / Progresif"
            />
          </div>

          {/* Label pembagi di bawah meteran */}
          <div className="relative mt-2 flex justify-between text-[10px] sm:text-[11px] font-semibold text-[var(--muted)]">
            <span className="text-[#ef4444]">0 (Erosi Berat)</span>
            <span className="text-[#fb923c] hidden sm:inline">30</span>
            <span className="text-center font-bold text-[var(--text)] bg-[var(--panel)] px-2 rounded border border-[var(--line)] shadow-xs">
              50 (Titik Netral / Skor 0)
            </span>
            <span className="text-[#a3e635] hidden sm:inline">75</span>
            <span className="text-[#22c55e]">100 (Teladan)</span>
          </div>
        </div>
      </div>

      {/* Kartu Bantuan Edukatif (Muncul saat tombol diklik atau default bila diminta) */}
      {(showInfo || !compact) && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 text-xs leading-relaxed space-y-2 text-[var(--muted)]">
          <div className="font-bold text-[var(--text)] flex items-center gap-1.5">
            <span>ℹ️</span>
            <span>Memahami Skala Indeks Pancasila (0–100)</span>
          </div>
          <p>
            Skor <strong>50 BUKAN nilai merah ujian sekolah</strong>, melainkan <strong>titik keseimbangan netral</strong> (setara skor 0 pada rubrik konstitusi -2 s.d. +2).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/5">
              <span className="font-bold text-red-500 block mb-0.5">0 – 45: Zona Regresi</span>
              Menandai adanya tindakan yang menggerus atau melanggar norma konstitusi & hak asasi.
            </div>
            <div className="p-2.5 rounded-lg border border-slate-500/20 bg-slate-500/5">
              <span className="font-bold text-[var(--text)] block mb-0.5">46 – 55: Zona Netral</span>
              Kinerja administratif rutin tanpa terobosan baru atau nihil bukti pelanggaran maupun penguatan.
            </div>
            <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <span className="font-bold text-emerald-500 block mb-0.5">56 – 100: Zona Progresif</span>
              Kebijakan atau putusan yang secara konkret memperluas jaminan konstitusional dan keadilan rakyat.
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Batas Atas (Capped) Bila Ada Pelanggaran Hak Asasi Non-Derogable */}
      {isCapped && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-400 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-red-300">
            <span>⚠️</span>
            <span>Peringatan Pembatasan Konstitusional (Pasal 28I ayat 1 UUD 1945)</span>
          </div>
          <p className="leading-relaxed">
            Masa jabatan ini mencatat pelanggaran berat terhadap hak asasi yang tidak dapat dikurangi (seperti hak hidup/bebas penyiksaan). Berdasarkan metodologi, indeks dibatasi maksimal <strong>{finalScore}</strong> (sebelum dibatasi: <strong className="line-through text-slate-400">{uncappedScore}</strong>). Capaian di bidang lain tidak dapat menghapus pelanggaran hak asasi dasar.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Lencana Skor Dimensi yang langsung menjelaskan angka dan artinya.
 * Mencegah kebingungan "angka 50 itu apa maksudnya?".
 */
export function DimensionScoreBadge({ score }: { score: number }) {
  // score adalah -2..+2
  const converted = Math.round(((score + 2) / 4) * 100);
  const color = scoreColor(score);
  const textColor = scoreTextColor(score);

  let label = "Netral";
  let sign = "0";

  if (score >= 1.5) {
    label = "Teladan";
    sign = "+2";
  } else if (score > 0) {
    label = "Penguatan";
    sign = `+${score.toFixed(0)}`;
  } else if (score <= -1.5) {
    label = "Pelanggaran";
    sign = "-2";
  } else if (score < 0) {
    label = "Menggerus";
    sign = `${score.toFixed(0)}`;
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums border shadow-2xs"
      style={{
        background: `${color}18`,
        borderColor: `${color}40`,
        color: textColor,
      }}
      title={`Skor Rubrik: ${score > 0 ? "+" : ""}${score.toFixed(1)} dari -2..+2 (Dikonversi ke skala 100: ${converted})`}
    >
      <span className="font-extrabold">{converted}</span>
      <span className="text-[10px] opacity-80 font-medium">({sign} · {label})</span>
    </span>
  );
}
