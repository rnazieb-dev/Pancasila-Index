import React from "react";

export type InstitutionId =
  | "presiden-ri"
  | "dpr-ri"
  | "mpr-ri"
  | "dpd-ri"
  | "mahkamah-konstitusi"
  | "mahkamah-agung"
  | "bpk-ri"
  | "komisi-yudisial"
  | string;

interface InstitutionLogoProps {
  id: InstitutionId;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  showBadge?: boolean;
}

const sizeMap = {
  xs: 22,
  sm: 30,
  md: 46,
  lg: 68,
  xl: 96,
};

const EMBLEM_FILES: Record<string, { file: string; label: string }> = {
  "presiden-ri": {
    file: "/emblems/presiden-ri.png",
    label: "Lambang Negara Republik Indonesia (Garuda Pancasila)",
  },
  presiden: {
    file: "/emblems/presiden-ri.png",
    label: "Lambang Negara Republik Indonesia (Garuda Pancasila)",
  },
  "dpr-ri": {
    file: "/emblems/dpr-ri.png",
    label: "Lambang Dewan Perwakilan Rakyat Republik Indonesia",
  },
  dpr: {
    file: "/emblems/dpr-ri.png",
    label: "Lambang Dewan Perwakilan Rakyat Republik Indonesia",
  },
  "mpr-ri": {
    file: "/emblems/mpr-ri.png",
    label: "Lambang Majelis Permusyawaratan Rakyat Republik Indonesia",
  },
  mpr: {
    file: "/emblems/mpr-ri.png",
    label: "Lambang Majelis Permusyawaratan Rakyat Republik Indonesia",
  },
  "dpd-ri": {
    file: "/emblems/dpd-ri.png",
    label: "Lambang Dewan Perwakilan Daerah Republik Indonesia",
  },
  dpd: {
    file: "/emblems/dpd-ri.png",
    label: "Lambang Dewan Perwakilan Daerah Republik Indonesia",
  },
  "mahkamah-konstitusi": {
    file: "/emblems/mahkamah-konstitusi.png",
    label: "Lambang Mahkamah Konstitusi Republik Indonesia",
  },
  mk: {
    file: "/emblems/mahkamah-konstitusi.png",
    label: "Lambang Mahkamah Konstitusi Republik Indonesia",
  },
  "mahkamah-agung": {
    file: "/emblems/mahkamah-agung.png",
    label: "Lambang Mahkamah Agung Republik Indonesia",
  },
  ma: {
    file: "/emblems/mahkamah-agung.png",
    label: "Lambang Mahkamah Agung Republik Indonesia",
  },
  "bpk-ri": {
    file: "/emblems/bpk-ri.png",
    label: "Lambang Badan Pemeriksa Keuangan Republik Indonesia",
  },
  bpk: {
    file: "/emblems/bpk-ri.png",
    label: "Lambang Badan Pemeriksa Keuangan Republik Indonesia",
  },
  "komisi-yudisial": {
    file: "/emblems/komisi-yudisial.png",
    label: "Lambang Komisi Yudisial Republik Indonesia",
  },
  ky: {
    file: "/emblems/komisi-yudisial.png",
    label: "Lambang Komisi Yudisial Republik Indonesia",
  },
};

export function InstitutionLogo({
  id,
  size = "md",
  className = "",
  showBadge = false,
}: InstitutionLogoProps) {
  const pixelSize = typeof size === "number" ? size : sizeMap[size] ?? 46;
  const emblem = EMBLEM_FILES[id] ?? {
    file: "/emblems/presiden-ri.svg",
    label: "Lambang Lembaga Negara",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl bg-white/95 p-1 shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-transform group-hover:scale-105 ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      title={emblem.label}
    >
      <img
        src={emblem.file}
        alt={emblem.label}
        width={pixelSize}
        height={pixelSize}
        className="h-full w-full object-contain drop-shadow-xs"
        loading="lazy"
      />
      {showBadge && (
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow ring-2 ring-[var(--panel)]">
          ✓
        </span>
      )}
    </div>
  );
}
