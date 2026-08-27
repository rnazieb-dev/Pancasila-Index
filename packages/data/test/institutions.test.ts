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

  it("memuat indeks eksternal independen dengan data deret waktu dan catatan kesenjangan ABS", () => {
    const indices = dataset.external_indices ?? [];
    expect(indices.length).toBeGreaterThanOrEqual(6);

    const dimIds = new Set(dataset.rubric.dimensions.map((d) => d.id));

    for (const idx of indices) {
      expect(idx.id).toBeDefined();
      expect(idx.name.length).toBeGreaterThanOrEqual(3);
      expect(idx.publisher.length).toBeGreaterThanOrEqual(2);
      expect(["hard-data", "expert-coded", "civil-society", "official-self-assessment"]).toContain(idx.type);
      expect(idx.data.length).toBeGreaterThanOrEqual(1);
      expect(idx.abs_discrepancy_note).toBeDefined();
      expect((idx.abs_discrepancy_note || "").length).toBeGreaterThan(15);

      for (const dim of idx.target_dimensions) {
        expect(dimIds.has(dim), `Dimensi target ${dim} pada indeks ${idx.id} harus terdaftar di rubrik`).toBe(true);
      }

      for (const dp of idx.data) {
        expect(dp.year).toBeGreaterThanOrEqual(1945);
        // Skor boleh null bila penerbit hanya merilis peringkat; yang tidak
        // boleh adalah titik data kosong sama sekali.
        if (dp.score === null) {
          expect(
            dp.rank,
            `Titik data ${idx.id}/${dp.year} tanpa skor wajib punya peringkat`
          ).toBeDefined();
        } else {
          expect(typeof dp.score).toBe("number");
        }
        // Provenance, bila ada, wajib lengkap agar bisa ditelusuri ulang.
        if (dp.provenance) {
          expect(dp.provenance.url).toMatch(/^https?:\/\//);
          expect(dp.provenance.retrieved_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      }

      // Derajat verifikasi dihitung build, bukan diklaim YAML.
      const withProv = idx.data.filter((dp) => dp.provenance).length;
      const expected =
        withProv === 0
          ? "belum-terverifikasi"
          : withProv === idx.data.length
            ? "terverifikasi"
            : "sebagian";
      expect(
        idx.verification,
        `verification indeks ${idx.id} harus konsisten dengan kelengkapan provenance`
      ).toBe(expected);
    }
  });

  it("tidak memuat indeks tanpa penerbit yang bisa dilacak", () => {
    // Indeks fiktif "Indeks Supremasi Sipil & Integritas Sektor Keamanan"
    // pernah ada di berkas ini padahal penerbitnya tidak eksis. Uji ini
    // menjaga agar tidak masuk lagi.
    for (const idx of dataset.external_indices ?? []) {
      expect(idx.id).not.toBe("civilian-supremacy-security");
      expect(idx.url).toMatch(/^https?:\/\//);
    }
  });
});

describe("Aktor, perkara, dan atribusi peristiwa", () => {
  it("setiap kursi masa jabatan tertaut ke entitas orang kanonik", () => {
    const actorIds = new Set(dataset.actors.map((a) => a.id));
    expect(actorIds.size).toBe(dataset.actors.length);

    for (const term of dataset.terms) {
      for (const a of term.actors) {
        expect(
          a.actor_id,
          `Aktor ${a.name} pada masa jabatan ${term.id} belum punya actor_id`
        ).toBeDefined();
        expect(
          actorIds.has(a.actor_id!),
          `actor_id ${a.actor_id} pada ${term.id} tidak ada di actors.yaml`
        ).toBe(true);
      }
    }
  });

  it("setiap perkara bersitasi minimal satu sumber yang terdaftar", () => {
    const srcIds = new Set(dataset.sources.map((s) => s.id));
    const actorIds = new Set(dataset.actors.map((a) => a.id));
    const eventIds = new Set(dataset.events.map((e) => e.id));

    expect(dataset.actor_cases.length).toBeGreaterThan(0);
    for (const c of dataset.actor_cases) {
      expect(
        c.source_ids.length,
        `Perkara ${c.id} tanpa sumber - nama tidak boleh masuk tanpa dokumen`
      ).toBeGreaterThanOrEqual(1);
      for (const sid of c.source_ids) expect(srcIds.has(sid)).toBe(true);
      expect(actorIds.has(c.actor_id)).toBe(true);
      for (const eid of c.event_ids) expect(eventIds.has(eid)).toBe(true);
    }
  });

  it("status hukum perkara selalu eksplisit", () => {
    const allowed = [
      "terlapor",
      "tersangka",
      "terdakwa",
      "terpidana",
      "inkracht",
      "bebas",
      "dihentikan",
    ];
    for (const c of dataset.actor_cases) {
      expect(allowed, `Status perkara ${c.id} tidak dikenal`).toContain(c.status);
    }
  });

  it("re-atribusi peristiwa selalu bisa diaudit", () => {
    const termIds = new Set(dataset.terms.map((t) => t.id));
    const reattributed = dataset.events.filter((e) => e.subject_term_id);
    expect(reattributed.length).toBeGreaterThan(0);

    for (const e of reattributed) {
      expect(termIds.has(e.subject_term_id!)).toBe(true);
      expect(
        e.subject_term_id,
        `subject_term_id ${e.id} sama dengan term_id - bukan re-atribusi`
      ).not.toBe(e.term_id);
      expect(
        e.subject_basis_id,
        `Re-atribusi ${e.id} tanpa subject_basis_id tidak bisa diaudit`
      ).toBeDefined();
      expect(
        e.source_ids.length,
        `Re-atribusi ${e.id} tanpa sumber tidak bisa ditelusuri`
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it("aktor yang dirujuk peristiwa selalu terdaftar", () => {
    const actorIds = new Set(dataset.actors.map((a) => a.id));
    for (const e of dataset.events) {
      for (const aid of e.actor_ids) {
        expect(actorIds.has(aid), `event ${e.id}: actor_id ${aid} tidak terdaftar`).toBe(true);
      }
    }
  });
});

