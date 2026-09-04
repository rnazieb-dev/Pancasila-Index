import { describe, it, expect } from "vitest";

import { dataset } from "../src/index";

/**
 * Pagar regresi atas audit integritas data 4 September 2026.
 *
 * Temuan yang dijaga di sini: 554 dari 579 skor dimensi pernah berisi
 * dialektika, kutipan pakar, dan sitasi hasil pembangkitan template - termasuk
 * tokoh yang telah wafat "mengomentari" peristiwa puluhan tahun setelah
 * kematiannya, serta klaim pengawasan manusia EU AI Act dengan penelaah fiktif.
 */
describe("integritas anti-halusinasi dataset", () => {
  const skor = dataset.assessments.flatMap((a) =>
    a.dimension_scores.map((d) => ({ asm: a.id, ...d }))
  );
  const tahunSumber = new Map(dataset.sources.map((s) => [s.id, s.year]));

  it("tidak ada kalimat antitesis/sintesis identik dipakai lebih dari 3 kali", () => {
    for (const field of ["antithesis_id", "synthesis_id"] as const) {
      const hitung = new Map<string, number>();
      for (const d of skor) {
        const teks = d[field]?.trim().toLowerCase();
        if (!teks || teks.length < 40) continue;
        hitung.set(teks, (hitung.get(teks) ?? 0) + 1);
      }
      const berulang = [...hitung].filter(([, n]) => n > 3);
      expect(berulang.map(([t, n]) => `${n}x ${t.slice(0, 60)}`)).toEqual([]);
    }
  });

  it("tidak ada kutipan pakar identik dipakai lebih dari 3 kali", () => {
    const hitung = new Map<string, number>();
    for (const d of skor) for (const q of d.expert_quotes ?? []) {
      hitung.set(q.quote.trim().toLowerCase(), (hitung.get(q.quote.trim().toLowerCase()) ?? 0) + 1);
    }
    expect([...hitung].filter(([, n]) => n > 3).map(([t]) => t.slice(0, 60))).toEqual([]);
  });

  it("tahun kutipan pakar selalu sama dengan tahun terbit sumbernya (anti-anakronisme)", () => {
    const menyimpang: string[] = [];
    for (const d of skor) {
      for (const q of d.expert_quotes ?? []) {
        if (!q.source_id || q.year === undefined) continue;
        const y = tahunSumber.get(q.source_id);
        if (typeof y === "number" && q.year !== y) {
          menyimpang.push(`${d.asm}/${d.dimension_id}: ${q.year} vs ${q.source_id} (${y})`);
        }
      }
    }
    expect(menyimpang).toEqual([]);
  });

  it("penutur kutipan adalah orang, bukan nama terbitan", () => {
    const salah = skor.flatMap((d) =>
      (d.expert_quotes ?? [])
        .filter((q) => /^(jurnal|constitutional review|mimbar hukum|masalah-masalah hukum)/i.test(q.author))
        .map((q) => `${d.asm}/${d.dimension_id}: ${q.author}`)
    );
    expect(salah).toEqual([]);
  });

  it("label skor pada sintesis konsisten dengan angka score", () => {
    const label = /\b(?:skor|penilaian)\b[^.]{0,48}?\(([+-][0-2]|0)\)/i;
    const mismatch = skor
      .filter((d) => {
        const m = d.synthesis_id?.match(label);
        return m ? Number(m[1]) !== d.score : false;
      })
      .map((d) => `${d.asm}/${d.dimension_id}`);
    expect(mismatch).toEqual([]);
  });

  it("tidak ada catatan bukti hasil penempelan massal", () => {
    const template = skor.flatMap((d) =>
      d.evidence
        .filter((e) => e.note_id && /^Kutipan (analisis )?struktural/i.test(e.note_id))
        .map((e) => `${d.asm}/${d.dimension_id}: ${e.source_id}`)
    );
    expect(template).toEqual([]);
  });

  it("tidak ada peristiwa sintetis berboilerplate 'Dokumentasi Historis:'", () => {
    expect(dataset.events.filter((e) => /^Dokumentasi Historis:/.test(e.title_id))).toEqual([]);
  });

  it("tidak ada ringkasan peristiwa boilerplate yang dipakai berulang", () => {
    const hitung = new Map<string, string[]>();
    for (const e of dataset.events) {
      const k = e.summary_id.trim().toLowerCase();
      hitung.set(k, [...(hitung.get(k) ?? []), e.id]);
    }
    expect([...hitung].filter(([, ids]) => ids.length > 1).map(([t]) => t.slice(0, 60))).toEqual([]);
  });

  it("klaim pengawasan manusia EU AI Act tidak boleh tanpa penelaah bernama", () => {
    const bohong = dataset.assessments
      .filter((a) => {
        const ho = a.ai_disclosure?.human_oversight;
        return ho?.status === "verified" && ho.approvers.length === 0;
      })
      .map((a) => a.id);
    expect(bohong).toEqual([]);
  });
});
