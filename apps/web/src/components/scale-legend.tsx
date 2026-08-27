import { scoreQualLabel } from "@/lib/view";

interface ScaleLegendProps {
  compact?: boolean;
}

/**
 * Panduan skala indeks 0–100 untuk masyarakat awam.
 * Menegaskan bahwa 50 = NETRAL, bukan buruk.
 */
export function ScaleLegend({ compact = false }: ScaleLegendProps) {
  const levels = [
    { range: "75–100", label: "Teladan / Progresif", color: "#22c55e" },
    { range: "56–74", label: "Penguatan Konkret", color: "#a3e635" },
    { range: "46–55", label: "Netral / Status Quo ← titik tengah", color: "#94a3b8" },
    { range: "30–45", label: "Cenderung Menggerus", color: "#fb923c" },
    { range: "0–29", label: "Erosi Berat", color: "#ef4444" },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 text-[11px]">
        {levels.map((l) => (
          <span
            key={l.range}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
            style={{ background: `${l.color}18`, color: l.color }}
          >
            <span className="size-1.5 rounded-full" style={{ background: l.color }} />
            {l.range}: {l.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
        Panduan Baca Indeks (0–100)
      </p>
      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
        Indeks <strong className="text-white">50</strong> menandai posisi{" "}
        <strong className="text-slate-300">NETRAL</strong> — bukan nilai buruk. Angka di atas 50
        mencerminkan kepatuhan lebih dari norma dasar; di bawah 50 mengindikasikan erosi norma
        konstitusional.
      </p>
      <div className="mt-3 space-y-1.5">
        {levels.map((l) => (
          <div key={l.range} className="flex items-center gap-3">
            <span
              className="w-12 shrink-0 text-[11px] font-mono text-right"
              style={{ color: l.color }}
            >
              {l.range}
            </span>
            <span
              className="flex-1 h-2 rounded-full"
              style={{ background: `${l.color}40` }}
            />
            <span className="text-[11px] text-[var(--muted)] w-48 shrink-0">
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Badge predikat kualitatif inline untuk komponen skor */
export function ScoreBadge({ index }: { index: number | null }) {
  const qual = scoreQualLabel(index);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: qual.bg, color: qual.color }}
    >
      {qual.label}
    </span>
  );
}
