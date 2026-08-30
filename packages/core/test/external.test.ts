import { describe, expect, it } from "vitest";

import { externalIndicesForPeriod, termYearRange } from "../src/external";
import type { ExternalIndex } from "../src/schemas";

const mk = (id: string, years: number[]): ExternalIndex =>
  ({
    id,
    name: id,
    publisher: "p",
    type: "hard-data",
    scale: "0-100",
    description: "d",
    target_dimensions: [],
    verification: "terverifikasi",
    data: years.map((year) => ({ year, score: 50, note: "n" })),
  }) as unknown as ExternalIndex;

describe("externalIndicesForPeriod", () => {
  it("TIDAK mensubstitusi data terbaru untuk periode tanpa data", () => {
    // Inti bug: dulu kode mengambil dua titik TERBARU bila rentangnya kosong,
    // sehingga masa jabatan 1945-1959 menampilkan angka 2023-2026 di bawah
    // judul yang menegaskan periodenya sendiri.
    const out = externalIndicesForPeriod([mk("cpi", [2014, 2020, 2024])], 1945, 1959);
    expect(out.relevant).toEqual([]);
    // tetapi tahun paling awal tetap dilaporkan agar ketiadaannya bisa dijelaskan
    expect(out.earliestAvailableYear).toBe(2014);
  });

  it("hanya menyisakan titik DI DALAM periode", () => {
    const out = externalIndicesForPeriod([mk("cpi", [2010, 2015, 2020, 2025])], 2014, 2021);
    expect(out.relevant).toHaveLength(1);
    expect(out.relevant[0]!.data.map((d) => d.year)).toEqual([2015, 2020]);
  });

  it("indeks tanpa titik dalam periode dibuang, yang punya tetap", () => {
    const out = externalIndicesForPeriod(
      [mk("lama", [2012, 2013]), mk("baru", [2024, 2025])],
      2024,
      2026
    );
    expect(out.relevant.map((i) => i.id)).toEqual(["baru"]);
  });

  it("batas periode inklusif di kedua ujung", () => {
    const out = externalIndicesForPeriod([mk("x", [2014, 2021])], 2014, 2021);
    expect(out.relevant[0]!.data.map((d) => d.year)).toEqual([2014, 2021]);
  });

  it("tanpa indeks sama sekali: earliestAvailableYear null", () => {
    expect(externalIndicesForPeriod([], 2000, 2010)).toEqual({
      relevant: [],
      earliestAvailableYear: null,
    });
  });

  it("tidak memutasi masukan", () => {
    const asli = mk("cpi", [2010, 2020]);
    externalIndicesForPeriod([asli], 2015, 2025);
    expect(asli.data.map((d) => d.year)).toEqual([2010, 2020]);
  });
});

describe("termYearRange", () => {
  it("end_date kosong dipetakan ke tahun berjalan", () => {
    expect(termYearRange({ start_date: "2024-10-01", end_date: null }, 2026)).toEqual({
      startYear: 2024,
      endYear: 2026,
    });
  });

  it("end_date terisi dipakai apa adanya", () => {
    expect(
      termYearRange({ start_date: "1945-08-18", end_date: "1959-07-05" }, 2026)
    ).toEqual({ startYear: 1945, endYear: 1959 });
  });
});
