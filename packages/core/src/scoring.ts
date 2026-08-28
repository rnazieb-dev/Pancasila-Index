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

/**
 * Kebijakan status yang membentuk sebuah angka. WAJIB dinyatakan eksplisit
 * oleh setiap pemanggil — tidak ada nilai default. Sebelumnya jalur produksi
 * memakai fungsi tanpa filter status sementara fungsi yang memfilter hanya
 * hidup di test, sehingga draf tersaji sebagai indeks tanpa ada yang memilih
 * demikian.
 */
export type AssessmentBasis = "published" | "draft-preview";

export interface AssessmentSummary {
  term_id: string;
  assessment_ids: string[];
  rubric_version: string;
  /** Dasar status angka ini; ikut terbawa ke payload API dan UI. */
  basis: AssessmentBasis;
  /** Komposisi penilaian pembentuk angka. */
  published_count: number;
  draft_count: number;
  /** Skor dimensi yang DIKELUARKAN karena belum berbukti empiris. */
  excluded_no_evidence: number;
  /** skor per grup (sila / tujuan pembukaan / struktur UUD) */
  groups: GroupScoreResult[];
  /** indeks komposit 0..100; null bila tak ada dimensi dinilai ATAU cakupan di bawah ambang */
  index: number | null;
  /** Alasan indeks ditahan, agar UI dapat menjelaskan alih-alih menampilkan kosong. */
  index_suppressed_reason: "cakupan-di-bawah-ambang" | null;
  /** proporsi total dimensi rubrik yang dinilai (0..1) */
  coverage: number;
  scored_dimensions: number;
  total_dimensions: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/**
 * Cakupan minimum sebelum sebuah komposit 0-100 boleh diterbitkan.
 *
 * Tanpa ambang ini, cakupan hanya menjadi BOBOT: menilai 2 dari 12 dimensi
 * menghasilkan angka yang tampak otoritatif (pernah terjadi: 88,9 dari
 * cakupan 17%) padahal sepuluh dimensi lain tak diketahui. Skor grup dan
 * cakupannya tetap dilaporkan di bawah ambang - yang ditahan hanya angka
 * tunggal yang mudah dikutip di luar konteks.
 */
export const MIN_COVERAGE_FOR_INDEX = 0.5;

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
): { perDim: Map<string, { score: number; confidence: number }>; excluded: number } {
  const acc = new Map<string, { sum: number; n: number }>();
  const supportByDim = new Map<string, Set<string>>();
  let excluded = 0;
  for (const a of assessments) {
    for (const ds of a.dimension_scores) {
      if (!rubric.dimensions.some((d) => d.id === ds.dimension_id)) continue;
      // Skor tanpa bukti empiris tidak boleh menggerakkan indeks. Ia tetap
      // tampil di UI sebagai penilaian yang menunggu bukti.
      if (ds.evidence_gap === true || ds.evidence.length === 0) {
        excluded += 1;
        continue;
      }
      const cur = acc.get(ds.dimension_id) ?? { sum: 0, n: 0 };
      cur.sum += ds.score;
      cur.n += 1;
      acc.set(ds.dimension_id, cur);
      const set = supportByDim.get(ds.dimension_id) ?? new Set<string>();
      // HANYA bukti empiris. Jangkar normatif sengaja tidak dihitung:
      // menambah kutipan pasal tidak menambah pengetahuan tentang fakta.
      for (const ev of ds.evidence) set.add(ev.source_id);
      supportByDim.set(ds.dimension_id, set);
    }
  }
  const result = new Map<string, { score: number; confidence: number }>();
  for (const [dimId, { sum, n }] of acc) {
    let confSum = 0;
    for (const a of assessments)
      for (const ds of a.dimension_scores)
        if (ds.dimension_id === dimId && !(ds.evidence_gap === true || ds.evidence.length === 0))
          confSum += ds.confidence;
    const baseConfidence = n > 0 ? confSum / n : 0;
    result.set(dimId, {
      score: sum / n,
      confidence: effectiveConfidence(baseConfidence, supportByDim.get(dimId)?.size ?? 1),
    });
  }
  return { perDim: result, excluded };
}

/**
 * Hitung ringkasan dari sekumpulan penilaian yang SUDAH difilter pemanggil.
 * Tidak diekspor: pemanggil wajib lewat `computeIndex` agar kebijakan status
 * selalu dinyatakan. Lihat catatan pada AssessmentBasis.
 */
function summarize(
  assessments: Assessment[],
  rubric: Rubric,
  basis: AssessmentBasis
): AssessmentSummary | null {
  if (assessments.length === 0) return null;

  const { perDim, excluded } = meanPerDimension(assessments, rubric);
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
  const belowFloor = coverage < MIN_COVERAGE_FOR_INDEX;

  return {
    term_id: assessments[0]?.term_id ?? "",
    assessment_ids: assessments.map((a) => a.id),
    rubric_version: assessments[0]?.rubric_version ?? "",
    basis,
    published_count: assessments.filter((a) => a.status === "published").length,
    draft_count: assessments.filter((a) => a.status !== "published").length,
    excluded_no_evidence: excluded,
    groups,
    index: overall === null || belowFloor ? null : scoreToIndex(overall),
    index_suppressed_reason: overall !== null && belowFloor ? "cakupan-di-bawah-ambang" : null,
    coverage,
    scored_dimensions: scoredDims,
    total_dimensions: totalDimensions,
  };
}

/**
 * SATU-SATUNYA jalan menghitung indeks sebuah masa jabatan.
 *
 * `basis` tidak punya nilai default dengan sengaja: setiap permukaan —
 * halaman, REST API, ekspor — harus menyatakan apakah ia menyajikan angka
 * terkurasi ("published") atau pratinjau draf ("draft-preview"). Dasar itu
 * ikut terbawa di hasil sehingga tidak bisa hilang di perjalanan.
 */
export function computeIndex(
  allAssessments: Assessment[],
  termId: string,
  rubric: Rubric,
  basis: AssessmentBasis
): AssessmentSummary | null {
  const forTerm = allAssessments.filter((a) => a.term_id === termId);
  const eligible =
    basis === "published"
      ? forTerm.filter((a) => a.status === "published" && a.human_confirmed)
      : forTerm;
  return summarize(eligible, rubric, basis);
}

/** Indeks publik: hanya penilaian terkurasi dan terkonfirmasi manusia. */
export function computePublicIndex(
  allAssessments: Assessment[],
  termId: string,
  rubric: Rubric
): AssessmentSummary | null {
  return computeIndex(allAssessments, termId, rubric, "published");
}
