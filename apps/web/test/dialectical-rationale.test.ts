import { describe, it, expect } from "vitest";
import { dimensionScoreSchema, expertQuoteSchema } from "@pancasila-index/core";
import { dataset } from "@pancasila-index/data";

describe("Dialectical Rationale & Expert Quotes Integrity", () => {
  it("expertQuoteSchema memvalidasi struktur kutipan langsung pakar hukum dan peradilan", () => {
    const quote = expertQuoteSchema.parse({
      quote:
        "Baru kali ini saya menyaksikan Mahkamah Konstitusi berubah haluan secepat ini dalam hitungan hari...",
      author: "Prof. Dr. Saldi Isra, S.H., M.P.A.",
      role: "Hakim Konstitusi",
      year: 2023,
      source_id: "dissenting-opinion-saldi-isra-putusan-90-2023",
    });

    expect(quote.author).toBe("Prof. Dr. Saldi Isra, S.H., M.P.A.");
    expect(quote.year).toBe(2023);
    expect(quote.source_id).toBe("dissenting-opinion-saldi-isra-putusan-90-2023");
  });

  it("dimensionScoreSchema memvalidasi struktur dialektika (tesis, antitesis, sintesis, dan kutipan)", () => {
    const ds = dimensionScoreSchema.parse({
      dimension_id: "checks-balances",
      score: -2,
      confidence: 0.9,
      thesis_id: "Pemerintah mengklaim revisi UU untuk penataan pengawasan.",
      antithesis_id: "Pakar mengkritik pelemahan KPK dan autokrasi legalisme.",
      synthesis_id: "Pelanggaran berat terhadap checks and balances.",
      expert_quotes: [
        {
          quote: "Revisi UU KPK membonsai independensi penyidikan...",
          author: "Bivitri Susanti, S.H., LL.M.",
          role: "Pakar Hukum Tata Negara",
          year: 2020,
        },
      ],
      rationale_id: "Sintesis lengkap pertimbangan ilmiah berbasis bukti empiris.",
      evidence: [{ source_id: "uu-19-2019" }],
    });

    expect(ds.thesis_id).toBeDefined();
    expect(ds.antithesis_id).toBeDefined();
    expect(ds.synthesis_id).toBeDefined();
    expect(ds.expert_quotes?.length).toBe(1);
  });

  it("dataset kanonik memuat skor berdialektika tesis-antitesis dan kutipan pakar terverifikasi", () => {
    let dialecticCount = 0;
    let quoteCount = 0;
    const sourceIds = new Set(dataset.sources.map((s) => s.id));

    for (const asm of dataset.assessments) {
      for (const ds of asm.dimension_scores) {
        if (ds.thesis_id || ds.antithesis_id) {
          dialecticCount++;
        }
        if (ds.expert_quotes && ds.expert_quotes.length > 0) {
          for (const eq of ds.expert_quotes) {
            quoteCount++;
            if (eq.source_id) {
              expect(sourceIds.has(eq.source_id)).toBe(true);
            }
          }
        }
      }
    }

    expect(dialecticCount).toBeGreaterThanOrEqual(20);
    expect(quoteCount).toBeGreaterThanOrEqual(20);
  });

  it("asesmen kunci era krusial memiliki kutipan pakar otoritatif", () => {
    const jokowi2 = dataset.assessments.find((a) => a.id === "asm-jokowi-ii");
    expect(jokowi2).toBeDefined();
    const cbJokowi2 = jokowi2?.dimension_scores.find((d) => d.dimension_id === "checks-balances");
    expect(cbJokowi2?.expert_quotes?.length).toBeGreaterThanOrEqual(1);
    expect(cbJokowi2?.expert_quotes?.some((q) => q.author.includes("Saldi Isra"))).toBe(true);

    const soeharto = dataset.assessments.find((a) => a.id === "asm-soeharto");
    expect(soeharto).toBeDefined();
    const cbSoeharto = soeharto?.dimension_scores.find((d) => d.dimension_id === "checks-balances");
    expect(cbSoeharto?.expert_quotes?.some((q) => q.author.includes("Daniel S. Lev"))).toBe(true);

    const mk23 = dataset.assessments.find((a) => a.id === "asm-mk23");
    expect(mk23).toBeDefined();
    const nhMk23 = mk23?.dimension_scores.find((d) => d.dimension_id === "negara-hukum");
    expect(nhMk23?.expert_quotes?.some((q) => q.author.includes("MKMK") || q.author.includes("Saldi Isra"))).toBe(true);
  });
});
