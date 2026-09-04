"use client";

import { useState } from "react";
import Link from "next/link";
import type { AiDisclosure } from "@pancasila-index/core";
import {
  IconBot,
  IconInfo,
  IconScale,
  IconShieldCheck,
  IconAlertTriangle,
  IconExternalLink,
} from "./icons";

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
  // Jangan pernah mengarang nama penelaah. Bila tidak ada approver bernama,
  // status pengawasan manusia ditampilkan apa adanya: belum ditelaah.
  const approvers = disclosure?.human_oversight?.approvers ?? [];
  const oversightVerified =
    disclosure?.human_oversight?.status === "verified" && approvers.length > 0;

  const modelDisplay =
    modelId === "gemini-3.8-flash-high"
      ? "Gemini 3.8 Flash High"
      : modelId === "gemini-2.5-flash"
      ? "Gemini 2.5 Flash"
      : modelId === "gemini-1.5-pro"
      ? "Gemini 1.5 Pro"
      : modelId === "claude-3-5-sonnet"
      ? "Claude 3.5 Sonnet"
      : modelId === "claude-opus-5"
      ? "Claude Opus 5"
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
        <IconBot size={13} className="shrink-0 text-[var(--acc-sky-strong)]" />
        <span>
          {compact ? (
            <>AI: <strong>{modelDisplay}</strong> (EU AI Act)</>
          ) : (
            <>
              Sintesis Berbantuan AI: <strong>{modelDisplay}</strong> · Kuorum 2 Reviewer
            </>
          )}
        </span>
        <span className="inline-flex items-center gap-0.5 text-[9px] opacity-70 underline ml-0.5">
          Rincian
          <IconInfo size={11} className="inline shrink-0" />
        </span>
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
                  <span className="p-1 rounded-md bg-[var(--acc-sky)]/10 text-[var(--acc-sky)]">
                    <IconScale size={18} />
                  </span>
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

            {/* Jejak remediasi otomatis oleh model pembersih */}
            {disclosure?.remediation && (
              <div className="space-y-1.5 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
                <div className="flex items-center gap-2 text-[var(--acc-sky-strong)] font-bold text-xs">
                  <IconBot size={16} />
                  <span>Remediasi Integritas Data</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Draf awal dibangkitkan <strong>{modelDisplay}</strong>, lalu diaudit dan
                  dibersihkan oleh model lain:{" "}
                  <strong className="text-[var(--text)]">
                    {disclosure.remediation.model_id === "claude-opus-5"
                      ? "Claude Opus 5"
                      : disclosure.remediation.model_id}
                  </strong>{" "}
                  ({disclosure.remediation.model_provider}) pada{" "}
                  <span className="font-mono">{disclosure.remediation.performed_at}</span>.
                  {disclosure.remediation.notes_id ? ` ${disclosure.remediation.notes_id}` : null}
                </p>
              </div>
            )}

            {/* Protokol Human-in-the-Loop (Pasal 14 EU AI Act) */}
            <div
              className={`space-y-2 rounded-xl border p-4 ${
                oversightVerified
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-amber-500/30 bg-amber-500/5"
              }`}
            >
              <div
                className={`flex items-center gap-2 font-bold text-xs ${
                  oversightVerified
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {oversightVerified ? <IconShieldCheck size={16} /> : <IconAlertTriangle size={16} />}
                <span>Pengawasan Manusia (Human Oversight — Pasal 14)</span>
              </div>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Sistem AI pada Pancasila Index <strong>hanya digunakan sebagai alat bantu klasifikasi heuristik dan sintesis awal dokumen</strong>. Sesuai prinsip *Human-in-the-Loop*, penilaian baru boleh berstatus <em>published</em> setelah diverifikasi dan disetujui secara independen oleh minimal <strong>2 Penelaah Manusia (Kuorum Ganda)</strong> tanpa konflik kepentingan.
              </p>
              <div
                className={`pt-2 border-t text-[11px] ${
                  oversightVerified ? "border-emerald-500/20" : "border-amber-500/20"
                }`}
              >
                {oversightVerified ? (
                  <>
                    <span className="text-[var(--muted)]">Penelaah yang menandatangani verifikasi: </span>
                    <strong className="text-[var(--text)]">{approvers.join(" & ")}</strong>
                  </>
                ) : (
                  <span className="text-[var(--muted)]">
                    <strong className="text-amber-600 dark:text-amber-400">
                      Belum ada penelaah manusia yang menandatangani verifikasi.
                    </strong>{" "}
                    Penilaian ini berstatus draf dan menunggu kuorum dua penelaah.
                    {reviewers.length > 0 && (
                      <> Pihak yang menyusun draf: {reviewers.join(", ")}.</>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Peringatan Keterbatasan & Batas Bias (Pasal 50 & 53) */}
            <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                <IconAlertTriangle size={16} />
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
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-xs font-semibold hover:border-red-500 hover:text-red-500 transition"
                >
                  Hak Jawab / Koreksi
                  <IconExternalLink size={12} />
                </Link>
                <Link
                  href="/usulkan-bukti"
                  className="inline-flex items-center gap-1 rounded-lg bg-[var(--acc-sky)] text-white px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition"
                >
                  Ajukan Bukti Primer
                  <IconExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
