import Link from "next/link";
import { notFound } from "next/navigation";

import {
  dataset,
  getAssessmentsOfTerm,
  getEventsOfTerm,
  getInstitution,
  getSource,
  getTermsOfInstitution,
} from "@pancasila-index/data";

import { RadarChart } from "@/components/radar-chart";
import {
  groupName,
  indexLabel,
  periodLabel,
  scoreColor,
  scoreLabel,
  sourceTitle,
  termSummary,
} from "@/lib/view";

export function generateStaticParams() {
  return dataset.terms.flatMap((t) => {
    const inst = dataset.institutions.find((i) => i.id === t.institution_id);
    return inst ? [{ slug: inst.slug, term: t.id }] : [];
  });
}

export default async function TermPage({
  params,
}: {
  params: Promise<{ slug: string; term: string }>;
}) {
  const { slug, term: termId } = await params;
  const institution = getInstitution(dataset, slug);
  const term = getTermsOfInstitution(dataset, institution?.id ?? "").find(
    (t) => t.id === termId
  );
  if (!institution || !term) notFound();

  const summary = termSummary(term.id);
  const assessments = getAssessmentsOfTerm(dataset, term.id);
  const events = getEventsOfTerm(dataset, term.id);

  const silaDims = dataset.rubric.dimensions.filter(
    (d) => d.group_id === "sila"
  );

  // skor per dimensi (rerata lintas penilaian) untuk radar & daftar
  const scoreByDim = new Map<string, number>();
  for (const gs of summary?.groups ?? []) {
    for (const dim of dataset.rubric.dimensions.filter(
      (d) => d.group_id === gs.group_id
    )) {
      // nilai per-dimensi dihitung ulang ringan dari penilaian
      const vals = assessments.flatMap((a) =>
        a.dimension_scores.filter((ds) => ds.dimension_id === dim.id).map((ds) => ds.score)
      );
      if (vals.length > 0)
        scoreByDim.set(dim.id, vals.reduce((x, y) => x + y, 0) / vals.length);
    }
  }

  const silaValues = silaDims.map((d) => scoreByDim.get(d.id));
  const silaLabels = silaDims.map((d) => {
    const v = scoreByDim.get(d.id);
    return `Sila ${d.id.split("-")[1]}${v === undefined ? "" : " " + Math.round(((v + 2) / 4) * 100)}`;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href={`/lembaga/${institution.slug}`} className="text-sm text-[var(--muted)] hover:text-white">
        ← {institution.short_id}
      </Link>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="text-3xl font-bold">{term.label_id}</h1>
        <span className="text-sm text-[var(--muted)]">
          {periodLabel(term.start_date, term.end_date)} · {term.era}
        </span>
      </div>

      {term.actors.length > 0 && (
        <p className="mt-2 text-sm text-[var(--muted)]">
          {term.actors.map((a) => `${a.name} (${a.role_id})`).join(" · ")}
        </p>
      )}

      <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 flex flex-wrap items-center gap-6">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--muted)]">Indeks draf</div>
          <div
            className="text-4xl font-bold tabular-nums"
            style={{ color: scoreColor(((summary?.index ?? 50) / 25 - 2)) }}
          >
            {indexLabel(summary?.index ?? null)}
          </div>
        </div>
        <div className="text-[11px] text-[var(--muted)]">skala 0–100 · 50 = netral</div>
        <div className="text-xs text-[var(--muted)] leading-relaxed">
          cakupan {Math.round((summary?.coverage ?? 0) * 100)}% dari{" "}
          {summary?.total_dimensions ?? 0} dimensi rubrik v{summary?.rubric_version ?? "?"}
          <br />
          {assessments.length} penilaian · status: <em>draf belum dikurasi</em>
        </div>
      </div>

      {/* Radar lima sila */}
      <section className="mt-10 grid md:grid-cols-[320px_1fr] gap-8 items-center">
        <div className="justify-self-center">
          {silaValues.some((v) => typeof v === "number") ? (
            <RadarChart labels={silaLabels} values={silaValues} />
          ) : (
            <div className="w-[320px] h-[320px] rounded-xl border border-dashed border-[var(--line)] flex items-center justify-center p-6 text-center text-xs text-[var(--muted)] leading-relaxed">
              Radar lima sila akan tampil setelah dimensi sila dinilai.
              <br />
              Penilaian periode ini baru menyentuh tujuan bernegara dan norma struktural.
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold">Skor per grup</h2>
          <div className="mt-4 space-y-3">
            {(summary?.groups ?? []).map((gs) => (
              <div key={gs.group_id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{groupName(gs.group_id)}</span>
                  <span className="tabular-nums text-[var(--muted)]">
                    {gs.coverage > 0 ? Math.round(((gs.score + 2) / 4) * 100) + "/100" : "belum dinilai"} · cakupan{" "}
                    {Math.round(gs.coverage * 100)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--line)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((gs.score + 2) / 4) * 100))}%`,
                      background:
                        gs.coverage > 0 ? scoreColor(gs.score) : "#334155",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rincian dimensi + bukti */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">Rincian dimensi & bukti</h2>
        <div className="mt-4 space-y-3">
          {dataset.rubric.dimensions.map((dim) => {
            const entries = assessments.flatMap((a) =>
              a.dimension_scores
                .filter((ds) => ds.dimension_id === dim.id)
                .map((ds) => ({ assessmentId: a.id, ds }))
            );
            if (entries.length === 0) return null;
            const avg = entries.reduce((acc, e) => acc + e.ds.score, 0) / entries.length;
            const conf = entries.reduce((acc, e) => acc + e.ds.confidence, 0) / entries.length;
            const first = entries[0]?.ds;
            if (!first) return null;
            return (
              <details
                key={dim.id}
                className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3"
              >
                <summary className="flex flex-wrap items-center gap-3 cursor-pointer list-none">
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-bold w-11 text-center tabular-nums"
                    title={`skala rubrik: ${avg > 0 ? "+" : ""}${avg.toFixed(1)} dari -2..+2`}
                    style={{ background: `${scoreColor(avg)}22`, color: scoreColor(avg) }}
                  >
                    {Math.round(((avg + 2) / 4) * 100)}
                  </span>
                  <span className="font-medium grow">{dim.name_id}</span>
                  <span className="text-xs text-[var(--muted)]">
                    keyakinan {Math.round(conf * 100)}%
                  </span>
                </summary>
                <div className="mt-3 space-y-3 border-t border-[var(--line)] pt-3">
                  <p className="text-sm italic text-[var(--muted)]">{dim.question_id.trim()}</p>
                  <p className="text-sm">{first.rationale_id.trim()}</p>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[var(--muted)] mt-2">Bukti empiris</div>
                    {first.evidence.length === 0 ? (
                      <p className="mt-1 text-xs text-amber-400">Belum ada bukti empiris - skor menunggu kurasi.</p>
                    ) : (
                    <ul className="mt-1.5 space-y-1">
                      {first.evidence.map((ev) => {
                        const src = dataset.sources.find((s) => s.id === ev.source_id);
                        const href = src?.resolved_url ?? src?.url;
                        return (
                          <li key={ev.source_id} className="text-xs leading-relaxed">
                            {href ? (
                              <>
                                📄{" "}
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sky-400 hover:text-sky-300 underline decoration-dotted underline-offset-2"
                                >
                                  {src?.title_id ?? ev.source_id} ↗
                                </a>
                              </>
                            ) : (
                              <span className="text-[var(--muted)]">• {sourceTitle(ev.source_id)}</span>
                            )}
                            {ev.note_id ? <span className="text-[var(--muted)]"> — {ev.note_id}</span> : null}
                          </li>
                        );
                      })}
                    </ul>
                    )}
                    {(first.normative_anchors ?? []).length > 0 && (
                      <div className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">
                        Landasan normatif (bukan bukti faktual):{" "}
                        {(first.normative_anchors ?? []).map((na, i, arr) => {
                          const src = dataset.sources.find((s) => s.id === na);
                          return (
                            <span key={na}>
                              {src ? (
                                <a
                                  href={src.resolved_url ?? src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline decoration-dotted underline-offset-2 hover:text-white"
                                >
                                  {(src.title_id || "").replace(/\s*\([^)]*\)\s*/g, " ").slice(0, 48).trim()} ↗
                                </a>
                              ) : (
                                na
                              )}
                              {i < arr.length - 1 ? " · " : ""}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {first.event_ids && first.event_ids.length > 0 && (
                    <div className="text-xs text-[var(--muted)]">
                      Peristiwa terkait:{" "}
                      {first.event_ids
                        .map(
                          (id) =>
                            dataset.events.find((e) => e.id === id)?.title_id ??
                            id
                        )
                        .join(" · ")}
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      {/* Peristiwa */}
      {events.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Peristiwa berbukti</h2>
          <ol className="mt-4 space-y-3">
            {events.map((ev) => (
              <li key={ev.id} className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-xs font-mono text-[var(--muted)]">{ev.date}</span>
                  <span className="text-[11px] uppercase tracking-wide text-red-400/80">
                    {ev.category}
                  </span>
                </div>
                <div className="mt-1 font-medium">{ev.title_id}</div>
                <p className="mt-1 text-sm text-[var(--muted)]">{ev.summary_id}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ev.source_ids.map((sid) => {
                    const src = dataset.sources.find((s) => s.id === sid);
                    const href = src?.resolved_url ?? src?.url;
                    return href ? (
                      <a
                        key={sid}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={src?.title_id ?? sid}
                        className="rounded bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 text-[11px] text-sky-400 hover:text-sky-300 hover:border-sky-700 max-w-xs truncate"
                      >
                        📄 {src?.title_id ?? sid} ↗
                      </a>
                    ) : (
                      <span
                        key={sid}
                        title={sourceTitle(sid)}
                        className="rounded bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--muted)] max-w-xs truncate"
                      >
                        📄 {sourceTitle(sid)}
                      </span>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

