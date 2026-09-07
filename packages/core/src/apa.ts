/**
 * Perujukan gaya APA edisi ke-7 untuk sumber Pancasila Index.
 *
 * Kenapa APA dan bukan format bebas
 * ---------------------------------
 * Rujukan berformat memaksa metadata yang tidak bisa disamarkan: siapa
 * pengarangnya, tahun berapa, terbitan apa, halaman berapa. Sebuah kutipan
 * yang hanya menyebut nama pakar dan judul buku tampak sah sampai seseorang
 * mencoba mencarinya. Rujukan APA yang lengkap membuat pencarian itu bisa
 * dilakukan pembaca - dan celah pada metadatanya langsung kelihatan.
 *
 * Dokumen hukum Indonesia
 * -----------------------
 * APA menyerahkan sitasi hukum ke Bluebook, yang berbasis yurisdiksi
 * Amerika dan tidak mengenal peraturan Indonesia. Untuk peraturan dan
 * putusan, modul ini memakai konvensi yang lazim di penulisan hukum
 * Indonesia (nama lembaga sebagai pengarang korporat, nomor dan tahun
 * peraturan sebagai judul yang dimiringkan), dibingkai dalam susunan APA
 * "Pengarang. (Tahun). Judul. Sumber." supaya satu daftar pustaka tetap
 * konsisten walau isinya bercampur buku, jurnal, laporan, dan peraturan.
 */
import type { Source } from "./schemas";

/** Bagian rujukan yang perlu dimiringkan saat dirender. */
export interface ApaReference {
  /** Rujukan utuh sebagai teks datar - untuk salin-tempel dan ekspor. */
  text: string;
  /**
   * Rujukan terpecah agar UI dapat memiringkan bagian yang seharusnya
   * miring tanpa menebak-nebak lewat penguraian teks.
   */
  parts: { text: string; italic?: boolean }[];
}

const LEMBAGA_PENERBIT: Record<string, string> = {
  "undang-undang": "Republik Indonesia",
  perppu: "Republik Indonesia",
  "peraturan-pemerintah": "Republik Indonesia",
  "peraturan-presiden": "Republik Indonesia",
  keppres: "Republik Indonesia",
  inpres: "Republik Indonesia",
  "putusan-mk": "Mahkamah Konstitusi Republik Indonesia",
  "putusan-ma": "Mahkamah Agung Republik Indonesia",
  "putusan-mpd": "Majelis Pengawas Daerah",
  "mputusan-mpd": "Majelis Pengawas Daerah",
  "dokumen-mpr": "Majelis Permusyawaratan Rakyat Republik Indonesia",
  "arsip-nasional": "Arsip Nasional Republik Indonesia",
};

/**
 * Judul sumber di dataset ini sering menempelkan nama pengarang dalam
 * tanda kurung ("... (Prof. Dr. Jimly Asshiddiqie)") karena dipakai sebagai
 * label tampilan. Pada rujukan APA pengarang sudah berdiri sendiri di depan,
 * jadi ekor itu harus dibuang - kalau tidak namanya muncul dua kali.
 */
function judulBersih(source: Source): string {
  let t = source.title_id.trim();
  if (source.author) {
    // Buang " (…)" penutup yang isinya memuat potongan nama pengarang.
    const m = t.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
    if (m?.[1] && m[2]) {
      const kurung = m[2].toLowerCase();
      const namaPotongan = source.author
        .split(/[,\s]+/)
        .filter((w) => w.length > 3)
        .map((w) => w.toLowerCase());
      if (namaPotongan.some((w) => kurung.includes(w))) t = m[1];
    }
  }
  return t.replace(/\s+/g, " ").trim();
}

function akhiri(s: string): string {
  return /[.?!]$/.test(s) ? s : `${s}.`;
}

function tautan(source: Source): string | undefined {
  if (source.doi) {
    return source.doi.startsWith("http")
      ? source.doi
      : `https://doi.org/${source.doi.replace(/^doi:/i, "")}`;
  }
  return source.url;
}

/**
 * Menyusun rujukan APA-7 dari satu sumber.
 *
 * Bila metadatanya tidak lengkap, yang dikembalikan tetap rujukan sejauh
 * yang diketahui - TIDAK ditambal karangan. Rujukan yang pincang adalah
 * informasi yang berguna: ia menunjukkan sumber mana yang metadatanya masih
 * perlu dilengkapi, sedangkan tambalan justru menyembunyikannya.
 */
export function formatApa(source: Source): ApaReference {
  const parts: { text: string; italic?: boolean }[] = [];
  const push = (text: string, italic = false) => {
    if (text) parts.push(italic ? { text, italic: true } : { text });
  };

  const tahun = source.year ? `(${source.year}).` : "(t.t.).";
  const judul = judulBersih(source);
  const url = tautan(source);
  const korporat = LEMBAGA_PENERBIT[source.type];

  switch (source.type) {
    case "jurnal": {
      // Pengarang. (Tahun). Judul artikel. *Jurnal*, *Vol*(No), hlm. URL
      push(`${akhiri(source.author || korporat || "Tanpa pengarang")} ${tahun} `);
      push(`${akhiri(judul)} `);
      if (source.container_title) {
        push(source.container_title, true);
        if (source.volume) {
          push(", ");
          push(source.volume, true);
          if (source.issue) push(`(${source.issue})`);
        }
        if (source.pages) push(`, ${source.pages}`);
        push(". ");
      }
      break;
    }

    case "buku": {
      // Pengarang. (Tahun). *Judul* (ed. N). Penerbit.
      push(`${akhiri(source.author || "Tanpa pengarang")} ${tahun} `);
      push(judul, true);
      if (source.edition) push(` (ed. ${source.edition})`);
      push(". ");
      if (source.publisher) push(`${akhiri(source.publisher)} `);
      break;
    }

    case "laporan-lembaga": {
      // Lembaga. (Tahun). *Judul laporan*. Penerbit. URL
      push(`${akhiri(source.author || source.publisher || "Lembaga penerbit")} ${tahun} `);
      push(judul, true);
      push(". ");
      if (source.publisher && source.publisher !== source.author) {
        push(`${akhiri(source.publisher)} `);
      }
      break;
    }

    case "berita": {
      // Pengarang/Redaksi. (Tahun). Judul. *Media*. URL
      push(`${akhiri(source.author || source.publisher || "Redaksi")} ${tahun} `);
      push(`${akhiri(judul)} `);
      if (source.container_title || source.publisher) {
        push(source.container_title || source.publisher!, true);
        push(". ");
      }
      break;
    }

    default: {
      /*
       * Peraturan, putusan, dan arsip. Nomor dan tahunnya sudah menjadi
       * bagian judulnya di dataset ini, jadi judul itu yang dimiringkan
       * sebagai identitas dokumen.
       */
      push(`${akhiri(source.author || korporat || "Republik Indonesia")} ${tahun} `);
      push(judul, true);
      push(". ");
      if (source.publisher) push(`${akhiri(source.publisher)} `);
      break;
    }
  }

  if (url) push(url);

  const text = parts
    .map((p) => p.text)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return { text, parts };
}

/**
 * Sitasi dalam teks: (Pengarang, Tahun) atau (Pengarang, Tahun, hlm. 231).
 * `locator` datang dari `expert_quote.locator`, sehingga kutipan langsung
 * selalu membawa penunjuk letaknya sampai ke tampilan.
 */
export function formatApaInText(source: Source, locator?: string): string {
  const nama = (source.author || LEMBAGA_PENERBIT[source.type] || source.publisher || "")
    .split(",")[0]!
    .trim();
  const tahun = source.year ? String(source.year) : "t.t.";
  const inti = [nama || source.title_id.slice(0, 28), tahun].filter(Boolean).join(", ");
  return locator?.trim() ? `(${inti}, ${locator.trim()})` : `(${inti})`;
}
