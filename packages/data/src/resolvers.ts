/**
 * Resolver tautan bukti: setiap sumber wajib punya URL yang bisa
 * dibuka pembaca - produk hukum diarahkan ke pencarian resmi JDIH/BPK,
 * putusan pengadilan ke direktori MA/MKRI, arsip ke repositori R2 mandiri
 * atau Google Search sebagai jaring pengaman (bebas blokir ISP Indonesia).
 */

const BPK_SEARCH = "https://peraturan.bpk.go.id/Search?keywords=";
const MA_SEARCH = "https://putusan3.mahkamahagung.go.id/direktori/pencarian.html?q=";
const MK_SEARCH = "https://www.mkri.id/index.php?page=web.Putusan&id=1&kat=1";
const WEB_SEARCH = "https://www.google.com/search?q=";

function enc(q: string): string {
  return encodeURIComponent(q.replace(/\s+/g, " ").trim());
}

/** Ambil frasa kunci paling mencari-dapat dari judul sumber. */
function searchQuery(title: string): string {
  // "UU No. 40 Tahun 2008 tentang Penghapusan..." -> 'UU 40 Tahun 2008'
  const m = title.match(/(UU|UUDS|TAP MPR[SM]?|Keppres|Inpres|Perppu)\s*(No\.?\s*)?(\d+[A-Z]?)(\s*Tahun\s*(\d{4}))?/i);
  if (m) {
    const kind = m[1]!.toUpperCase().replace("MPRS", "MPRS").replace("MPD", "MPR");
    return `${kind} ${m[3]}${m[5] ? ` Tahun ${m[5]}` : ""}`;
  }
  // Putusan MK No. 91/PUU-XVIII/2020 (...) -> nomor perkara
  const p = title.match(/Putusan\s+(MK|MA)?\s*No\.?\s*([\w/-]+)/i);
  if (p) return `${title.slice(0, 90)}`;
  return title.slice(0, 90);
}

export function resolveSourceUrl(s: {
  id: string;
  type: string;
  title_id: string;
  url?: string;
  r2_key?: string;
  archive_url?: string;
}): string {
  // 1. URL arsip R2 eksplisit (arsip permanen mandiri)
  if (s.archive_url) return s.archive_url;
  if (s.r2_key) return `https://www.pancasila.site/api/arsip/${s.r2_key}`;

  // 2. URL eksplisit resmi (JDIH, ANRI, MKRI, Leiden, Kemlu, dsb.)
  if (s.url) return s.url;

  // 3. Resolver terarah berdasarkan jenis instansi
  switch (s.type) {
    case "undang-undang":
    case "perppu":
    case "keppres":
    case "inpres":
    case "dokumen-mpr":
      return BPK_SEARCH + enc(searchQuery(s.title_id));
    case "putusan-ma":
      return MA_SEARCH + enc(s.title_id);
    case "putusan-mk":
      return MK_SEARCH;
    case "laporan-lembaga":
    case "arsip-nasional":
    case "berita":
    case "buku":
    case "lainnya":
    default:
      // Google search bebas blokir ISP di seluruh Indonesia
      return WEB_SEARCH + enc(s.title_id);
  }
}
