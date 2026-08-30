import type { ExternalIndex } from "./schemas";

/**
 * Pemilihan indeks eksternal menurut periode — SATU tempat.
 *
 * Aturannya sederhana tetapi mudah salah: sebuah indeks pihak ketiga hanya
 * relevan bagi sebuah masa jabatan bila ia punya titik data DI DALAM periode
 * itu. Angka dari periode lain tidak dapat menjadi korroborasi.
 *
 * Dulu widget-nya, ketika tidak menemukan data dalam rentang tahun, mengambil
 * dua titik TERBARU sebagai gantinya. Karena titik data eksternal paling awal
 * tahun 2012, 19 dari 45 masa jabatan — seluruhnya yang berakhir sebelum 2012,
 * termasuk Sukarno, Suharto, Habibie, dan Gus Dur — menampilkan angka 2023–2026
 * di bawah judul yang menegaskan periodenya sendiri.
 *
 * Aturan ini tinggal di sini, bukan di komponen, supaya pemanggil dapat
 * memfilter di server (payload tidak perlu membawa data yang tak dirender)
 * TANPA aturannya jadi hidup di dua tempat lalu menyimpang — kesalahan yang
 * sama pernah membuat halaman /bandingkan menghitung indeksnya sendiri.
 */
export interface PeriodIndices {
  /** Indeks yang punya minimal satu titik data di dalam periode. */
  relevant: ExternalIndex[];
  /**
   * Tahun paling awal yang tersedia di SELURUH indeks yang diberikan, tanpa
   * memandang periode. Dipakai untuk menjelaskan ketiadaan data
   * ("data eksternal baru dimulai 2012"); null bila tidak ada titik sama sekali.
   */
  earliestAvailableYear: number | null;
}

export function externalIndicesForPeriod(
  indices: readonly ExternalIndex[],
  startYear: number,
  endYear: number
): PeriodIndices {
  const years = indices
    .flatMap((i) => i.data.map((d) => d.year))
    .filter((y): y is number => Number.isFinite(y));

  const relevant = indices
    .map((idx) => ({
      ...idx,
      data: idx.data.filter((dp) => dp.year >= startYear && dp.year <= endYear),
    }))
    .filter((idx) => idx.data.length > 0);

  return {
    relevant,
    earliestAvailableYear: years.length > 0 ? Math.min(...years) : null,
  };
}

/** Rentang tahun sebuah masa jabatan; end terbuka = tahun berjalan. */
export function termYearRange(
  term: { start_date: string; end_date?: string | null },
  currentYear: number
): { startYear: number; endYear: number } {
  return {
    startYear: parseInt(term.start_date.slice(0, 4), 10),
    endYear: term.end_date ? parseInt(term.end_date.slice(0, 4), 10) : currentYear,
  };
}
