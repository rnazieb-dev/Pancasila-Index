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
  size?: number;
}

/**
 * Radar Chart SVG murni interaktif untuk membandingkan multi-series (2 atau lebih organ/periode).
 * Skala: Pusat = -2 (merah), Garis Putus-putus = 0 (netral), Tepi Luar = +2 (hijau).
 */
export function MultiRadarChart({ labels, series, size = 360 }: MultiRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.35;
  const n = labels.length;

  const point = (i: number, v: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = ((v + 2) / 4) * R;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  };

  const ringPath = (v: number) =>
    Array.from({ length: n }, (_, i) => point(i, v).join(",")).join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Radar chart perbandingan dimensi"
        className="overflow-visible"
      >
        {/* Ring panduan skala -2 .. +2 */}
        {[2, 1, 0, -1, -2].map((v) => (
          <polygon
            key={v}
            points={ringPath(v)}
            fill="none"
            stroke="#232c44"
            strokeWidth={v === -2 || v === 2 ? 1.5 : 1}
            strokeDasharray={v === 0 ? "4 3" : undefined}
          />
        ))}

        {/* Jari-jari sumbu */}
        {Array.from({ length: n }, (_, i) => {
          const [px, py] = point(i, 2);
          return <line key={i} x1={cx} y1={cy} x2={px} y2={py} stroke="#232c44" strokeWidth={1} />;
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
                />
              )}
              {dataPoints.map(([px, py], i) => (
                <circle
                  key={i}
                  cx={px}
                  cy={py}
                  r={4}
                  fill={s.color}
                  stroke="#0f172a"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          );
        })}

        {/* Label sumbu */}
        {labels.map((label, i) => {
          const [lx, ly] = point(i, 2.55);
          return (
            <text
              key={label}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={600}
              fill="#94a3b8"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
        {series.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <span
              className="inline-block size-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-medium text-[var(--text)]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
