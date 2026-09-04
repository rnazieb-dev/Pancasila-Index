#!/usr/bin/env tsx
/**
 * Remediasi P1 audit integritas data (audit-kritik-total.md, 4 Sep 2026).
 *
 *  1. Hapus 8 entri jurnal fiktif (artikel tidak ada pada volume yang diklaim)
 *     dan 3 buku yang tidak dapat diverifikasi keberadaannya.
 *  2. Perbaiki metadata 9 buku nyata yang judul/tahun/penerbitnya keliru
 *     (seluruhnya diverifikasi ulang lewat katalog perpustakaan/penerbit).
 *  3. Cabut 570 entri `evidence` hasil penempelan massal berkatatan template
 *     "Kutipan (analisis) struktural dari ..." - buku ajar umum bukan bukti
 *     empiris bagi skor spesifik.
 *  4. Hapus 315 peristiwa sintetis `ev-rescue-*` berprefiks
 *     "Dokumentasi Historis:" (Pergub/Perda daerah bernomor seri pabrikan)
 *     beserta sumber yatimnya, dan tanggalkan dari seluruh assessment.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (f: string) => join(ROOT, "data", f);

/** Sumber yang dicabut total: artikel/buku tidak ditemukan pada verifikasi web. */
const HAPUS_SUMBER = new Set([
  // 8 jurnal: judul artikel tidak ada pada volume/nomor yang diklaim.
  "jurnal-konstitusi-mk-2015",
  "jurnal-ius-quia-iustum-2018",
  "mimbar-hukum-ugm-2019",
  "padjadjaran-jurnal-ilmu-hukum-2020",
  "jurnal-hukum-peradilan-ma-2017",
  "constitutional-review-mk-2021",
  "jurnal-masalah-hukum-undip-2016",
  "jurnal-dinamika-hukum-unsoed-2015",
  // Monograf tidak terverifikasi di katalog penerbit maupun perpustakaan.
  "buku-susi-dwi-harijanti-htn-2021",
  "buku-radian-salman-desentralisasi-2018",
]);

/** Duplikat fantom: dialihkan ke entri aslinya. */
const REMAP_SUMBER: Record<string, string> = {
  "buku-bivitri-susanti-autocratic-legalism-2020": "kertas-posisi-jentera-uu-ciptaker-2020",
};

/** Koreksi metadata buku nyata, hasil verifikasi katalog. */
const KOREKSI_SUMBER: Record<string, Record<string, unknown>> = {
  "buku-wirjono-asas-hukum-1953": {
    title_id: "Azas-azas Hukum Tata Negara di Indonesia (Wirjono Prodjodikoro)",
    year: 1974,
    citation_id:
      "Prodjodikoro, W. (1974). Azas-azas Hukum Tata Negara di Indonesia (cet. 2). Jakarta: Dian Rakyat.",
    source_verified: true,
  },
  "buku-satya-arinanto-htn-2016": {
    title_id: "Hak Asasi Manusia dalam Transisi Politik di Indonesia (Prof. Satya Arinanto)",
    year: 2003,
    citation_id:
      "Arinanto, S. (2003). Hak Asasi Manusia dalam Transisi Politik di Indonesia. Jakarta: Pusat Studi Hukum Tata Negara FH UI.",
    source_verified: true,
  },
  "buku-fitra-arsil-pemilu-2017": {
    title_id:
      "Teori Sistem Pemerintahan: Pergeseran Konsep dan Saling Kontribusi Antar Sistem Pemerintahan di Berbagai Negara (Dr. Fitra Arsil)",
    year: 2017,
    citation_id:
      "Arsil, F. (2017). Teori Sistem Pemerintahan: Pergeseran Konsep dan Saling Kontribusi Antar Sistem Pemerintahan di Berbagai Negara. Depok: Rajawali Pers (RajaGrafindo Persada).",
    source_verified: true,
  },
  "buku-syaiful-aris-demokrasi-2019": {
    title_id: "Pemilu dan Sistem Presidensiil Indonesia (Dr. Mohammad Syaiful Aris)",
    year: 2022,
    citation_id:
      "Aris, M. S. (2022). Pemilu dan Sistem Presidensiil Indonesia. Malang: Setara Press.",
    source_verified: true,
  },
  "buku-achmad-ruslan-pembentukan-uu-2014": {
    title_id:
      "Teori dan Panduan Praktik Pembentukan Peraturan Perundang-undangan di Indonesia (Prof. Achmad Ruslan)",
    year: 2013,
    citation_id:
      "Ruslan, A. (2013). Teori dan Panduan Praktik Pembentukan Peraturan Perundang-undangan di Indonesia (ed. 2). Yogyakarta: Rangkang Education.",
    source_verified: true,
  },
  "buku-bagir-manan-menegakkan-hukum-2004": {
    year: 2009,
    citation_id: "Manan, B. (2009). Menegakkan Hukum Suatu Pencarian. Jakarta: Djambatan.",
    source_verified: true,
  },
  "buku-bintan-saragih-lembaga-perwakilan-2006": {
    year: 1988,
    citation_id:
      "Saragih, B. R. (1988). Lembaga Perwakilan dan Pemilihan Umum di Indonesia (cet. 1). Jakarta: Gaya Media Pratama.",
    source_verified: true,
  },
  "buku-yance-arizona-konstitusionalisme-agraria-2018": {
    year: 2014,
    citation_id: "Arizona, Y. (2014). Konstitusionalisme Agraria. Yogyakarta: STPN Press.",
    source_verified: true,
  },
  "buku-soepomo-uud-1945": {
    title_id: "Risalah Sidang BPUPKI-PPKI, 29 Mei 1945 - 19 Agustus 1945 (Sekretariat Negara RI)",
    year: 1992,
    citation_id:
      "Sekretariat Negara Republik Indonesia. (1992). Risalah Sidang Badan Penyelidik Usaha-usaha Persiapan Kemerdekaan Indonesia (BPUPKI) - Panitia Persiapan Kemerdekaan Indonesia (PPKI), 29 Mei 1945 - 19 Agustus 1945. Jakarta: Sekretariat Negara RI.",
    source_verified: true,
  },
  "buku-harun-alrasid-pengisian-jabatan-presiden-1999": {
    title_id: "Pengisian Jabatan Presiden (Prof. Dr. Harun Alrasid)",
    citation_id: "Alrasid, H. (1999). Pengisian Jabatan Presiden. Jakarta: Pustaka Utama Grafiti.",
    source_verified: true,
  },
};

/** Placeholder komposit dipecah menjadi dua entri nyata. */
const PECAH_LITERATUR = ["buku-kahin-nationalism-revolution-1952", "buku-ricklefs-history-modern-indonesia-1981"];
const LITERATUR_BARU = [
  {
    id: "buku-kahin-nationalism-revolution-1952",
    type: "buku",
    title_id: "Nationalism and Revolution in Indonesia (George McTurnan Kahin)",
    year: 1952,
    citation_id:
      "Kahin, G. McT. (1952). Nationalism and Revolution in Indonesia. Ithaca, NY: Cornell University Press.",
    url: "https://www.cornellpress.cornell.edu/book/9780877274018/nationalism-and-revolution-in-indonesia/",
    source_verified: true,
    frbr_uri: "/akn/id/archive/buku/1952/kahin-nationalism-revolution",
  },
  {
    id: "buku-ricklefs-history-modern-indonesia-1981",
    type: "buku",
    title_id: "A History of Modern Indonesia since c. 1300 (M. C. Ricklefs)",
    year: 1981,
    citation_id:
      "Ricklefs, M. C. (1981). A History of Modern Indonesia since c. 1300. London: Macmillan.",
    url: "https://www.macmillanihe.com/page/detail/A-History-of-Modern-Indonesia-since-c1200/?K=9780230546851",
    source_verified: true,
    frbr_uri: "/akn/id/archive/buku/1981/ricklefs-history-modern-indonesia",
  },
];

/** Catatan bukti hasil penempelan massal skrip pengayaan. */
const CATATAN_TEMPLATE = /^Kutipan (analisis )?struktural/;

/** Peristiwa sintetis: dokumen administratif daerah berboilerplate identik. */
const JUDUL_SINTETIS = /^Dokumentasi Historis:/;
const RESCUE_SALAH_LABEL_DIHAPUS = new Set([
  "ev-rescue-keputusan-gubernur-jawa-tengah-nomor-18842024-tentang-penu",
  "ev-rescue-keputusan-gubernur-provinsi-dki-jakarta-nomor-432-tahun-2023",
  "ev-rescue-analisis-penegakan-hukum-konstitusi-di-indonesia-studi-put",
]);
/** Peristiwa nyata yang salah dilabeli "Putusan Peradilan:". */
const RESCUE_LABEL_DIPERBAIKI: Record<string, { title_id: string; category?: string }> = {
  "ev-rescue-dakwaan-kejagung-timah-2024": {
    title_id:
      "Surat Dakwaan Kejaksaan Agung dalam Perkara Korupsi Tata Niaga Timah IUP PT Timah Tbk (2024)",
    category: "peristiwa",
  },
  "ev-rescue-arsip-nii-vonis-mahadper-1962": {
    title_id:
      "Putusan Mahkamah Darurat Perang (Mahadper) atas Perkara Sekarmadji Maridjan Kartosoewirjo (1962)",
  },
  "ev-rescue-hasil-sidang-tahunan-mpr-tahun-2024-putusan-dan-ketetapan": {
    title_id: "Sidang Tahunan MPR RI Tahun 2024 dan Ketetapan yang Dihasilkan",
    category: "peristiwa",
  },
};

// ------------------------------------------------------------------ muat

type Src = { id: string; type?: string; [k: string]: unknown };
type Ev = { id: string; title_id: string; source_ids?: string[]; category?: string; [k: string]: unknown };
type Dim = {
  dimension_id: string;
  evidence: Array<{ source_id: string; note_id?: string }>;
  event_ids?: string[];
  evidence_gap?: boolean;
  expert_quotes?: Array<{ source_id?: string }>;
};
type Asm = { id: string; dimension_scores: Dim[] };

const sources = parse(readFileSync(P("sources.yaml"), "utf8")) as Src[];
const events = parse(readFileSync(P("events.yaml"), "utf8")) as Ev[];
/** Berkas peristiwa modular ikut dibaca agar sumber terpakai tidak dianggap yatim. */
const EVENT_FILES = readdirSync(join(ROOT, "data", "events")).filter((f) => f.endsWith(".yaml"));
const eventsModular = EVENT_FILES.map((f) => ({
  file: f,
  items: parse(readFileSync(join(ROOT, "data", "events", f), "utf8")) as Ev[],
}));
const assessments = parse(readFileSync(P("assessments.yaml"), "utf8")) as Asm[];

const stat = {
  sumberFiktifDihapus: 0,
  sumberDiremap: 0,
  sumberDikoreksi: 0,
  buktiTemplateDicabut: 0,
  buktiKeSumberFiktifDicabut: 0,
  kutipanKeSumberFiktifDicabut: 0,
  skorJadiEvidenceGap: 0,
  peristiwaSintetisDihapus: 0,
  peristiwaLabelDiperbaiki: 0,
  tautanPeristiwaDicabut: 0,
  sumberYatimSintetisDihapus: 0,
  peristiwaLiteraturDipecah: 0,
};

// ---- 1. peristiwa sintetis ------------------------------------------------

const eventsDihapus = new Set<string>();
for (const ev of events) {
  if (!ev.id.startsWith("ev-rescue-")) continue;
  if (JUDUL_SINTETIS.test(ev.title_id) || RESCUE_SALAH_LABEL_DIHAPUS.has(ev.id)) {
    eventsDihapus.add(ev.id);
  }
}
const eventsBaru = events.filter((e) => !eventsDihapus.has(e.id));
stat.peristiwaSintetisDihapus = eventsDihapus.size;

/** Placeholder komposit diganti dua entri nyata di seluruh peristiwa. */
function pecahLiteratur(list: Ev[]): number {
  let n = 0;
  for (const ev of list) {
    if (!ev.source_ids?.includes("literatur-sejarah-nasional")) continue;
    const next: string[] = [];
    for (const id of ev.source_ids) {
      if (id === "literatur-sejarah-nasional") {
        for (const baru of PECAH_LITERATUR) if (!next.includes(baru)) next.push(baru);
      } else if (!next.includes(id)) next.push(id);
    }
    ev.source_ids = next;
    n++;
  }
  return n;
}

for (const ev of eventsBaru) {
  const fix = RESCUE_LABEL_DIPERBAIKI[ev.id];
  if (fix) {
    ev.title_id = fix.title_id;
    if (fix.category) ev.category = fix.category;
    stat.peristiwaLabelDiperbaiki++;
  }
  // Prefiks "Putusan Peradilan:" hanya sah untuk putusan sungguhan.
  ev.title_id = ev.title_id.replace(/^Putusan Peradilan:\s*/, "");
}

stat.peristiwaLiteraturDipecah += pecahLiteratur(eventsBaru);
for (const { items } of eventsModular) stat.peristiwaLiteraturDipecah += pecahLiteratur(items);

// Sumber yang hanya dipakai peristiwa sintetis ikut dicabut.
const sumberTerpakai = new Set<string>();
for (const ev of eventsBaru) for (const s of ev.source_ids ?? []) sumberTerpakai.add(s);
for (const { items } of eventsModular) for (const ev of items) for (const s of ev.source_ids ?? []) sumberTerpakai.add(s);
for (const asm of assessments) {
  for (const dim of asm.dimension_scores) {
    for (const e of dim.evidence ?? []) sumberTerpakai.add(e.source_id);
    for (const q of dim.expert_quotes ?? []) if (q.source_id) sumberTerpakai.add(q.source_id);
  }
}
const sumberDariEventDihapus = new Set<string>();
for (const ev of events) {
  if (!eventsDihapus.has(ev.id)) continue;
  for (const s of ev.source_ids ?? []) if (!sumberTerpakai.has(s)) sumberDariEventDihapus.add(s);
}

// ---- 2. assessments -------------------------------------------------------

for (const asm of assessments) {
  for (const dim of asm.dimension_scores) {
    const evidence: typeof dim.evidence = [];
    for (const e of dim.evidence ?? []) {
      if (HAPUS_SUMBER.has(e.source_id)) {
        stat.buktiKeSumberFiktifDicabut++;
        continue;
      }
      if (e.note_id && CATATAN_TEMPLATE.test(e.note_id)) {
        stat.buktiTemplateDicabut++;
        continue;
      }
      const remap = REMAP_SUMBER[e.source_id];
      if (remap) e.source_id = remap;
      if (e.source_id === "literatur-sejarah-nasional") {
        for (const id of PECAH_LITERATUR) {
          if (!evidence.some((x) => x.source_id === id)) evidence.push({ source_id: id });
        }
        continue;
      }
      if (!evidence.some((x) => x.source_id === e.source_id && x.note_id === e.note_id)) {
        evidence.push(e);
      }
    }
    dim.evidence = evidence;
    if (evidence.length === 0) {
      dim.evidence_gap = true;
      stat.skorJadiEvidenceGap++;
    }

    if (dim.expert_quotes) {
      const q = dim.expert_quotes.filter((x) => {
        if (x.source_id && HAPUS_SUMBER.has(x.source_id)) {
          stat.kutipanKeSumberFiktifDicabut++;
          return false;
        }
        if (x.source_id && REMAP_SUMBER[x.source_id]) x.source_id = REMAP_SUMBER[x.source_id];
        return true;
      });
      if (q.length) dim.expert_quotes = q;
      else delete dim.expert_quotes;
    }

    if (dim.event_ids) {
      const before = dim.event_ids.length;
      const keep = dim.event_ids.filter((id) => !eventsDihapus.has(id));
      stat.tautanPeristiwaDicabut += before - keep.length;
      if (keep.length) dim.event_ids = keep;
      else delete dim.event_ids;
    }
  }
}

// ---- 3. sources -----------------------------------------------------------

const sumberBaru: Src[] = [];
for (const s of sources) {
  if (HAPUS_SUMBER.has(s.id) || REMAP_SUMBER[s.id]) {
    if (HAPUS_SUMBER.has(s.id)) stat.sumberFiktifDihapus++;
    else stat.sumberDiremap++;
    continue;
  }
  if (sumberDariEventDihapus.has(s.id)) {
    stat.sumberYatimSintetisDihapus++;
    continue;
  }
  if (s.id === "literatur-sejarah-nasional") continue;
  const fix = KOREKSI_SUMBER[s.id];
  if (fix) {
    Object.assign(s, fix);
    stat.sumberDikoreksi++;
  }
  sumberBaru.push(s);
}
sumberBaru.push(...(LITERATUR_BARU as unknown as Src[]));

writeFileSync(P("sources.yaml"), stringify(sumberBaru, { indent: 2, lineWidth: 0 }), "utf8");
writeFileSync(P("events.yaml"), stringify(eventsBaru, { indent: 2, lineWidth: 0 }), "utf8");
for (const { file, items } of eventsModular) {
  const path = join(ROOT, "data", "events", file);
  const next = stringify(items, { indent: 2, lineWidth: 0 });
  if (next !== readFileSync(path, "utf8")) writeFileSync(path, next, "utf8");
}
writeFileSync(P("assessments.yaml"), stringify(assessments, { indent: 2, lineWidth: 0 }), "utf8");
console.table(stat);
