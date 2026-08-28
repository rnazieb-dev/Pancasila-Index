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
  /** rerata tertimbang keyakinan efektif dimensi grup ini (0..1) */
  confidence: number;
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
  /** Versi mesin skor yang menghasilkan angka ini; lihat SCORING_METHOD_VERSION. */
  method_version: string;
  /** Dasar status angka ini; ikut terbawa ke payload API dan UI. */
  basis: AssessmentBasis;
  /** Komposisi penilaian pembentuk angka. */
  published_count: number;
  draft_count: number;
  /** Skor dimensi yang DIKELUARKAN karena belum berbukti empiris. */
  excluded_no_evidence: number;
  /**
   * Skor yang dikeluarkan karena dimension_id-nya tidak ada di rubrik aktif.
   * Dulu dilewati tanpa dihitung, sehingga matematika cakupan dan ambang
   * MIN_COVERAGE_FOR_INDEX bergeser tanpa jejak - relevan begitu rubrik
   * berubah struktur dan penilaian lama menyebut dimensi yang sudah hilang.
   */
  excluded_unknown_dimension: number;
  /** skor per grup (sila / tujuan pembukaan / struktur UUD) */
  groups: GroupScoreResult[];
  /** indeks komposit 0..100; null bila tak ada dimensi dinilai ATAU cakupan di bawah ambang */
  index: number | null;
  /** Alasan indeks ditahan, agar UI dapat menjelaskan alih-alih menampilkan kosong. */
  index_suppressed_reason: "cakupan-di-bawah-ambang" | null;
  /**
   * Rentang indeks dari keyakinan bukti. Null tepat ketika `index` null.
   * Bukti lemah MELEBARKAN rentang, tidak menggeser nilai tengahnya.
   */
  index_interval: { low: number; high: number } | null;
  /** Rerata tertimbang keyakinan efektif seluruh dimensi yang dihitung (0..1). */
  mean_confidence: number;
  /**
   * Pelanggaran pada dimensi yang memuat hak tak dapat dikurangi.
   *
   * WAJIB terisi terlepas dari apakah `index` terbit: karena ambang cakupan
   * menahan indeks pada mayoritas masa jabatan, kasus paling umum justru
   * "ada pelanggaran, indeks ditahan". UI harus menampilkan peringatannya
   * tanpa bergantung pada adanya angka.
   */
  non_derogable_breaches: { dimension_id: string; score: number }[];
  /** Komposit dibatasi karena pelanggaran di atas. Bukan bentuk penahanan. */
  index_capped: boolean;
  /**
   * Nilai komposit SEBELUM dibatasi. Wajib diterbitkan: batas yang
   * menyembunyikan angka yang digantikannya adalah tangan tak terlihat,
   * dan seluruh klaim proyek ini soal dapat diaudit.
   */
  index_uncapped: number | null;
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

/**
 * Versi MESIN SKOR, terpisah dari versi rubrik.
 *
 * CONTRIBUTING.md membatasi versi rubrik pada isi rubrik: dimensi, indikator,
 * bobot. Mengubah cara agregasi (mis. keyakinan berhenti jadi bobot, atau
 * pelanggaran hak non-derogable membatasi komposit) tidak memindahkan satu pun
 * dari ketiganya - tetapi mengubah SETIAP angka yang diterbitkan. Tanpa
 * penanda ini, dua angka dari rubrik 1.0.0 bisa berbeda tanpa jejak sebabnya.
 *
 * Naikkan setiap kali rumus agregasi berubah, dan sebutkan di changelog.
 */
export const SCORING_METHOD_VERSION = "2.0.0";

/**
 * Setengah-lebar rentang maksimum, dalam satuan SKOR (-2..+2), pada keyakinan 0.
 *
 * Keyakinan bukti tidak lagi mengubah nilai tengah - ia melaporkan seberapa
 * lebar rentangnya. Dulu keyakinan dikalikan ke bobot, sehingga pelanggaran
 * berat yang sulit dibuktikan justru MERINGANKAN indeks (terukur: -2 pada
 * keyakinan 0,20 bersama empat +1 pada 0,90 menghasilkan 71,1, bukan 60,0).
 * Itu insentif terbalik untuk indeks yang mengukur pemegang kekuasaan.
 *
 * 1 poin skor = 25 poin indeks, jadi 0.5 berarti maksimum +-12,5 poin indeks
 * pada keyakinan 0, dan sekitar +-2,5 pada keyakinan 0,9.
 */
export const MAX_UNCERTAINTY_HALFWIDTH = 0.5;

/**
 * Batas atas komposit ketika dimensi ber-`non_derogable` dilanggar.
 *
 * Rerata tertimbang bersifat kompensatoris penuh: terukur, -2 pada HAM,
 * negara hukum, dan checks-and-balances sekaligus bersama lima dimensi +2
 * menghasilkan 62,5 - di ATAS "netral" 50. Pasal 28I ayat (1) UUD menyebut
 * sebagian hak tidak dapat dikurangi dalam keadaan apa pun; membiarkannya
 * dilunasi pertumbuhan ekonomi bukan pilihan penyetelan melainkan salah baca
 * struktur normanya.
 *
 * Ini BATAS, bukan veto: angkanya tetap terbit dan tetap dinyatakan, hanya
 * tidak boleh melampaui plafon. Menahan angka akan menyembunyikan
 * pelanggaran; membatasi menyatakannya.
 */
export const NON_DEROGABLE_CAPS = {
  /** Pelanggaran berat (skor -2) -> plafon indeks 25. */
  severe: -1.0,
  /** Penggerusan (skor <= -1) -> plafon indeks 50 (netral). */
  erosion: 0.0,
} as const;

/**
 * Porsi NYATA tiap dimensi terhadap komposit pada cakupan penuh.
 *
 * Ini bukan `dimension.weight`, dan bedanya pernah menyembunyikan cacat
 * selama seumur proyek: bobot grup 5/4/3 kebetulan sama dengan jumlah
 * dimensi tiap grup (5, 4, 3), sehingga porsi tiap dimensi menjadi
 * `bobot/total x 1/jumlah` = 1/12 - identik untuk kedua belasnya. Rubrik
 * mengumumkan hierarki normatif yang secara aritmetik tidak berpengaruh,
 * dan tidak ada test yang pernah mengukurnya.
 *
 * Turunkan porsi dari rumus agregasi yang sebenarnya, jangan dari angka
 * bobot mentah, dan pakai fungsi ini untuk yang ditampilkan ke pembaca.
 */
export function dimensionInfluence(rubric: Rubric): Map<string, number> {
  const totalGroupWeight = rubric.groups.reduce((acc, g) => acc + g.weight, 0);
  const out = new Map<string, number>();
  if (totalGroupWeight <= 0) return out;

  for (const group of rubric.groups) {
    const dims = rubric.dimensions.filter((d) => d.group_id === group.id);
    const totalDimWeight = dims.reduce((acc, d) => acc + d.weight, 0);
    if (totalDimWeight <= 0) continue;
    // Porsi grup dinormalisasi, lalu dibagi ke dimensinya menurut bobotnya.
    const groupShare = group.weight / totalGroupWeight;
    for (const dim of dims) {
      out.set(dim.id, groupShare * (dim.weight / totalDimWeight));
    }
  }
  return out;
}

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
): {
  perDim: Map<string, { score: number; confidence: number }>;
  excluded: number;
  excludedUnknown: number;
} {
  const acc = new Map<string, { sum: number; n: number }>();
  const supportByDim = new Map<string, Set<string>>();
  let excluded = 0;
  let excludedUnknown = 0;
  for (const a of assessments) {
    for (const ds of a.dimension_scores) {
      if (!rubric.dimensions.some((d) => d.id === ds.dimension_id)) {
        // Dihitung, tidak cuma dilewati: kalau senyap, cakupan bergeser tanpa
        // ada yang tahu. Sengaja tidak throw - summarize dipanggil dengan
        // fixture buatan tangan di test.
        excludedUnknown += 1;
        continue;
      }
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
  return { perDim: result, excluded, excludedUnknown };
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

  const { perDim, excluded, excludedUnknown } = meanPerDimension(assessments, rubric);
  const totalDimensions = rubric.dimensions.length;

  /** Hasil per grup plus setengah-lebar rentangnya (internal, tidak diekspor). */
  interface GroupAgg {
    public: GroupScoreResult;
    halfWidth: number;
    weightSum: number;
  }

  const aggs: GroupAgg[] = rubric.groups.map((group) => {
    const dims = rubric.dimensions.filter((d) => d.group_id === group.id);
    const items: EffectiveScore[] = [];
    // Setengah-lebar rentang grup digabung dengan BOBOT YANG SAMA dengan nilai
    // tengahnya, memakai aturan LINEAR: H = sum(w*h) / sum(w).
    //
    // Sengaja bukan kuadratur. Kuadratur mengasumsikan galat tiap dimensi
    // saling bebas - tidak dapat dipertahankan ketika satu penulis (kini
    // pipeline AI) menghasilkan seluruh 12 skor dari kumpulan sumber yang
    // tumpang-tindih. Linear itu arah konservatif, dan bagi indeks legitimasi
    // terlalu berhati-hati adalah mode gagal yang benar.
    // JANGAN "optimalkan" ini menjadi kuadratur.
    let halfWeighted = 0;
    let confWeighted = 0;
    let weightSum = 0;
    for (const dim of dims) {
      const m = perDim.get(dim.id);
      if (!m) continue;
      // Keyakinan TIDAK ikut ke bobot - hanya bobot dimensi dari rubrik.
      items.push({ score: m.score, effectiveWeight: dim.weight });
      halfWeighted += dim.weight * (1 - m.confidence) * MAX_UNCERTAINTY_HALFWIDTH;
      confWeighted += dim.weight * m.confidence;
      weightSum += dim.weight;
    }
    const score = weightedMean(items);
    return {
      public: {
        group_id: group.id,
        score: score ?? 0,
        coverage: dims.length > 0 ? items.length / dims.length : 0,
        confidence: weightSum > 0 ? confWeighted / weightSum : 0,
      },
      halfWidth: weightSum > 0 ? halfWeighted / weightSum : 0,
      weightSum,
    };
  });

  const groups: GroupScoreResult[] = aggs.map((a) => a.public);

  const scoredDims = [...perDim.keys()].length;
  const coverage = totalDimensions > 0 ? scoredDims / totalDimensions : 0;

  const groupItems: EffectiveScore[] = [];
  // Setengah-lebar komposit, digabung dengan bobot grup yang sama.
  let compHalfWeighted = 0;
  let compConfWeighted = 0;
  let compWeightSum = 0;
  for (const a of aggs) {
    const gs = a.public;
    const g = rubric.groups.find((rg) => rg.id === gs.group_id);
    if (!g || gs.coverage === 0) continue;
    // TODO(tiket sendiri): `coverage` di sini adalah besaran epistemik yang
    // dipakai sebagai bobot substantif - masalah sekeluarga dengan keyakinan
    // yang baru dicabut dari bobot. Dibiarkan karena MIN_COVERAGE_FOR_INDEX
    // sudah menahan kasus terburuk; jangan diubah tanpa tiketnya sendiri.
    const w = g.weight * gs.coverage;
    groupItems.push({ score: gs.score, effectiveWeight: w });
    compHalfWeighted += w * a.halfWidth;
    compConfWeighted += w * gs.confidence;
    compWeightSum += w;
  }
  const overall = weightedMean(groupItems);
  const belowFloor = coverage < MIN_COVERAGE_FOR_INDEX;
  const meanConfidence = compWeightSum > 0 ? compConfWeighted / compWeightSum : 0;
  const halfWidth = compWeightSum > 0 ? compHalfWeighted / compWeightSum : 0;

  // ---- pelanggaran hak yang tak dapat dikurangi ----
  // Dikumpulkan dari perDim, sehingga skor ber-`evidence_gap` otomatis tidak
  // memicu batas: ia sudah dikeluarkan lebih dulu di meanPerDimension.
  const breaches: { dimension_id: string; score: number }[] = [];
  let cap: number | null = null;
  for (const dim of rubric.dimensions) {
    if (!dim.non_derogable) continue;
    const m = perDim.get(dim.id);
    if (!m || m.score > -1) continue;
    breaches.push({ dimension_id: dim.id, score: m.score });
    const c = m.score <= -2 ? NON_DEROGABLE_CAPS.severe : NON_DEROGABLE_CAPS.erosion;
    cap = cap === null ? c : Math.min(cap, c);
  }

  // Batas hanya boleh MENURUNKAN. Ambang cakupan dievaluasi lebih dulu dan
  // menang: membatasi angka yang tidak terbit tidak bermakna. Namun
  // `breaches` tetap dilaporkan agar UI bisa memperingatkan tanpa angka.
  const cappedOverall =
    overall !== null && cap !== null ? Math.min(overall, cap) : overall;
  // `index_capped` hanya berlaku bila ada angka terbit yang dibatasi. Ketika
  // ambang cakupan menahan indeks, tidak ada yang dibatasi - tetapi `breaches`
  // tetap dilaporkan supaya UI bisa memperingatkan tanpa angka.
  const wasCapped =
    !belowFloor && overall !== null && cappedOverall !== null && cappedOverall < overall;

  const indexOut = cappedOverall === null || belowFloor ? null : scoreToIndex(cappedOverall);
  // scoreToIndex sudah menjepit ke [-2,+2], jadi batas [0,100] gratis.
  // Batas dipasang ke nilai tengah DAN ke `high`, supaya rentangnya tidak
  // bisa mengklaim "mungkin sebenarnya aman". `low` dibiarkan.
  const interval =
    cappedOverall === null || belowFloor
      ? null
      : {
          low: scoreToIndex(cappedOverall - halfWidth),
          high: scoreToIndex(
            cap === null ? cappedOverall + halfWidth : Math.min(cappedOverall + halfWidth, cap)
          ),
        };

  return {
    term_id: assessments[0]?.term_id ?? "",
    assessment_ids: assessments.map((a) => a.id),
    rubric_version: assessments[0]?.rubric_version ?? "",
    method_version: SCORING_METHOD_VERSION,
    basis,
    published_count: assessments.filter((a) => a.status === "published").length,
    draft_count: assessments.filter((a) => a.status !== "published").length,
    excluded_no_evidence: excluded,
    excluded_unknown_dimension: excludedUnknown,
    groups,
    index: indexOut,
    index_suppressed_reason: overall !== null && belowFloor ? "cakupan-di-bawah-ambang" : null,
    index_interval: interval,
    mean_confidence: meanConfidence,
    non_derogable_breaches: breaches,
    index_capped: wasCapped,
    index_uncapped: overall === null || belowFloor ? null : scoreToIndex(overall),
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
