"use client";

import { useState } from "react";
import type { ExternalIndex, Term } from "@pancasila-index/core";

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

export function ExternalIndicesWidget({
  term,
  indices,
  earliestAvailableYear,
}: Props) {
  const [selectedIdxId, setSelectedIdxId] = useState<string | null>(null);

  // Rentang tahun dari term
  const startYear = parseInt(term.start_date.slice(0, 4), 10);
  const endYear = term.end_date ? parseInt(term.end_date.slice(0, 4), 10) : new Date().getFullYear();
  const isShortTransition = endYear - startYear <= 2;

  const relevantIndices = indices
    .map((idx) => {
      const displayPoints = idx.data;
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

      return { ...idx, displayPoints, avgScore, unverified };
    })
    .filter((idx) => idx.displayPoints.length > 0);

  /*
    Tidak ada indeks eksternal yang mencakup periode ini. Dinyatakan secara jujur:
    ketiadaan korroborasi independen untuk sebuah era adalah keterangan historis yang
    relevan mengapa penilaian era tersebut bersandar murni pada sumber hukum primer.
  */
  if (relevantIndices.length === 0) {
    const awal = earliestAvailableYear;
    return (
      <section className="mt-12 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)]/40 p-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🌐</span>
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
      label: "Survei Masyarakat Sipil",
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
    <section className="mt-14 rounded-2xl border border-[var(--acc-sky)]/30 bg-[var(--panel)] p-6 space-y-6">
      {/* Header Widget */}
      <div className="border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">🌐</span>
          <span className="text-xs uppercase tracking-wider text-[var(--acc-sky)] font-bold">
            Konteks Independen Global (Enrichment)
          </span>
        </div>
        <h2 className="text-xl font-bold text-[var(--text)] mt-1">
          Indikator Integritas & Demokrasi Independen (Tahun Kalender {startYear}–{term.end_date ? endYear : "Kini"})
        </h2>
        <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed max-w-3xl">
          Tolok ukur independen pihak ketiga yang terbit pada rentang tahun masa jabatan ini. Data ini disajikan sebagai pembanding eksternal terhadap bukti hukum primer.
        </p>

        {/* Catatan Khusus Masa Transisi Singkat */}
        {isShortTransition && (
          <div className="mt-3 inline-flex items-start gap-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] p-3 text-[11px] text-[var(--muted)] leading-relaxed">
            <span className="text-amber-400 font-bold shrink-0">ℹ️</span>
            <span>
              <strong>Catatan Periode Kalender:</strong> Indeks internasional dirilis tahunan (Jan–Des). Untuk masa jabatan transisi ({term.label_id}), angka kalender tahun {startYear} dan {endYear} merefleksikan peristiwa transisi kepemimpinan nasional.
            </span>
          </div>
        )}
      </div>

      {/* Grid Kartu Indeks */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {relevantIndices.map((idx) => {
          const typeBadge = typeLabels[idx.type] ?? {
            label: "Indeks Independen",
            bg: "bg-sky-500/10 border-sky-500/30",
            text: "text-[var(--acc-sky)]",
          };

          return (
            <div
              key={idx.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[var(--line)] pb-3">
                <div>
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold ${typeBadge.bg} ${typeBadge.text}`}
                  >
                    {typeBadge.label}
                  </span>
                  <h3 className="font-bold text-base text-[var(--text)] mt-1.5">{idx.name}</h3>
                  <p className="text-[11px] text-[var(--muted)]">{idx.publisher}</p>
                </div>

                <a
                  href={idx.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1 text-[11px] text-[var(--acc-sky)] hover:border-sky-500 hover:underline shrink-0"
                >
                  Sumber Resmi ↗
                </a>
              </div>

              {/* Rerata & Skala */}
              <div className="flex items-center justify-between rounded-lg bg-[var(--panel)] px-3.5 py-2 text-xs border border-[var(--line)]">
                <span className="text-[var(--muted)] font-medium">
                  Rerata Periode ({startYear}–{endYear}):
                </span>
                <span className="font-extrabold text-sm text-[var(--acc-sky-strong)] tabular-nums">
                  {idx.avgScore ?? "—"}{" "}
                  <span className="text-[10px] font-normal text-[var(--muted)]">/ {idx.scale.split(" ")[0]}</span>
                </span>
              </div>

              {/* Rincian Titik Data per Tahun & Catatan Historis Kontekstual */}
              <div className="space-y-2.5">
                <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">
                  Titik Data Tahun Kalender ({idx.displayPoints.length} tahun tercakup):
                </div>

                <div className="space-y-2">
                  {idx.displayPoints.map((p) => {
                    const prov = p.provenance;
                    return (
                      <div
                        key={p.year}
                        className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-2.5 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-[var(--text)]">Tahun {p.year}</span>
                          <div className="flex items-center gap-2">
                            {p.rank && (
                              <span className="text-[10px] text-[var(--muted)]">
                                Peringkat #{p.rank}{p.total_countries ? `/${p.total_countries}` : ""}
                              </span>
                            )}
                            <span className="rounded bg-sky-500/15 px-2 py-0.5 font-bold text-[var(--acc-sky-strong)]">
                              Skor {p.score ?? "—"}
                            </span>
                          </div>
                        </div>

                        {/* Catatan Kontekstual Era Ini */}
                        {p.note && (
                          <p className="text-[11px] text-[var(--muted)] leading-relaxed pt-0.5">
                            📌 {p.note}
                          </p>
                        )}

                        {prov && (
                          <div className="text-[10px] text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--line)]">
                            <span className="truncate max-w-[200px]">Metode: {prov.method}</span>
                            <a
                              href={prov.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[var(--acc-sky)] hover:underline truncate max-w-[150px]"
                            >
                              Arsip Dokumen ↗
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
