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
 * Dilengkapi Polar Text Anchoring cerdas agar teks tidak bertabrakan dengan poligon.
 */
export function MultiRadarChart({ labels, series }: MultiRadarProps) {
  const CANVAS_SIZE = 520;
  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;
  const R = 150; // Radius grafik
  const n = labels.length;

  const getAngle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, v: number, radiusMultiplier = 1) => {
    const angle = getAngle(i);
    const r = ((v + 2) / 4) * R * radiusMultiplier;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  };

  const ringPath = (v: number) =>
    Array.from({ length: n }, (_, i) => point(i, v).join(",")).join(" ");

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-[340px] sm:max-w-[420px] aspect-square flex items-center justify-center p-1">
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
              fill={v === 0 ? "rgba(255,255,255,0.03)" : "none"}
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
                    r={4.5}
                    fill={s.color}
                    stroke="var(--bg, #0f172a)"
                    strokeWidth={1.5}
                  />
                ))}
              </g>
            );
          })}

          {/* Label sumbu dengan Polar Text Anchoring cerdas */}
          {labels.map((label, i) => {
            const angle = getAngle(i);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            // Jarak label dari pusat
            const labelDistance = 1.18;
            const [lx, ly] = point(i, 2, labelDistance);

            // Tentukan anchor dan alignment berdasarkan posisi sudut polar
            let textAnchor: "start" | "end" | "middle" = "middle";
            let dominantBaseline: "central" | "hanging" | "auto" = "central";

            if (cos > 0.25) {
              textAnchor = "start"; // Sisi kanan mengalir ke kanan
            } else if (cos < -0.25) {
              textAnchor = "end"; // Sisi kiri mengalir ke kiri
            } else {
              textAnchor = "middle";
            }

            if (sin < -0.7) {
              dominantBaseline = "auto"; // Puncak atas
            } else if (sin > 0.7) {
              dominantBaseline = "hanging"; // Dasar bawah
            } else {
              dominantBaseline = "central";
            }

            return (
              <text
                key={label}
                x={lx}
                y={ly}
                textAnchor={textAnchor}
                dominantBaseline={dominantBaseline}
                fontSize={12}
                fontWeight={700}
                fill="var(--text, #e2e8f0)"
                className="select-none tracking-tight"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend Interaktif Seri */}
      <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs px-2 w-full">
        {series.map((s) => (
          <div 
            key={s.id} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] shadow-sm"
          >
            <span
              className="inline-block size-3 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-semibold text-[var(--text)] text-xs truncate max-w-[180px] sm:max-w-[240px]" title={s.label}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
