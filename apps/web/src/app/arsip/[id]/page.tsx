import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dataset } from "@pancasila-index/data";
import {
  IconArchive,
  IconGlobe,
  IconShieldCheck,
  IconInstitution,
  IconScale,
  IconHistory,
  IconFilePlus,
} from "@/components/icons";

const TYPE_LABEL: Record<string, string> = {
  "undang-undang": "Undang-Undang (UU)",
  perppu: "Peraturan Pemerintah Pengganti UU",
  keppres: "Keputusan Presiden (Keppres)",
  inpres: "Instruksi Presiden (Inpres)",
  "dokumen-mpr": "Ketetapan / Risalah MPR",
  "putusan-mk": "Putusan Mahkamah Konstitusi",
  "putusan-ma": "Putusan Mahkamah Agung",
  "putusan-mpd": "Putusan Mahkamah Pengadilan",
  "arsip-nasional": "Khazanah Arsip Nasional (ANRI)",
  jurnal: "Jurnal Ilmiah",
  buku: "Buku / Monograf Sejarah",
  berita: "Dokumentasi Berita / Risalah",
  "laporan-lembaga": "Laporan Resmi Lembaga Negara",
  lainnya: "Dokumen Ketatanegaraan",
};

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
  const title = `${source.title_id} | Khazanah Arsip Pancasila Index`;
  const description = source.citation_id
    ? `Dokumen hukum primer tersitasi: ${source.citation_id}. Sumber rujukan penilaian kesetiaan konstitusional.`
    : `Dokumen primer ${source.title_id} tersitasi dalam penilaian kesetiaan konstitusional Pancasila Index.`;

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

  // Authoritative Direct Official URL
  const officialHref = source.url ?? source.resolved_url;
  // Mirror Archive URL
  const downloadHref = source.archive_url ?? source.resolved_url ?? (source.r2_key ? `https://www.pancasila.site/api/arsip/${source.r2_key}` : null);

  const isUud1945 = source.id === "uud-nri-1945";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-[var(--muted)] overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[var(--text)] transition">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <Link href="/arsip" className="hover:text-[var(--text)] transition">
          Khazanah Arsip
        </Link>
        <span>&rsaquo;</span>
        <span className="text-[var(--text)] font-mono">{source.id}</span>
      </nav>

      <div className="space-y-6">
        {/* Type + year + register */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-sky-500/15 text-[var(--acc-sky-strong)] border border-sky-500/30">
            {TYPE_LABEL[source.type] ?? source.type.replace("-", " ")}
          </span>
          {source.year && (
            <span className="text-xs font-mono font-bold text-[var(--text)] bg-[var(--panel)] border border-[var(--line)] px-2.5 py-1 rounded-lg">
              Tahun {source.year}
            </span>
          )}
          <span className="text-[11px] text-[var(--muted)] font-mono bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 rounded">
            ID: {source.id}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] leading-tight">
          {source.title_id}
        </h1>

        {/* Action buttons (Direct Official Link First) */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {officialHref && (
            <a
              href={officialHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-bold text-white hover:bg-red-500 transition shadow-md"
            >
              <IconGlobe size={16} />
              <span>Buka di Sumber Asli (Portal Resmi Instansi)</span>
              <span>&rarr;</span>
            </a>
          )}

          {downloadHref && (
            <a
              href={downloadHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-xs font-semibold text-[var(--text)] hover:border-slate-400 transition"
            >
              <IconArchive size={16} className="text-[var(--acc-amber-strong)]" />
              <span>Unduh Salinan Digital (Mirror R2)</span>
            </a>
          )}
        </div>

        {/* Metadata Registry Box */}
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
              Informasi Provenansi &amp; Keabsahan Bukti
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <IconShieldCheck size={14} /> Terverifikasi
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            {source.citation_id && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[var(--muted)]">
                  Sitasi Resmi / Lembaran Negara:
                </span>
                <div className="font-mono font-bold text-[var(--text)] bg-[var(--bg)] p-2.5 rounded-xl border border-[var(--line)]">
                  {source.citation_id}
                </div>
              </div>
            )}

            {officialHref && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[var(--muted)]">
                  Tautan Langsung Sumber Primer:
                </span>
                <div className="font-mono text-[11px] text-[var(--acc-sky)] bg-[var(--bg)] p-2.5 rounded-xl border border-[var(--line)] truncate">
                  <a
                    href={officialHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center justify-between gap-1"
                  >
                    <span className="truncate">{officialHref}</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Special Reading View for UUD 1945 */}
        {isUud1945 && (
          <div className="rounded-3xl border border-sky-500/30 bg-sky-500/5 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-500/20 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
                  <IconScale size={20} className="text-[var(--acc-sky-strong)]" />
                  <span>Batang Tubuh Undang-Undang Dasar Negara Republik Indonesia 1945</span>
                </h2>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Satu Naskah Hasil Empat Tahap Perubahan (1999–2002) — Landasan Penilaian 73 Pasal
                </p>
              </div>
              <Link
                href="/landasan-uud"
                className="text-xs font-semibold text-[var(--acc-sky-strong)] hover:underline whitespace-nowrap"
              >
                Lihat Peta 73 Pasal &amp; 12 Dimensi &rarr;
              </Link>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-[var(--text)]">
              <div className="rounded-2xl bg-[var(--bg)] border border-[var(--line)] p-5 space-y-2">
                <div className="font-bold text-[var(--acc-amber-strong)] uppercase tracking-wider text-[11px]">
                  Pembukaan (Preambule) Alinea IV:
                </div>
                <p className="italic text-[var(--muted)] leading-relaxed">
                  &ldquo;...maka disusunlah Kemerdekaan Kebangsaan Indonesia itu dalam suatu Undang-Undang Dasar Negara Indonesia, yang terbentuk dalam suatu susunan Negara Republik Indonesia yang berkedaulatan rakyat dengan berdasar kepada Ketuhanan Yang Maha Esa, Kemanusiaan yang adil dan beradab, Persatuan Indonesia dan Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam Permusyawaratan/Perwakilan, serta dengan mewujudkan suatu Keadilan sosial bagi seluruh rakyat Indonesia.&rdquo;
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[var(--bg)] border border-[var(--line)] p-4 space-y-1">
                  <div className="font-bold text-[var(--text)]">Pasal 1 Ayat (2) &amp; (3)</div>
                  <p className="text-[var(--muted)]">
                    Kedaulatan berada di tangan rakyat dan dilaksanakan menurut UUD. Negara Indonesia adalah negara hukum.
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--bg)] border border-[var(--line)] p-4 space-y-1">
                  <div className="font-bold text-[var(--text)]">Pasal 24 Ayat (1)</div>
                  <p className="text-[var(--muted)]">
                    Kekuasaan kehakiman merupakan kekuasaan yang merdeka untuk menyelenggarakan peradilan guna menegakkan hukum dan keadilan.
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--bg)] border border-[var(--line)] p-4 space-y-1">
                  <div className="font-bold text-[var(--text)]">Pasal 28A–28J</div>
                  <p className="text-[var(--muted)]">
                    Jaminan perlindungan komprehensif Hak Asasi Manusia dan kewajiban perlindungan negara.
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--bg)] border border-[var(--line)] p-4 space-y-1">
                  <div className="font-bold text-[var(--text)]">Pasal 33 Ayat (1)–(4)</div>
                  <p className="text-[var(--muted)]">
                    Perekonomian disusun sebagai usaha bersama berdasar atas asas kekeluargaan; bumi, air, dan kekayaan alam dikuasai oleh negara untuk sebesar-besar kemakmuran rakyat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Relasi Penggunaan dalam Indeks */}
        {(eventHits.length > 0 || termsUsing.size > 0) && (
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
              Peran Dokumen dalam Penilaian Konstitusional
            </h2>

            {termsUsing.size > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] text-[var(--muted)] font-medium">
                  Organ &amp; Masa Jabatan yang Dinilai Berdasarkan Bukti Ini:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[...termsUsing.entries()].map(([termId, t]) => (
                    <Link
                      key={termId}
                      href={t.slug ? `/lembaga/${t.slug}/${termId}` : `/lembaga/${t.slug}`}
                      className="text-xs font-semibold bg-[var(--bg)] border border-[var(--line)] px-3 py-1.5 rounded-xl hover:border-slate-400 transition flex items-center gap-1.5"
                    >
                      <IconInstitution size={13} className="text-[var(--acc-sky)]" />
                      <span>{t.name} — {t.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {eventHits.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                <span className="text-[11px] text-[var(--muted)] font-medium">
                  Peristiwa Sejarah &amp; Perkara Hukum Bersitasi ({eventHits.length} peristiwa):
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {eventHits.map((e) => (
                    <div
                      key={e.id}
                      className="text-xs bg-[var(--bg)] border border-[var(--line)] p-3 rounded-xl space-y-1"
                    >
                      <div className="font-bold text-[var(--text)]">
                        {e.title_id}
                      </div>
                      <div className="text-[11px] text-[var(--muted)] font-mono">
                        Tanggal: {e.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Standar Integritas */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs text-[var(--muted)] leading-relaxed flex items-start gap-3">
          <IconShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          <span>
            Dokumen primer ini bersitasi sebagai rujukan pengujian kesetiaan konstitusional. Tautan langsung diarahkan ke basis data resmi negara (<strong className="text-[var(--text)]">JDIH Setneg, MKRI, Mahkamah Agung, BPK, dan ANRI</strong>) untuk memudahkan verifikasi independen oleh publik.
          </span>
        </div>
      </div>
    </div>
  );
}
