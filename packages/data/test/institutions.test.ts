import { describe, it, expect } from "vitest";
import { dataset, getInstitutions, getTermsOfInstitution } from "../src/index";

describe("8 Constitutional Organs Dataset Integration", () => {
  it("memuat tepat 8 organ konstitusional UUD 1945", () => {
    const institutions = getInstitutions(dataset);
    expect(institutions).toHaveLength(8);

    const expectedSlugs = [
      "presiden",
      "dpr",
      "mpr",
      "dpd",
      "mahkamah-konstitusi",
      "mahkamah-agung",
      "bpk",
      "komisi-yudisial",
    ];

    for (const slug of expectedSlugs) {
      const found = institutions.find((i) => i.slug === slug);
      expect(found, `Lembaga '${slug}' harus terdaftar`).toBeDefined();
      expect(found?.name_id.length).toBeGreaterThan(5);
    }
  });

  it("setiap organ memiliki setidaknya 1 masa jabatan terdaftar", () => {
    for (const inst of dataset.institutions) {
      const terms = getTermsOfInstitution(dataset, inst.id);
      expect(terms.length, `Lembaga ${inst.id} harus memiliki masa jabatan`).toBeGreaterThanOrEqual(1);
    }
  });

  it("setiap peristiwa memiliki tanggal valid dan sumber primer terhubung", () => {
    const sourceIds = new Set(dataset.sources.map((s) => s.id));
    for (const ev of dataset.events) {
      expect(ev.date).toMatch(/^\d{4}(-\d{2})?(-\d{2})?$/);
      expect(ev.source_ids.length, `Peristiwa ${ev.id} harus memiliki sumber`).toBeGreaterThanOrEqual(1);
      for (const sid of ev.source_ids) {
        expect(sourceIds.has(sid), `Sumber ${sid} pada peristiwa ${ev.id} harus terdaftar`).toBe(true);
      }
    }
  });

  it("setiap penilaian terhubung ke masa jabatan yang sah dan memiliki skor dimensi", () => {
    const termIds = new Set(dataset.terms.map((t) => t.id));
    const dimIds = new Set(dataset.rubric.dimensions.map((d) => d.id));

    for (const asm of dataset.assessments) {
      expect(termIds.has(asm.term_id), `Assessment ${asm.id} harus terhubung ke term sah`).toBe(true);
      expect(asm.dimension_scores.length).toBeGreaterThanOrEqual(1);

      for (const ds of asm.dimension_scores) {
        expect(dimIds.has(ds.dimension_id), `Dimensi ${ds.dimension_id} harus ada di rubrik`).toBe(true);
        expect(ds.score).toBeGreaterThanOrEqual(-2);
        expect(ds.score).toBeLessThanOrEqual(2);
        expect(ds.confidence).toBeGreaterThanOrEqual(0);
        expect(ds.confidence).toBeLessThanOrEqual(1);
        expect(ds.rationale_id.length).toBeGreaterThanOrEqual(15);
      }
    }
  });
});
