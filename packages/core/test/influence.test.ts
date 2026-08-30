import { describe, expect, it } from "vitest";

import { dimensionInfluence } from "../src/scoring.js";
import type { Rubric } from "../src/schemas.js";

/**
 * Rubrik NYATA (12 dimensi, 5/4/3 per grup) - bukan fixture kecil, karena
 * cacat yang diuji di sini justru lahir dari kebetulan pada angka nyata:
 * bobot grup 5/4/3 sama dengan jumlah dimensinya.
 */
function rubrikNyata(groupWeights: [number, number, number]): Rubric {
  const [wSila, wTujuan, wStruktur] = groupWeights;
  const dim = (id: string, group_id: string) => ({
    id,
    group_id,
    name_id: id,
    question_id: `Pertanyaan ${id}?`,
    weight: 1,
    anchors: { "-2": "buruk", "0": "netral", "2": "baik" },
    indicators: [],
  });
  return {
    version: "1.0.0",
    name_id: "Rubrik",
    description_id: "Rubrik dengan struktur grup nyata.",
    groups: [
      { id: "sila", name_id: "Lima Sila", description_id: "lima sila", weight: wSila },
      { id: "pembukaan", name_id: "Tujuan", description_id: "empat tujuan", weight: wTujuan },
      { id: "struktur-uud", name_id: "Struktural", description_id: "norma struktural", weight: wStruktur },
    ],
    dimensions: [
      ...["sila-1", "sila-2", "sila-3", "sila-4", "sila-5"].map((id) => dim(id, "sila")),
      ...["tujuan-1", "tujuan-2", "tujuan-3", "tujuan-4"].map((id) => dim(id, "pembukaan")),
      ...["negara-hukum", "checks-balances", "kedaulatan-rakyat"].map((id) => dim(id, "struktur-uud")),
    ],
  } as unknown as Rubric;
}

const pct = (v: number | undefined) => Math.round((v ?? 0) * 1000) / 10;

describe("dimensionInfluence", () => {
  it("porsi seluruh dimensi berjumlah 100%", () => {
    const inf = dimensionInfluence(rubrikNyata([0.4, 0.3, 0.3]));
    const total = [...inf.values()].reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 10);
    expect(inf.size).toBe(12);
  });

  it("MEREKAM CACAT: bobot 5/4/3 saling meniadakan karena jumlah dimensi juga 5/4/3", () => {
    // Ini keadaan rubrik SEBELUM diperbaiki. Test ini ada untuk membuktikan
    // cacatnya nyata dan terukur, bukan tuduhan - dan agar siapa pun yang
    // kembali ke bobot 5/4/3 langsung melihat akibatnya.
    const inf = dimensionInfluence(rubrikNyata([5, 4, 3]));
    for (const id of inf.keys()) expect(pct(inf.get(id))).toBe(8.3);
    // hierarki yang dideklarasikan rubrik tidak berpengaruh sama sekali
    expect(inf.get("negara-hukum")).toBeCloseTo(inf.get("tujuan-4")!, 10);
    expect(inf.get("sila-1")).toBeCloseTo(inf.get("kedaulatan-rakyat")!, 10);
  });

  it("bobot 40/30/30 memberi hierarki yang berpengaruh nyata", () => {
    // Angka ini BUKAN penilaian normatif baru: docs/metodologi.md sudah
    // menerbitkan 40%/30%/30% sejak lama; kodenya yang belum menurutinya.
    const inf = dimensionInfluence(rubrikNyata([0.4, 0.3, 0.3]));
    expect(pct(inf.get("sila-1"))).toBe(8.0);
    expect(pct(inf.get("tujuan-4"))).toBe(7.5);
    expect(pct(inf.get("negara-hukum"))).toBe(10.0);
    // keluhan intinya: negara hukum harus di atas politik luar negeri
    expect(inf.get("negara-hukum")!).toBeGreaterThan(inf.get("tujuan-4")!);
  });

  it("porsi grup tidak boleh sebanding jumlah dimensinya", () => {
    // Penjaga terhadap 'perbaikan' yang menghapus normalisasi per grup
    // sehingga bobot efektif = bobot_grup x bobot_dimensi. Itu membuat grup
    // besar mendominasi: struktur-uud jatuh ke 18% dan negara-hukum ke 6%.
    const inf = dimensionInfluence(rubrikNyata([0.4, 0.3, 0.3]));
    const porsiGrup = (ids: string[]) => ids.reduce((a, id) => a + inf.get(id)!, 0);
    expect(porsiGrup(["sila-1", "sila-2", "sila-3", "sila-4", "sila-5"])).toBeCloseTo(0.4, 10);
    expect(porsiGrup(["tujuan-1", "tujuan-2", "tujuan-3", "tujuan-4"])).toBeCloseTo(0.3, 10);
    expect(porsiGrup(["negara-hukum", "checks-balances", "kedaulatan-rakyat"])).toBeCloseTo(0.3, 10);
  });

  it("bobot dimensi berbeda membagi porsi grup secara proporsional", () => {
    const r = rubrikNyata([0.4, 0.3, 0.3]);
    // naikkan sila-2 (HAM) jadi 2, sisanya tetap 1 -> total bobot sila = 6
    (r.dimensions.find((d) => d.id === "sila-2") as { weight: number }).weight = 2;
    const inf = dimensionInfluence(r);
    expect(inf.get("sila-2")).toBeCloseTo(0.4 * (2 / 6), 10);
    expect(inf.get("sila-1")).toBeCloseTo(0.4 * (1 / 6), 10);
    expect([...inf.values()].reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
  });
});
