/**
 * corpus — suggest v2 berbasis korpus JDIH (fase 6b, tanpa LLM berbayar).
 *
 * Setiap instrumen hukum di packages/data/raw/index.jsonl adalah peristiwa
 * produk-hukum yang terverifikasi metadata resminya (tanggal, nomor,
 * status, relasi). Generator ini MURNI & deterministik: mengubah baris
 * index menjadi pasangan {sumber baru?, peristiwa} siap-import, dengan
 * prinsip jujur:
 *   - tanpa pemetaan dimensi yang yakin -> peristiwa DILEWATI, bukan
 *     ditebak;
 *   - tanggal hanya dari metadata JDIH (ditetapkan > diundangkan >
 *     tahun saja);
 *   - instrumen yang sudah punya sumber di dataset dilewati.
 */

export interface IndexRecord {
  key: string;
  idperaturan: string;
  jns: string;
  nama_jenis?: string;
  no_peraturan: string;
  tahun: string;
  tentang: string;
  status?: string | null;
  status_hukum?: string | null;
  tanggal_ditetapkan?: string | null;
  tanggal_diundangkan?: string | null;
  sumber_url: string;
  cited_by?: string[];
}

/** Rentang masa jabatan presiden (dari terms-presiden.yaml, 25-08-2026). */
const TERM_RANGES: Array<{ id: string; start: string; end: string | null }> = [
  { id: "presiden-soekarno-i", start: "1945-08-18", end: "1959-07-04" },
  { id: "presiden-soekarno-ii", start: "1959-07-05", end: "1967-03-11" },
  { id: "presiden-soeharto", start: "1967-03-12", end: "1998-05-21" },
  { id: "presiden-habibie", start: "1998-05-21", end: "1999-10-20" },
  { id: "presiden-gusdur", start: "1999-10-20", end: "2001-07-23" },
  { id: "presiden-megawati", start: "2001-07-23", end: "2004-10-20" },
  { id: "presiden-sby-i", start: "2004-10-20", end: "2009-10-20" },
  { id: "presiden-sby-ii", start: "2009-10-20", end: "2014-10-20" },
  { id: "presiden-jokowi-i", start: "2014-10-20", end: "2019-10-20" },
  { id: "presiden-jokowi-ii", start: "2019-10-20", end: "2024-10-20" },
  { id: "presiden-prabowo", start: "2024-10-20", end: null },
];

/** Titik tengah tahun dipakai bila hanya tahun yang diketahui. */
export function termForDate(dateIso: string): string | null {
  const probe = dateIso.length === 4 ? `${dateIso}-07-01` : dateIso.slice(0, 10);
  for (const t of TERM_RANGES) {
    if (probe >= t.start && (t.end === null || probe <= t.end)) return t.id;
  }
  return null;
}

const TYPE_BY_JNS: Record<string, string> = {
  UU: "undang-undang",
  PERPU: "perppu",
  KEPPRES: "keppres",
};

export function sourceIdFor(r: IndexRecord): string {
  const jns = r.jns.toLowerCase(); // uu -> uu, perpu -> perpu, keppres -> keppres
  return `${jns}-${r.no_peraturan.toLowerCase()}-${r.tahun}`;
}

export function sourceTypeFor(jns: string): string | null {
  return TYPE_BY_JNS[jns] ?? null;
}

/** "PEMBENTUKAN PERATURAN PERUNDANG-UNDANGAN" -> "Pembentukan Peraturan Perundang-Undangan" */
export function titleCaseTentang(s: string): string {
  const kecil = new Set(["di", "ke", "dan", "atau", "atas", "tentang", "dari"]);
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) =>
      i > 0 && kecil.has(w) ? w : w.replace(/(^|-)([a-z])/g, (_, h, c) => h + c.toUpperCase())
    )
    .join(" ");
}

/** Tabel kata-kunci -> dimensi rubrik (15 dimensi resmi, bukan indikator).
 *  Urutan = prioritas. Konservatif: tanpa kecocokan yakin, dilewati. */
const DIM_RULES: Array<[RegExp, string]> = [
  [/korupsi|tipikor|pencucian uang|pidana|kuhp/i, "negara-hukum"],
  [/kekuasaan kehakiman|peradilan|pengadilan|hakim/i, "negara-hukum"],
  [/pemilu|pemilihan umum/i, "sila-4"],
  [/keuangan negara|perbendaharaan|audit|pemeriksa keuangan/i, "checks-balances"],
  [/otonomi|pemerintahan daerah|\bdesa\b/i, "sila-3"],
  [/hak asasi|\basasi\b/i, "sila-2"],
  [/kepolisian/i, "sila-2"],
  [/data pribadi/i, "tujuan-1"],
  [/kesehatan/i, "tujuan-2"],
  [/pendidikan|budaya/i, "tujuan-3"],
  [/ketenagakerjaan|kerja layak|cipta kerja/i, "sila-5"],
  [/jaminan sosial/i, "sila-5"],
  [/majelis permusyawaratan|dewan perwakilan|\bdpr\b|\bdpd\b|\bmpr\b/i, "kedaulatan-rakyat"],
  [/aparatur sipil|administrasi pemerintahan|intelijen negara/i, "checks-balances"],
  [/ratifikasi|perjanjian|konvensi|paris agreement|hubungan luar negeri/i, "tujuan-4"],
  [/kawasan perdagangan|pelabuhan/i, "tujuan-2"],
];

export function dimensionFor(tentang: string): string | null {
  for (const [re, dim] of DIM_RULES) if (re.test(tentang)) return dim;
  return null;
}

function tanggalPeristiwa(r: IndexRecord): string | null {
  const raw = r.tanggal_ditetapkan ?? r.tanggal_diundangkan ?? (r.tahun || null);
  // skema event.date menerima YYYY | YYYY-MM | YYYY-MM-DD saja
  if (!raw) return null;
  return raw.length > 10 ? raw.slice(0, 10) : raw;
}

function ringkasTanggal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || iso.length === 4) return iso;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export interface CorpusBatchItem {
  source: Record<string, unknown>;
  event: Record<string, unknown>;
}

export function generateCorpusBatch(
  records: readonly IndexRecord[],
  opts: { knownSourceIds?: ReadonlySet<string> } = {}
): { items: CorpusBatchItem[]; skipped: Array<{ key: string; reason: string }> } {
  const items: CorpusBatchItem[] = [];
  const skipped: Array<{ key: string; reason: string }> = [];

  // indeks bantu: nomor-tahun -> tentang, untuk mewarisi topik amendemen.
  // Dasarnya faktual: judul amendemen menyebut UU yang diubahnya.
  const byNoThn = new Map<string, IndexRecord>();
  for (const r of records) byNoThn.set(`${r.jns}-${r.no_peraturan}-${r.tahun}`, r);

  function dimDenganWarisan(
    r: IndexRecord,
    seen: Set<string> = new Set()
  ): { dim: string | null; dasar: string | null } {
    const langsung = dimensionFor(r.tentang);
    if (langsung) return { dim: langsung, dasar: null };
    const m = r.tentang.match(
      /(?:UNDANG[- ]UNDANG|UU)\s*NOMOR\s*(\d+[A-Z]?)\s*TAHUN\s*(\d{4})/i
    );
    if (!m || seen.has(r.idperaturan)) return { dim: null, dasar: null };
    seen.add(r.idperaturan);
    const base =
      byNoThn.get(`UU-${m[1]}-${m[2]}`) ?? byNoThn.get(`PERPU-${m[1]}-${m[2]}`);
    if (!base || base.idperaturan === r.idperaturan)
      return { dim: null, dasar: null };
    // rantai amendemen boleh naik beberapa tingkat (dengan pengaman siklus)
    const up = dimDenganWarisan(base, seen);
    if (up.dim)
      return {
        dim: up.dim,
        dasar: `${base.nama_jenis ?? base.jns} ${base.no_peraturan}/${base.tahun}`,
      };
    return { dim: null, dasar: null };
  }

  for (const r of records) {
    const sid = sourceIdFor(r);
    if (opts.knownSourceIds?.has(sid)) {
      skipped.push({ key: r.key, reason: `sumber ${sid} sudah ada di dataset` });
      continue;
    }
    const type = sourceTypeFor(r.jns);
    if (!type) {
      skipped.push({ key: r.key, reason: `jenis ${r.jns} tak didukung skema sumber` });
      continue;
    }
    const date = tanggalPeristiwa(r);
    if (!date) {
      skipped.push({ key: r.key, reason: "tanpa tanggal & tahun" });
      continue;
    }
    const term = termForDate(date);
    if (!term) {
      skipped.push({ key: r.key, reason: `tanggal ${date} di luar rentang term` });
      continue;
    }
    const { dim, dasar } = dimDenganWarisan(r);
    if (!dim) {
      skipped.push({ key: r.key, reason: `tak ada dimensi yakin utk "${r.tentang.slice(0, 40)}"` });
      continue;
    }

    const judul = titleCaseTentang(r.tentang);
    const namaJenis = r.nama_jenis?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? r.jns;
    const tglText = tanggalPeristiwa(r)!;

    items.push({
      source: {
        id: sid,
        type,
        title_id: `${namaJenis} Nomor ${r.no_peraturan} Tahun ${r.tahun} tentang ${judul}`,
        year: Number(r.tahun),
        url: r.sumber_url,
        citation_id: `jdih-setneg:${r.idperaturan}`,
      },
      event: {
        id: `ev-${sid}`,
        term_id: term,
        date: date,
        category: "produk-hukum",
        title_id: `${namaJenis} No. ${r.no_peraturan} Tahun ${r.tahun}: ${judul}`,
        summary_id:
          `${namaJenis} Nomor ${r.no_peraturan} Tahun ${r.tahun} tentang ${judul} ` +
          `tercatat ditetapkan/diundangkan ${ringkasTanggal(tglText)} ` +
          (r.status ? `dengan status "${r.status}". ` : ". ") +
          (dasar ? `Instrumen ini mengubah ${dasar}. ` : "") +
          `Metadata resmi dihimpun langsung dari JDIH Kementerian Sekretariat Negara ` +
          `(tautan sumber terlampir); berkas PDF asli tersimpan di korpus data/raw.`,
        source_ids: [sid],
        dimension_ids: [dim],
      },
    });
  }
  return { items, skipped };
}
