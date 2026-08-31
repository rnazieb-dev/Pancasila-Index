import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { appendSource, addEvidence } from "../src/yaml-edit";

const ASSESSMENTS = fileURLToPath(new URL("../data/assessments.yaml", import.meta.url));
const SOURCES = fileURLToPath(new URL("../data/sources.yaml", import.meta.url));

const assessments = readFileSync(ASSESSMENTS, "utf8");
const sources = readFileSync(SOURCES, "utf8");

describe("appendSource", () => {
  it("menambahkan entri baru dan hasilnya tetap YAML sah", () => {
    const entri = [
      "- id: uji-sumber-baru",
      "  type: putusan-mk",
      "  title_id: Putusan Uji Coba",
      "  year: 2026",
      "  citation_id: Putusan Uji Coba",
      "  url: https://mkri.id/uji",
    ].join("\n");

    const hasil = appendSource(sources, entri);
    expect(hasil.applied).toBe(true);

    const parsed = YAML.parse(hasil.text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(YAML.parse(sources).length + 1);
    expect(parsed.at(-1).id).toBe("uji-sumber-baru");
  });

  it("menolak id yang sudah ada (idempoten)", () => {
    const adaId = YAML.parse(sources)[0].id;
    const hasil = appendSource(sources, `- id: ${adaId}\n  type: lainnya`);
    expect(hasil.applied).toBe(false);
    expect(hasil.text).toBe(sources);
  });
});

describe("addEvidence pada assessments.yaml sungguhan", () => {
  it("menyisipkan sitasi dan dokumen tetap dapat diurai", () => {
    const doc = YAML.parse(assessments);
    const entri = doc[0];
    const dim = entri.dimension_scores[0];

    const hasil = addEvidence(assessments, entri.term_id, dim.dimension_id, "sumber-uji-xyz");
    expect(hasil.applied, hasil.reason).toBe(true);

    const setelah = YAML.parse(hasil.text);
    expect(setelah.length).toBe(doc.length);

    const dimSetelah = setelah[0].dimension_scores[0];
    const ids = dimSetelah.evidence.map((e: { source_id: string }) => e.source_id);
    expect(ids).toContain("sumber-uji-xyz");
    // Sitasi lama tidak boleh hilang.
    for (const e of dim.evidence) expect(ids).toContain(e.source_id);
  });

  it("hanya mengubah SATU baris (diff minimal)", () => {
    const doc = YAML.parse(assessments);
    const hasil = addEvidence(
      assessments,
      doc[0].term_id,
      doc[0].dimension_scores[0].dimension_id,
      "sumber-uji-diff",
    );
    const sebelum = assessments.split("\n");
    const sesudah = hasil.text.split("\n");
    expect(sesudah.length).toBe(sebelum.length + 1);
  });

  it("tidak menyentuh masa jabatan lain meski id dimensi sama", () => {
    const doc = YAML.parse(assessments);
    const target = doc[0];
    const dimId = target.dimension_scores[0].dimension_id;
    // dimensi yang sama pasti muncul di banyak masa jabatan
    const lain = doc.filter((a: { term_id: string }) => a.term_id !== target.term_id);
    expect(lain.length).toBeGreaterThan(0);

    const hasil = addEvidence(assessments, target.term_id, dimId, "sumber-uji-isolasi");
    const setelah = YAML.parse(hasil.text);

    for (const a of setelah) {
      const d = a.dimension_scores.find((x: { dimension_id: string }) => x.dimension_id === dimId);
      if (!d) continue;
      const ids = d.evidence.map((e: { source_id: string }) => e.source_id);
      if (a.term_id === target.term_id) expect(ids).toContain("sumber-uji-isolasi");
      else expect(ids).not.toContain("sumber-uji-isolasi");
    }
  });

  it("menolak masa jabatan yang tidak ada", () => {
    const h = addEvidence(assessments, "masa-jabatan-fiktif", "sila-1", "x");
    expect(h.applied).toBe(false);
    expect(h.text).toBe(assessments);
  });

  it("menolak dimensi yang belum dinilai pada masa jabatan itu", () => {
    const doc = YAML.parse(assessments);
    const entri = doc[0];
    const dinilai = new Set(entri.dimension_scores.map((d: { dimension_id: string }) => d.dimension_id));
    const belum = ["sila-1","sila-2","sila-3","sila-4","sila-5","tujuan-1","tujuan-2",
      "tujuan-3","tujuan-4","negara-hukum","checks-balances","kedaulatan-rakyat"]
      .find((d) => !dinilai.has(d));
    if (!belum) return; // entri pertama lengkap; lewati
    const h = addEvidence(assessments, entri.term_id, belum, "x");
    expect(h.applied).toBe(false);
    expect(h.text).toBe(assessments);
  });

  it("idempoten: sitasi yang sudah ada tidak diduplikasi", () => {
    const doc = YAML.parse(assessments);
    const entri = doc[0];
    const dim = entri.dimension_scores[0];
    const sudahAda = dim.evidence[0].source_id;
    const h = addEvidence(assessments, entri.term_id, dim.dimension_id, sudahAda);
    expect(h.applied).toBe(false);
    expect(h.text).toBe(assessments);
  });

  it("bekerja untuk SETIAP masa jabatan & dimensi di dataset", () => {
    const doc = YAML.parse(assessments);
    let dicoba = 0;
    for (const a of doc) {
      for (const d of a.dimension_scores) {
        const h = addEvidence(assessments, a.term_id, d.dimension_id, "sumber-uji-menyeluruh");
        expect(h.applied, `${a.term_id}/${d.dimension_id}: ${h.reason}`).toBe(true);
        dicoba++;
      }
    }
    expect(dicoba).toBeGreaterThan(500);
  });
});
