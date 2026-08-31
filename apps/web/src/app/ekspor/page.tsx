"use client";

import { useState } from "react";
import { dataset } from "@pancasila-index/data";
import { useLocale } from "@/components/locale-provider";
import { pickI18n } from "@/lib/i18n";

export default function EksporPage() {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const { t, locale } = useLocale();

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
      // evidence_gap & normative_anchors_count ikut diekspor: tanpa keduanya,
      // pengunduh tidak bisa tahu skor mana yang DIKELUARKAN dari indeks
      // karena belum berbukti, dan akan salah merekonstruksi angkanya.
      const headers = ["assessment_id", "term_id", "status", "dimension_id", "score", "confidence", "rationale_id", "evidence_count", "evidence_gap", "normative_anchors_count", "counted_in_index"];
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
          ds.evidence_gap === true,
          (ds.normative_anchors ?? []).length,
          !(ds.evidence_gap === true || ds.evidence.length === 0),
        ])
      );
      return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    if (type === "sources") {
      const headers = ["id", "type", "title_id", "year", "citation_id", "detail_url", "archive_url", "resolved_url"];
      const rows = dataset.sources.map((s) => [
        `"${s.id}"`,
        `"${s.type}"`,
        `"${s.title_id.replace(/"/g, '""')}"`,
        s.year ?? "",
        `"${(s.citation_id ?? "").replace(/"/g, '""')}"`,
        `"${s.detail_url ?? ""}"`,
        `"${s.archive_url ?? ""}"`,
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
        <h1 className="text-3xl font-bold">{t("exportPageTitle")}</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          {t("exportPageSubtitle")}
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* 1. Dataset Lengkap JSON */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-[var(--acc-sky)] font-bold">{t("exportFormatJson")}</span>
              <span className="text-xs text-[var(--muted)]">~250 KB</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text)] mt-1">{t("exportCardJsonTitle")}</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
              Berisi seluruh objek data: 8 lembaga, 50 masa jabatan, {dataset.events.length} {t("eventsLabel")}, {dataset.sources.length} {t("sourcesLabel")}, {dataset.assessments.length} lembar penilaian, dan peta 37 pasal UUD 1945.
            </p>
          </div>
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => handleDownload("pancasila-index-dataset.json", JSON.stringify(dataset, null, 2), "application/json")}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition text-center shadow"
            >
              {t("exportDownloadJson")}
            </button>
            <button
              onClick={() => handleCopy("json", JSON.stringify(dataset, null, 2))}
              className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-500 transition"
            >
              {copiedType === "json" ? t("exportCopied") : t("exportCopy")}
            </button>
          </div>
        </div>

        {/* 2. Peristiwa CSV */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-[var(--acc-emerald)] font-bold">{t("exportFormatCsv")}</span>
              <span className="text-xs text-[var(--muted)]">{dataset.events.length} baris</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text)] mt-1">{t("exportCardEventsTitle")}</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
              Daftar kronologis peristiwa hukum, kebijakan, dan dinamika ketatanegaraan beserta tanggal, kategori, ringkasan, dan tautan dimensi/sumber.
            </p>
          </div>
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => handleDownload("events.csv", generateCsv("events"), "text/csv")}
              className="flex-1 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600 transition text-center shadow"
            >
              {t("exportDownloadCsvEvents")}
            </button>
            <button
              onClick={() => handleCopy("events", generateCsv("events"))}
              className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-500 transition"
            >
              {copiedType === "events" ? t("exportCopied") : t("exportCopy")}
            </button>
          </div>
        </div>

        {/* 3. Penilaian CSV */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-[var(--acc-amber)] font-bold">{t("exportFormatCsv")}</span>
              <span className="text-xs text-[var(--muted)]">{dataset.assessments.length} lembar</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text)] mt-1">{t("exportCardAssessTitle")}</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
              Rincian skor dimensi (-2 .. +2), rasional penilaian, tingkat keyakinan, dan jumlah bukti empiris per periode kepemimpinan lembaga.
            </p>
          </div>
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => handleDownload("assessments.csv", generateCsv("assessments"), "text/csv")}
              className="flex-1 rounded-lg bg-amber-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-600 transition text-center shadow"
            >
              {t("exportDownloadCsvAssess")}
            </button>
            <button
              onClick={() => handleCopy("assessments", generateCsv("assessments"))}
              className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-500 transition"
            >
              {copiedType === "assessments" ? t("exportCopied") : t("exportCopy")}
            </button>
          </div>
        </div>


        {/* 5. Audit Data Terbuka CKAN */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-emerald-500 font-bold">{t("exportCkanLabel")}</span>
              <span className="text-xs text-[var(--muted)]">{t("exportFormatApi")}</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text)] mt-1">{t("exportCardCkanTitle")}</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
              Koleksi hasil audit kritis atas dataset resmi kementerian/lembaga yang telah lolos pengujian independen melalui kuorum 2 peninjau.
            </p>
          </div>
          <div className="flex gap-2 pt-3">
            <a
              href="/api/v1/ckan-audits?status=published"
              target="_blank"
              rel="noreferrer"
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition text-center shadow"
            >
              Buka REST API v1
            </a>
          </div>
        </div>


        {/* 4. Sumber Primer CSV */}
        <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-[var(--acc-purple)] font-bold">{t("exportFormatCsv")}</span>
              <span className="text-xs text-[var(--muted)]">{dataset.sources.length} instrumen</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text)] mt-1">{t("exportCardSourcesTitle")}</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
              Koleksi instrumen hukum, UU, Putusan MK, Putusan MA, TAP MPR, dan arsip resmi lengkap dengan nomor lembaran negara dan URL rujukan JDIH/BPK.
            </p>
          </div>
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => handleDownload("sources.csv", generateCsv("sources"), "text/csv")}
              className="flex-1 rounded-lg bg-purple-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-purple-600 transition text-center shadow"
            >
              {t("exportDownloadCsvSources")}
            </button>
            <button
              onClick={() => handleCopy("sources", generateCsv("sources"))}
              className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-500 transition"
            >
              {copiedType === "sources" ? t("exportCopied") : t("exportCopy")}
            </button>
          </div>
        </div>
      </div>

      {/* Lisensi Terbuka */}
      <section className="mt-12 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-6">
        <h3 className="text-base font-bold text-[var(--text)]">{t("exportLicenseTitle")}</h3>
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
          {t("exportLicenseBody")}{" "}
          <strong className="text-[var(--text)]">Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</strong>.{" "}
          {t("exportLicenseCode")}
        </p>
      </section>
    </div>
  );
}
