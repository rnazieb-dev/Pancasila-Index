"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { dataset } from "@pancasila-index/data";
import { MultiRadarChart, type RadarSeries } from "@/components/multi-radar-chart";
import { indexLabel, periodLabel, scoreColor, scoreTextColor, scoreQualLabel,
  summaryIndexLabel, summaryQualLabel, termSummary } from "@/lib/view";
import { ScaleLegend } from "@/components/scale-legend";
import { InstitutionLogo } from "@/components/institution-logo";

/** Warna seri untuk peran TEKS; berbalik per tema. Indeks sejajar PRESET_COLORS. */
const SERIES_TEXT_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
];

const PRESET_COLORS = [
  "#38bdf8", // sky
  "#f43f5e", // rose
  "#34d399", // emerald
  "#fbbf24", // amber
  "#a855f7", // purple
];

export default function BandingkanPage() {
  const [selectedTermIds, setSelectedTermIds] = useState<string[]>([
    "presiden-soeharto",
    "presiden-habibie",
    "presiden-jokowi-ii",
  ]);
  const [hiddenSeriesIds, setHiddenSeriesIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"sila" | "all">("sila");


  const termsById = useMemo(() => {
    return new Map(dataset.terms.map((t) => [t.id, t]));
  }, []);

  const institutionsById = useMemo(() => {
    return new Map(dataset.institutions.map((i) => [i.id, i]));
  }, []);

  const assessmentsByTerm = useMemo(() => {
    const map = new Map<string, typeof dataset.assessments>();
    for (const a of dataset.assessments) {
      const list = map.get(a.term_id) ?? [];
      list.push(a);
      map.set(a.term_id, list);
    }
    return map;
  }, []);

  // Hitung rata-rata skor per dimensi untuk tiap term yang dipilih
  const termDimensionAverages = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const termId of selectedTermIds) {
      const asms = assessmentsByTerm.get(termId) ?? [];
      const dimMap = new Map<string, number>();
      for (const dim of dataset.rubric.dimensions) {
        const scores = asms.flatMap((a) =>
          a.dimension_scores
            .filter((ds) => ds.dimension_id === dim.id)
            .map((ds) => ds.score)
        );
        if (scores.length > 0) {
          dimMap.set(dim.id, scores.reduce((a, b) => a + b, 0) / scores.length);
        }
      }
      map.set(termId, dimMap);
    }
    return map;
  }, [selectedTermIds, assessmentsByTerm]);

  // Siapkan label & series untuk radar chart
  const { radarLabels, radarSeries, activeDimensions } = useMemo(() => {
    const dims =
      mode === "sila"
        ? dataset.rubric.dimensions.filter((d) => d.group_id === "sila")
        : dataset.rubric.dimensions;

    const labels =
      mode === "sila"
        ? dims.map((d) => `Sila ${d.id.replace("sila-", "")}`)
        : dims.map((d) => d.name_id);

    const series: RadarSeries[] = selectedTermIds.map((termId, idx) => {
      const term = termsById.get(termId);
      const dimMap = termDimensionAverages.get(termId);
      const values = dims.map((d) => dimMap?.get(d.id));

      return {
        id: termId,
        label: term?.label_id ?? termId,
        color: PRESET_COLORS[idx % PRESET_COLORS.length]!,
        values,
      };
    });

    return { radarLabels: labels, radarSeries: series, activeDimensions: dims };
  }, [mode, selectedTermIds, termsById, termDimensionAverages]);

  // Deteksi komparasi asimetris (selisih cakupan dimensi > 30%)
  const asymmetryWarning = useMemo(() => {
    const coverages = selectedTermIds.map((termId) => {
      const asms = assessmentsByTerm.get(termId) ?? [];
      const coveredDims = new Set(asms.flatMap((a) => a.dimension_scores.map((ds) => ds.dimension_id)));
      return coveredDims.size / dataset.rubric.dimensions.length;
    });
    const max = Math.max(...coverages);
    const min = Math.min(...coverages);
    return max - min > 0.3 ? { max: Math.round(max * 100), min: Math.round(min * 100) } : null;
  }, [selectedTermIds, assessmentsByTerm]);

  const toggleTerm = (termId: string) => {
    if (selectedTermIds.includes(termId)) {
      if (selectedTermIds.length > 1) {
        setSelectedTermIds(selectedTermIds.filter((id) => id !== termId));
        setHiddenSeriesIds((prev) => { const s = new Set(prev); s.delete(termId); return s; });
      }
    } else {
      if (selectedTermIds.length < 5) {
        setSelectedTermIds([...selectedTermIds, termId]);
      }
    }
  };

  const toggleSeriesVisibility = (termId: string) => {
    setHiddenSeriesIds((prev) => {
      const s = new Set(prev);
      if (s.has(termId)) s.delete(termId); else s.add(termId);
      return s;
    });
  };

  const visibleSeries = radarSeries.filter((s) => !hiddenSeriesIds.has(s.id));


  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bandingkan Era & Lembaga</h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Komparasi radar visual atas kepatuhan Pancasila & UUD 1945 lintas organ kekuasaan.
          </p>
        </div>

        {/* Mode switcher */}
        <div className="inline-flex rounded-lg border border-[var(--line)] bg-[var(--panel)] p-1 text-xs font-semibold">
          <button
            onClick={() => setMode("sila")}
            className={`rounded-md px-3 py-1.5 transition ${
              mode === "sila" ? "bg-red-600 text-white" : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            5 Sila Pancasila
          </button>
          <button
            onClick={() => setMode("all")}
            className={`rounded-md px-3 py-1.5 transition ${
              mode === "all" ? "bg-red-600 text-white" : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            12 Dimensi Lengkap
          </button>
        </div>
      </div>

      {/* Peringatan Komparasi Asimetris */}
      {asymmetryWarning && (
        <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
          <span className="text-[var(--acc-amber)] text-lg mt-0.5">⚠️</span>
          <div className="text-xs leading-relaxed">
            <strong className="text-[var(--acc-amber-strong)]">Komparasi Asimetris</strong>
            {" — "}
            <span className="text-[var(--acc-amber-strong)]">
              Rentang cakupan dimensi antar-organ yang dipilih cukup besar (antara{" "}
              {asymmetryWarning.min}% dan {asymmetryWarning.max}%). Organ/periode dengan cakupan lebih
              rendah mungkin belum memiliki data yang cukup untuk dibandingkan secara setara.
              Tafsirkan radar dengan hati-hati.
            </span>
          </div>
        </div>
      )}

      {/* Panduan Skala */}
      <div className="mt-5">
        <ScaleLegend compact />
      </div>

      {/* Selector Term / Periode */}
      <section className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            Pilih Periode/Organ untuk Dibandingkan (Maksimal 5):
          </h2>
          <span className="text-xs text-[var(--muted)]">
            {selectedTermIds.length} terpilih
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {dataset.terms.map((term) => {
            const isSelected = selectedTermIds.includes(term.id);
            const idx = selectedTermIds.indexOf(term.id);
            const color = isSelected ? PRESET_COLORS[idx % PRESET_COLORS.length] : undefined;
            const inst = institutionsById.get(term.institution_id);

            return (
              <button
                key={term.id}
                onClick={() => toggleTerm(term.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition flex items-center gap-2 ${
                  isSelected
                    ? "border-transparent bg-slate-800 text-white shadow"
                    : "border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:border-slate-500 hover:text-[var(--text)]"
                }`}
                style={isSelected ? { outline: `2px solid ${color}` } : undefined}
              >
                {isSelected && (
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}
                <InstitutionLogo id={term.institution_id} size="xs" />
                <span className="font-medium truncate max-w-[200px]">
                  {inst?.short_id ?? ""}: {term.label_id}
                </span>
                <span className="text-[10px] opacity-70">({term.era})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Radar Chart Overlay */}
      <section className="mt-10 grid lg:grid-cols-[440px_1fr] gap-8 items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <div className="justify-self-center py-4">
          <MultiRadarChart labels={radarLabels} series={radarSeries} size={380} />
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-[var(--text)]">Ringkasan Komparasi</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Grafik radar di samping memetakan skor (-2 s.d. +2) secara simultan. Pusat poligon
            menunjukkan pelanggaran norma (-2), garis putus-putus tengah menandai posisi netral (0),
            dan tepi luar menandakan kepatuhan penuh (+2).
          </p>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 pt-2">
            {selectedTermIds.map((termId, idx) => {
              const term = termsById.get(termId);
              const color = PRESET_COLORS[idx % PRESET_COLORS.length];
              // Indeks OTORITATIF, bukan hitungan sendiri. Halaman ini dulu
              // memakai rerata datar seluruh skor dimensi, sehingga melewati
              // bobot grup, pengecualian skor tanpa bukti, ambang cakupan, DAN
              // batas hak non-derogable. Selisihnya sampai 13 poin: Megawati
              // tampil 63 di sini padahal angka otoritatifnya 50 karena
              // pelanggaran HAM - persis di halaman yang dipakai orang untuk
              // menarik kesimpulan lintas era.
              const summary = termSummary(termId);
              const index = summary?.index ?? null;

              return (
                <div
                  key={termId}
                  className="rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 space-y-1.5"
                  style={{ borderTop: `3px solid ${color}` }}
                >
                  <div className="flex items-center gap-2">
                    {term && <InstitutionLogo id={term.institution_id} size="xs" />}
                    <div className="text-xs font-semibold truncate" title={term?.label_id}>
                      {term?.label_id}
                    </div>
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">
                    {periodLabel(term?.start_date ?? "", term?.end_date ?? null)}
                  </div>
                  <div className="pt-1 flex items-baseline justify-between">
                    <span className="text-[11px] text-[var(--muted)]">Indeks Draf:</span>
                    <strong
                      className="text-lg font-bold"
                      style={{ color: summaryQualLabel(summary).color }}
                    >
                      {summaryIndexLabel(summary)}
                      {index !== null ? "/100" : ""}
                    </strong>
                  </div>
                  {summary?.index_interval && (
                    <div className="text-[10px] tabular-nums text-[var(--muted)]">
                      rentang {summary.index_interval.low}–{summary.index_interval.high}
                    </div>
                  )}
                  {summary?.index_capped && (
                    <div className="text-[10px] leading-relaxed text-[var(--acc-red)]">
                      dibatasi pelanggaran hak dasar (tanpa batas: {summary.index_uncapped})
                    </div>
                  )}
                  {(summary?.non_derogable_breaches.length ?? 0) > 0 && !summary?.index_capped && (
                    <div className="text-[10px] leading-relaxed text-[var(--acc-red)]">
                      ada pelanggaran hak yang tidak dapat dikurangi
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tabel Rincian Skor Berdampingan */}
      <section className="mt-12">
        <h2 className="text-xl font-bold">Tabel Skor Komparatif Per Dimensi</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--panel)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--muted)] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[200px]">Dimensi</th>
                {selectedTermIds.map((termId, idx) => {
                  const term = termsById.get(termId);
                  const color = SERIES_TEXT_COLORS[idx % SERIES_TEXT_COLORS.length];
                  return (
                    <th
                      key={termId}
                      className="px-4 py-3 min-w-[160px]"
                      style={{ color }}
                    >
                      {term?.label_id}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {activeDimensions.map((dim) => {
                return (
                  <tr key={dim.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[var(--text)]">{dim.name_id}</div>
                      <div className="text-xs text-[var(--muted)] line-clamp-1">{dim.question_id}</div>
                    </td>
                    {selectedTermIds.map((termId) => {
                      const dimMap = termDimensionAverages.get(termId);
                      const val = dimMap?.get(dim.id);

                      if (val === undefined) {
                        return (
                          <td key={termId} className="px-4 py-3.5 text-xs text-[var(--muted)] italic">
                            Belum dinilai
                          </td>
                        );
                      }

                      const pct = Math.round(((val + 2) / 4) * 100);
                      return (
                        <td key={termId} className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="rounded px-2 py-0.5 text-xs font-bold tabular-nums"
                              style={{
                                background: `${scoreColor(val)}22`,
                                color: scoreTextColor(val),
                              }}
                            >
                              {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
                            </span>
                            <span className="text-xs text-[var(--muted)]">
                              ({pct}/100)
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
