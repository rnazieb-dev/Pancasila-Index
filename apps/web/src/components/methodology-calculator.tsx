"use client";

import { useState, useMemo } from "react";
import { dataset } from "@pancasila-index/data";
import {
  scoreToIndex,
  NON_DEROGABLE_CAPS,
  MAX_UNCERTAINTY_HALFWIDTH,
  MIN_COVERAGE_FOR_INDEX,
  MIN_GROUP_COVERAGE,
} from "@pancasila-index/core";

export function MethodologyCalculator() {
  const rubric = dataset.rubric;

  // Initial state: all dimensions at 0 (neutral) with 0.85 confidence
  const initialScores: Record<string, number> = {};
  for (const d of rubric.dimensions) {
    initialScores[d.id] = 0;
  }

  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [confidence, setConfidence] = useState<number>(0.85);

  const presets = [
    {
      name: "Netral / Rutin (Semua 0)",
      apply: () => {
        const s: Record<string, number> = {};
        for (const d of rubric.dimensions) s[d.id] = 0;
        setScores(s);
        setConfidence(0.85);
      },
    },
    {
      name: "Teladan Reformasi (+2 HAM & Lembaga)",
      apply: () => {
        const s: Record<string, number> = {};
        for (const d of rubric.dimensions) s[d.id] = 1;
        s["sila_2"] = 2;
        s["hak_asasi"] = 2;
        s["checks_balances"] = 2;
        s["peradilan_independen"] = 2;
        setScores(s);
        setConfidence(0.92);
      },
    },
    {
      name: "Pembangunan Ekonomi tapi Pelanggaran HAM Berat (-2 Hak Hidup)",
      apply: () => {
        const s: Record<string, number> = {};
        for (const d of rubric.dimensions) s[d.id] = 1; // Ekonomi & infrastruktur bagus
        s["sila_5"] = 2; // Keadilan sosial ekonomi
        s["kesejahteraan_umum"] = 2;
        s["sila_2"] = -2; // Extrajudicial killings (Non-derogable)
        s["peradilan_independen"] = -2;
        setScores(s);
        setConfidence(0.88);
      },
    },
    {
      name: "Krisis Konstitusi & Otoritarianisme Ekstrem (-2 Merata)",
      apply: () => {
        const s: Record<string, number> = {};
        for (const d of rubric.dimensions) s[d.id] = -2;
        setScores(s);
        setConfidence(0.95);
      },
    },
  ];

  const calculation = useMemo(() => {
    // 1. Group aggregations
    const groupResults = rubric.groups.map((group) => {
      const dims = rubric.dimensions.filter((d) => d.group_id === group.id);
      let weightSum = 0;
      let weightedScoreSum = 0;
      let scoredCount = 0;

      for (const dim of dims) {
        const score = scores[dim.id];
        if (score !== undefined) {
          scoredCount++;
          weightSum += dim.weight;
          weightedScoreSum += score * dim.weight;
        }
      }

      const avgScore = weightSum > 0 ? weightedScoreSum / weightSum : 0;
      const coverage = dims.length > 0 ? scoredCount / dims.length : 0;

      return {
        groupId: group.id,
        groupName: group.name_id,
        groupWeight: group.weight,
        score: avgScore,
        coverage,
        weightSum,
        dimensions: dims,
      };
    });

    // 2. Composite aggregation
    let totalCompWeight = 0;
    let weightedCompScore = 0;
    let includedGroups = 0;

    for (const g of groupResults) {
      if (g.coverage >= MIN_GROUP_COVERAGE) {
        includedGroups++;
        totalCompWeight += g.groupWeight;
        weightedCompScore += g.score * g.groupWeight;
      }
    }

    const totalDims = rubric.dimensions.length;
    const scoredTotal = Object.keys(scores).length;
    const totalCoverage = totalDims > 0 ? scoredTotal / totalDims : 0;

    const uncappedOverall =
      totalCompWeight > 0 ? weightedCompScore / totalCompWeight : 0;

    // 3. Non-derogable breaches
    const breaches: { id: string; name: string; score: number }[] = [];
    let cap: number | null = null;

    for (const dim of rubric.dimensions) {
      if (dim.non_derogable) {
        const score = scores[dim.id] ?? 0;
        if (score <= -1) {
          breaches.push({ id: dim.id, name: dim.name_id, score });
          const c =
            score <= -2
              ? NON_DEROGABLE_CAPS.severe
              : NON_DEROGABLE_CAPS.erosion;
          cap = cap === null ? c : Math.min(cap, c);
        }
      }
    }

    const isCapped = cap !== null && uncappedOverall > cap;
    const finalOverall = isCapped ? (cap as number) : uncappedOverall;

    const halfWidth = (1 - confidence) * MAX_UNCERTAINTY_HALFWIDTH;
    const uncappedIndex = scoreToIndex(uncappedOverall);
    const finalIndex = scoreToIndex(finalOverall);
    const lowIndex = scoreToIndex(finalOverall - halfWidth);
    const highIndex = scoreToIndex(
      cap !== null ? Math.min(finalOverall + halfWidth, cap) : finalOverall + halfWidth
    );

    return {
      groupResults,
      totalCoverage,
      uncappedOverall,
      uncappedIndex,
      finalOverall,
      finalIndex,
      isCapped,
      capValue: cap !== null ? scoreToIndex(cap) : null,
      breaches,
      lowIndex,
      highIndex,
      halfWidthIndex: (MAX_UNCERTAINTY_HALFWIDTH * (1 - confidence) * 25).toFixed(1),
    };
  }, [scores, confidence, rubric]);

  const updateScore = (dimId: string, val: number) => {
    setScores((prev) => ({ ...prev, [dimId]: val }));
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-8 space-y-8 shadow-sm">
      {/* Header & Presets */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Simulator Penskoran Interaktif (Live Mathematical Engine)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-serif">
              Uji langsung cara kerja agregasi bobot porsi nyata, normalisasi 0–100, batas hak asasi (*non-derogable*), dan rentang galat keyakinan.
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">
            Scoring Engine v2.0
          </span>
        </div>

        {/* Presets */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
            Skenario Uji Cepat:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={p.apply}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition font-medium cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Output KPI Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Final Index */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2 relative overflow-hidden">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Skor Akhir Indeks Pancasila
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl sm:text-5xl font-mono font-black ${
                calculation.finalIndex >= 70
                  ? "text-emerald-700 dark:text-emerald-400"
                  : calculation.finalIndex >= 50
                  ? "text-blue-700 dark:text-blue-400"
                  : calculation.finalIndex >= 30
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-rose-700 dark:text-rose-400"
              }`}
            >
              {calculation.finalIndex.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">/ 100</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
            Rentang Keyakinan: [{calculation.lowIndex.toFixed(1)} s.d. {calculation.highIndex.toFixed(1)}] (±{calculation.halfWidthIndex} poin)
          </div>
          {calculation.isCapped && (
            <div className="mt-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-md p-2">
              ⚠️ Skor Dibatasi Plafon {calculation.capValue} karena pelanggaran dimensi hak dasar mutlak (Pasal 28I ayat 1 UUD 1945).
            </div>
          )}
        </div>

        {/* Card 2: Uncapped vs Capped */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Audit Plafon Hak Tak Dapat Dikurangi
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Skor Murni (Uncapped):</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {calculation.uncappedIndex.toFixed(1)} / 100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status Pembatasan:</span>
              <span
                className={`font-bold ${
                  calculation.isCapped ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {calculation.isCapped ? "DIBATASI (CAPPED)" : "LOLOS (TIDAK DIBATASI)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pelanggaran Hak Mutlak:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {calculation.breaches.length} Dimensi
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Group Contributions */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Porsi Nyata 3 Kelompok Landasan
          </div>
          <div className="space-y-1 text-xs">
            {calculation.groupResults.map((g) => (
              <div key={g.groupId} className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 truncate pr-2">
                  {g.groupName} ({g.groupWeight * 10}%):
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {scoreToIndex(g.score).toFixed(1)} / 100
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confidence Level Controller */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Tingkat Keyakinan Bukti Empiris (Evidence Confidence): {(confidence * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Keyakinan bukti hanya mengatur lebar rentang ketidakpastian [Low..High], bukan menggeser nilai tengah komposit.
          </p>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={confidence}
          onChange={(e) => setConfidence(parseFloat(e.target.value))}
          className="w-full sm:w-48 cursor-pointer"
        />
      </div>

      {/* 12 Dimensions Sliders Accordion */}
      <div className="space-y-6">
        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Pengaturan Nilai 12 Dimensi Rubrik (-2 s.d. +2):
        </div>

        <div className="space-y-6">
          {calculation.groupResults.map((g) => (
            <div
              key={g.groupId}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4 bg-slate-50/30 dark:bg-slate-900/20"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {g.groupName} (Bobot Efektif {g.groupWeight * 10}%)
                </span>
                <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                  Rerata Kelompok: {g.score.toFixed(2)} ({scoreToIndex(g.score).toFixed(1)} / 100)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {g.dimensions.map((d) => {
                  const currentVal = scores[d.id] ?? 0;
                  return (
                    <div
                      key={d.id}
                      className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {d.name_id}
                            </span>
                            {d.non_derogable && (
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/20"
                                title="Pasal 28I ayat (1) UUD 1945: Hak yang tidak dapat dikurangi dalam keadaan apa pun"
                              >
                                Hak Mutlak
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {d.question_id}
                          </p>
                        </div>
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                            currentVal > 0
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : currentVal < 0
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {currentVal > 0 ? `+${currentVal}` : currentVal}
                        </span>
                      </div>

                      {/* Scale Selector */}
                      <div className="grid grid-cols-5 gap-1 pt-1">
                        {[-2, -1, 0, 1, 2].map((v) => (
                          <button
                            key={v}
                            onClick={() => updateScore(d.id, v)}
                            className={`text-xs py-1 rounded font-mono font-bold transition cursor-pointer ${
                              currentVal === v
                                ? v < 0
                                  ? "bg-rose-600 text-white"
                                  : v > 0
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                                : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            {v > 0 ? `+${v}` : v}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
