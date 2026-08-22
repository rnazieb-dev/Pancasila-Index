import { NextResponse } from "next/server";

import { dataset } from "@pancasila-index/data";

/**
 * GET /api/v1/rubric — rubrik Kepancasilaan lengkap berversi.
 */
export function GET() {
  const r = dataset.rubric;
  return NextResponse.json({
    version: r.version,
    name: r.name_id,
    description: r.description_id,
    license: "CC-BY-SA-4.0",
    groups: r.groups.map((g) => ({
      id: g.id,
      name: g.name_id,
      description: g.description_id,
      weight: g.weight,
      dimensions: r.dimensions
        .filter((d) => d.group_id === g.id)
        .map((d) => ({
          id: d.id,
          name: d.name_id,
          question: d.question_id,
          weight: d.weight,
          anchors: d.anchors,
          indicators: d.indicators.map((i) => ({
            id: i.id,
            name: i.name_id,
            legal_anchors: i.legal_anchors_id,
          })),
        })),
    })),
  });
}
