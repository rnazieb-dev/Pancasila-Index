import { describe, expect, it } from "vitest";

import {
  dimensionFor,
  generateCorpusBatch,
  sourceIdFor,
  sourceTypeFor,
  termForDate,
  titleCaseTentang,
  type IndexRecord,
} from "../src/corpus";

const rec = (over: Partial<IndexRecord> = {}): IndexRecord => ({
  key: "UU-11-2020",
  idperaturan: "P18978",
  jns: "UU",
  nama_jenis: "Undang-Undang",
  no_peraturan: "11",
  tahun: "2020",
  tentang: "CIPTA KERJA",
  status: "Diubah",
  tanggal_ditetapkan: "2020-11-02T00:00:00.000Z",
  tanggal_diundangkan: null,
  sumber_url: "https://jdih.setneg.go.id/detailperaturan?jns=UU&no=11&thn=2020",
  cited_by: [],
  ...over,
});

describe("termForDate", () => {
  it("memetakan tanggal ke era presiden", () => {
    expect(termForDate("1998-06")).toBe("presiden-habibie");
    expect(termForDate("2005-03-17")).toBe("presiden-sby-i");
    expect(termForDate("2023-01-02")).toBe("presiden-jokowi-ii");
    expect(termForDate("1983")).toBe("presiden-soeharto"); // titik tengah tahun
    expect(termForDate("1944")).toBeNull();
    expect(termForDate("2031")).toBe("presiden-prabowo"); // masa jabatan berjalan
  });
});

describe("normalkan identitas", () => {
  it("sourceId & type", () => {
    expect(sourceIdFor(rec())).toBe("uu-11-2020");
    expect(sourceIdFor(rec({ jns: "PERPU", no_peraturan: "2" }))).toBe("perpu-2-2020");
    expect(sourceTypeFor("KEPPRES")).toBe("keppres");
    expect(sourceTypeFor("PP")).toBeNull();
  });

  it("titleCase menjaga partikel kecil", () => {
    expect(titleCaseTentang("PERUBAHAN ATAS UNDANG-UNDANG NOMOR 1 TAHUN 1974")).toBe(
      "Perubahan atas Undang-Undang Nomor 1 Tahun 1974"
    );
  });
});

describe("dimensionFor — konservatif", () => {
  it("kenali pola utama", () => {
    expect(dimensionFor("PEMILIHAN UMUM")).toBe("sila-4");
    expect(dimensionFor("PENGADILAN TINDAK PIDANA KORUPSI")).toBe(
      "negara-hukum"
    );
    expect(dimensionFor("BADAN PEMERIKSA KEUANGAN")).toBe("checks-balances");
  });

  it("mengembalikan null bila tidak yakin", () => {
    expect(dimensionFor("KEOLAHRAGAAN")).toBeNull();
    expect(dimensionFor("IBU KOTA NEGARA")).toBeNull();
  });
});

describe("generateCorpusBatch", () => {
  it("menghasilkan pasangan sumber+peristiwa yang koheren", () => {
    const { items, skipped } = generateCorpusBatch([rec()]);
    expect(items).toHaveLength(1);
    const { source, event } = items[0]!;
    expect(source.id).toBe("uu-11-2020");
    expect((source.title_id as string).startsWith("Undang-Undang Nomor 11 Tahun 2020")).toBe(true);
    expect(event.term_id).toBe("presiden-jokowi-ii");
    expect(event.date).toBe("2020-11-02");
    expect(event.dimension_ids).toEqual(["sila-5"]);
    expect(String(event.summary_id)).toContain("JDIH");
    expect(skipped).toHaveLength(0);
  });

  it("melewati instrumen yang sudah bersumber", () => {
    const known = new Set(["uu-11-2020"]);
    const out = generateCorpusBatch([rec()], { knownSourceIds: known });
    expect(out.items).toHaveLength(0);
    expect(out.skipped[0]!.reason).toContain("sudah ada");
  });

  it("melewati tanpa dimensi yakin — bukan menebak", () => {
    const out = generateCorpusBatch([
      rec({ key: "UU-3-2022", no_peraturan: "3", tahun: "2022", tentang: "IBU KOTA NEGARA" }),
    ]);
    expect(out.items).toHaveLength(0);
    expect(out.skipped[0]!.reason).toContain("dimensi");
  });
});
