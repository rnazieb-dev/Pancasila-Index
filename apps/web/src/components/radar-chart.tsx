interface RadarProps {
  /** label tiap sumbu, urutannya menentukan sudut */
  labels: string[];
  /** nilai -2..+2; undefined = belum dinilai (sumbu dilewati) */
  values: Array<number | undefined>;
  size?: number;
}

/**
 * Radar chart SVG murni tanpa dependensi.
 * Pusat = -2, tepi luar = +2, cincin setiap 1 poin.
 */
export function RadarChart({ labels, values, size = 320 }: RadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.36;
  const n = labels.length;

  const point = (i: number, v: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = ((v + 2) / 4) * R;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  };

  const ringPath = (v: number) =>
    Array.from({ length: n }, (_, i) => point(i, v).join(",")).join(" ");

  const defined = values
    .map((v, i) => ({ v, i }))
    .filter((x): x is { v: number; i: number } => typeof x.v === "number");
  const dataPoints = defined.map(({ v, i }) => point(i, v));
  const dataPath =
    defined.length >= 3 ? dataPoints.map((p) => p.join(",")).join(" ") : "";

  const avg = values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;

  const stroke =
    avg <= -1 ? "#ef4444" : avg < 0 ? "#fb923c" : avg === 0 ? "#94a3b8" : avg <= 1 ? "#a3e635" : "#22c55e";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Radar lima sila">
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
      {Array.from({ length: n }, (_, i) => {
        const [px, py] = point(i, 2);
        return <line key={i} x1={cx} y1={cy} x2={px} y2={py} stroke="#232c44" />;
      })}
      {values.length > 0 && (
        <>
          {defined.length >= 3 && (
            <polygon points={dataPath} fill={`${stroke}22`} stroke={stroke} strokeWidth={2} />
          )}
          {dataPoints.map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r={3.5} fill={stroke} />
          ))}
          {values.some((v) => typeof v !== "number") && (
            <text x={cx} y={size - 8} textAnchor="middle" fontSize={10} fill="#8b96ad">
              sebagian dimensi belum dinilai
            </text>
          )}
        </>
      )}
      {labels.map((label, i) => {
        const [lx, ly] = point(i, 2.55);
        return (
          <text
            key={label}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="#8b96ad"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
