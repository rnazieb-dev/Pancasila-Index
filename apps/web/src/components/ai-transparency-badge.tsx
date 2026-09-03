"use client";

import { useState } from "react";
import Link from "next/link";
import type { AiDisclosure } from "@pancasila-index/core";

interface Props {
  disclosure?: AiDisclosure;
  reviewers?: string[];
  compact?: boolean;
  className?: string;
}

export function AiTransparencyBadge({
  disclosure,
  reviewers = [],
  compact = false,
  className = "",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const modelId = disclosure?.model_id || "gemini-3.8-flash-high";
  const modelProvider = disclosure?.model_provider || "Google DeepMind";
  const pipelineVersion = disclosure?.pipeline_version || "pancasila-nlp-v1.5";
  const approvers =
    disclosure?.human_oversight?.approvers?.length
      ? disclosure.human_oversight.approvers
      : reviewers.length
      ? reviewers
      : ["Penelaah Terverifikasi 1", "Penelaah Terverifikasi 2"];

  const modelDisplay =
    modelId === "gemini-3.8-flash-high"
      ? "Gemini 3.8 Flash High"
      : modelId === "gemini-2.5-flash"
      ? "Gemini 2.5 Flash"
      : modelId === "gemini-1.5-pro"
      ? "Gemini 1.5 Pro"
      : modelId === "claude-3-5-sonnet"
      ? "Claude 3.5 Sonnet"
      : modelId;

  return (
    <>
      {/* Tombol / Lencana Interaktif */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Klik untuk melihat lembar transparansi kepatuhan EU AI Act Pasal 50"
        className={`inline-flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--acc-sky-strong)] hover:border-sky-400 hover:bg-sky-500/20 transition cursor-pointer text-left ${className}`}
      >
        <span>🤖</span>
        <span>
          {compact ? (
            <>AI: <strong>{modelDisplay}</strong> (EU AI Act)</>
          ) : (
            <>
              Sintesis Berbantuan AI: <strong>{modelDisplay}</strong> · Kuorum 2 Reviewer
            </>
          )}
        </span>
        <span className="text-[9px] opacity-70 underline ml-0.5">Rincian ℹ️</span>
      </button>

      {/* Modal Dialog Transparansi Kepatuhan EU AI Act */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border-2 border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl space-y-5 text-xs text-[var(--text)] leading-relaxed max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-[var(--line)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚖️</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--acc-sky)]">
                    Kepatuhan Regulasi EU AI Act (Pasal 50 &amp; 14)
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[var(--text)] mt-1">
                  Transparansi Sistem AI &amp; Akuntabilitas Ilmiah
                </h3>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Deklarasi terbuka atas pemanfaatan kecerdasan buatan dalam audit konstitusional Pancasila Index.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="size-7 rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-center justify-center text-sm font-bold text-[var(--muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>

            {/* Grid Spesifikasi Teknis */}
            <div className="grid grid-cols-2 gap-2.5 bg-[var(--bg)] p-3.5 rounded-xl border border-[var(--line)]">
              <div>
                <span className="text-[10px] uppercase text-[var(--muted)] block">Model AI Utama</span>
                <strong className="text-sm text-[var(--text)]">{modelDisplay}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[var(--muted)] block">Penyedia / Pengembang</span>
                <strong className="text-sm text-[var(--text)]">{modelProvider}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[var(--muted)] block">Pipeline &amp; Parser</span>
                <span className="font-mono text-xs text-[var(--acc-sky)]">{pipelineVersion}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[var(--muted)] block">Status Regulasi</span>
                <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                  EU AI Act Art. 50 Compliant
                </span>
              </div>
            </div>

            {/* Protokol Human-in-the-Loop (Pasal 14 EU AI Act) */}
            <div className="space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <span>🛡️</span>
                <span>Pengawasan Manusia (Human Oversight — Pasal 14)</span>
              </div>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Sistem AI pada Pancasila Index <strong>hanya digunakan sebagai alat bantu klasifikasi heuristik dan sintesis awal dokumen</strong>. Sesuai prinsip *Human-in-the-Loop*, tidak ada skor atau analisis yang diterbitkan secara otonom. Setiap penilaian wajib diverifikasi dan disetujui secara independen oleh minimal <strong>2 Penelaah Manusia (Kuorum Ganda)</strong> tanpa konflik kepentingan.
              </p>
              <div className="pt-2 border-t border-emerald-500/20 text-[11px]">
                <span className="text-[var(--muted)]">Penelaah yang menandatangani verifikasi: </span>
                <strong className="text-[var(--text)]">{approvers.join(" & ")}</strong>
              </div>
            </div>

            {/* Peringatan Keterbatasan & Batas Bias (Pasal 50 & 53) */}
            <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                <span>⚠️</span>
                <span>Batasan Reliabilitas &amp; Pencegahan Halusinasi</span>
              </div>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                {disclosure?.limitations_notice ||
                  "Model pembelajaran mesin dapat mengalami bias pelatihan atau menyederhanakan kompleksitas penegakan hukum tata negara. Tolok ukur kebenaran kanonik hanya berada pada dokumen primer hukum (Lembaran Negara RI, Putusan Mahkamah Konstitusi/Agung, dan Laporan Hasil Pemeriksaan BPK) yang disitasi langsung pada setiap butir penilaian."}
              </p>
            </div>

            {/* Hak Jawab, Komplain & Jalur Koreksi (Redress Mechanism) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
              <p className="text-[10px] text-[var(--muted)] max-w-xs">
                Menemukan ketidaktepatan sintesis AI atau ingin melampirkan dokumen primer tandingan?
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href="/koreksi"
                  className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-xs font-semibold hover:border-red-500 hover:text-red-500 transition"
                >
                  Hak Jawab / Koreksi ↗
                </Link>
                <Link
                  href="/usulkan-bukti"
                  className="rounded-lg bg-[var(--acc-sky)] text-white px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition"
                >
                  Ajukan Bukti Primer ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
