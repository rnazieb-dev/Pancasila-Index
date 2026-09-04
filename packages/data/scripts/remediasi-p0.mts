#!/usr/bin/env tsx
/**
 * Remediasi P0 audit integritas data (audit-kritik-total.md, 4 Sep 2026).
 *
 * Prinsip: integritas > kuantitas. Lebih baik kosong daripada fiktif.
 *
 *  1. Hapus seluruh dialektika hasil template (antithesis/synthesis/thesis/
 *     expert_quotes) yang dibangkitkan skrip pengayaan. `rationale_id` tetap
 *     utuh, sehingga UI jatuh ke prosa rasional apa adanya.
 *  2. Perbaiki kutipan pakar yang tersisa: tahun kutipan diselaraskan ke tahun
 *     publikasi sumber (anti-anakronisme), penulis yang berupa nama jurnal
 *     dihapus.
 *  3. Selaraskan label skor di `synthesis_id` dengan nilai `score` kanonik;
 *     sintesis yang arah penilaiannya berlawanan dengan skor dihapus.
 *  4. Jujurkan metadata `ai_disclosure` EU AI Act: tanpa penelaah manusia
 *     fiktif.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSESSMENTS = join(ROOT, "data", "assessments.yaml");
const SOURCES = join(ROOT, "data", "sources.yaml");

const TEMPLATE_ANTITHESIS = [
  /^Meskipun merupakan langkah maju, sejumlah pakar mengingatkan/,
  /^Situasi ini mencerminkan stagnasi\./,
  /^Pendekatan ini menuai kritik tajam karena mengabaikan/,
];
const TEMPLATE_SYNTHESIS = /^Kesimpulannya, skor .* merefleksikan dinamika di mana/;
const TEMPLATE_QUOTE = [
  /^Capaian konstitusional ini adalah preseden baik/,
  /^Stagnasi ketatanegaraan terjadi ketika hukum/,
  /^Penyimpangan terhadap norma dasar ini adalah bentuk kemunduran/,
];

/** Label skor kanonik sesuai rubrik v1. */
const SCORE_LABEL: Record<string, string> = {
  "-2": "Sangat Buruk (-2)",
  "-1": "Buruk (-1)",
  "0": "Netral (0)",
  "1": "Baik (+1)",
  "2": "Sangat Baik (+2)",
};

/**
 * Sintesis bertanda label skor yang keliru. `relabel` = arah penilaian sudah
 * benar, hanya besarannya salah tulis; `drop` = narasi berlawanan arah dengan
 * skor kanonik sehingga tidak dapat diselamatkan tanpa mengarang.
 */
const SYNTHESIS_FIX: Record<string, { action: "relabel"; text: string } | { action: "drop" }> = {
  "asm-megawati::checks-balances": {
    action: "relabel",
    text:
      "Skor baik (+1) karena lahirnya MK (UU 24/2003) dan KPK (UU 30/2002) menuntaskan transisi sistem ketatanegaraan menuju pemisahan kekuasaan yang seimbang.",
  },
  "asm-jokowi-ii::sila-4": {
    action: "relabel",
    text:
      "Penilaian regresi berat (-2) karena eliminasi meaningful public participation melanggar esensi permusyawaratan/perwakilan Sila Keempat.",
  },
  "asm-mk23::negara-hukum": {
    action: "relabel",
    text:
      "Skor inkonstitusional (-1) karena rekayasa putusan demi memfasilitasi dinasti keluarga presiden meruntuhkan muruah dan legitimasi peradilan konstitusi.",
  },
  "asm-bpk-2019-sekarang::checks-balances": {
    action: "relabel",
    text:
      "Skor regresi (-1) karena audit keuangan negara yang dikomersialkan menjadi komoditas suap melumpuhkan fungsi akuntabilitas fiskal Pasal 23E UUD 1945.",
  },
  "asm-sby-i::sila-1": { action: "drop" },
  "asm-jokowi-i::sila-4": { action: "drop" },
  "asm-jokowi-i::negara-hukum": { action: "drop" },
  "asm-mk08::negara-hukum": { action: "drop" },
};

const sources = parse(readFileSync(SOURCES, "utf8")) as Array<{ id: string; year?: number; type?: string }>;
const sourceYear = new Map(sources.map((s) => [s.id, s.year]));

type Quote = { quote: string; author: string; role: string; year?: number; source_id?: string };
type Dim = {
  dimension_id: string;
  score: number;
  rationale_id: string;
  thesis_id?: string;
  antithesis_id?: string;
  synthesis_id?: string;
  expert_quotes?: Quote[];
};
type Assessment = {
  id: string;
  reviewers: string[];
  dimension_scores: Dim[];
  ai_disclosure?: Record<string, unknown>;
};

const assessments = parse(readFileSync(ASSESSMENTS, "utf8")) as Assessment[];

const stat = {
  dialektikaTemplateDihapus: 0,
  tesisTruncatedDihapus: 0,
  kutipanTemplateDihapus: 0,
  kutipanPenulisJurnalDihapus: 0,
  kutipanTahunDiselaraskan: 0,
  sintesisDilabelUlang: 0,
  sintesisDihapus: 0,
  aiDisclosureDijujurkan: 0,
};

for (const asm of assessments) {
  for (const dim of asm.dimension_scores) {
    const key = `${asm.id}::${dim.dimension_id}`;

    // 1. Blok dialektika hasil template -> hapus seluruhnya.
    const isTemplate =
      (dim.antithesis_id && TEMPLATE_ANTITHESIS.some((r) => r.test(dim.antithesis_id!))) ||
      (dim.synthesis_id && TEMPLATE_SYNTHESIS.test(dim.synthesis_id));
    if (isTemplate) {
      stat.dialektikaTemplateDihapus++;
      if (dim.thesis_id && dim.thesis_id.trim() !== dim.rationale_id.trim()) {
        stat.tesisTruncatedDihapus++;
      }
      delete dim.thesis_id;
      delete dim.antithesis_id;
      delete dim.synthesis_id;
      if (dim.expert_quotes) {
        stat.kutipanTemplateDihapus += dim.expert_quotes.length;
        delete dim.expert_quotes;
      }
      continue;
    }

    // 2. Kutipan pakar yang tersisa.
    if (dim.expert_quotes) {
      const kept: Quote[] = [];
      for (const q of dim.expert_quotes) {
        if (TEMPLATE_QUOTE.some((r) => r.test(q.quote))) {
          stat.kutipanTemplateDihapus++;
          continue;
        }
        // Nama jurnal dipersonifikasi sebagai penutur kutipan lisan.
        if (/^(Jurnal|Masalah-Masalah Hukum|Mimbar Hukum|Constitutional Review|Padjadjaran)/i.test(q.author)) {
          stat.kutipanPenulisJurnalDihapus++;
          continue;
        }
        // Anti-anakronisme: kutipan disitasi dari terbitan, jadi tahunnya
        // adalah tahun terbit sumber tersebut.
        const y = q.source_id ? sourceYear.get(q.source_id) : undefined;
        if (typeof y === "number" && q.year !== y) {
          q.year = y;
          stat.kutipanTahunDiselaraskan++;
        } else if (typeof y !== "number" && q.year !== undefined) {
          delete q.year;
          stat.kutipanTahunDiselaraskan++;
        }
        kept.push(q);
      }
      if (kept.length) dim.expert_quotes = kept;
      else delete dim.expert_quotes;
    }

    // 3. Label skor pada sintesis substantif.
    const fix = SYNTHESIS_FIX[key];
    if (fix && dim.synthesis_id) {
      if (fix.action === "drop") {
        delete dim.synthesis_id;
        stat.sintesisDihapus++;
      } else {
        dim.synthesis_id = fix.text;
        stat.sintesisDilabelUlang++;
      }
    }
  }

  // 4. Kejujuran metadata EU AI Act: belum ada penelaah manusia.
  const dis = asm.ai_disclosure as
    | { human_oversight?: Record<string, unknown>; [k: string]: unknown }
    | undefined;
  if (dis) {
    dis.model_id = "gemini-3.8-flash-high";
    dis.model_provider = "Google DeepMind";
    dis.human_oversight = {
      mechanism: "quorum-2-reviewers",
      status: "draft",
      approver_count: 0,
      approvers: [],
    };
    dis.limitations_notice =
      "Draf analitis dibangkitkan model AI dan BELUM ditelaah manusia. Audit integritas 4 September 2026 menemukan dialektika, kutipan pakar, dan sitasi hasil halusinasi model; seluruh materi tersebut telah dihapus. Yang tersisa adalah rasional bersitasi dokumen primer yang masih menunggu kuorum dua penelaah manusia sebelum berstatus published.";
    dis.remediation = {
      model_id: "claude-opus-5",
      model_provider: "Anthropic",
      performed_at: "2026-09-04",
      notes_id:
        "Remediasi audit integritas data: pencabutan dialektika template, kutipan pakar fabrikasi, dan penjujuran metadata pengawasan manusia.",
    };
    stat.aiDisclosureDijujurkan++;
  }
  if (!asm.reviewers.includes("Claude Opus 5 (Remediasi Audit Integritas)")) {
    asm.reviewers.push("Claude Opus 5 (Remediasi Audit Integritas)");
  }
}

writeFileSync(ASSESSMENTS, stringify(assessments, { indent: 2, lineWidth: 0 }), "utf8");
console.table(stat);
