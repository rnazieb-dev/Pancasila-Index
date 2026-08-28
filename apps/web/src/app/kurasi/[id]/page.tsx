import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { getCurrentUser, hasRole } from "@/lib/authz";
import { dataset, getSource } from "@pancasila-index/data";
import { KurasiActions } from "@/components/kurasi-actions";
import { scoreColor, scoreTextColor } from "@/lib/view";

export const dynamic = "force-dynamic";

export default async function KurasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!hasRole(user, "KONTRIBUTOR")) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Area kurasi</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Konfigurasi GITHUB_ID/GITHUB_SECRET atau set CURATION_DEV=1.
        </p>
      </div>
    );
  }

  const { id } = await params;
  const a = dataset.assessments.find((x) => x.id === id);
  if (!a) notFound();

  const term = dataset.terms.find((t) => t.id === a.term_id);
  const inst = dataset.institutions.find((i) => i.id === term?.institution_id);

  const scoredByDim = new Map(a.dimension_scores.map((d) => [d.dimension_id, d]));
  const unscored = dataset.rubric.dimensions.filter(
    (d) => !scoredByDim.has(d.id)
  );

  const history = await db.review.findMany({
    where: { assessmentId: a.id },
    orderBy: { createdAt: "asc" },
  });
  const approvers = new Set(
    history.filter((r) => r.decision === "APPROVED").map((r) => r.reviewerName)
  );
  const quorumMet =
    approvers.size >= 2 && (history.at(-1)?.decision ?? "") === "APPROVED";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href={`/kurasi?tab=draft`} className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
        ← antrean kurasi
      </Link>

      <h1 className="mt-3 text-3xl font-bold">{term?.label_id ?? a.term_id}</h1>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {a.id} · rubrik v{a.rubric_version} · dibuat {a.created_at} ·{" "}
        {a.ai_suggested ? "usulan AI" : "manual"} · reviewer tercatat:{" "}
        {a.reviewers.join(", ")}
      </p>

      {/* Status kuorum */}
      <div
        className={`mt-5 rounded-xl border px-5 py-4 ${
          a.status === "published"
            ? "border-green-800/40 bg-green-900/10"
            : quorumMet
              ? "border-green-800/40 bg-green-900/10"
              : history.some((r) => r.decision === "APPROVED")
                ? "border-orange-500/30 bg-orange-500/10"
                : "border-[var(--line)] bg-[var(--panel)]"
        }`}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Status
            </div>
            <div className="font-semibold">
              {a.status === "published" ? "✓ published" : quorumMet ? "siap publish" : history.length ? "menunggu telaah kedua" : "draf baru"}
            </div>
          </div>
          <div className="text-xs text-[var(--muted)] leading-relaxed">
            Approver berbeda nama:{" "}
            <strong className="text-[var(--text)]">{approvers.size}/2</strong>
            {history.length > 0 && (
              <>
                {" "}· keputusan terakhir: {history.at(-1)?.decision} oleh{" "}
                {history.at(-1)?.reviewerName}
              </>
            )}
          </div>
          {hasRole(user, "KURATOR") && !a.status.startsWith("pub") && (
            <div className="ml-auto">
              <KurasiActions assessmentId={a.id} />
            </div>
          )}
        </div>
        {!quorumMet && history.some((r) => r.decision === "APPROVED") && (
          <p className="mt-2 text-[11px] text-[var(--acc-amber-strong)]">
            Sudah disetujui satu kurator — publikasi menunggu telaah kedua dari
            kurator berbeda.
          </p>
        )}
      </div>

      {/* Riwayat keputusan */}
      {history.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Riwayat keputusan</h2>
          <ul className="mt-3 space-y-1 text-xs text-[var(--muted)]">
            {[...history].reverse().map((r) => (
              <li key={r.id}>
                {r.createdAt.toISOString().slice(0, 10)} —{" "}
                <strong className={r.decision === "APPROVED" ? "text-green-400" : "text-[var(--acc-red)]"}>
                  {r.decision}
                </strong>{" "}
                oleh {r.reviewerName}
                {r.note ? ` — "${r.note}"` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tabel dimensi: rubrik vs penilaian */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Penilaian per dimensi ({scoredByDim.size}/{dataset.rubric.dimensions.length})</h2>
        <div className="mt-4 space-y-3">
          {dataset.rubric.dimensions.map((dim) => {
            const ds = scoredByDim.get(dim.id);
            return (
              <details key={dim.id} className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3" open={!ds}>
                <summary className={`cursor-pointer list-none flex flex-wrap items-center gap-3 ${ds ? "" : "opacity-60"}`}>
                  {ds ? (
                    (() => {
                      const v = Math.round(((ds.score + 2) / 4) * 100);
                      // Dulu skala warna skor disalin ulang di sini dengan hex
                      // hardcoded - salinan keempat, dan tak terbaca di light mode.
                      return (
                        <span
                          className="rounded-md px-2 py-0.5 text-xs font-bold w-11 text-center tabular-nums"
                          style={{ background: `${scoreColor(ds.score)}22`, color: scoreTextColor(ds.score) }}
                        >
                          {v}
                        </span>
                      );
                    })()
                  ) : (
                    <span className="rounded-md px-2 py-0.5 text-xs w-11 text-center border border-dashed border-[var(--line)] text-[var(--muted)]">–</span>
                  )}
                  <span className="font-medium grow">{dim.name_id}</span>
                  {ds && (
                    <span className="text-xs text-[var(--muted)]">
                      skala {ds.score > 0 ? "+" : ""}
                      {ds.score} · keyakinan {Math.round(ds.confidence * 100)}%
                    </span>
                  )}
                </summary>

                <div className="mt-3 border-t border-[var(--line)] pt-3 grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {/* kolom rubrik */}
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-[var(--acc-sky)] mb-1">
                      Rubrik v{dataset.rubric.version}
                    </div>
                    <p className="italic text-[var(--muted)]">{dim.question_id.trim()}</p>
                    {/*
                      Seluruh LIMA jangkar, bukan hanya −2 dan +2. Kurator di
                      halaman inilah yang memutuskan skornya, jadi menyembunyikan
                      jangkar −1/0/+1 berarti aturan terpentingnya tidak pernah
                      terbaca — termasuk bahwa 0 BUKAN untuk kasus tarik-menarik.
                    */}
                    <dl className="mt-2 space-y-1 text-xs leading-relaxed text-[var(--muted)]">
                      {(["-2", "-1", "0", "1", "2"] as const).map((k) => {
                        const teks = dim.anchors[k];
                        if (!teks) return null;
                        const nol = k === "0";
                        return (
                          <div key={k} className="grid grid-cols-[2.2rem_1fr] gap-2">
                            <dt
                              className={`tabular-nums font-semibold ${
                                nol ? "text-[var(--acc-amber)]" : "text-[var(--muted)]"
                              }`}
                            >
                              {k === "0" ? "0" : k.startsWith("-") ? `−${k.slice(1)}` : `+${k}`}
                            </dt>
                            <dd className={nol ? "text-[var(--text)]" : ""}>{teks.trim()}</dd>
                          </div>
                        );
                      })}
                    </dl>
                    {dim.indicators.length > 0 && (
                      <ul className="mt-2 text-xs text-[var(--muted)] list-disc pl-4 space-y-0.5">
                        {dim.indicators.map((ind) => (
                          <li key={ind.id}>
                            {ind.name_id}
                            {ind.legal_anchors_id.length > 0 && (
                              <span className="opacity-70"> [{ind.legal_anchors_id.join("; ")}]</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* kolom penilaian / belum dinilai */}
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-[var(--acc-amber)] mb-1">
                      Penilaian kurandidat
                    </div>
                    {ds ? (
                      <>
                        <p>{ds.rationale_id.trim()}</p>
                        <div className="mt-2 text-xs text-[var(--muted)]">
                          Bukti empiris:
                        </div>
                        <ul className="mt-1 space-y-1">
                          {ds.evidence.map((ev) => {
                            const src = getSource(dataset, ev.source_id);
                            const href = src?.resolved_url ?? src?.url;
                            return (
                              <li key={ev.source_id} className="text-xs">
                                📄{" "}
                                {href ? (
                                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--acc-sky)] hover:text-[var(--acc-sky-strong)] underline decoration-dotted underline-offset-2">
                                    {(src?.title_id ?? ev.source_id).slice(0, 60)} ↗
                                  </a>
                                ) : (
                                  <span className="text-[var(--muted)]">{ev.source_id}</span>
                                )}
                                {ev.note_id ? ` — ${ev.note_id}` : ""}
                              </li>
                            );
                          })}
                        </ul>
                        {(ds.event_ids ?? []).length > 0 && (
                          <div className="mt-2 text-xs text-[var(--muted)]">
                            Peristiwa:{" "}
                            {(ds.event_ids ?? [])
                              .map((eid) => dataset.events.find((e) => e.id === eid)?.title_id ?? eid)
                              .join(" · ")}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-[var(--muted)] italic">
                        Belum dinilai — lengkapi bila mandat lembaga menyentuh dimensi ini.
                      </p>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
        {unscored.length > 0 && (
          <p className="mt-3 text-xs text-[var(--muted)]">
            Belum dinilai: {unscored.map((d) => d.name_id).join(" · ")}. Cakupan
            parsial diperbolehkan — jangan mengisi bukti tempelan demi tabel penuh.
          </p>
        )}
      </section>
    </div>
  );
}
