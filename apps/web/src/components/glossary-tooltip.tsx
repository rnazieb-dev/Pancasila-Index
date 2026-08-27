"use client";

import { GLOSSARY } from "@/lib/view";

interface GlossaryTooltipProps {
  term: string;
  children: React.ReactNode;
}

/**
 * Tooltip definisi instan untuk istilah tatanegara.
 * Klik/hover memunculkan penjelasan kontekstual tanpa meninggalkan halaman.
 */
export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const definition = GLOSSARY[term.toLowerCase()];
  if (!definition) return <>{children}</>;

  return (
    <span className="relative group inline">
      <span className="underline decoration-dotted decoration-sky-400/70 cursor-help text-sky-300">
        {children}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
          w-72 rounded-xl border border-sky-500/30 bg-[#0b1629] p-3 text-xs leading-relaxed text-[var(--muted)]
          shadow-xl opacity-0 group-hover:opacity-100 group-focus:opacity-100
          transition-opacity duration-150"
      >
        <span className="block text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-1">
          {term}
        </span>
        {definition}
      </span>
    </span>
  );
}
