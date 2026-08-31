"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { dataset } from "@pancasila-index/data";
import { MultiRadarChart, type RadarSeries } from "@/components/multi-radar-chart";
import { indexLabel, periodLabel, scoreColor, scoreTextColor, scoreQualLabel,
  summaryIndexLabel, summaryQualLabel, termSummary } from "@/lib/view";
import { ScaleLegend } from "@/components/scale-legend";
import { InstitutionLogo } from "@/components/institution-logo";
import { useLocale } from "@/components/locale-provider";
import { pickI18n } from "@/lib/i18n";

/** Warna seri untuk peran TEKS; berbalik per tema. Indeks sejajar PRESET_COLORS. */
const SERIES_TEXT_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
];

const SHORT_DIMENSION_LABELS: Record<string, string> = {
  "sila-1": "Sila 1: Ketuhanan",
  "sila-2": "Sila 2: Kemanusiaan",
  "sila-3": "Sila 3: Persatuan",
  "sila-4": "Sila 4: Kerakyatan",
  "sila-5": "Sila 5: Keadilan",
  "tujuan-1": "T1: Lindungi Bangsa",
  "tujuan-2": "T2: Kesejahteraan",
  "tujuan-3": "T3: Cerdaskan",
  "tujuan-4": "T4: Ketertiban Dunia",
  "negara-hukum": "N1: Negara Hukum",
  "checks-balances": "N2: Checks & Balances",
  "kedaulatan-rakyat": "N3: Kedaulatan Rakyat",
};

const PRESET_COLORS = [
  "#38bdf8", // sky
  "#f43f5e", // rose
  "#34d399", // emerald
  "#fbbf24", // amber
  "#a855f7", // purple
];

const CURATED_PRESETS = [
  {
    id: "presiden-reformasi",
    label: "Presiden Era Reformasi",
    description: "Habibie, Gus Dur, Megawati, SBY, Jokowi",
    termIds: ["presiden-habibie", "presiden-gusdur", "presiden-megawati", "presiden-sby-i", "presiden-jokowi-i"],
  },
  {
    id: "transisi-orba-reformasi",
    label: "Transisi Orba → Reformasi",
    description: "Soeharto, Habibie, Gus Dur",
    termIds: ["presiden-soeharto", "presiden-habibie", "presiden-gusdur"],
  },
  {
    id: "lembaga-peradilan",
    label: "Peradilan & Etik (MK vs MA vs KY)",
    description: "MK 2003-2008, MA 1998-2008, KY 2005-2010",
    termIds: ["mk-2003-2008", "ma-1998-2008", "ky-2005-2010"],
  },
  {
    id: "parlemen-rakyat",
    label: "Parlemen (DPR vs DPD vs MPR)",
    description: "DPR 2014-2019, DPD 2014-2019, MPR 2014-2019",
    termIds: ["dpr-2014-2019", "dpd-2014-2019", "mpr-2014-2019"],
  },
  {
    id: "orla-vs-orba",
    label: "Orde Lama vs Orde Baru",
    description: "Soekarno vs Soeharto",
    termIds: ["presiden-soekarno-1959-1966", "presiden-soeharto"],
  },
];

export default function BandingkanPage() {
  const { t, locale } = useLocale();
  const [selectedTermIds, setSelectedTermIds] = useState<string[]>([
    "presiden-soeharto",
    "presiden-habibie",
    "presiden-jokowi-ii",
  ]);
  const [hiddenSeriesIds, setHiddenSeriesIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"sila" | "all">("sila");
  const [activeInstitutionTab, setActiveInstitutionTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

    const labels = dims.map((d) => SHORT_DIMENSION_LABELS[d.id] || d.name_id);

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

  const removeTerm = (termId: string) => {
    if (selectedTermIds.length > 1) {
      setSelectedTermIds(selectedTermIds.filter((id) => id !== termId));
    }
  };

  const applyPreset = (termIds: string[]) => {
    setSelectedTermIds(termIds);
    setHiddenSeriesIds(new Set());
  };

  const visibleSeries = radarSeries.filter((s) => !hiddenSeriesIds.has(s.id));

  // Filtered terms for the hierarchical selector
  const filteredTerms = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return dataset.terms.filter((term) => {
      if (activeInstitutionTab !== "all" && term.institution_id !== activeInstitutionTab) {
        return false;
      }
      if (!q) return true;
      const inst = institutionsById.get(term.institution_id);
      const matchesLabel = term.label_id.toLowerCase().includes(q);
      const matchesEra = term.era.toLowerCase().includes(q);
      const matchesInst = inst?.name_id.toLowerCase().includes(q) || inst?.short_id?.toLowerCase().includes(q);
      return matchesLabel || matchesEra || matchesInst;
    });
  }, [activeInstitutionTab, searchTerm, institutionsById]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)]">{t("bandingkanPageTitle")}</h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
            Komparasi radar visual atas kepatuhan Pancasila & UUD 1945 lintas organ kekuasaan.
          </p>
        </div>

        {/* Mode switcher */}
        <div className="inline-flex rounded-lg border border-[var(--line)] bg-[var(--panel)] p-1 text-xs font-semibold">
          <button
            onClick={() => setMode("sila")}
            className={`rounded-md px-3 py-1.5 transition ${
              mode === "sila" ? "bg-[var(--acc-red)] text-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            5 Sila Pancasila
          </button>
          <button
            onClick={() => setMode("all")}
            className={`rounded-md px-3 py-1.5 transition ${
              mode === "all" ? "bg-[var(--acc-red)] text-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            12 Dimensi Lengkap
          </button>
        </div>
      </div>

      {/* 1. Skenario Komparasi Populer (1-Klik) */}
      <section className="mt-6 p-4 sm:p-5 rounded-2xl border border-[var(--acc-sky)]/30 bg-[var(--acc-sky)]/5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <h2 className="text-xs sm:text-sm font-bold text-[var(--text)] uppercase tracking-wide">
              Skenario Komparasi Populer (1-Klik):
            </h2>
          </div>
          <span className="text-[11px] text-[var(--muted)] hidden sm:inline">Pilih perbandingan siap pakai</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
          {CURATED_PRESETS.map((preset) => {
            const isCurrent =
              preset.termIds.length === selectedTermIds.length &&
              preset.termIds.every((id) => selectedTermIds.includes(id));

            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.termIds)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1 ${
                  isCurrent
                    ? "border-[var(--acc-sky)] bg-[var(--acc-sky)]/20 shadow-sm"
                    : "border-[var(--line)] bg-[var(--panel)] hover:border-sky-400 hover:bg-[var(--bg)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text)]">{preset.label}</span>
                  {isCurrent && <span className="text-[10px] font-bold text-[var(--acc-sky)]">✓ Aktif</span>}
                </div>
                <p className="text-[11px] text-[var(--muted)] line-clamp-1">{preset.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Active Comparison Bar (Chips) */}
      <section className="mt-6 p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Sedang Dibandingkan ({selectedTermIds.length}/5):
            </h3>
          </div>
          {selectedTermIds.length > 2 && (
            <button
              onClick={() => setSelectedTermIds(["presiden-soeharto", "presiden-habibie"])}
              className="text-[11px] text-[var(--muted)] hover:text-[var(--acc-red)] transition"
            >
              Reset ke 2 Organ
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedTermIds.map((termId, idx) => {
            const term = termsById.get(termId);
            const color = PRESET_COLORS[idx % PRESET_COLORS.length];
            const inst = term ? institutionsById.get(term.institution_id) : undefined;

            return (
              <div
                key={termId}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] shadow-sm text-xs"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                {term && <InstitutionLogo id={term.institution_id} size="xs" />}
                <span className="font-semibold text-[var(--text)] truncate max-w-[150px] sm:max-w-[200px]">
                  {inst?.short_id ?? ""}: {term?.label_id}
                </span>
                <span className="text-[10px] text-[var(--muted)]">({term?.era})</span>
                {selectedTermIds.length > 1 && (
                  <button
                    onClick={() => removeTerm(termId)}
                    className="ml-1 text-[var(--muted)] hover:text-[var(--acc-red)] font-bold text-xs p-0.5"
                    title="Hapus dari perbandingan"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Selector Organ Terstruktur (Tab & Search) */}
      <section className="mt-4 p-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs font-semibold text-[var(--muted)]">
            + Tambah Organ / Periode Lain ke Perbandingan:
          </div>

          {/* Instant Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("bandingkanPlaceholder")}
              className="w-full bg-[var(--panel)] border border-[var(--line)] rounded-lg px-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-sky-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tab Organ */}
        <div className="flex flex-wrap gap-1 border-b border-[var(--line)] pb-2 text-xs">
          <button
            onClick={() => setActiveInstitutionTab("all")}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              activeInstitutionTab === "all"
                ? "bg-[var(--text)] text-[var(--bg)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            Semua ({dataset.terms.length})
          </button>
          {dataset.institutions.map((inst) => {
            const count = dataset.terms.filter((t) => t.institution_id === inst.id).length;
            const isActive = activeInstitutionTab === inst.id;
            return (
              <button
                key={inst.id}
                onClick={() => setActiveInstitutionTab(inst.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[var(--text)] text-[var(--bg)] font-semibold"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <InstitutionLogo id={inst.id} size="xs" />
                <span>{inst.short_id}</span>
                <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Pilihan Periode Terfilter */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-44 overflow-y-auto p-1">
          {filteredTerms.length === 0 ? (
            <div className="text-xs text-[var(--muted)] italic py-2">
              Tidak ada periode yang cocok dengan filter &quot;{searchTerm}&quot;.
            </div>
          ) : (
            filteredTerms.map((term) => {
              const isSelected = selectedTermIds.includes(term.id);
              const idx = selectedTermIds.indexOf(term.id);
              const color = isSelected ? PRESET_COLORS[idx % PRESET_COLORS.length] : undefined;
              const inst = institutionsById.get(term.institution_id);

              return (
                <button
                  key={term.id}
                  onClick={() => toggleTerm(term.id)}
                  disabled={!isSelected && selectedTermIds.length >= 5}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition flex items-center gap-2 ${
                    isSelected
                      ? "border-transparent bg-slate-800 text-white shadow-sm"
                      : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:border-slate-400 hover:text-[var(--text)] disabled:opacity-40"
                  }`}
                  style={isSelected ? { outline: `2px solid ${color}` } : undefined}
                >
                  {isSelected ? (
                    <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                  ) : (
                    <span className="text-xs text-[var(--muted)]">+</span>
                  )}
                  <InstitutionLogo id={term.institution_id} size="xs" />
                  <span className="font-medium truncate max-w-[130px] sm:max-w-[200px]">
                    {inst?.short_id ?? ""}: {term.label_id}
                  </span>
                  <span className="text-[10px] opacity-70">({term.era})</span>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Peringatan Komparasi Asimetris */}
      {asymmetryWarning && (
        <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
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
      <div className="mt-6">
        <ScaleLegend compact />
      </div>

      {/* Radar Chart Overlay */}
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 sm:gap-8 items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-6">
        <div className="w-full flex flex-col items-center py-2">
          <MultiRadarChart labels={radarLabels} series={visibleSeries} />
          {mode === "all" && (
            <div className="mt-3 w-full text-[11px] text-[var(--muted)] bg-[var(--bg)] p-2.5 rounded-lg border border-[var(--line)]">
              <div className="font-semibold text-[var(--text)] mb-1">Keterangan Kode Sumbu Radar:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <div><strong>Sila 1–5:</strong> Nilai Pancasila</div>
                <div><strong>T1–T4:</strong> Tujuan Bernegara (Alinea IV)</div>
                <div><strong>N1–N3:</strong> Norma Struktural (UUD 1945)</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-[var(--text)]">{t("bandingkanSummaryTitle")}</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Grafik radar di samping memetakan skor (-2 s.d. +2) secara simultan. Pusat poligon
            menunjukkan pelanggaran norma (-2), garis putus-putus tengah menandai posisi netral (0),
            dan tepi luar menandakan kepatuhan penuh (+2).
          </p>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            {selectedTermIds.map((termId, idx) => {
              const term = termsById.get(termId);
              const color = PRESET_COLORS[idx % PRESET_COLORS.length];
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
        <h2 className="text-xl font-bold">{t("bandingkanTableTitle")}</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--panel)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--muted)] uppercase tracking-wider sticky top-0 z-20">
              <tr>
                <th className="px-3.5 sm:px-4 py-3 min-w-[150px] sm:min-w-[200px] sticky left-0 bg-[var(--bg)] z-30 border-r border-[var(--line)] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.2)]">Dimensi</th>
                {selectedTermIds.map((termId, idx) => {
                  const term = termsById.get(termId);
                  const color = SERIES_TEXT_COLORS[idx % SERIES_TEXT_COLORS.length];
                  return (
                    <th
                      key={termId}
                      className="px-3 sm:px-4 py-3 min-w-[130px] sm:min-w-[160px]"
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
                    <td className="px-3.5 sm:px-4 py-3.5 sticky left-0 bg-[var(--panel)] z-10 border-r border-[var(--line)] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.2)]">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text)]">{dim.name_id}</div>
                      <div className="text-[11px] sm:text-xs text-[var(--muted)] line-clamp-1">{dim.question_id}</div>
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
                        <td key={termId} className="px-3 sm:px-4 py-3.5">
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
