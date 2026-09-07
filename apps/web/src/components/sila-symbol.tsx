import React from "react";

/**
 * Lambang kelima sila sebagai raster (PNG), bukan ikon garis buatan sendiri.
 *
 * Kelima lambang ini diturunkan dari perisai pada lambang negara Garuda
 * Pancasila - berkas Wikimedia Commons yang sama yang dipakai untuk logo
 * lembaga kepresidenan di `public/emblems/presiden-ri.svg`. Skrip yang
 * memotongnya beserta SHA-256 tiap keluaran ada di
 * `apps/web/scripts/build-sila-symbols.mts` dan `public/lambang/manifest.json`.
 *
 * Ikon garis sebelumnya adalah gambar tafsiran: bintang, rantai, dan beringin
 * versi penulis kode. Untuk indeks yang menilai kesetiaan pada Pancasila,
 * memakai lambang resminya - bukan interpretasi - itu bagian dari ketelitian
 * yang sama yang dituntut pada datanya.
 *
 * Dimensi lain (tujuan Pembukaan, norma struktural) tetap memakai ikon SVG
 * karena memang tidak punya lambang resmi; mengarang raster untuk itu justru
 * kebalikan dari maksud perubahan ini.
 */

export const SILA_SYMBOLS: Record<
  string,
  { file: string; symbol_id: string; sila_id: string; ground: "dark" | "light" }
> = {
  "sila-1": {
    file: "/lambang/sila-1.png",
    symbol_id: "Bintang",
    sila_id: "Ketuhanan Yang Maha Esa",
    ground: "dark",
  },
  "sila-2": {
    file: "/lambang/sila-2.png",
    symbol_id: "Rantai",
    sila_id: "Kemanusiaan yang Adil dan Beradab",
    ground: "dark",
  },
  "sila-3": {
    file: "/lambang/sila-3.png",
    symbol_id: "Pohon Beringin",
    sila_id: "Persatuan Indonesia",
    ground: "light",
  },
  "sila-4": {
    file: "/lambang/sila-4.png",
    symbol_id: "Kepala Banteng",
    sila_id:
      "Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan",
    ground: "dark",
  },
  "sila-5": {
    file: "/lambang/sila-5.png",
    symbol_id: "Padi dan Kapas",
    sila_id: "Keadilan Sosial bagi Seluruh Rakyat Indonesia",
    ground: "light",
  },
};

interface SilaSymbolProps {
  /** Id dimensi rubrik, mis. `sila-3`. */
  dimensionId: string;
  size?: number;
  className?: string;
}

export function SilaSymbol({ dimensionId, size = 22, className = "" }: SilaSymbolProps) {
  const sym = SILA_SYMBOLS[dimensionId];
  if (!sym) return null;

  const label = `Lambang sila ke-${dimensionId.replace("sila-", "")}: ${
    sym.symbol_id
  } - ${sym.sila_id}`;

  return (
    <img
      src={sym.file}
      alt={label}
      title={label}
      width={size}
      height={size}
      /*
       * Bidang putih (beringin, padi-kapas) akan lenyap di tema terang tanpa
       * cincin pembatas; bidang gelap tidak butuh itu tapi cincinnya tetap
       * dipasang supaya kelima lambang punya bingkai yang sama.
       */
      className={`shrink-0 rounded-md object-contain ring-1 ring-black/10 dark:ring-white/15 ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
      decoding="async"
    />
  );
}
