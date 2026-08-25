import { describe, expect, it } from "vitest";

import {
  buildListPayload,
  detailPayload,
  isoDate,
  listRowSchema,
  matchRow,
  parseLegalRef,
  pdfUrl,
} from "../src/jdih";

describe("parseLegalRef", () => {
  it("mengenali UU bentuk pendek dan panjang", () => {
    expect(parseLegalRef("UU No. 40 Tahun 2008 tentang Penghapusan Diskriminasi")).toEqual({
      jns: "UU",
      no: "40",
      thn: "2008",
    });
    expect(
      parseLegalRef("Undang-Undang Nomor 1 Tahun 1974 tentang Perkawinan")
    ).toEqual({ jns: "UU", no: "1", thn: "1974" });
  });

  it("mengenali Perppu bentuk panjang tanpa tertukar dengan UU", () => {
    expect(
      parseLegalRef(
        "Peraturan Pemerintah Pengganti Undang-Undang Nomor 2 Tahun 2022"
      )
    ).toEqual({ jns: "PERPU", no: "2", thn: "2022" });
  });

  it("mengenali Keputusan Presiden / Keppres", () => {
    expect(parseLegalRef("Keppres No. 6 Tahun 2000")).toEqual({
      jns: "KEPPRES",
      no: "6",
      thn: "2000",
    });
    expect(
      parseLegalRef("Keputusan Presiden Nomor 53 Tahun 2001")
    ).toEqual({ jns: "KEPPRES", no: "53", thn: "2001" });
  });

  it("menolak putusan pengadilan, TAP MPR, dan UUDS", () => {
    expect(parseLegalRef("Putusan MK No. 91/PUU-XVIII/2020")).toBeNull();
    expect(parseLegalRef("TAP MPR No. III/MPR/2000")).toBeNull();
    expect(parseLegalRef("Konstitusi Republik Indonesia Serikat 1949 (UUDS)")).toBeNull();
  });

  it("nomor dengan sufiks huruf tetap terbaca", () => {
    expect(parseLegalRef("UU No. 11A Tahun 2020 tentang Cagub")).toEqual({
      jns: "UU",
      no: "11A",
      thn: "2020",
    });
  });
});

describe("payload & URL builder", () => {
  it("buildListPayload mengikuti kontrak API JDIH", () => {
    const p = buildListPayload({ jns: ["UU"], start: 400, length: 100 });
    expect(p).toMatchObject({
      tentang: "",
      p_lihan: "semua",
      jns: ["UU"],
      thn: [],
      status: "",
      terx: "All",
      sortOrder: "asc",
      length: 100,
      start: 400,
    });
  });

  it("detailPayload memuat k kosong sesuai kontrak situs", () => {
    expect(detailPayload({ jns: "PERPU", no: "2", thn: "2022" })).toEqual({
      jns: "PERPU",
      no: "2",
      thn: "2022",
      k: "",
    });
  });

  it("pdfUrl meng-encode parameter", () => {
    const url = pdfUrl("UU_NO_1_TH_1990.pdf", "P00903");
    expect(url.startsWith("https://jdih.setneg.go.id/api/hukumproduk/pdf")).toBe(true);
    expect(url).toContain("l=uploads");
    expect(url).toContain("f=UU_NO_1_TH_1990.pdf");
    expect(url).toContain("fl=P00903");
  });
});

describe("matchRow", () => {
  const rows = ["P1|01|1990|UU", "P2|7|1983|uu", "P3|2|2022|PERPU"].map((s) => {
    const [idperaturan, no, tahun, jns] = s.split("|");
    return listRowSchema.parse({
      idperaturan,
      no_peraturan: no,
      tahun,
      tentang: "x",
      jns,
    });
  });

  it("cocok meski nol di depan atau beda kapital", () => {
    expect(matchRow(rows, { jns: "uu", no: "01", thn: "1990" })?.idperaturan).toBe("P1");
    expect(matchRow(rows, { jns: "UU", no: "7", thn: "1983" })?.idperaturan).toBe("P2");
    expect(matchRow(rows, { jns: "PERPU", no: "2", thn: "2022" })?.idperaturan).toBe("P3");
  });

  it("tidak cocok bila tahun beda", () => {
    expect(matchRow(rows, { jns: "UU", no: "1", thn: "1991" })).toBeUndefined();
  });
});

describe("isoDate", () => {
  it("menormalkan tanggal API ke ISO pendek", () => {
    expect(isoDate("1990-03-14T00:00:00.000Z")).toBe("1990-03-14");
    expect(isoDate(null)).toBeNull();
    expect(isoDate("bukan-tanggal")).toBeNull();
  });
});
