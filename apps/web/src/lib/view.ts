import { dataset } from "@pancasila-index/data";
import {
  computeAssessmentSummary,
  type AssessmentSummary,
} from "@pancasila-index/core";

export function termSummary(termId: string): AssessmentSummary | null {
  const assessments = dataset.assessments.filter((a) => a.term_id === termId);
  if (assessments.length === 0) return null;
  return computeAssessmentSummary(assessments, dataset.rubric);
}

export function scoreColor(score: number): string {
  if (score <= -1.5) return "#ef4444";
  if (score < 0) return "#fb923c";
  if (score === 0) return "#94a3b8";
  if (score <= 1) return "#a3e635";
  return "#22c55e";
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
