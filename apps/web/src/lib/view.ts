import { dataset } from "@pancasila-index/data";
import {
  computeIndex,
  MIN_COVERAGE_FOR_INDEX,
  type AssessmentBasis,
  type AssessmentSummary,
} from "@pancasila-index/core";

/**
 * Kebijakan status tunggal untuk SELURUH permukaan publik: halaman, REST
 * API, dan ekspor. Selama fase seed belum dikurasi dewan editorial, indeks
 * disajikan sebagai pratinjau draf — dan setiap permukaan wajib menyatakannya
 * (UI lewat lencana, API lewat field `basis` pada payload).
 *
 * Ubah satu baris ini ke "published" begitu kurasi berjalan; tidak ada
 * tempat lain yang perlu disentuh, dan test menjaga agar tidak ada permukaan
 * yang diam-diam memakai kebijakan berbeda.
 */
export const INDEX_BASIS: AssessmentBasis = "draft-preview";

export function termSummary(termId: string): AssessmentSummary | null {
  return computeIndex(dataset.assessments, termId, dataset.rubric, INDEX_BASIS);
}

export function scoreColor(score: number): string {
  if (score <= -1.5) return "#ef4444";
  if (score < 0) return "#fb923c";
  if (score === 0) return "#94a3b8";
  if (score <= 1) return "#a3e635";
  return "#22c55e";
}

/**
 * Warna skor untuk peran TEKS. Mengembalikan custom property yang berbalik
 * per tema; scoreColor() di atas tetap dipakai untuk isi bar/tint karena
 * nilai vividnya hanya lolos rasio 1.4-2.3 bila dijadikan teks di atas
 * panel terang (ambang WCAG AA = 4.5).
 */
export function scoreTextColor(score: number): string {
  if (score <= -1.5) return "var(--score-vneg)";
  if (score < 0) return "var(--score-neg)";
  if (score === 0) return "var(--score-zero)";
  if (score <= 1) return "var(--score-pos)";
  return "var(--score-vpos)";
}

export function scoreLabel(score: number | null): string {
  if (score === null) return "belum dinilai";
  const s = Math.round(score * 10) / 10;
  return `${s > 0 ? "+" : ""}${s.toFixed(1)}`;
}

/** Indeks publik ditampilkan sebagai angka bulat 0-100 tanpa tanda - mudah dibaca awam. */
export function indexLabel(index: number | null): string {
  if (index === null) return "belum dinilai";
  return String(Math.round(index));
}

/**
 * Label indeks yang membedakan tiga keadaan berbeda yang sebelumnya
 * bertumpuk menjadi satu "belum dinilai":
 *   - tidak ada penilaian sama sekali
 *   - ada penilaian, tetapi cakupannya di bawah ambang sehingga komposit
 *     ditahan (skor grup tetap ada dan tetap ditampilkan)
 *   - ada indeks
 */
export function summaryIndexLabel(summary: AssessmentSummary | null): string {
  if (!summary) return "belum dinilai";
  if (summary.index !== null) return String(Math.round(summary.index));
  if (summary.index_suppressed_reason === "cakupan-di-bawah-ambang")
    return "cakupan kurang";
  return "belum dinilai";
}

/** Penjelasan satu kalimat untuk keadaan indeks; null bila indeks terbit normal. */
export function summaryIndexNote(summary: AssessmentSummary | null): string | null {
  if (!summary) return "Belum ada penilaian untuk masa jabatan ini.";
  if (summary.index_suppressed_reason === "cakupan-di-bawah-ambang")
    return `Indeks tunggal ditahan: baru ${summary.scored_dimensions} dari ${summary.total_dimensions} dimensi berbukti (ambang ${Math.round(MIN_COVERAGE_FOR_INDEX * 100)}%). Skor per kelompok di bawah tetap berlaku.`;
  if (summary.index === null) return "Belum ada dimensi yang dinilai dengan bukti.";
  return null;
}

export function periodLabel(start: string, end: string | null): string {
  const s = start.slice(0, 4);
  return end ? `${s}–${end.slice(0, 4)}` : `${s}–kini`;
}

export function groupName(groupId: string): string {
  return dataset.rubric.groups.find((g) => g.id === groupId)?.name_id ?? groupId;
}

export function dimensionName(dimId: string): string {
  return dataset.rubric.dimensions.find((d) => d.id === dimId)?.name_id ?? dimId;
}

export function sourceTitle(sourceId: string): string {
  return (
    dataset.sources.find((s) => s.id === sourceId)?.title_id ?? sourceId
  );
}

/**
 * Predikat kualitatif berdasarkan indeks 0–100.
 * Membantu masyarakat awam memahami bahwa 50 adalah posisi NETRAL, bukan "gagal".
 */
export interface QualLabel {
  label: string;
  color: string;
  bg: string;
}

export function scoreQualLabel(index: number | null): QualLabel {
  if (index === null)
    return { label: "Belum Dinilai", color: "var(--score-zero)", bg: "var(--score-zero-bg)" };
  if (index >= 75)
    return { label: "Teladan / Progresif", color: "var(--score-vpos)", bg: "var(--score-vpos-bg)" };
  if (index >= 56)
    return { label: "Penguatan Konkret", color: "var(--score-pos)", bg: "var(--score-pos-bg)" };
  if (index >= 46)
    return { label: "Netral / Status Quo", color: "var(--score-zero)", bg: "var(--score-zero-bg)" };
  if (index >= 30)
    return { label: "Cenderung Menggerus", color: "var(--score-neg)", bg: "var(--score-neg-bg)" };
  return { label: "Erosi Berat", color: "var(--score-vneg)", bg: "var(--score-vneg-bg)" };
}

/**
 * Label kualitatif yang sadar konteks ringkasan.
 *
 * WAJIB dipakai di mana pun `AssessmentSummary` tersedia. `scoreQualLabel`
 * memetakan 46-55 ke "Netral / Status Quo" - jadi masa jabatan yang komposit-
 * nya DIBATASI ke tepat 50 karena temuan penyiksaan akan tampil sebagai
 * "netral". Itu lebih buruk daripada cacat yang batas ini perbaiki.
 */
export function summaryQualLabel(summary: AssessmentSummary | null): QualLabel {
  if (summary?.index_capped) {
    return {
      label: "Dibatasi: pelanggaran hak dasar",
      color: "var(--score-vneg)",
      bg: "var(--score-vneg-bg)",
    };
  }
  return scoreQualLabel(summary?.index ?? null);
}

/** Konstanta glosarium istilah tatanegara */
export const GLOSSARY: Record<string, string> = {
  "soft bicameralism":
    "Sistem parlemen dua kamar yang tidak setara, di mana DPR memiliki kewenangan lebih besar dari DPD. Berbeda dengan 'hard bicameralism' di AS yang setara.",
  "normative anchors":
    "Jangkar normatif: ketentuan UUD 1945 atau prinsip konstitusi yang digunakan sebagai standar dasar penilaian.",
  "hak uji materiil":
    "Kewenangan Mahkamah Agung atau Mahkamah Konstitusi untuk menguji apakah suatu peraturan bertentangan dengan peraturan yang lebih tinggi.",
  "executive-heavy":
    "Sistem pemerintahan di mana cabang eksekutif mendominasi proses pengambilan keputusan, seringkali melampaui batas kewenangan konstitusionalnya.",
  "kontrak sosial":
    "Perjanjian dasar antara negara dan warganya, yang dalam konteks Indonesia diwujudkan melalui Pancasila, Pembukaan, dan batang tubuh UUD 1945.",
  "diskresi":
    "Kewenangan yang diberikan kepada pejabat negara untuk mengambil keputusan berdasarkan pertimbangan sendiri dalam situasi yang tidak diatur secara spesifik oleh peraturan.",
  "constitutional moment":
    "Momen transformatif dalam sejarah ketatanegaraan di mana perubahan fundamental terjadi pada tatanan hukum dan konstitusi.",
  "judicial review":
    "Pengujian konstitusionalitas undang-undang atau peraturan oleh lembaga yudisial (di Indonesia: oleh Mahkamah Konstitusi untuk UU, MA untuk di bawah UU).",
};

