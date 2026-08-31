"use client";

import { useState } from "react";
import Link from "next/link";

interface TermActionsProps {
  termId: string;
  institutionSlug: string;
  termLabel: string;
}

export function TermActions({ termId, institutionSlug, termLabel }: TermActionsProps) {
  const [showEmbed, setShowEmbed] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe src="https://pancasila.site/embed/term/${termId}" width="100%" height="420" frameborder="0" style="border-radius: 16px; max-width: 480px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></iframe>`;

  const copyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2.5 print:hidden">
      {/* Tombol Cetak / PDF */}
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400 transition"
      >
        <span>🖨️</span>
        <span>Cetak Lembar Fakta (PDF)</span>
      </button>

      {/* Tombol Kode Semat */}
      <button
        onClick={() => setShowEmbed(!showEmbed)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-400 transition"
      >
        <span>🔗</span>
        <span>Sematkan Widget (Embed)</span>
      </button>

      {/* Tombol Usulkan Bukti */}
      <Link
        href={`/usulkan-bukti?masa=${termId}`}
        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:border-emerald-400 transition"
      >
        <span>➕</span>
        <span>Usulkan Bukti Baru</span>
      </Link>

      {/* Modal / Panel Popover Embed Code */}
      {showEmbed && (
        <div className="w-full mt-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-xl text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--text)]">Kode Semat Widget Iframe:</span>
            <button
              onClick={() => setShowEmbed(false)}
              className="text-[var(--muted)] hover:text-[var(--text)]"
            >
              ✕
            </button>
          </div>
          <p className="text-[var(--muted)] text-[11px]">
            Salin kode HTML di bawah untuk menyematkan skor dan sorotan bukti {termLabel} di portal berita atau blog Anda.
          </p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-xl bg-[var(--bg)] p-3 font-mono text-[11px] text-[var(--muted)] border border-[var(--line)]">
              {embedCode}
            </pre>
          </div>
          <div className="flex items-center justify-between">
            <a
              href={`/embed/term/${termId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[var(--acc-sky)] hover:underline"
            >
              Pratinjau Widget Standalone ↗
            </a>
            <button
              onClick={copyEmbed}
              className="rounded-lg bg-[var(--acc-red)] px-3 py-1 text-xs font-bold text-white shadow hover:opacity-90 transition"
            >
              {copied ? "✓ Tersalin!" : "Salin Kode HTML"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
