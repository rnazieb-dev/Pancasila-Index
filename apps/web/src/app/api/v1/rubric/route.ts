import { NextResponse } from "next/server";

import { dataset } from "@pancasila-index/data";
import { dimensionInfluence, SCORING_METHOD_VERSION } from "@pancasila-index/core";

/**
 * GET /api/v1/rubric — rubrik Kepancasilaan lengkap berversi.
 */
export function GET() {
  const r = dataset.rubric;
  // Porsi NYATA tiap dimensi terhadap komposit. Angka `weight` mentah saja
  // pernah menyesatkan konsumen API: bobot grup 5/4/3 kebetulan sama dengan
  // jumlah dimensinya, sehingga seluruh dimensi berpengaruh identik.
  const influence = dimensionInfluence(r);
  return NextResponse.json({
    version: r.version,
    scoring_method_version: SCORING_METHOD_VERSION,
    name: r.name_id,
    description: r.description_id,
    license: "CC-BY-SA-4.0",
    groups: r.groups.map((g) => ({
      id: g.id,
      name: g.name_id,
      description: g.description_id,
      weight: g.weight,
      influence_share: r.dimensions
        .filter((d) => d.group_id === g.id)
        .reduce((a, d) => a + (influence.get(d.id) ?? 0), 0),
      dimensions: r.dimensions
        .filter((d) => d.group_id === g.id)
        .map((d) => ({
          id: d.id,
          name: d.name_id,
          question: d.question_id,
          weight: d.weight,
          influence_share: influence.get(d.id) ?? 0,
          non_derogable: d.non_derogable,
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
