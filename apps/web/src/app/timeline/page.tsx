"use client";

import { useState } from "react";
import Link from "next/link";
import { dataset, getEventsOfTerm } from "@pancasila-index/data";
import {
  indexLabel,
  periodLabel,
  scoreColor,
  scoreTextColor,
  termSummary,
} from "@/lib/view";

type PillarFilter = "all" | "sila" | "tujuan" | "struktural";

export default function TimelinePage() {
  const [activePillar, setActivePillar] = useState<PillarFilter>("all");

  const branches = [
    { id: "eksekutif", label: "Eksekutif" },
    { id: "legislatif", label: "Legislatif" },
    { id: "yudikatif", label: "Yudikatif" },
    { id: "eksaminatif", label: "Eksaminatif / Pengawasan Keuangan" },
  ] as const;

  const pillars = [
    { id: "all", label: "Semua Pilar (12 Dimensi)", icon: "🌐" },
    { id: "sila", label: "1. Lima Sila Pancasila", icon: "🦅" },
    { id: "tujuan", label: "2. Pembukaan UUD 1945 (Tujuan)", icon: "🏛️" },
    { id: "struktural", label: "3. Norma Struktural UUD 1945", icon: "⚖️" },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="border-b border-[var(--line)] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">Linimasa Penilaian Konstitusional</h1>
            <p className="mt-2 text-sm sm:text-base text-[var(--muted)] max-w-3xl leading-relaxed">
              Kronologi penilaian kesetiaan 8 organ konstitusional dari 1945 hingga kini. Gunakan tombol splitter di bawah untuk melihat rincian per pilar konstitusi.
            </p>
          </div>
          <Link
            href="/timeline/tren"
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-xs sm:text-sm font-bold text-[var(--acc-sky)] hover:border-sky-500 hover:shadow transition"
          >
            📈 Lihat Grafik Tren Lintas Dekade →
          </Link>
        </div>

        {/* 3-Pillar Interactive Splitter Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {pillars.map((p) => {
            const isActive = activePillar === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePillar(p.id as PillarFilter)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? "bg-[var(--acc-red)] text-white shadow-md"
                    : "bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400"
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cabang Kekuasaan Sections */}
      {branches.map((branch) => {
        const institutions = dataset.institutions.filter(
          (i) => i.branch === branch.id
        );
        if (institutions.length === 0) return null;

        return (
          <section key={branch.id} className="mt-14">
            <h2 className="text-base sm:text-lg font-bold text-[var(--acc-red)] border-b border-[var(--line)] pb-2.5 uppercase tracking-wider">
              Cabang {branch.label}
            </h2>
            <div className="space-y-10 mt-6">
              {institutions.map((institution) => {
                const terms = dataset.terms
                  .filter((t) => t.institution_id === institution.id)
                  .sort((a, b) => a.start_date.localeCompare(b.start_date));

                return (
                  <div key={institution.id} className="space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-[var(--text)]">{institution.name_id}</h3>
                      <Link
                        href={`/lembaga/${institution.slug}`}
                        className="text-xs text-[var(--acc-sky)] hover:text-[var(--acc-sky-strong)] font-medium"
                      >
                        Lihat profil lembaga →
                      </Link>
                    </div>

                    <ol className="relative border-l-2 border-[var(--line)] ml-3 space-y-5 pt-1">
                      {terms.map((term) => {
                        const summary = termSummary(term.id);
                        const termEvents = getEventsOfTerm(dataset, term.id);

                        // Ambil subskor grup
                        const gSila = (summary?.groups ?? []).find((g) => g.group_id === "sila");
                        const gTujuan = (summary?.groups ?? []).find((g) => g.group_id === "tujuan");
                        const gStruktural = (summary?.groups ?? []).find((g) => g.group_id === "struktural");

                        // Tentukan skor aktif berdasarkan filter splitter
                        let displayScore = summary?.index ?? null;
                        let displayCoverage = summary?.coverage ?? 0;
                        let displayLabel = "Indeks Menyeluruh";

                        if (activePillar === "sila") {
                          displayScore = gSila && gSila.coverage > 0 ? Math.round(((gSila.score + 2) / 4) * 100) : null;
                          displayCoverage = gSila?.coverage ?? 0;
                          displayLabel = "Skor Lima Sila";
                        } else if (activePillar === "tujuan") {
                          displayScore = gTujuan && gTujuan.coverage > 0 ? Math.round(((gTujuan.score + 2) / 4) * 100) : null;
                          displayCoverage = gTujuan?.coverage ?? 0;
                          displayLabel = "Skor Pembukaan UUD";
                        } else if (activePillar === "struktural") {
                          displayScore = gStruktural && gStruktural.coverage > 0 ? Math.round(((gStruktural.score + 2) / 4) * 100) : null;
                          displayCoverage = gStruktural?.coverage ?? 0;
                          displayLabel = "Skor Norma Struktural";
                        }

                        const barColor = displayScore !== null ? scoreColor(displayScore / 25 - 2) : "#475569";

                        return (
                          <li key={term.id} className="ml-6 relative">
                            {/* Dot indicator */}
                            <span
                              className="absolute -left-[31px] top-4 size-3 rounded-full ring-4 ring-[var(--bg)]"
                              style={{ background: barColor }}
                            />

                            <Link
                              href={`/lembaga/${institution.slug}/${term.id}`}
                              className="group block rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-5 hover:border-slate-400 hover:shadow-lg transition duration-200"
                            >
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <span className="font-bold text-sm sm:text-base group-hover:text-[var(--acc-sky)] transition">
                                  {term.label_id}
                                </span>
                                <span className="text-xs font-mono text-[var(--muted)]">
                                  {periodLabel(term.start_date, term.end_date)}
                                </span>
                              </div>

                              {/* Nilai Utama Node */}
                              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-[var(--muted)]">{displayLabel}:</span>
                                  <strong
                                    className="text-sm sm:text-base font-extrabold tabular-nums"
                                    style={{ color: scoreTextColor(displayScore !== null ? displayScore / 25 - 2 : 0) }}
                                  >
                                    {indexLabel(displayScore)}/100
                                  </strong>
                                  <span className="text-[11px] text-[var(--muted)]">
                                    (cakupan {Math.round(displayCoverage * 100)}%)
                                  </span>
                                </div>
                                <span className="text-[11px] text-[var(--muted)] font-medium">
                                  ⚡ {termEvents.length} peristiwa berbukti
                                </span>
                              </div>

                              {/* 3-Pillar Splitter Breakdown Bar */}
                              <div className="mt-4 pt-3 border-t border-[var(--line)] grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                                <div className="flex items-center justify-between rounded-lg bg-[var(--bg)] px-2.5 py-1.5 border border-[var(--line)]">
                                  <span className="text-[var(--muted)]">🦅 Pancasila</span>
                                  <span className="font-bold tabular-nums" style={{ color: gSila && gSila.coverage > 0 ? scoreTextColor(gSila.score) : "var(--score-zero)" }}>
                                    {gSila && gSila.coverage > 0 ? `${Math.round(((gSila.score + 2) / 4) * 100)}` : "-"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-[var(--bg)] px-2.5 py-1.5 border border-[var(--line)]">
                                  <span className="text-[var(--muted)]">🏛️ Pembukaan</span>
                                  <span className="font-bold tabular-nums" style={{ color: gTujuan && gTujuan.coverage > 0 ? scoreTextColor(gTujuan.score) : "var(--score-zero)" }}>
                                    {gTujuan && gTujuan.coverage > 0 ? `${Math.round(((gTujuan.score + 2) / 4) * 100)}` : "-"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-[var(--bg)] px-2.5 py-1.5 border border-[var(--line)]">
                                  <span className="text-[var(--muted)]">⚖️ Norma UUD</span>
                                  <span className="font-bold tabular-nums" style={{ color: gStruktural && gStruktural.coverage > 0 ? scoreTextColor(gStruktural.score) : "var(--score-zero)" }}>
                                    {gStruktural && gStruktural.coverage > 0 ? `${Math.round(((gStruktural.score + 2) / 4) * 100)}` : "-"}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

