import Link from "next/link";

import { dataset } from "@pancasila-index/data";
import { getCurrentUser, hasRole } from "@/lib/authz";

export const dynamic = "force-dynamic";

export const metadata = { title: "Kurasi" };

const TABS = [
  { key: "draft", label: "Antrean draf" },
  { key: "published", label: "Telah dikurasi" },
  { key: "all", label: "Semua" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default async function KurasiPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!hasRole(user, "KONTRIBUTOR")) {
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
        <Link href="/" className="mt-6 inline-block text-sm underline hover:text-[var(--text)]">
          ← kembali ke beranda
        </Link>
      </div>
    );
  }

  const sp = await searchParams;
  const tab: TabKey =
    sp.tab === "published" || sp.tab === "all" ? sp.tab : "draft";

  const all = [...dataset.assessments];
  const drafts = all.filter((a) => a.status === "draft");
  const published = all.filter((a) => a.status === "published");

  // prioritas antrean: cakupan terendah dulu (paling butuh perhatian),
  // lalu yang terbaru dibuat.
  const covOf = (a: (typeof all)[number]) =>
    new Set(a.dimension_scores.map((d) => d.dimension_id)).size /
    dataset.rubric.dimensions.length;

  const rows =
    tab === "all" ? all : tab === "published" ? published : [...drafts].sort(
      (a, b) =>
        covOf(a) - covOf(b) || b.created_at.localeCompare(a.created_at)
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-bold">Antrean kurasi</h1>
        <span className="text-xs text-[var(--muted)]">
          {user ? (user.name ? `${user.name} · ${user.role}` : user.role) : "anonim"} ·{" "}
          {drafts.length} draf · {published.length} published · kuorum{" "}
          <strong className="text-[var(--text)]">2 approver</strong>
        </span>
      </div>

      <div className="mt-4 flex gap-2 text-xs">
        {TABS.map((tb) => (
          <Link
            key={tb.key}
            href={`/kurasi?tab=${tb.key}`}
            className={`rounded-full px-3 py-1 border transition ${
              tab === tb.key
                ? "border-red-500/60 bg-red-500/10 text-[var(--acc-red-strong)]"
                : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {tb.label}
          </Link>
        ))}
        <Link
          href="/kurasi/usulan"
          className="ml-auto rounded-full border border-[var(--acc-sky)]/50 px-3 py-1 font-semibold text-[var(--acc-sky-strong)] hover:bg-[var(--acc-sky)]/10"
        >
          Antrean usulan bukti →
        </Link>
        <Link
          href="/kurasi/log"
          className="rounded-full border border-[var(--line)] px-3 py-1 text-[var(--muted)] hover:text-[var(--text)]"
        >
          Log aktivitas →
        </Link>
      </div>

      <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-[var(--acc-amber-strong)]">
        Publikasi butuh <strong>dua approver berbeda nama</strong>. Satu approval
        menandai penilaian sebagai <em>menunggu telaah kedua</em>; penolakan wajib
        beralasan dan langsung mengeluarkannya dari dataset publik setelah build.
      </div>

      <div className="mt-8 space-y-2">
        {rows.map((a) => {
          const term = dataset.terms.find((t) => t.id === a.term_id);
          const inst = dataset.institutions.find(
            (i) => i.id === term?.institution_id
          );
          const scored = new Set(a.dimension_scores.map((d) => d.dimension_id));
          const covPct = Math.round(covOf(a) * 100);
          const isPublished = a.status === "published";
          return (
            <div
              key={a.id}
              className={`rounded-lg border px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 ${
                isPublished
                  ? "border-green-800/40 bg-green-900/10"
                  : "border-[var(--line)] bg-[var(--panel)]"
              }`}
            >
              <div className="grow min-w-52">
                <div className="font-medium">{term?.label_id ?? a.term_id}</div>
                <div className="text-xs text-[var(--muted)] mt-0.5">
                  {inst?.name_id ?? "—"} · {a.id} · rubrik v{a.rubric_version} ·{" "}
                  {scored.size}/{dataset.rubric.dimensions.length} dimensi ({covPct}%) ·{" "}
                  {a.ai_suggested ? "usulan AI" : "manual"} · {a.created_at}
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  isPublished
                    ? "bg-green-500/15 text-green-400"
                    : covPct < 50
                      ? "bg-orange-500/15 text-[var(--acc-orange-strong)]"
                      : "bg-slate-500/15 text-[var(--muted)]"
                }`}
              >
                {isPublished ? "✓ published" : covPct < 50 ? "cakupan rendah" : "draf"}
              </span>
              <Link
                href={`/kurasi/${a.id}`}
                className="text-xs underline text-[var(--muted)] hover:text-[var(--text)]"
              >
                tinjau →
              </Link>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="text-sm text-[var(--muted)] py-8 text-center">
            Tidak ada penilaian pada tab ini.
          </p>
        )}
      </div>
    </div>
  );
}
