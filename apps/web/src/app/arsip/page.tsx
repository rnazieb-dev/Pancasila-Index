"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { dataset } from "@pancasila-index/data";

export default function ArsipPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const typeLabels: Record<string, { label: string; icon: string }> = {
    all: { label: "Semua Dokumen", icon: "📚" },
    "arsip-nasional": { label: "Khazanah ANRI & Naskah Sejarah", icon: "🏛️" },
    "undang-undang": { label: "Undang-Undang (UU)", icon: "📜" },
    "dokumen-mpr": { label: "Ketetapan & Risalah MPR", icon: "🏛️" },
    "putusan-mk": { label: "Putusan Mahkamah Konstitusi", icon: "⚖️" },
    "putusan-ma": { label: "Putusan Mahkamah Agung", icon: "⚖️" },
    "keppres": { label: "Keppres / Dekrit", icon: "📑" },
    "jurnal": { label: "Jurnal & Kajian Akademik", icon: "📖" },
  };

  const sources = dataset.sources;

  const filteredSources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sources.filter((src) => {
      if (selectedType !== "all" && src.type !== selectedType) {
        return false;
      }
      if (!q) return true;
      const matchesTitle = src.title_id.toLowerCase().includes(q);
      const matchesCitation = src.citation_id?.toLowerCase().includes(q);
      const matchesYear = src.year?.toString().includes(q);
      const matchesId = src.id.toLowerCase().includes(q);
      return matchesTitle || matchesCitation || matchesYear || matchesId;
    });
  }, [sources, selectedType, searchQuery]);

  const anriCount = sources.filter((s) => s.type === "arsip-nasional").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Navigation */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--muted)] mb-6">
        <Link href="/" className="hover:text-[var(--text)] transition">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <span className="text-[var(--text)]">Khazanah Arsip Nasional</span>
      </div>

      {/* Header */}
      <div className="border-b border-[var(--line)] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--acc-sky)]">
              <span>🏛️</span>
              <span>Arsip Nasional Republik Indonesia (ANRI) & Sumber Primer</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)] mt-1">
              Khazanah Arsip & Dokumen Hukum
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-3xl">
              Direktori sitasi dokumen primer otentik yang menjadi bukti empiris penilaian Pancasila Index: membedah risalah stenografis BPUPK 1945, kawat sandi PDRI 1948, risalah Konstituante 1957, naskah KAA 1955, hingga Naskah Komprehensif Perubahan UUD 1945 (Buku I–X).
            </p>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)]">
            <div className="text-xs text-[var(--muted)]">Total Sumber Primer Tersitasi:</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--acc-sky)]">
              {sources.length} <span className="text-xs font-normal text-[var(--muted)]">Dokumen</span>
            </div>
            <div className="text-[11px] text-[var(--acc-emerald)] font-semibold">
              ✓ Termasuk {anriCount} Naskah Arsip ANRI
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor arsip ANRI, judul undang-undang, risalah sidang, atau tahun..."
              className="w-full bg-[var(--panel)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-[var(--muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Type Filter Tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {Object.entries(typeLabels).map(([typeKey, { label, icon }]) => {
            const isActive = selectedType === typeKey;
            const count =
              typeKey === "all"
                ? sources.length
                : sources.filter((s) => s.type === typeKey).length;

            if (count === 0 && typeKey !== "all") return null;

            return (
              <button
                key={typeKey}
                onClick={() => setSelectedType(typeKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-[var(--acc-sky)] text-slate-950 shadow-sm"
                    : "bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400"
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Sources */}
      <div className="mt-8">
        <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-4">
          <span>Menampilkan {filteredSources.length} dokumen arsip hukum:</span>
          {selectedType !== "all" && (
            <button
              onClick={() => setSelectedType("all")}
              className="text-[var(--acc-sky)] hover:underline"
            >
              Tampilkan Semua
            </button>
          )}
        </div>

        {filteredSources.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-[var(--line)]">
            <p className="text-sm font-semibold text-[var(--muted)]">
              Tidak ditemukan arsip yang cocok dengan &quot;{searchQuery}&quot;.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSources.map((src) => {
              const href = src.resolved_url ?? src.url;
              const isAnri = src.type === "arsip-nasional";

              return (
                <div
                  key={src.id}
                  className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between space-y-3 transition hover:shadow-md ${
                    isAnri
                      ? "border-sky-500/40 bg-sky-500/5 hover:border-sky-400"
                      : "border-[var(--line)] bg-[var(--panel)] hover:border-slate-400"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isAnri
                            ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                            : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--line)]"
                        }`}
                      >
                        {src.type.replace("-", " ")}
                      </span>
                      {src.year && (
                        <span className="text-xs font-mono font-bold text-[var(--text)]">
                          {src.year}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-[var(--text)] leading-snug">
                      {src.title_id}
                    </h3>

                    {src.citation_id && (
                      <div className="text-[11px] text-[var(--muted)] bg-[var(--bg)] p-2 rounded-lg border border-[var(--line)]/60 font-mono">
                        <span className="text-[var(--text)] font-semibold">Sitasi / Register:</span>{" "}
                        {src.citation_id}
                      </div>
                    )}
                  </div>

                  {href && (
                    <div className="pt-2 border-t border-[var(--line)]/40 flex items-center justify-between">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--acc-sky)] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Buka Rujukan Dokumen</span>
                        <span>↗</span>
                      </a>
                      <span className="text-[10px] text-[var(--muted)] font-mono">{src.id}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Standar Verifikasi Arsip */}
      <div className="mt-14 p-6 rounded-2xl border border-[var(--line)] bg-[var(--panel)] space-y-3">
        <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
          <span>🏛️</span> Standar Validasi Dokumen Primer Pancasila Index
        </h3>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          Setiap skor penilaian dalam Pancasila Index wajib diverifikasi dengan dokumen primer berkekuatan hukum (Lembaran Negara, Risalah Parlemen, Naskah ANRI, Putusan Peradilan yang telah berkekuatan hukum tetap). Kami menolak ketergantungan pada klaim sepihak tanpa dukungan register naskah otentik.
        </p>
      </div>
    </div>
  );
}
