"use client";

import { useState } from "react";
import Link from "next/link";
import { dataset, getEventsOfTerm, termYearRange } from "@pancasila-index/data";
import { termSummary } from "@/lib/view";
import { TrendLineChart, TrendPoint } from "@/components/trend-line-chart";
import { ScaleLegend } from "@/components/scale-legend";
import {
  IconTimeline,
  IconCompare,
  IconScale,
  IconInstitution,
  IconAuditLog,
} from "@/components/icons";

export default function TrendTimelinePage() {
  const [selectedInstId, setSelectedInstId] = useState<string>("presiden-ri");
  const [activeSeries, setActiveSeries] = useState({
    composite: true,
    sila: true,
    pembukaan: true,
    "struktur-uud": true,
  });

  const selectedInst = dataset.institutions.find((i) => i.id === selectedInstId) || dataset.institutions[0]!;

  // Susun titik-titik data kronologis untuk lembaga terpilih
  const terms = dataset.terms
    .filter((t) => t.institution_id === selectedInstId)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  const points: TrendPoint[] = terms.map((t) => {
    const { startYear, endYear } = termYearRange(t, new Date().getFullYear());
    const summary = termSummary(t.id);
    const termEvents = getEventsOfTerm(dataset, t.id);

    const gSila = (summary?.groups ?? []).find((g) => g.group_id === "sila");
    const gPembukaan = (summary?.groups ?? []).find((g) => g.group_id === "pembukaan");
    const gStrukturUud = (summary?.groups ?? []).find((g) => g.group_id === "struktur-uud");

    return {
      id: t.id,
      slug: t.id,
      label: t.label_id,
      startYear,
      endYear,
      institutionSlug: selectedInst.slug,
      composite: summary?.index ?? null,
      sila: gSila && gSila.coverage > 0 ? Math.round(((gSila.score + 2) / 4) * 100) : null,
      pembukaan: gPembukaan && gPembukaan.coverage > 0 ? Math.round(((gPembukaan.score + 2) / 4) * 100) : null,
      "struktur-uud": gStrukturUud && gStrukturUud.coverage > 0 ? Math.round(((gStrukturUud.score + 2) / 4) * 100) : null,
      eventsCount: termEvents.length,
      topEventTitle: termEvents[0]?.title_id,
    };
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header & Navigasi */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <Link href="/timeline" className="hover:text-[var(--text)]">
              ← Linimasa Vertikal
            </Link>
            <span>/</span>
            <span className="text-[var(--acc-red)] font-semibold uppercase tracking-wider">Grafik Tren</span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold">Grafik Tren Historis 1945–2024</h1>
          <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
            Visualisasi komparatif evolusi nilai Pancasila Index lintas dekade. Amati dinamika naik-turunnya komposit 3 pilar konstitusi pada setiap era kepemimpinan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/timeline"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400 transition"
          >
            <IconTimeline size={14} className="shrink-0" />
            <span>Mode Linimasa</span>
          </Link>
          <Link
            href="/bandingkan"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400 transition"
          >
            <IconCompare size={14} className="shrink-0" />
            <span>Mode Radar</span>
          </Link>
        </div>
      </div>

      {/* Pemilih Organ Konstitusional */}
      <div className="mt-6">
        <label className="text-xs uppercase tracking-wide text-[var(--muted)] font-semibold">
          Pilih Organ Konstitusional:
        </label>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {dataset.institutions.map((inst) => {
            const isSelected = inst.id === selectedInstId;
            return (
              <button
                key={inst.id}
                onClick={() => setSelectedInstId(inst.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  isSelected
                    ? "bg-[var(--acc-red)] text-white shadow"
                    : "bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400"
                }`}
              >
                {inst.short_id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pengatur Tampilan Garis Series */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <span className="text-xs text-[var(--muted)] font-medium">Tampilkan Pilar Konstitusi:</span>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[var(--acc-red)]">
            <input
              type="checkbox"
              checked={activeSeries.composite}
              onChange={(e) => setActiveSeries({ ...activeSeries, composite: e.target.checked })}
              className="rounded"
            />
            <span>● Komposit Utama</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[#a3e635]">
            <input
              type="checkbox"
              checked={activeSeries.sila}
              onChange={(e) => setActiveSeries({ ...activeSeries, sila: e.target.checked })}
              className="rounded"
            />
            <span className="inline-flex items-center gap-1">
              <IconScale size={13} className="shrink-0" />
              <span>Lima Sila</span>
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[#38bdf8]">
            <input
              type="checkbox"
              checked={activeSeries.pembukaan}
              onChange={(e) => setActiveSeries({ ...activeSeries, pembukaan: e.target.checked })}
              className="rounded"
            />
            <span className="inline-flex items-center gap-1">
              <IconInstitution size={13} className="shrink-0" />
              <span>Pembukaan UUD</span>
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[#f59e0b]">
            <input
              type="checkbox"
              checked={activeSeries["struktur-uud"]}
              onChange={(e) => setActiveSeries({ ...activeSeries, "struktur-uud": e.target.checked })}
              className="rounded"
            />
            <span className="inline-flex items-center gap-1">
              <IconAuditLog size={13} className="shrink-0" />
              <span>Norma Struktural</span>
            </span>
          </label>
        </div>
      </div>

      {/* Panduan Warna Skala */}
      <div className="mt-4">
        <ScaleLegend compact />
      </div>

      {/* Komponen Visual Grafik Tren */}
      <div className="mt-6 rounded-3xl border border-[var(--line)] bg-gradient-to-b from-[var(--panel)] to-[var(--bg)] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold">{selectedInst.name_id}</h2>
            <p className="text-xs text-[var(--muted)]">Rentang historis {points.length} era masa jabatan</p>
          </div>
          <div className="text-xs text-[var(--muted)] font-mono">Skala Indeks 0–100 (50 = Netral)</div>
        </div>

        <TrendLineChart points={points} activeSeries={activeSeries} />
      </div>

      {/* Tabel Ringkasan Kronologis */}
      <div className="mt-12">
        <h3 className="text-lg font-bold">Ringkasan Skor Lintas Era ({selectedInst.short_id})</h3>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--line)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--panel)] border-b border-[var(--line)] text-[var(--muted)] uppercase font-semibold">
              <tr>
                <th className="p-3.5">Masa Jabatan</th>
                <th className="p-3.5">Tahun</th>
                <th className="p-3.5 text-center">Komposit</th>
                <th className="p-3.5 text-center">Lima Sila</th>
                <th className="p-3.5 text-center">Pembukaan</th>
                <th className="p-3.5 text-center">Norma UUD</th>
                <th className="p-3.5 text-right">Peristiwa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {points.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--panel)] transition">
                  <td className="p-3.5 font-bold">
                    <Link href={`/lembaga/${selectedInst.slug}/${p.id}`} className="hover:text-[var(--acc-sky)]">
                      {p.label}
                    </Link>
                  </td>
                  <td className="p-3.5 font-mono text-[var(--muted)]">
                    {p.startYear}–{p.endYear}
                  </td>
                  <td className="p-3.5 text-center font-bold tabular-nums">
                    {p.composite !== null ? `${p.composite}/100` : "-"}
                  </td>
                  <td className="p-3.5 text-center font-medium tabular-nums text-[#22c55e]">
                    {p.sila !== null ? `${p.sila}` : "-"}
                  </td>
                  <td className="p-3.5 text-center font-medium tabular-nums text-[#38bdf8]">
                    {p.pembukaan !== null ? `${p.pembukaan}` : "-"}
                  </td>
                  <td className="p-3.5 text-center font-medium tabular-nums text-[#f59e0b]">
                    {p["struktur-uud"] !== null ? `${p["struktur-uud"]}` : "-"}
                  </td>
                  <td className="p-3.5 text-right text-[var(--muted)] font-medium">{p.eventsCount} bukti</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
