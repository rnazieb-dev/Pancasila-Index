import { NextResponse, type NextRequest } from "next/server";
import { dataset } from "@pancasila-index/data";
import { computeIndex } from "@pancasila-index/core";
import { INDEX_BASIS } from "@/lib/view";
import { checkRateLimit } from "@/lib/rate-limit";

export function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const institution = searchParams.get("institution");
  const era = searchParams.get("era");
  const q = searchParams.get("q")?.toLowerCase();

  let terms = dataset.terms;

  if (institution) {
    terms = terms.filter(
      (t) => t.institution_id === institution || dataset.institutions.find((i) => i.slug === institution)?.id === t.institution_id
    );
  }

  if (era) {
    terms = terms.filter((t) => t.era === era);
  }

  if (q) {
    terms = terms.filter(
      (t) =>
        t.label_id.toLowerCase().includes(q) ||
        t.actors.some((a) => a.name.toLowerCase().includes(q))
    );
  }

  const data = terms.map((t) => {
    const asms = dataset.assessments.filter((a) => a.term_id === t.id);
    const summary = computeIndex(dataset.assessments, t.id, dataset.rubric, INDEX_BASIS);
    return {
      ...t,
      index: summary?.index ?? null,
      coverage: summary?.coverage ?? 0,
      index_interval: summary?.index_interval ?? null,
      mean_confidence: summary?.mean_confidence ?? null,
      method_version: summary?.method_version ?? null,
      index_capped: summary?.index_capped ?? false,
      index_uncapped: summary?.index_uncapped ?? null,
      non_derogable_breaches: summary?.non_derogable_breaches ?? [],
      groups_excluded_low_coverage: summary?.groups_excluded_low_coverage ?? [],
      excluded_unknown_dimension: summary?.excluded_unknown_dimension ?? 0,
      basis: summary?.basis ?? null,
      published_assessments: summary?.published_count ?? 0,
      draft_assessments: summary?.draft_count ?? 0,
      excluded_no_evidence: summary?.excluded_no_evidence ?? 0,
      total_assessments: asms.length,
    };
  });

  return NextResponse.json({ data, count: data.length });
}
