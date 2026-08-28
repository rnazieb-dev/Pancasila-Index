/**
 * Resolver tautan bukti: setiap sumber wajib punya URL yang bisa
 * dibuka pembaca - produk hukum diarahkan ke pencarian resmi JDIH/BPK,
 * putusan pengadilan ke portal mkri atau pencarian presisi, sisanya ke
 * URL langsung bila ada lalu pencarian web sebagai jaring pengaman.
 */

const BPK_SEARCH = "https://peraturan.bpk.go.id/Search?keywords=";
const WEB_SEARCH = "https://duckduckgo.com/?q=";

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
}): string {
  // URL eksplisit selalu menang (dokumen arsip, BBC, CMI, dsb.)
  if (s.url) return s.url;

  switch (s.type) {
    case "undang-undang":
    case "perppu":
    case "keppres":
    case "inpres":
    case "dokumen-mpr":
      return BPK_SEARCH + enc(searchQuery(s.title_id));
    default:
      // Putusan MK/MA berisi nomor perkara sehingga pencarian web presisi;
      // portal putusan3.mkri.id kerap lambat sehingga bukan target utama.
      return s.url ?? WEB_SEARCH + enc(s.title_id);
  }
}
