"use client";

import { useState } from "react";
import Link from "next/link";
import { scoreColor, scoreTextColor, indexLabel } from "@/lib/view";

export interface TrendPoint {
  id: string;
  slug: string;
  label: string;
  startYear: number;
  endYear: number;
  institutionSlug: string;
  composite: number | null;
  sila: number | null;
  pembukaan: number | null;
  "struktur-uud": number | null;
  eventsCount: number;
  topEventTitle?: string;
}

interface TrendLineChartProps {
  points: TrendPoint[];
  activeSeries: {
    composite: boolean;
    sila: boolean;
    pembukaan: boolean;
    "struktur-uud": boolean;
  };
}

export function TrendLineChart({ points, activeSeries }: TrendLineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<TrendPoint | null>(null);

  if (points.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] p-12 text-center text-xs text-[var(--muted)]">
        Tidak ada data titik waktu yang tersedia untuk lembaga ini.
      </div>
    );
  }

  const width = 860;
  const height = 360;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const n = points.length;
  const getX = (index: number) => {
    if (n <= 1) return padLeft + chartWidth / 2;
    return padLeft + (index / (n - 1)) * chartWidth;
  };

  const getY = (val: number | null) => {
    if (val === null) return padTop + chartHeight;
    const clamped = Math.max(0, Math.min(100, val));
    return padTop + chartHeight - (clamped / 100) * chartHeight;
  };

  // Generate SVG path strings for each series
  const buildPath = (key: "composite" | "sila" | "pembukaan" | "struktur-uud") => {
    const valid = points
      .map((p, i) => ({ val: p[key], x: getX(i), y: getY(p[key]) }))
      .filter((p) => p.val !== null);

    if (valid.length === 0) return "";
    return valid.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  };

  return (
    <div className="relative w-full overflow-x-auto">
      <div className="min-w-[700px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          role="img"
          aria-label="Grafik tren nilai Pancasila Index lintas dekade"
        >
          {/* Background Grid Lines */}
          {[0, 25, 50, 75, 100].map((v) => {
            const y = getY(v);
            const isMid = v === 50;
            return (
              <g key={v}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke={isMid ? "#475569" : "var(--line)"}
                  strokeWidth={isMid ? 1.5 : 1}
                  strokeDasharray={isMid ? "4 4" : undefined}
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-[var(--muted)]"
                >
                  {v}
                </text>
              </g>
            );
          })}

          {/* Area Neutral Fill */}
          <rect
            x={padLeft}
            y={getY(50)}
            width={chartWidth}
            height={getY(0) - getY(50)}
            fill="rgba(239, 68, 68, 0.02)"
          />
          <rect
            x={padLeft}
            y={getY(100)}
            width={chartWidth}
            height={getY(50) - getY(100)}
            fill="rgba(34, 197, 94, 0.02)"
          />

          {/* Series Lines */}
          {activeSeries.sila && (
            <path
              d={buildPath("sila")}
              fill="none"
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="3 3"
              className="transition-all duration-300"
            />
          )}

          {activeSeries.pembukaan && (
            <path
              d={buildPath("pembukaan")}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="3 3"
              className="transition-all duration-300"
            />
          )}

          {activeSeries["struktur-uud"] && (
            <path
              d={buildPath("struktur-uud")}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="3 3"
              className="transition-all duration-300"
            />
          )}

          {activeSeries.composite && (
            <path
              d={buildPath("composite")}
              fill="none"
              stroke="var(--acc-red)"
              strokeWidth={3.5}
              className="transition-all duration-300 drop-shadow"
            />
          )}

          {/* Interactive Data Points */}
          {points.map((p, i) => {
            const x = getX(i);
            const yComp = getY(p.composite);
            const isHovered = hoveredPoint?.id === p.id;

            return (
              <g key={p.id} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(p)}>
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={height - padBottom}
                    stroke="#94a3b8"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                  />
                )}

                {/* Composite Point Circle */}
                {activeSeries.composite && p.composite !== null && (
                  <circle
                    cx={x}
                    cy={yComp}
                    r={isHovered ? 6.5 : 4.5}
                    fill={scoreColor(p.composite / 25 - 2)}
                    stroke="var(--bg)"
                    strokeWidth={2}
                    className="transition-all duration-150"
                  />
                )}

                {/* Sub-score circles */}
                {activeSeries.sila && p.sila !== null && (
                  <circle cx={x} cy={getY(p.sila)} r={isHovered ? 4 : 2.5} fill="#22c55e" />
                )}
                {activeSeries.pembukaan && p.pembukaan !== null && (
                  <circle cx={x} cy={getY(p.pembukaan)} r={isHovered ? 4 : 2.5} fill="#38bdf8" />
                )}
                {activeSeries["struktur-uud"] && p["struktur-uud"] !== null && (
                  <circle cx={x} cy={getY(p["struktur-uud"])} r={isHovered ? 4 : 2.5} fill="#f59e0b" />
                )}

                {/* X Axis Labels */}
                <text
                  x={x}
                  y={height - padBottom + 16}
                  textAnchor="middle"
                  className={`text-[10px] font-mono transition-colors ${
                    isHovered ? "fill-[var(--text)] font-bold" : "fill-[var(--muted)]"
                  }`}
                >
                  {p.startYear}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Detail Box */}
        {hoveredPoint ? (
          <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-xl transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-2.5">
              <div>
                <span className="font-bold text-sm text-[var(--text)]">{hoveredPoint.label}</span>
                <span className="ml-2 text-xs font-mono text-[var(--muted)]">
                  ({hoveredPoint.startYear}–{hoveredPoint.endYear})
                </span>
              </div>
              <Link
                href={`/lembaga/${hoveredPoint.institutionSlug}/${hoveredPoint.id}`}
                className="text-xs font-semibold text-[var(--acc-sky)] hover:underline"
              >
                Buka Telaah Era Ini →
              </Link>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="rounded-lg bg-[var(--bg)] p-2 border border-[var(--line)]">
                <div className="text-[10px] text-[var(--muted)]">Komposit Utama</div>
                <div
                  className="font-extrabold text-base tabular-nums"
                  style={{
                    color:
                      hoveredPoint.composite !== null
                        ? scoreTextColor(hoveredPoint.composite / 25 - 2)
                        : "var(--score-zero)",
                  }}
                >
                  {indexLabel(hoveredPoint.composite)}/100
                </div>
              </div>

              <div className="rounded-lg bg-[var(--bg)] p-2 border border-[var(--line)]">
                <div className="text-[10px] text-[#22c55e] font-semibold">Lima Sila</div>
                <div className="font-bold text-sm tabular-nums">
                  {hoveredPoint.sila !== null ? `${hoveredPoint.sila}/100` : "-"}
                </div>
              </div>

              <div className="rounded-lg bg-[var(--bg)] p-2 border border-[var(--line)]">
                <div className="text-[10px] text-[#38bdf8] font-semibold">Pembukaan UUD</div>
                <div className="font-bold text-sm tabular-nums">
                  {hoveredPoint.pembukaan !== null ? `${hoveredPoint.pembukaan}/100` : "-"}
                </div>
              </div>

              <div className="rounded-lg bg-[var(--bg)] p-2 border border-[var(--line)]">
                <div className="text-[10px] text-[#f59e0b] font-semibold">Norma Struktural</div>
                <div className="font-bold text-sm tabular-nums">
                  {hoveredPoint["struktur-uud"] !== null ? `${hoveredPoint["struktur-uud"]}/100` : "-"}
                </div>
              </div>
            </div>

            {hoveredPoint.topEventTitle && (
              <div className="mt-2.5 text-xs text-[var(--muted)] flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-[var(--acc-red)]">Peristiwa Kunci:</span>
                <span className="truncate">{hoveredPoint.topEventTitle}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-[var(--line)] p-3 text-center text-xs text-[var(--muted)]">
            Arahkan kursor (*hover*) pada titik tahun untuk melihat rincian 3 pilar dan peristiwa bersejarah era tersebut.
          </div>
        )}
      </div>
    </div>
  );
}
