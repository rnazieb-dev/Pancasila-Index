"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { dataset } from "@pancasila-index/data";
import {
  IconArchive,
  IconGlobe,
  IconHistory,
  IconInstitution,
  IconScale,
  IconFilePlus,
  IconAuditLog,
  IconSearch,
  IconShieldCheck,
} from "@/components/icons";

type SourceItem = (typeof dataset.sources)[number];

interface ClusterDef {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  match: (src: SourceItem) => boolean;
}

const CLUSTERS: Record<string, ClusterDef> = {
  all: {
    label: "Semua Dokumen",
    icon: IconArchive,
    match: () => true,
  },
  oposisi: {
    label: "Oposisi & Rekonsiliasi",
    icon: IconShieldCheck,
    match: (s: SourceItem) =>
      s.id.includes("nii") ||
      s.id.includes("pki") ||
      s.id.includes("mahmillub") ||
      s.id.includes("prri") ||
      s.id.includes("permesta") ||
      s.id.includes("gam") ||
      s.id.includes("helsinki") ||
      s.id.includes("papua") ||
      s.id.includes("pepera") ||
      s.id.includes("rms") ||
      s.id.includes("petisi-50") ||
      s.title_id.toLowerCase().includes("oposisi") ||
      s.title_id.toLowerCase().includes("pemberontakan") ||
      s.title_id.toLowerCase().includes("perlawanan") ||
      s.title_id.toLowerCase().includes("rekonsiliasi") ||
      s.title_id.toLowerCase().includes("amnesti"),
  },
  internasional: {
    label: "Repositori Internasional",
    icon: IconGlobe,
    match: (s: SourceItem) =>
      s.id.startsWith("nanl-") ||
      s.id.startsWith("iisg-") ||
      s.id.startsWith("kitlv-") ||
      s.id.startsWith("un-") ||
      s.id.startsWith("cmi-") ||
      Boolean(s.citation_id?.includes("Nationaal Archief")) ||
      Boolean(s.citation_id?.includes("IISG")) ||
      Boolean(s.citation_id?.includes("KITLV")) ||
      Boolean(s.citation_id?.includes("United Nations")) ||
      Boolean(s.citation_id?.includes("CMI")) ||
      Boolean(s.citation_id?.includes("Cornell")),
  },
  anri: {
    label: "Khazanah ANRI & PPKI",
    icon: IconArchive,
    match: (s: SourceItem) =>
      s.type === "arsip-nasional" &&
      !s.id.startsWith("nanl-") &&
      !s.id.startsWith("iisg-") &&
      !s.id.startsWith("un-") &&
      !s.id.startsWith("cmi-"),
  },
  uu: {
    label: "Undang-Undang (UU)",
    icon: IconHistory,
    match: (s: SourceItem) => s.type === "undang-undang" || s.type === "perppu",
  },
  mpr: {
    label: "Ketetapan & Risalah MPR",
    icon: IconInstitution,
    match: (s: SourceItem) => s.type === "dokumen-mpr",
  },
  mk: {
    label: "Putusan Mahkamah Konstitusi",
    icon: IconScale,
    match: (s: SourceItem) => s.type === "putusan-mk",
  },
  ma: {
    label: "Putusan Mahkamah Agung",
    icon: IconScale,
    match: (s: SourceItem) => s.type === "putusan-ma",
  },
  keppres: {
    label: "Keppres / Dekrit",
    icon: IconAuditLog,
    match: (s: SourceItem) => s.type === "keppres",
  },
};

export default function ArsipPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCluster, setSelectedCluster] = useState<string>("all");

  const sources = dataset.sources;

  const filteredSources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const activeCluster: ClusterDef = CLUSTERS[selectedCluster] ?? CLUSTERS.all ?? { label: "Semua", icon: IconArchive, match: () => true };

    return sources.filter((src) => {
      if (!activeCluster.match(src)) {
        return false;
      }
      if (!q) return true;
      const matchesTitle = src.title_id.toLowerCase().includes(q);
      const matchesCitation = src.citation_id?.toLowerCase().includes(q) ?? false;
      const matchesYear = src.year?.toString().includes(q) ?? false;
      const matchesId = src.id.toLowerCase().includes(q);
      return matchesTitle || matchesCitation || matchesYear || matchesId;
    });
  }, [sources, selectedCluster, searchQuery]);

  const getRepositoryBadge = (src: SourceItem) => {
    if (src.id.startsWith("nanl-") || src.citation_id?.includes("Nationaal Archief")) {
      return { name: "Nationaal Archief NL (Den Haag)", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    }
    if (src.id.startsWith("iisg-") || src.citation_id?.includes("IISG")) {
      return { name: "IISG (IISH Amsterdam)", color: "bg-red-500/20 text-red-400 border-red-500/30" };
    }
    if (src.id.startsWith("kitlv-") || src.citation_id?.includes("KITLV")) {
      return { name: "KITLV / Univ. Leiden", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    }
    if (src.id.startsWith("un-") || src.citation_id?.includes("United Nations")) {
      return { name: "United Nations Treaty Archives", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" };
    }
    if (src.id.startsWith("cmi-") || src.citation_id?.includes("CMI")) {
      return { name: "CMI Martti Ahtisaari Foundation", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
    }
    if (src.type === "arsip-nasional" || src.citation_id?.includes("ANRI")) {
      return { name: "Arsip Nasional RI (ANRI)", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" };
    }
    return null;
  };

  const oposisiCount = sources.filter((s) => CLUSTERS["oposisi"]?.match(s) ?? false).length;
  const intlCount = sources.filter((s) => CLUSTERS["internasional"]?.match(s) ?? false).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Navigation */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--muted)] mb-6">
        <Link href="/" className="hover:text-[var(--text)] transition">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <span className="text-[var(--text)]">Khazanah Arsip & Dokumen Hukum</span>
      </div>

      {/* Header */}
      <div className="border-b border-[var(--line)] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--acc-sky)]">
              <IconArchive size={16} />
              <span>Arsip Nasional (ANRI), Repositori Internasional & Dokumen Oposisi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)] mt-1">
              Khazanah Arsip Konstitusi & Oposisi
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-3xl">
              Direktori sitasi dokumen primer otentik: membedah risalah stenografis PPKI 18–22 Agustus 1945, naskah Proklamasi & Qanun Asasi NII 1949, resolusi PKI & notulen Mahmillub 1966, piagam PRRI/Permesta 1957–1958, Deklarasi GAM & MoU Helsinki 2005, Manifesto Papua & PEPERA 1969, hingga dokumen Petisi 50 (1980) dari repositori ANRI, Nationaal Archief Nederland, IISG Amsterdam, KITLV Leiden, UN Archives, dan CMI Helsinki.
            </p>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)]">
            <div className="text-xs text-[var(--muted)]">Total Sumber Primer Tersitasi:</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--acc-sky)]">
              {sources.length} <span className="text-xs font-normal text-[var(--muted)]">Dokumen</span>
            </div>
            <div className="text-[11px] text-[var(--acc-emerald)] font-semibold">
              ✓ {oposisiCount} Dokumen Oposisi &bull; {intlCount} Repositori Internasional
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-8 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari naskah NII, risalah PPKI, Permesta, PRRI, GAM, PKI Mahmillub, Petisi 50, nomor ANRI..."
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

        {/* Cluster Filter Tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {Object.entries(CLUSTERS).map(([clusterKey, config]) => {
            const isActive = selectedCluster === clusterKey;
            const count = sources.filter((s) => config.match(s)).length;
            const Icon = config.icon;

            if (count === 0 && clusterKey !== "all") return null;

            return (
              <button
                key={clusterKey}
                onClick={() => setSelectedCluster(clusterKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-sky-600 dark:bg-sky-600 text-white font-bold shadow-md ring-1 ring-sky-400"
                    : "bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400"
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <span>{config.label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Sources */}
      <div className="mt-8">
        <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-4">
          <span>Menampilkan {filteredSources.length} dokumen arsip hukum & perlawanan:</span>
          {selectedCluster !== "all" && (
            <button
              onClick={() => setSelectedCluster("all")}
              className="text-[var(--acc-sky)] hover:underline"
            >
              Tampilkan Semua
            </button>
          )}
        </div>

        {filteredSources.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-[var(--line)]">
            <p className="text-sm font-semibold text-[var(--muted)]">
              Tidak ditemukan arsip yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSources.map((src) => {
              const href = src.detail_url ?? src.resolved_url ?? src.url;
              const repoBadge = getRepositoryBadge(src);
              const isOpposition = CLUSTERS["oposisi"]?.match(src) ?? false;

              return (
                <div
                  key={src.id}
                  className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between space-y-3 transition hover:shadow-md ${
                    isOpposition
                      ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-400"
                      : src.type === "arsip-nasional"
                      ? "border-sky-500/40 bg-sky-500/5 hover:border-sky-400"
                      : "border-[var(--line)] bg-[var(--panel)] hover:border-slate-400"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isOpposition
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : src.type === "arsip-nasional"
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

                    {repoBadge && (
                      <div className="pt-1">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${repoBadge.color}`}>
                          {repoBadge.name}
                        </span>
                      </div>
                    )}

                    {src.citation_id && (
                      <div className="text-[11px] text-[var(--muted)] bg-[var(--bg)] p-2 rounded-lg border border-[var(--line)]/60 font-mono">
                        <span className="text-[var(--text)] font-semibold">Sitasi / Register:</span>{" "}
                        {src.citation_id}
                      </div>
                    )}
                  </div>

                  {href && (
                    <div className="pt-2 border-t border-[var(--line)]/40 flex items-center justify-between">
                      {href.startsWith("/") ? (
                        <Link
                          href={href}
                          className="text-xs text-[var(--acc-sky)] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Lihat Halaman Dokumen</span>
                          <span>↗</span>
                        </Link>
                      ) : (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--acc-sky)] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Buka Repositori Naskah</span>
                          <span>↗</span>
                        </a>
                      )}
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
          <IconInstitution size={18} className="text-[var(--acc-sky)]" />
          <span>Standar Validasi Dokumen Primer & Khazanah Oposisi</span>
        </h3>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          Pancasila Index memegang prinsip integritas historiografi ilmiah: menilai kesetiaan konstitusi tidak hanya dari narasi pemenang kekuasaan, melainkan juga menelaah naskah perlawanan dan konsensus rekonsiliasi yang tersimpan dalam arsip nasional dan perpustakaan internasional independen (Nationaal Archief Den Haag, IISG Amsterdam, KITLV Leiden, PBB, dan CMI Helsinki).
        </p>
      </div>
    </div>
  );
}
