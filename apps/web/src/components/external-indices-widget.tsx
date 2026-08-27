"use client";

import { useState } from "react";
import type { ExternalIndex, Term } from "@pancasila-index/core";

interface Props {
  term: Term;
  indices: ExternalIndex[];
}

export function ExternalIndicesWidget({ term, indices }: Props) {
  const [selectedIdxId, setSelectedIdxId] = useState<string | null>(null);

  if (!indices || indices.length === 0) return null;

  // Rentang tahun dari term
  const startYear = parseInt(term.start_date.slice(0, 4), 10);
  const endYear = term.end_date ? parseInt(term.end_date.slice(0, 4), 10) : new Date().getFullYear();

  // Filter indeks yang memiliki data dalam rentang tahun atau tahun terdekat
  const relevantIndices = indices
    .map((idx) => {
      const pointsInTerm = idx.data.filter(
        (dp) => dp.year >= startYear && dp.year <= endYear
      );
      // Jika tidak ada data spesifik di rentang tahun, ambil 2 data point terbaru
      const displayPoints = pointsInTerm.length > 0 ? pointsInTerm : idx.data.slice(-2);
      // Titik tanpa skor (hanya peringkat yang terbit) tidak boleh ikut
      // dirata-ratakan - kalau ikut, angka kosong terbaca sebagai nol.
      const scored = displayPoints.filter(
        (p): p is typeof p & { score: number } => p.score !== null
      );
      const avgScore =
        scored.length > 0
          ? (scored.reduce((acc, p) => acc + p.score, 0) / scored.length).toFixed(
              idx.scale.includes("0.00") ? 2 : 1
            )
          : null;
      const unverified = displayPoints.filter((p) => !p.provenance).length;

      return {
        ...idx,
        displayPoints,
        avgScore,
        unverified,
        hasExactData: pointsInTerm.length > 0,
      };
    })
    .filter((idx) => idx.displayPoints.length > 0);

  if (relevantIndices.length === 0) return null;

  const totalPoints = relevantIndices.reduce((n, i) => n + i.displayPoints.length, 0);
  const totalUnverified = relevantIndices.reduce((n, i) => n + i.unverified, 0);

  const defaultBadge = {
    label: "Indeks Independen",
    bg: "bg-sky-500/10 border-sky-500/30",
    text: "text-sky-400",
  };

  const verificationLabels: Record<
    string,
    { label: string; bg: string; text: string; title: string }
  > = {
    terverifikasi: {
      label: "Terverifikasi",
      bg: "bg-emerald-500/10 border-emerald-500/30",
      text: "text-emerald-300",
      title: "Setiap titik data punya tautan sumber dan tanggal pengambilan.",
    },
    sebagian: {
      label: "Sebagian terverifikasi",
      bg: "bg-amber-500/10 border-amber-500/30",
      text: "text-amber-300",
      title:
        "Hanya sebagian titik data punya sumber yang bisa ditelusuri. Titik lainnya jangan dikutip.",
    },
    "belum-terverifikasi": {
      label: "Belum terverifikasi",
      bg: "bg-red-500/10 border-red-500/30",
      text: "text-red-300",
      title:
        "Belum ada titik data yang bisa ditelusuri ke penerbitnya. Angka di kartu ini tidak boleh dikutip sebagai fakta.",
    },
  };

  const typeLabels: Record<string, { label: string; bg: string; text: string }> = {
    "hard-data": {
      label: "Hard Data (Bebas Survei ASN)",
      bg: "bg-emerald-500/10 border-emerald-500/30",
      text: "text-emerald-400",
    },
    "expert-coded": {
      label: "Double-Blind Expert Coded",
      bg: "bg-sky-500/10 border-sky-500/30",
      text: "text-sky-400",
    },
    "civil-society": {
      label: "Survei Masyarakat Sipil & Advokat",
      bg: "bg-purple-500/10 border-purple-500/30",
      text: "text-purple-400",
    },
    "official-self-assessment": {
      label: "Laporan Internal Formal",
      bg: "bg-amber-500/10 border-amber-500/30",
      text: "text-amber-400",
    },
  };

  return (
    <div className="mt-8 rounded-2xl border border-sky-500/30 bg-sky-950/10 p-6 space-y-6">
      {/* Header Widget */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">🌐</span>
            <span className="text-xs uppercase tracking-wider text-sky-400 font-bold">
              Konteks Independen Global (Enrichment)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white/95 mt-1">
            Indikator Integritas & Tata Kelola Independen ({startYear}–{term.end_date ? endYear : "Kini"})
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed max-w-2xl">
            Tolok ukur independen pihak ketiga berbasis data keras (<em>hard data</em>) dan riset akademik
            internasional. Dirancang untuk menguji validitas fakta di lapangan tanpa bergantung pada
            survei kepatuhan internal birokrasi yang rentan bias seremonial (&ldquo;Asal Bapak Senang&rdquo;).
          </p>
        </div>

        <div className="space-y-2">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-[11px] text-amber-200">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <span>⚖️</span>
              <span>Metrik Kesenjangan Fakta vs Klaim</span>
            </div>
            <p className="mt-0.5 text-amber-200/80">
              Bandingkan skor independen ini dengan fakta hukum di peristiwa era ini.
            </p>
          </div>

          {totalUnverified > 0 && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-[11px] text-red-200">
              <div className="font-bold text-red-300">
                {totalUnverified} dari {totalPoints} angka belum tertelusur
              </div>
              <p className="mt-0.5 text-red-200/80">
                Angka bertanda garis putus-putus belum bisa dilacak ke penerbitnya.
                Jangan dikutip sebagai fakta.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Grid Kartu Indeks */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relevantIndices.map((idx) => {
          const typeBadge = typeLabels[idx.type] ?? defaultBadge;
          const verifBadge =
            verificationLabels[idx.verification] ?? verificationLabels["belum-terverifikasi"]!;
          const isSelected = selectedIdxId === idx.id;

          return (
            <div
              key={idx.id}
              onClick={() => setSelectedIdxId(isSelected ? null : idx.id)}
              className={`cursor-pointer rounded-xl border p-4 transition flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "border-sky-400 bg-sky-950/40 ring-1 ring-sky-400"
                  : "border-[var(--line)] bg-[var(--panel)] hover:border-slate-500 hover:bg-[var(--panel)]/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${typeBadge.bg} ${typeBadge.text}`}
                  >
                    {typeBadge.label}
                  </span>
                  <a
                    href={idx.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5"
                  >
                    Sumber ↗
                  </a>
                </div>

                <div className="mt-1.5">
                  <span
                    title={verifBadge.title}
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${verifBadge.bg} ${verifBadge.text}`}
                  >
                    {verifBadge.label}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white/90 mt-2.5">{idx.name}</h3>
                <p className="text-[11px] text-slate-400">{idx.publisher}</p>

                <p className="mt-2 text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                  {idx.description}
                </p>
              </div>

              {/* Skor Rata-rata Era Ini */}
              <div className="rounded-lg bg-[var(--bg)] p-3 border border-[var(--line)]">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-[var(--muted)] font-semibold uppercase tracking-wider">
                    {idx.hasExactData ? `Rata-rata Era (${startYear}–${endYear})` : "Skor Terkini"}
                  </span>
                  <span className="font-mono text-base font-bold text-sky-300">
                    {idx.avgScore ?? "—"}{" "}
                    <span className="text-[10px] font-normal text-slate-400">/ {idx.scale.split(" ")[0]}</span>
                  </span>
                </div>

                {/* Deret waktu mini */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  {idx.displayPoints.map((p) => {
                    const prov = p.provenance;
                    // Garis putus-putus = angka belum tertelusur ke penerbit.
                    // Pembeda visual ini wajib: tanpanya, angka tak bersumber
                    // terbaca sama meyakinkan dengan angka yang sudah dilacak.
                    return (
                      <span
                        key={p.year}
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                          prov
                            ? "border border-slate-700 bg-slate-800/80 text-slate-300"
                            : "border border-dashed border-red-500/40 bg-red-950/20 text-slate-400"
                        }`}
                        title={
                          prov
                            ? `${p.year}: ${p.score ?? "peringkat saja"}${
                                p.rank ? ` (peringkat ${p.rank})` : ""
                              }\nSumber: ${prov.url}\nDiambil: ${prov.retrieved_at} (${prov.method})${
                                p.note ? `\n${p.note}` : ""
                              }`
                            : `${p.year}: BELUM TERVERIFIKASI - tidak ada tautan sumber. Jangan dikutip.${
                                p.note ? `\n${p.note}` : ""
                              }`
                        }
                      >
                        {p.year}:{" "}
                        <strong className={prov ? "text-sky-300" : "text-slate-400"}>
                          {p.score ?? (p.rank ? `#${p.rank}` : "—")}
                        </strong>
                        {!prov && <span className="ml-0.5 text-red-400/70">?</span>}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Catatan Kesenjangan ABS jika diklik */}
              {idx.abs_discrepancy_note && (
                <div className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2.5 rounded border border-amber-500/20 leading-relaxed">
                  <strong className="text-amber-200 block mb-0.5">Analisis Kesenjangan:</strong>
                  {idx.abs_discrepancy_note}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
