import { describe, it, expect } from "vitest";
import { dataset } from "../src/index";

describe("Scale & Integrity of Events Corpus", () => {
  it("memuat ratusan peristiwa dengan struktur valid", () => {
    expect(dataset.events.length).toBeGreaterThanOrEqual(230);
  });

  it("seluruh peristiwa memiliki ID unik dan format slug yang benar", () => {
    const ids = new Set<string>();
    for (const ev of dataset.events) {
      expect(ids.has(ev.id), `ID peristiwa '${ev.id}' duplikat`).toBe(false);
      ids.add(ev.id);
      expect(ev.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("seluruh peristiwa terhubung ke masa jabatan (term) yang sah", () => {
    const termIds = new Set(dataset.terms.map((t) => t.id));
    for (const ev of dataset.events) {
      expect(
        termIds.has(ev.term_id),
        `Peristiwa '${ev.id}' merujuk term_id '${ev.term_id}' yang tidak terdaftar`
      ).toBe(true);
    }
  });

  it("seluruh peristiwa memiliki setidaknya satu sumber primer aktif terverifikasi", () => {
    const sourceIds = new Set(dataset.sources.map((s) => s.id));
    for (const ev of dataset.events) {
      expect(
        ev.source_ids.length,
        `Peristiwa '${ev.id}' wajib memiliki sumber primer`
      ).toBeGreaterThanOrEqual(1);

      for (const sid of ev.source_ids) {
        expect(
          sourceIds.has(sid),
          `Sumber '${sid}' pada peristiwa '${ev.id}' tidak ditemukan di sources.yaml`
        ).toBe(true);
      }
    }
  });

  it("seluruh peristiwa terpetakan ke dimensi rubrik Pancasila yang valid", () => {
    const dimIds = new Set(dataset.rubric.dimensions.map((d) => d.id));
    for (const ev of dataset.events) {
      for (const dim of ev.dimension_ids) {
        expect(
          dimIds.has(dim),
          `Dimensi '${dim}' pada peristiwa '${ev.id}' tidak terdaftar di rubrik`
        ).toBe(true);
      }
    }
  });

  it("seluruh peristiwa memiliki ringkasan historis substantif (summary_id)", () => {
    for (const ev of dataset.events) {
      expect(ev.title_id.length).toBeGreaterThanOrEqual(5);
      expect(ev.summary_id.length).toBeGreaterThanOrEqual(15);
    }
  });
});
