import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dataset } from "../src/index";

/**
 * Penjaga regresi untuk halaman /metodologi.
 *
 * Latar: preset simulator pernah menulis ke ID dimensi yang tidak ada
 * (`sila_2`, `hak_asasi`, `peradilan_independen` — memakai garis bawah,
 * sedangkan rubrik memakai tanda hubung). Penulisan itu jatuh ke kunci hantu
 * tanpa error apa pun, sehingga preset "Pelanggaran HAM Berat" menghasilkan
 * indeks 75/100 dan "0 pelanggaran hak mutlak" — kebalikan dari yang
 * didemonstrasikannya. TypeScript tidak menangkapnya karena `scores`
 * bertipe Record<string, number>.
 *
 * Uji ini memindai sumber komponen dan menuntut setiap ID dimensi yang
 * dirujuk benar-benar ada di rubrik.
 */

const CALCULATOR = fileURLToPath(
  new URL("../../../apps/web/src/components/methodology-calculator.tsx", import.meta.url),
);

describe("integritas UI metodologi", () => {
  const source = readFileSync(CALCULATOR, "utf8");
  const validIds = new Set(dataset.rubric.dimensions.map((d) => d.id));

  it("rubrik memakai ID bertanda hubung, bukan garis bawah", () => {
    for (const id of validIds) {
      expect(id, `ID dimensi "${id}" tidak boleh mengandung garis bawah`).not.toContain("_");
    }
  });

  it("setiap ID dimensi yang ditulis preset simulator ada di rubrik", () => {
    const referenced = [...source.matchAll(/\bs\[["']([^"']+)["']\]\s*=/g)].map((m) => m[1]);

    expect(
      referenced.length,
      "tidak menemukan penulisan skor apa pun — pola preset mungkin berubah, perbarui uji ini",
    ).toBeGreaterThan(0);

    const unknown = [...new Set(referenced)].filter((id) => !validIds.has(id));
    expect(
      unknown,
      `ID dimensi tidak dikenal di preset simulator: ${unknown.join(", ")}. ` +
        `ID yang sah: ${[...validIds].join(", ")}`,
    ).toEqual([]);
  });

  it("preset pelanggaran HAM berat menyetel dimensi non-derogable ke -2", () => {
    const nonDerogable = dataset.rubric.dimensions.filter((d) => d.non_derogable);
    expect(nonDerogable.length).toBeGreaterThan(0);

    // Preset ini ada khusus untuk mendemonstrasikan plafon Pasal 28I ayat (1).
    // Jika ia tidak lagi menyetel dimensi hak mutlak ke -2, plafon tidak pernah
    // aktif dan demonstrasinya menjadi menyesatkan.
    const hasSevereBreach = nonDerogable.some((d) =>
      new RegExp(`s\\[["']${d.id}["']\\]\\s*=\\s*-2`).test(source),
    );
    expect(
      hasSevereBreach,
      "tidak ada preset yang menyetel dimensi non-derogable ke -2; " +
        "demonstrasi plafon hak mutlak tidak akan pernah aktif",
    ).toBe(true);
  });
});
