import Link from "next/link";
import { notFound } from "next/navigation";

import {
  dataset,
  getAssessmentsOfTerm,
  getEventsAboutTerm,
  getEventsOfTerm,
  getInstitution,
  getSource,
  getTermsOfInstitution,
} from "@pancasila-index/data";

import { RadarChart } from "@/components/radar-chart";
import { ExternalIndicesWidget } from "@/components/external-indices-widget";
import {
  groupName,
  indexLabel, summaryIndexLabel, summaryIndexNote, summaryQualLabel, dimensionName,
  periodLabel,
  scoreColor,
  scoreTextColor,
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
  // Peristiwa yang menjadikan periode ini subjek pemeriksaan meski dicatat di
  // lembaga lain - tanpa ini, audit BPK atau putusan MA atas perkara pejabat
  // periode ini hanya tampil di profil lembaga yang membongkarnya.
  const eventsAbout = getEventsAboutTerm(dataset, term.id);
  const actorsById = new Map(dataset.actors.map((a) => [a.id, a]));
  const institutionsById = new Map(dataset.institutions.map((i) => [i.id, i]));
  const termsById = new Map(dataset.terms.map((t) => [t.id, t]));

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
      <Link href={`/lembaga/${institution.slug}`} className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
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
          {term.actors.map((a, i) => (
            <span key={`${a.name}-${i}`}>
              {i > 0 && " · "}
              {a.actor_id ? (
                <Link
                  href={`/aktor/${a.actor_id}`}
                  className="text-[var(--acc-sky)] underline decoration-dotted underline-offset-2 hover:text-[var(--acc-sky-strong)]"
                >
                  {a.name}
                </Link>
              ) : (
                a.name
              )}{" "}
              ({a.role_id})
            </span>
          ))}
        </p>
      )}

      {/* Peringatan pelanggaran hak dasar. Sengaja DI ATAS angka dan tidak
          bergantung pada ada-tidaknya indeks: aturannya disebut sebelum
          angkanya, dan mayoritas masa jabatan indeksnya ditahan ambang
          cakupan sehingga peringatan yang digantungkan ke angka tak berguna. */}
      {(summary?.non_derogable_breaches.length ?? 0) > 0 && (
        <div className="mt-5 rounded-xl border border-[var(--acc-red)] bg-[var(--score-vneg-bg)] px-5 py-4">
          <div className="text-xs font-bold uppercase tracking-wide text-[var(--acc-red)]">
            Pelanggaran hak yang tidak dapat dikurangi
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text)]">
            Pasal 28I ayat (1) UUD 1945 menyatakan sebagian hak tidak dapat dikurangi
            dalam keadaan apa pun — termasuk hak hidup dan hak bebas dari penyiksaan.
            Penilaian periode ini menemukan pelanggaran pada{" "}
            {summary!.non_derogable_breaches
              .map((b) => `${dimensionName(b.dimension_id)} (skor ${b.score})`)
              .join(", ")}
            . Pelanggaran seperti ini <strong>tidak dapat dilunasi</strong> capaian di
            dimensi lain, sehingga indeks komposit diberi batas atas.
          </p>
          {summary!.index_capped && (
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              Tanpa batas itu, komposit periode ini adalah{" "}
              <strong className="text-[var(--text)]">{summary!.index_uncapped}</strong> —
              dicantumkan agar batasnya dapat diperiksa, bukan disembunyikan.
            </p>
          )}
        </div>
      )}

      <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 flex flex-wrap items-center gap-6">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--muted)]">Indeks draf</div>
          <div
            className="text-4xl font-bold tabular-nums"
            style={{ color: summaryQualLabel(summary).color }}
          >
            {summaryIndexLabel(summary)}
          </div>
          {summary?.index_interval && (
            <div className="mt-1 text-[11px] tabular-nums text-[var(--muted)]">
              rentang {summary.index_interval.low}–{summary.index_interval.high}
              <span className="ml-1.5">(keyakinan {Math.round(summary.mean_confidence * 100)}%)</span>
            </div>
          )}
        </div>
        <div className="text-[11px] text-[var(--muted)]">
          skala 0–100 · 50 = netral
          <br />
          {summaryQualLabel(summary).label}
        </div>
        {summaryIndexNote(summary) && (
          <p className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[11px] leading-relaxed text-[var(--muted)]">
            {summaryIndexNote(summary)}
          </p>
        )}
        <div className="text-xs text-[var(--muted)] leading-relaxed">
          cakupan {Math.round((summary?.coverage ?? 0) * 100)}% dari{" "}
          {summary?.total_dimensions ?? 0} dimensi rubrik v{summary?.rubric_version ?? "?"}
          <br />
          {assessments.length} penilaian · dasar: <em>{summary?.basis ?? "-"}</em>
          <br />
          mesin skor v{summary?.method_version ?? "?"}
          {(summary?.excluded_no_evidence ?? 0) > 0 && (
            <>
              <br />
              {summary!.excluded_no_evidence} skor dikeluarkan karena belum berbukti empiris
            </>
          )}
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
            // Rentang skor antarpenilai: ditampilkan agar rerata tidak
            // menyembunyikan ketidaksetujuan, sesuai janji di /metodologi.
            const skorMin = Math.min(...entries.map((e) => e.ds.score));
            const skorMax = Math.max(...entries.map((e) => e.ds.score));
            const adaSelisih = entries.length > 1 && skorMin !== skorMax;
            return (
              <details
                key={dim.id}
                className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3"
              >
                <summary className="flex flex-wrap items-center gap-3 cursor-pointer list-none">
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-bold w-11 text-center tabular-nums"
                    title={`skala rubrik: ${avg > 0 ? "+" : ""}${avg.toFixed(1)} dari -2..+2`}
                    style={{ background: `${scoreColor(avg)}22`, color: scoreTextColor(avg) }}
                  >
                    {Math.round(((avg + 2) / 4) * 100)}
                  </span>
                  <span className="font-medium grow">{dim.name_id}</span>
                  <span className="text-xs text-[var(--muted)]">
                    keyakinan {Math.round(conf * 100)}%
                  </span>
                  {adaSelisih && (
                    <span
                      className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--acc-amber)]"
                      title={`${entries.length} penilai berselisih: ${skorMin} s.d. ${skorMax}`}
                    >
                      penilai berselisih {skorMin > 0 ? "+" : ""}{skorMin} … {skorMax > 0 ? "+" : ""}{skorMax}
                    </span>
                  )}
                </summary>
                <div className="mt-3 space-y-3 border-t border-[var(--line)] pt-3">
                  <p className="text-sm italic text-[var(--muted)]">{dim.question_id.trim()}</p>

                  {/* SETIAP penilai ditampilkan, bukan hanya yang pertama.
                      Sebelumnya skor dirata-ratakan tetapi rasional dan bukti
                      diambil dari entries[0] saja, sehingga penilai kedua
                      hilang sepenuhnya - bertentangan dengan janji di halaman
                      Metodologi bahwa ketidaksetujuan ditampilkan publik. */}
                  {entries.map((e, idx) => (
                    <div
                      key={`${e.assessmentId}-${idx}`}
                      className={
                        entries.length > 1
                          ? "rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 space-y-2"
                          : "space-y-2"
                      }
                    >
                      {entries.length > 1 && (
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)]">
                          <span className="font-mono">{e.assessmentId}</span>
                          <span className="tabular-nums">
                            skor {e.ds.score > 0 ? "+" : ""}
                            {e.ds.score} · keyakinan {Math.round(e.ds.confidence * 100)}%
                          </span>
                        </div>
                      )}
                      <p className="text-sm">{e.ds.rationale_id.trim()}</p>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-[var(--muted)] mt-2">Bukti empiris</div>
                        {e.ds.evidence_gap === true || e.ds.evidence.length === 0 ? (
                          <p className="mt-1 text-xs text-[var(--acc-amber)]">
                            Belum berbukti empiris — skor ini <strong>dikeluarkan</strong> dari indeks.
                          </p>
                        ) : (
                          <ul className="mt-1.5 space-y-1">
                            {e.ds.evidence.map((ev) => {
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
                                        className="text-[var(--acc-sky)] hover:text-[var(--acc-sky-strong)] underline decoration-dotted underline-offset-2"
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
                        {(e.ds.normative_anchors ?? []).length > 0 && (
                          <div className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">
                            Landasan normatif (bukan bukti faktual):{" "}
                            {(e.ds.normative_anchors ?? []).map((na, i, arr) => {
                              const src = dataset.sources.find((s) => s.id === na);
                              return (
                                <span key={na}>
                                  {src ? (
                                    <a
                                      href={src.resolved_url ?? src.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline decoration-dotted underline-offset-2 hover:text-[var(--text)]"
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
                      {e.ds.event_ids && e.ds.event_ids.length > 0 && (
                        <div className="text-xs text-[var(--muted)]">
                          Peristiwa terkait:{" "}
                          {e.ds.event_ids
                            .map((id) => dataset.events.find((ev) => ev.id === id)?.title_id ?? id)
                            .join(" · ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      {/* Konteks Independen Global (Enrichment) */}
      <ExternalIndicesWidget term={term} indices={dataset.external_indices ?? []} />

      {/* Peristiwa */}
      {events.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Peristiwa berbukti</h2>
          <ol className="mt-4 space-y-3">
            {events.map((ev) => (
              <li key={ev.id} className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-xs font-mono text-[var(--muted)]">{ev.date}</span>
                  <span className="text-[11px] uppercase tracking-wide text-[var(--acc-red)]">
                    {ev.category}
                  </span>
                </div>
                <div className="mt-1 font-medium">{ev.title_id}</div>
                <p className="mt-1 text-sm text-[var(--muted)]">{ev.summary_id}</p>
                {ev.actor_ids.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                      Aktor:
                    </span>
                    {ev.actor_ids.map((aid) => (
                      <Link
                        key={aid}
                        href={`/aktor/${aid}`}
                        className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-[var(--acc-amber-strong)] hover:border-amber-400"
                      >
                        {actorsById.get(aid)?.name ?? aid}
                      </Link>
                    ))}
                  </div>
                )}
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
                        className="rounded bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--acc-sky)] hover:text-[var(--acc-sky-strong)] hover:border-sky-700 max-w-xs truncate"
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
      {/* Peristiwa yang menjadikan periode ini SUBJEK, dicatat di lembaga lain */}
      {eventsAbout.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Diperiksa oleh lembaga lain</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[var(--muted)]">
            Audit, dakwaan, atau putusan yang objek pemeriksaannya jatuh di dalam masa
            jabatan ini, tetapi dicatat pada masa jabatan lembaga yang membongkarnya
            (BPK, MA, Kejaksaan). Sebelum ada penautan ini, perkara semacam itu hanya
            tampil di profil pembongkarnya - sehingga hilang dari halaman pihak yang
            diperiksa.
          </p>
          <ol className="mt-4 space-y-3">
            {eventsAbout.map((ev) => {
              const recordedIn = termsById.get(ev.term_id);
              const recordedInst = recordedIn
                ? institutionsById.get(recordedIn.institution_id)
                : undefined;
              return (
                <li
                  key={ev.id}
                  className="rounded-lg border border-amber-500/25 bg-amber-950/10 px-4 py-3"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-mono text-xs text-[var(--muted)]">{ev.date}</span>
                    <span className="text-[11px] uppercase tracking-wide text-[var(--acc-amber)]">
                      {ev.category}
                    </span>
                    {recordedIn && recordedInst && (
                      <Link
                        href={`/lembaga/${recordedInst.slug}/${recordedIn.id}`}
                        className="text-[11px] text-[var(--acc-sky)] hover:text-[var(--acc-sky-strong)]"
                      >
                        dicatat di {recordedIn.label_id} &rarr;
                      </Link>
                    )}
                  </div>
                  <div className="mt-1 font-medium">{ev.title_id}</div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{ev.summary_id}</p>
                  {ev.subject_basis_id && (
                    <p className="mt-2 rounded border border-[var(--line)] bg-[var(--bg)] px-2.5 py-2 text-[11px] leading-relaxed text-[var(--muted)]">
                      <strong className="text-[var(--muted)]">Dasar re-atribusi: </strong>
                      {ev.subject_basis_id}
                    </p>
                  )}
                  {ev.actor_ids.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                        Aktor:
                      </span>
                      {ev.actor_ids.map((aid) => (
                        <Link
                          key={aid}
                          href={`/aktor/${aid}`}
                          className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-[var(--acc-amber-strong)] hover:border-amber-400"
                        >
                          {actorsById.get(aid)?.name ?? aid}
                        </Link>
                      ))}
                    </div>
                  )}
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
                          className="max-w-xs truncate rounded border border-[var(--line)] bg-[var(--bg)] px-2 py-0.5 text-[11px] text-[var(--acc-sky)] hover:border-sky-700 hover:text-[var(--acc-sky-strong)]"
                        >
                          &#128196; {src?.title_id ?? sid} &uarr;
                        </a>
                      ) : (
                        <span
                          key={sid}
                          className="max-w-xs truncate rounded border border-[var(--line)] bg-[var(--bg)] px-2 py-0.5 text-[11px] text-[var(--muted)]"
                        >
                          &#128196; {sourceTitle(sid)}
                        </span>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

    </div>
  );
}
