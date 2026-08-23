import {
  SCORE_MAX,
  SCORE_MIN,
  type Assessment,
  type Rubric,
} from "./schemas";

export interface GroupScoreResult {
  group_id: string;
  /** rerata tertimbang skala -2..+2 */
  score: number;
  /** proporsi dimensi dalam grup yang sudah dinilai (0..1) */
  coverage: number;
}

export interface AssessmentSummary {
  term_id: string;
  assessment_ids: string[];
  rubric_version: string;
  /** skor per grup (sila / tujuan pembukaan / struktur UUD) */
  groups: GroupScoreResult[];
  /** indeks komposit 0..100, null bila tidak ada dimensi yang dinilai */
  index: number | null;
  /** proporsi total dimensi rubrik yang dinilai (0..1) */
  coverage: number;
  scored_dimensions: number;
  total_dimensions: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** Peta skala -2..+2 ke indeks 0..100 */
export function scoreToIndex(score: number): number {
  const s = clamp(score, SCORE_MIN, SCORE_MAX);
  return Math.round((((s - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100 + Number.EPSILON) * 10) / 10;
}

interface EffectiveScore {
  score: number;
  effectiveWeight: number;
}

function weightedMean(items: EffectiveScore[]): number | null {
  const totalWeight = items.reduce((acc, it) => acc + it.effectiveWeight, 0);
  if (items.length === 0 || totalWeight <= 0) return null;
  const sum = items.reduce((acc, it) => acc + it.score * it.effectiveWeight, 0);
  return sum / totalWeight;
}

/**
 * Korelasi bukti menaikkan efektivitas keyakinan: setiap sumber berbeda
 * tambahan menambah 0.04 hingga langit-langit 0.95. Satu bukti = dasar.
 */
export function effectiveConfidence(
  confidence: number,
  distinctSources: number
): number {
  return Math.min(0.95, confidence + 0.04 * Math.max(0, distinctSources - 1));
}

/**
 * Rerata per dimensi dari beberapa penilaian atas masa jabatan yang sama.
 * Hanya penilaian published yang dihitung untuk indeks publik.
 */
function meanPerDimension(
  assessments: Assessment[],
  rubric: Rubric
): Map<string, { score: number; confidence: number }> {
  const acc = new Map<string, { sum: number; n: number }>();
  const supportByDim = new Map<string, Set<string>>();
  for (const a of assessments) {
    for (const ds of a.dimension_scores) {
      if (!rubric.dimensions.some((d) => d.id === ds.dimension_id)) continue;
      const cur = acc.get(ds.dimension_id) ?? { sum: 0, n: 0 };
      cur.sum += ds.score;
      cur.n += 1;
      acc.set(ds.dimension_id, cur);
      const set = supportByDim.get(ds.dimension_id) ?? new Set<string>();
      // bukti empiris dan jangkar normatif sama-sama memperkuat keyakinan
      for (const ev of ds.evidence) set.add(ev.source_id);
      for (const na of ds.normative_anchors ?? []) set.add(`#norm:${na}`);
      supportByDim.set(ds.dimension_id, set);
    }
  }
  const result = new Map<string, { score: number; confidence: number }>();
  for (const [dimId, { sum, n }] of acc) {
    let confSum = 0;
    for (const a of assessments)
      for (const ds of a.dimension_scores)
        if (ds.dimension_id === dimId) confSum += ds.confidence;
    const baseConfidence = n > 0 ? confSum / n : 0;
    result.set(dimId, {
      score: sum / n,
      confidence: effectiveConfidence(baseConfidence, supportByDim.get(dimId)?.size ?? 1),
    });
  }
  return result;
}

export function computeAssessmentSummary(
  assessments: Assessment[],
  rubric: Rubric
): AssessmentSummary | null {
  if (assessments.length === 0) return null;

  const perDim = meanPerDimension(assessments, rubric);
  const totalDimensions = rubric.dimensions.length;

  const groups: GroupScoreResult[] = rubric.groups.map((group) => {
    const dims = rubric.dimensions.filter((d) => d.group_id === group.id);
    const items: EffectiveScore[] = [];
    for (const dim of dims) {
      const m = perDim.get(dim.id);
      if (!m) continue;
      items.push({
        score: m.score,
        effectiveWeight: dim.weight * Math.max(m.confidence, 0.05),
      });
    }
    const score = weightedMean(items);
    return {
      group_id: group.id,
      score: score ?? 0,
      coverage: dims.length > 0 ? items.length / dims.length : 0,
    };
  });

  const scoredDims = [...perDim.keys()].length;
  const coverage = totalDimensions > 0 ? scoredDims / totalDimensions : 0;

  const groupItems: EffectiveScore[] = [];
  for (const gs of groups) {
    const g = rubric.groups.find((rg) => rg.id === gs.group_id);
    if (!g || gs.coverage === 0) continue;
    groupItems.push({
      score: gs.score,
      effectiveWeight: g.weight * gs.coverage,
    });
  }
  const overall = weightedMean(groupItems);

  return {
    term_id: assessments[0]?.term_id ?? "",
    assessment_ids: assessments.map((a) => a.id),
    rubric_version: assessments[0]?.rubric_version ?? "",
    groups,
    index: overall === null ? null : scoreToIndex(overall),
    coverage,
    scored_dimensions: scoredDims,
    total_dimensions: totalDimensions,
  };
}

/** Gabungkan penilaian published saja untuk indeks publik. */
export function computePublicIndex(
  allAssessments: Assessment[],
  termId: string,
  rubric: Rubric
): AssessmentSummary | null {
  const published = allAssessments.filter(
    (a) => a.term_id === termId && a.status === "published"
  );
  return computeAssessmentSummary(published, rubric);
}
