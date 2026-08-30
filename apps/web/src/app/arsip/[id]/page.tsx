import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dataset } from "@pancasila-index/data";
import { IconArchive, IconGlobe, IconShieldCheck } from "@/components/icons";

const TYPE_LABEL: Record<string, string> = {
  "undang-undang": "Undang-Undang",
  perppu: "Peraturan Pemerintah Pengganti UU",
  keppres: "Keputusan Presiden",
  inpres: "Instruksi Presiden",
  "dokumen-mpr": "Ketetapan / Risalah MPR",
  "putusan-mk": "Putusan Mahkamah Konstitusi",
  "putusan-ma": "Putusan Mahkamah Agung",
  "putusan-mpd": "Putusan Mahkamah Pengadilan",
  "arsip-nasional": "Arsip Nasional",
  jurnal: "Jurnal Ilmiah",
  buku: "Buku",
  berita: "Berita / Liputan",
  "laporan-lembaga": "Laporan Lembaga",
  lainnya: "Dokumen Lainnya",
};

const REPO_TYPE = new Set(["arsip-nasional", "dokumen-mpr", "buku", "jurnal", "lainnya"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const source = dataset.sources.find((s) => s.id === id);
  if (!source) {
    return { title: "Dokumen Tidak Ditemukan | Pancasila Index" };
  }
  const title = `${source.title_id}`;
  const description = source.citation_id
    ? `Dokumen primer tersitasi Pancasila Index. ${source.citation_id}.`
    : "Dokumen primer tersitasi Pancasila Index — sumber bukti pengkajian kesetiaan konstitusional.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Pancasila Index",
      locale: "id_ID",
    },
  };
}

export default async function ArsipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const source = dataset.sources.find((s) => s.id === id);
  if (!source) notFound();

  const eventHits = dataset.events.filter((e) => e.source_ids.includes(source.id));
  const termsUsing = new Map<string, { name: string; label: string; slug: string }>();
  for (const a of dataset.assessments) {
    for (const ds of a.dimension_scores) {
      for (const ev of ds.evidence) {
        if (ev.source_id === source.id) {
          const term = dataset.terms.find((t) => t.id === a.term_id);
          if (term) {
            const inst = dataset.institutions.find((i) => i.id === term.institution_id);
            termsUsing.set(a.term_id, {
              name: inst?.name_id ?? a.term_id,
              label: term.label_id ?? a.term_id,
              slug: inst?.slug ?? "",
            });
          }
        }
      }
    }
  }

  const downloadHref = source.archive_url ?? source.resolved_url ?? source.url;
  const officialHref = source.url ?? source.resolved_url;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-[var(--muted)] overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[var(--text)] transition">Beranda</Link>
        <span>&rsaquo;</span>
        <Link href="/arsip" className="hover:text-[var(--text)] transition">Khazanah Arsip</Link>
        <span>&rsaquo;</span>
        <span className="text-[var(--text)]">{source.id}</span>
      </nav>

      <div className="space-y-5">
        {/* Type + year */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-sky-500/15 text-[var(--acc-sky)] border border-sky-500/25">
            {TYPE_LABEL[source.type] ?? source.type.replace("-", " ")}
          </span>
          {source.year && (
            <span className="text-sm font-mono font-bold text-[var(--text)]">{source.year}</span>
          )}
          <span className="text-[11px] text-[var(--muted)] font-mono">{source.id}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] leading-tight">
          {source.title_id}
        </h1>

        {/* Citation */}
        {source.citation_id && (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Sitasi / Register
            </div>
            <div className="text-sm text-[var(--text)] font-mono">{source.citation_id}</div>
          </div>
        )}

        {/* Relasi penggunaan */}
        {(eventHits.length > 0 || termsUsing.size > 0) && (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Dokumen ini menyokong
            </div>
            {termsUsing.size > 0 && (
              <div className="flex flex-wrap gap-2">
                {[...termsUsing.entries()].map(([termId, t]) => (
                  <Link
                    key={termId}
                    href={t.slug ? `/lembaga/${t.slug}/${termId}` : `/lembaga/${t.slug}`}
                    className="text-xs font-semibold bg-[var(--bg)] border border-[var(--line)] px-2 py-1 rounded-lg hover:border-slate-400 transition"
                  >
                    {t.name} — {t.label}
                  </Link>
                ))}
              </div>
            )}
            {eventHits.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {eventHits.slice(0, 6).map((e) => (
                  <span
                    key={e.id}
                    className="text-[11px] text-[var(--muted)] bg-[var(--bg)] border border-[var(--line)]/60 px-2 py-1 rounded-lg"
                  >
                    {String(e.title_id).slice(0, 48)}
                  </span>
                ))}
                {eventHits.length > 6 && (
                  <span className="text-[11px] text-[var(--muted)] py-1">+{eventHits.length - 6} peristiwa</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {downloadHref && (
            <a
              href={downloadHref}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--acc-red)] px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 transition shadow"
            >
              <IconArchive size={15} />
              Unduh Arsip PDF (Dokumen Asli)
            </a>
          )}
          {officialHref && (
            <a
              href={officialHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-5 py-2.5 text-xs font-semibold text-[var(--text)] hover:border-slate-400 transition"
            >
              <IconGlobe size={15} className="text-[var(--acc-sky)]" />
              Buka Dokumen Resmi
            </a>
          )}
        </div>

        {/* Integrity note */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs text-[var(--muted)] leading-relaxed flex items-start gap-2.5">
          <IconShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <span>
            Dokumen primer ini bersitasi sebagai bukti penilaian kesetiaan konstitusional.
            Arsip PDF disimpan mandiri di repositori <strong className="text-[var(--text)]">Cloudflare R2</strong>{" "}
            (gratis & permanen) dan dipetakan ke portal resmi lembaga untuk verifikasi silang.
          </span>
        </div>
      </div>
    </div>
  );
}
