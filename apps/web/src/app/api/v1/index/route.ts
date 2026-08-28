import { NextResponse } from "next/server";

import { dataset } from "@pancasila-index/data";
import { computeIndex } from "@pancasila-index/core";
import { INDEX_BASIS } from "@/lib/view";

/**
 * API publik v1: indeks draf per masa jabatan.
 * GET /api/v1/index
 */
export function GET() {
  const terms = dataset.terms.map((term) => {
    const summary = computeIndex(dataset.assessments, term.id, dataset.rubric, INDEX_BASIS);
    return {
      term_id: term.id,
      institution: term.institution_id,
      label: term.label_id,
      era: term.era,
      period: {
        start: term.start_date,
        end: term.end_date,
      },
      index: summary?.index ?? null,
      coverage: summary?.coverage ?? 0,
      rubric_version: summary?.rubric_version ?? null,
      // Asal-usul angka. Konsumen API tidak melihat footer situs, jadi dasar
      // status harus ada di payload — bukan hanya di disclaimer teratas.
      index_interval: summary?.index_interval ?? null,
      mean_confidence: summary?.mean_confidence ?? null,
      method_version: summary?.method_version ?? null,
      index_capped: summary?.index_capped ?? false,
      index_uncapped: summary?.index_uncapped ?? null,
      non_derogable_breaches: summary?.non_derogable_breaches ?? [],
      basis: summary?.basis ?? null,
      published_assessments: summary?.published_count ?? 0,
      draft_assessments: summary?.draft_count ?? 0,
      excluded_no_evidence: summary?.excluded_no_evidence ?? 0,
    };
  });

  return NextResponse.json({
    name: "Pancasila Index",
    disclaimer:
      "Seluruh nilai berstatus draf hasil demonstrasi metodologi; belum dikurasi manusia.",
    license: { code: "AGPL-3.0-only", data: "CC-BY-SA-4.0" },
    rubric: {
      version: dataset.rubric.version,
      groups: dataset.rubric.groups.map((g) => ({
        id: g.id,
        name: g.name_id,
        weight: g.weight,
      })),
      dimensions: dataset.rubric.dimensions.map((d) => ({
        id: d.id,
        group: d.group_id,
        name: d.name_id,
        weight: d.weight,
      })),
    },
    uud_coverage: {
      bab: dataset.uud.babs.length,
      pasal: dataset.uud.babs.reduce((acc, b) => acc + b.pasal.length, 0),
    },
    terms,
  });
}
