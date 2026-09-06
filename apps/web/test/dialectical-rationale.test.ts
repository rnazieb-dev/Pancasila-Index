import { describe, it, expect } from "vitest";
import { dimensionScoreSchema, expertQuoteSchema, formatApa } from "@pancasila-index/core";
import { dataset } from "@pancasila-index/data";

/*
 * Berkas ini dulu menguji JUMLAH kutipan ("minimal 20 kutipan pakar") dan
 * menyebut hasilnya "terverifikasi". Ambang itu justru mengunci masalahnya:
 * ia lulus selama dataset punya cukup banyak kutipan, tanpa pernah menanyakan
 * apakah kutipannya benar ada. Sembilan belas dari dua puluh satu kutipan yang
 * membuat uji ini hijau ternyata mustahil - antara lain kutipan Jimly
 * Asshiddiqie tahun 2005 tentang UU ITE yang baru disahkan 2008.
 *
 * Yang diuji sekarang adalah sifat yang membuat kutipan dapat diperiksa
 * pembaca, bukan banyaknya.
 */
describe("Integritas kutipan doktrin", () => {
  const quoteDasar = {
    quote: "Perubahan APBN wajib lewat undang-undang, bukan instruksi presiden.",
    author: "Prof. Dr. Ferdi, S.H., M.Hum.",
    role: "Dekan Fakultas Hukum Universitas Andalas",
    year: 2025,
    source_id: "berita-hukumonline-ferdi-inpres-cacat-hukum-2025",
  };

  it("menolak kutipan tanpa sumber", () => {
    const { source_id: _dibuang, ...tanpaSumber } = quoteDasar;
    expect(() =>
      expertQuoteSchema.parse({
        ...tanpaSumber,
        kind: "parafrasa",
        verification: "kutipan-sekunder",
      })
    ).toThrow();
  });

  it("menolak kutipan langsung tanpa penunjuk letak", () => {
    expect(() =>
      expertQuoteSchema.parse({
        ...quoteDasar,
        kind: "kutipan-langsung",
        verification: "kutipan-sekunder",
      })
    ).toThrow(/locator/i);
  });

  it("menolak klaim naskah-primer tanpa penunjuk letak", () => {
    expect(() =>
      expertQuoteSchema.parse({
        ...quoteDasar,
        kind: "parafrasa",
        verification: "naskah-primer",
      })
    ).toThrow(/locator/i);
  });

  it("menerima parafrasa bersumber yang menyatakan tingkat verifikasinya", () => {
    const q = expertQuoteSchema.parse({
      ...quoteDasar,
      kind: "parafrasa",
      verification: "kutipan-sekunder",
    });
    expect(q.kind).toBe("parafrasa");
    expect(q.verification).toBe("kutipan-sekunder");
  });

  it("dimensionScoreSchema tetap memvalidasi dialektika lengkap", () => {
    const ds = dimensionScoreSchema.parse({
      dimension_id: "checks-balances",
      score: -2,
      confidence: 0.9,
      thesis_id: "Pemerintah mengklaim revisi UU untuk penataan pengawasan.",
      antithesis_id: "Pengawasan independen justru dipangkas.",
      synthesis_id: "Pelanggaran berat terhadap checks and balances.",
      expert_quotes: [
        {
          ...quoteDasar,
          kind: "kutipan-langsung",
          locator: "paragraf 4",
          verification: "kutipan-sekunder",
        },
      ],
      rationale_id: "Sintesis lengkap pertimbangan ilmiah berbasis bukti empiris.",
      evidence: [{ source_id: "uu-19-2019" }],
    });
    expect(ds.expert_quotes?.length).toBe(1);
  });
});

describe("Kutipan pada dataset kanonik", () => {
  const sumberById = new Map(dataset.sources.map((s) => [s.id, s]));
  const semuaKutipan = dataset.assessments.flatMap((a) =>
    a.dimension_scores.flatMap((ds) =>
      (ds.expert_quotes ?? []).map((q) => ({ q, di: `${a.id}/${ds.dimension_id}` }))
    )
  );

  it("setiap kutipan menunjuk sumber yang terdaftar", () => {
    for (const { q, di } of semuaKutipan) {
      expect(sumberById.has(q.source_id), `${di}: ${q.source_id}`).toBe(true);
    }
  });

  it("tidak ada kutipan yang menyebut tahun melampaui terbitan sumbernya", () => {
    // Sifat inilah yang gagal dimiliki kutipan Jimly 2005 tentang UU ITE 2008.
    for (const { q, di } of semuaKutipan) {
      const tahunTerbit = sumberById.get(q.source_id)?.year;
      if (typeof tahunTerbit !== "number") continue;
      for (const m of q.quote.matchAll(/\b(19|20)\d{2}\b/g)) {
        expect(Number(m[0]), `${di}: menyebut ${m[0]}, sumber terbit ${tahunTerbit}`)
          .toBeLessThanOrEqual(tahunTerbit);
      }
    }
  });

  it("naskah-primer tidak diklaim di atas sumber yang baru terverifikasi katalog", () => {
    for (const { q, di } of semuaKutipan) {
      if (q.verification !== "naskah-primer") continue;
      const tier = sumberById.get(q.source_id)?.verification_tier;
      expect(["catalog_verified", "unverified"], `${di}`).not.toContain(tier);
    }
  });

  it("setiap kutipan langsung membawa penunjuk letak yang dapat dicari", () => {
    for (const { q, di } of semuaKutipan) {
      if (q.kind !== "kutipan-langsung") continue;
      expect(q.locator?.trim(), `${di}`).toBeTruthy();
    }
  });
});

describe("Rujukan APA", () => {
  it("menyusun rujukan buku dengan pengarang, tahun, judul, dan penerbit", () => {
    const apa = formatApa({
      id: "buku-uji",
      type: "buku",
      title_id: "Politik Hukum di Indonesia",
      year: 1998,
      author: "Mahfud MD, M.",
      publisher: "Rajawali Press",
    });
    expect(apa.text).toBe(
      "Mahfud MD, M. (1998). Politik Hukum di Indonesia. Rajawali Press."
    );
    expect(apa.parts.some((p) => p.italic && p.text.includes("Politik Hukum"))).toBe(true);
  });

  it("membuang ekor nama pengarang dari judul agar tidak muncul dua kali", () => {
    const apa = formatApa({
      id: "buku-uji-2",
      type: "buku",
      title_id: "Konstitusi & Konstitusionalisme Indonesia (Prof. Dr. Jimly Asshiddiqie)",
      year: 2005,
      author: "Asshiddiqie, J.",
      publisher: "Sinar Grafika",
    });
    expect(apa.text).not.toContain("(Prof. Dr. Jimly Asshiddiqie)");
    expect(apa.text).toContain("Konstitusi & Konstitusionalisme Indonesia.");
  });

  it("memakai lembaga sebagai pengarang korporat untuk putusan pengadilan", () => {
    const apa = formatApa({
      id: "putusan-uji",
      type: "putusan-mk",
      title_id: "Putusan MK No. 40/PUU-XXIV/2026",
      year: 2026,
      url: "https://pasal.id/peraturan/putusan-mk/puu-mk-40-2026",
    });
    expect(apa.text).toContain("Mahkamah Konstitusi Republik Indonesia. (2026).");
    expect(apa.text).toContain("https://pasal.id/");
  });

  it("menandai tahun tidak diketahui, tidak mengarangnya", () => {
    const apa = formatApa({
      id: "tanpa-tahun",
      type: "laporan-lembaga",
      title_id: "Laporan Tanpa Tahun",
      author: "Lembaga Uji",
    });
    expect(apa.text).toContain("(t.t.).");
  });
});
