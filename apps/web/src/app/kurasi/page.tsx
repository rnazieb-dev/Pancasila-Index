import Link from "next/link";

import { auth } from "@/auth";
import { dataset } from "@pancasila-index/data";
import { KurasiActions } from "@/components/kurasi-actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Kurasi — Pancasila Index" };

export default async function KurasiPage() {
  const session = await auth();
  const devMode = process.env.CURATION_DEV === "1";

  if (!session?.user && !devMode) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Area kurasi</h1>
        <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
          Kurasi membutuhkan akun GitHub. Konfigurasi{" "}
          <code className="text-[var(--text)]">GITHUB_ID</code> dan{" "}
          <code className="text-[var(--text)]">GITHUB_SECRET</code> di berkas
          .env, atau aktifkan mode pengembangan dengan{" "}
          <code className="text-[var(--text)]">CURATION_DEV=1</code>.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm underline hover:text-white">
          ← kembali ke beranda
        </Link>
      </div>
    );
  }

  const drafts = dataset.assessments.filter((a) => a.status === "draft");
  const published = dataset.assessments.filter((a) => a.status === "published");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-bold">Antrean kurasi</h1>
        <span className="text-xs text-[var(--muted)]">
          {session?.user?.name ? `masuk sebagai ${session.user.name}` : "mode dev"} ·{" "}
          {drafts.length} draf · {published.length} published
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-300">
        Keputusan dicatat ke <code>generated/review-state.json</code> (jejak audit
        yang dikomit). Terapkan dengan{" "}
        <code>pnpm build:data &amp;&amp; pnpm build</code>. Penolakan wajib
        beralasan.
      </div>

      <div className="mt-8 space-y-2">
        {drafts.map((a) => {
          const term = dataset.terms.find((t) => t.id === a.term_id);
          const scored = new Set(a.dimension_scores.map((d) => d.dimension_id));
          return (
            <div
              key={a.id}
              className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <div className="grow min-w-52">
                <div className="font-medium">{term?.label_id ?? a.term_id}</div>
                <div className="text-xs text-[var(--muted)] mt-0.5">
                  {a.id} · rubrik v{a.rubric_version} ·{" "}
                  {scored.size}/{dataset.rubric.dimensions.length} dimensi ·{" "}
                  {a.ai_suggested ? "usulan AI" : "manual"}
                </div>
              </div>
              <Link
                href={`/lembaga/${dataset.institutions.find((i) => i.id === term?.institution_id)?.slug ?? ""}/${a.term_id}`}
                className="text-xs underline text-[var(--muted)] hover:text-white"
              >
                tinjau →
              </Link>
              <KurasiActions assessmentId={a.id} />
            </div>
          );
        })}
      </div>

      {published.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Telah dikurasi ({published.length})</h2>
          <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
            {published.map((a) => (
              <li key={a.id}>
                ✓ {a.term_id} — reviewer: {a.reviewers.join(", ")}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
