"use client";

import { useState } from "react";
import { dataset } from "@pancasila-index/data";

export default function EksporPage() {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Helper untuk mengubah array of objects menjadi CSV string
  const generateCsv = (type: "events" | "assessments" | "sources" | "institutions") => {
    if (type === "events") {
      const headers = ["id", "term_id", "date", "category", "title_id", "summary_id", "dimension_ids", "source_ids"];
      const rows = dataset.events.map((e) => [
        `"${e.id}"`,
        `"${e.term_id}"`,
        `"${e.date}"`,
        `"${e.category}"`,
        `"${e.title_id.replace(/"/g, '""')}"`,
        `"${e.summary_id.replace(/"/g, '""')}"`,
        `"${e.dimension_ids.join(";")}"`,
        `"${e.source_ids.join(";")}"`,
      ]);
      return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    if (type === "assessments") {
      const headers = ["assessment_id", "term_id", "status", "dimension_id", "score", "confidence", "rationale_id", "evidence_count"];
      const rows = dataset.assessments.flatMap((a) =>
        a.dimension_scores.map((ds) => [
          `"${a.id}"`,
          `"${a.term_id}"`,
          `"${a.status}"`,
          `"${ds.dimension_id}"`,
          ds.score,
          ds.confidence,
          `"${ds.rationale_id.replace(/"/g, '""')}"`,
          ds.evidence.length,
        ])
      );
      return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    if (type === "sources") {
      const headers = ["id", "type", "title_id", "year", "citation_id", "resolved_url"];
      const rows = dataset.sources.map((s) => [
        `"${s.id}"`,
        `"${s.type}"`,
        `"${s.title_id.replace(/"/g, '""')}"`,
        s.year ?? "",
        `"${(s.citation_id ?? "").replace(/"/g, '""')}"`,
        `"${s.resolved_url ?? s.url ?? ""}"`,
      ]);
      return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    if (type === "institutions") {
      const headers = ["id", "slug", "branch", "name_id", "short_id", "description_id"];
      const rows = dataset.institutions.map((i) => [
        `"${i.id}"`,
        `"${i.slug}"`,
        `"${i.branch}"`,
        `"${i.name_id.replace(/"/g, '""')}"`,
        `"${i.short_id}"`,
        `"${i.description_id.replace(/"/g, '""')}"`,
      ]);
      return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    return "";
  };

  const handleDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (type: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">Ekspor & Data Terbuka</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          Unduh seluruh dataset Pancasila Index dalam format terstruktur CSV atau JSON untuk riset, analisis data, dan visualisasi independen.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* 1. Dataset Lengkap JSON */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-[var(--acc-sky)] font-bold">Format JSON</span>
              <span className="text-xs text-[var(--muted)]">~250 KB</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text)] mt-1">Dataset Kanonik Lengkap</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
              Berisi seluruh objek data: 8 lembaga, 45 masa jabatan, {dataset.events.length} peristiwa, {dataset.sources.length} sumber primer, {dataset.assessments.length} lembar penilaian, dan peta 73 pasal UUD 1945.
            </p>
          </div>
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => handleDownload("pancasila-index-dataset.json", JSON.stringify(dataset, null, 2), "application/json")}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition text-center shadow"
            >
              📥 Unduh JSON
            </button>
            <button
              onClick={() => handleCopy("json", JSON.stringify(dataset, null, 2))}
              className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-500 transition"
            >
              {copiedType === "json" ? "✓ Tersalin" : "Salin"}
            </button>
          </div>
        </div>

        {/* 2. Peristiwa CSV */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-[var(--acc-emerald)] font-bold">Format CSV</span>
              <span className="text-xs text-[var(--muted)]">{dataset.events.length} baris</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text)] mt-1">Tabel Peristiwa Berbukti (Events)</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
              Daftar kronologis peristiwa hukum, kebijakan, dan dinamika ketatanegaraan beserta tanggal, kategori, ringkasan, dan tautan dimensi/sumber.
            </p>
          </div>
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => handleDownload("events.csv", generateCsv("events"), "text/csv")}
              className="flex-1 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600 transition text-center shadow"
            >
              📥 Unduh CSV Peristiwa
            </button>
            <button
              onClick={() => handleCopy("events", generateCsv("events"))}
              className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-500 transition"
            >
              {copiedType === "events" ? "✓ Tersalin" : "Salin"}
            </button>
          </div>
        </div>

        {/* 3. Penilaian CSV */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-[var(--acc-amber)] font-bold">Format CSV</span>
              <span className="text-xs text-[var(--muted)]">{dataset.assessments.length} lembar</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text)] mt-1">Tabel Skor Penilaian (Assessments)</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
              Rincian skor dimensi (-2 .. +2), rasional penilaian, tingkat keyakinan, dan jumlah bukti empiris per periode kepemimpinan lembaga.
            </p>
          </div>
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => handleDownload("assessments.csv", generateCsv("assessments"), "text/csv")}
              className="flex-1 rounded-lg bg-amber-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-600 transition text-center shadow"
            >
              📥 Unduh CSV Skor
            </button>
            <button
              onClick={() => handleCopy("assessments", generateCsv("assessments"))}
              className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-500 transition"
            >
              {copiedType === "assessments" ? "✓ Tersalin" : "Salin"}
            </button>
          </div>
        </div>

        {/* 4. Sumber Primer CSV */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-[var(--acc-purple)] font-bold">Format CSV</span>
              <span className="text-xs text-[var(--muted)]">{dataset.sources.length} instrumen</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text)] mt-1">Tabel Sumber Primer & Sitasi</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
              Koleksi instrumen hukum, UU, Putusan MK, Putusan MA, TAP MPR, dan arsip resmi lengkap dengan nomor lembaran negara dan URL rujukan JDIH/BPK.
            </p>
          </div>
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => handleDownload("sources.csv", generateCsv("sources"), "text/csv")}
              className="flex-1 rounded-lg bg-purple-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-purple-600 transition text-center shadow"
            >
              📥 Unduh CSV Sumber
            </button>
            <button
              onClick={() => handleCopy("sources", generateCsv("sources"))}
              className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-500 transition"
            >
              {copiedType === "sources" ? "✓ Tersalin" : "Salin"}
            </button>
          </div>
        </div>
      </div>

      {/* Lisensi Terbuka */}
      <section className="mt-12 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <h3 className="text-base font-bold text-[var(--text)]">Lisensi Data Terbuka</h3>
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
          Seluruh data yang dipublikasikan di Pancasila Index dilisensikan di bawah{" "}
          <strong className="text-[var(--text)]">Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</strong>.
          Kode sumber platform berlisensi <strong className="text-[var(--text)]">AGPL-3.0</strong>. Anda bebas mengutip,
          mengolah ulang, dan mendistribusikan dataset ini untuk keperluan akademis, jurnalistik, maupun edukasi publik dengan mencantumkan atribusi ke Pancasila Index.
        </p>
      </section>
    </div>
  );
}
