"use client";

export interface RadarSeries {
  id: string;
  label: string;
  color: string;
  values: Array<number | undefined>;
}

interface MultiRadarProps {
  labels: string[];
  series: RadarSeries[];
}

/**
 * Radar Chart SVG murni interaktif untuk membandingkan multi-series (2 atau lebih organ/periode).
 * Skala: Pusat = -2 (merah), Garis Putus-putus = 0 (netral), Tepi Luar = +2 (hijau).
 * Sepenuhnya responsif berbasis viewBox 420x420 dengan safe margin untuk label.
 */
export function MultiRadarChart({ labels, series }: MultiRadarProps) {
  const CANVAS_SIZE = 420;
  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;
  const R = 125; // Safe radius leaves ~85px margin for labels inside 420x420 box
  const n = labels.length;

  const point = (i: number, v: number, radiusMultiplier = 1) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = ((v + 2) / 4) * R * radiusMultiplier;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  };

  const ringPath = (v: number) =>
    Array.from({ length: n }, (_, i) => point(i, v).join(",")).join(" ");

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-[320px] sm:max-w-[380px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
          className="w-full h-full overflow-visible select-none"
          role="img"
          aria-label="Radar chart perbandingan dimensi"
        >
          {/* Ring panduan skala -2 .. +2 */}
          {[2, 1, 0, -1, -2].map((v) => (
            <polygon
              key={v}
              points={ringPath(v)}
              fill={v === 0 ? "rgba(255,255,255,0.02)" : "none"}
              stroke="var(--line, #334155)"
              strokeWidth={v === -2 || v === 2 ? 1.5 : 1}
              strokeDasharray={v === 0 ? "4 3" : undefined}
            />
          ))}

          {/* Jari-jari sumbu */}
          {Array.from({ length: n }, (_, i) => {
            const [px, py] = point(i, 2);
            return (
              <line 
                key={i} 
                x1={cx} 
                y1={cy} 
                x2={px} 
                y2={py} 
                stroke="var(--line, #334155)" 
                strokeWidth={1} 
              />
            );
          })}

          {/* Poligon tiap series */}
          {series.map((s) => {
            const defined = s.values
              .map((v, i) => ({ v, i }))
              .filter((x): x is { v: number; i: number } => typeof x.v === "number");
            const dataPoints = defined.map(({ v, i }) => point(i, v));
            const dataPath =
              defined.length >= 3 ? dataPoints.map((p) => p.join(",")).join(" ") : "";

            return (
              <g key={s.id}>
                {defined.length >= 3 && (
                  <polygon
                    points={dataPath}
                    fill={`${s.color}26`}
                    stroke={s.color}
                    strokeWidth={2.5}
                    className="transition-all duration-300"
                  />
                )}
                {dataPoints.map(([px, py], i) => (
                  <circle
                    key={i}
                    cx={px}
                    cy={py}
                    r={4}
                    fill={s.color}
                    stroke="var(--bg, #0f172a)"
                    strokeWidth={1.5}
                  />
                ))}
              </g>
            );
          })}

          {/* Label sumbu responsif */}
          {labels.map((label, i) => {
            const [lx, ly] = point(i, 2, 1.28);
            return (
              <text
                key={label}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={600}
                fill="var(--muted, #94a3b8)"
                className="select-none"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend Responsif */}
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs px-2">
        {series.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-medium text-[var(--text)] truncate max-w-[140px] sm:max-w-[200px]" title={s.label}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
