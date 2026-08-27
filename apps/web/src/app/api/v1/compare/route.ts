import { NextResponse, type NextRequest } from "next/server";
import { dataset } from "@pancasila-index/data";
import { computeAssessmentSummary } from "@pancasila-index/core";
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
  const termsParam = searchParams.get("terms");

  if (!termsParam) {
    return NextResponse.json(
      { error: "Parameter 'terms' wajib diisi (contoh: ?terms=presiden-habibie,presiden-gusdur)" },
      { status: 400 }
    );
  }

  const termIds = termsParam.split(",").map((s) => s.trim()).filter(Boolean);
  const termsById = new Map(dataset.terms.map((t) => [t.id, t]));

  const comparison = termIds.map((termId) => {
    const term = termsById.get(termId);
    if (!term) return { term_id: termId, error: "Term not found" };

    const assessments = dataset.assessments.filter((a) => a.term_id === termId);
    const summary = computeAssessmentSummary(assessments, dataset.rubric);

    // Hitung rata-rata per dimensi
    const dimensions = dataset.rubric.dimensions.map((dim) => {
      const scores = assessments.flatMap((a) =>
        a.dimension_scores
          .filter((ds) => ds.dimension_id === dim.id)
          .map((ds) => ds.score)
      );
      return {
        dimension_id: dim.id,
        dimension_name: dim.name_id,
        group_id: dim.group_id,
        score: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
      };
    });

    return {
      term_id: term.id,
      label: term.label_id,
      institution: term.institution_id,
      era: term.era,
      period: { start: term.start_date, end: term.end_date },
      index: summary?.index ?? null,
      coverage: summary?.coverage ?? 0,
      dimensions,
    };
  });

  return NextResponse.json({ data: comparison });
}
