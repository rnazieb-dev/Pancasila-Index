import Link from "next/link";
import { notFound } from "next/navigation";

import {
  dataset,
  getActor,
  getCasesOfActor,
  getEventsOfActor,
  getTermsOfActor,
  type ActorCase,
  type LegalStatus,
} from "@pancasila-index/data";

import { indexLabel, periodLabel, scoreColor, termSummary } from "@/lib/view";

export function generateStaticParams() {
  return dataset.actors.map((a) => ({ id: a.id }));
}

/**
 * Tampilan status hukum. Warna dan kata sengaja dibedakan tajam antara
 * "belum diadili" dan "sudah berkekuatan hukum tetap": indeks tidak boleh
 * membuat tersangka terbaca seperti terpidana.
 */
const STATUS_VIEW: Record<
  LegalStatus,
  { label: string; note: string; color: string; bg: string }
> = {
  terlapor: {
    label: "Terlapor",
    note: "Baru dilaporkan. Belum ada penetapan penyidik, apalagi putusan.",
    color: "#94a3b8",
    bg: "#94a3b81f",
  },
  tersangka: {
    label: "Tersangka",
    note: "Ditetapkan penyidik, BELUM diadili. Belum boleh dibaca sebagai bersalah.",
    color: "#fbbf24",
    bg: "#fbbf241f",
  },
  terdakwa: {
    label: "Terdakwa",
    note: "Sedang diadili. Belum ada putusan.",
    color: "#fb923c",
    bg: "#fb923c1f",
  },
  terpidana: {
    label: "Terpidana",
    note: "Sudah divonis, belum berkekuatan hukum tetap (masih ada upaya hukum).",
    color: "#f87171",
    bg: "#f871711f",
  },
  inkracht: {
    label: "Inkracht",
    note: "Vonis sudah berkekuatan hukum tetap.",
    color: "#ef4444",
    bg: "#ef44441f",
  },
  bebas: {
    label: "Diputus bebas",
    note: "Diputus bebas atau lepas dari segala tuntutan hukum.",
    color: "#22c55e",
    bg: "#22c55e1f",
  },
  dihentikan: {
    label: "Penuntutan dihentikan",
    note: "Perkara dihentikan (SP3/SKP2/deponering) - tidak pernah dibuktikan di pengadilan.",
    color: "#38bdf8",
    bg: "#38bdf81f",
  },
};

function rupiah(n: number): string {
  if (n >= 1e12) return `Rp${(n / 1e12).toLocaleString("id-ID", { maximumFractionDigits: 3 })} triliun`;
  if (n >= 1e9) return `Rp${(n / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 2 })} miliar`;
  return `Rp${n.toLocaleString("id-ID")}`;
}

function CaseCard({ c }: { c: ActorCase }) {
  const view = STATUS_VIEW[c.status];
  return (
    <li className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
          style={{ background: view.bg, color: view.color }}
        >
          {view.label}
        </span>
        <span className="font-mono text-[11px] text-[var(--muted)]">{c.status_date}</span>
        {c.decision_ref && (
          <span className="font-mono text-[11px] text-[var(--muted)]">{c.decision_ref}</span>
        )}
      </div>

      <div className="mt-2 font-semibold text-white/95">{c.title_id}</div>
      <p className="mt-1 text-sm text-[var(--muted)] leading-relaxed">{c.summary_id}</p>

      <p className="mt-2 text-[11px] italic" style={{ color: view.color }}>
        {view.note}
      </p>

      {(c.sentence_id || c.loss_idr !== undefined) && (
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
          {c.sentence_id && (
            <span className="text-[var(--muted)]">
              Pidana: <strong className="text-white/90">{c.sentence_id}</strong>
            </span>
          )}
          {c.loss_idr !== undefined && (
            <span className="text-[var(--muted)]">
              Kerugian negara (audit resmi):{" "}
              <strong className="text-white/90">{rupiah(c.loss_idr)}</strong>
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {c.source_ids.map((sid) => {
          const src = dataset.sources.find((s) => s.id === sid);
          const href = src?.resolved_url ?? src?.url;
          return href ? (
            <a
              key={sid}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={src?.title_id ?? sid}
              className="max-w-xs truncate rounded border border-[var(--line)] bg-[var(--bg)] px-2 py-0.5 text-[11px] text-sky-400 hover:border-sky-700 hover:text-sky-300"
            >
              📄 {src?.title_id ?? sid} ↗
            </a>
          ) : (
            <span
              key={sid}
              className="max-w-xs truncate rounded border border-[var(--line)] bg-[var(--bg)] px-2 py-0.5 text-[11px] text-[var(--muted)]"
            >
              📄 {src?.title_id ?? sid}
            </span>
          );
        })}
      </div>
    </li>
  );
}

export default async function AktorProfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = getActor(dataset, id);
  if (!actor) notFound();

  const institutionsById = new Map(dataset.institutions.map((i) => [i.id, i]));
  const termsById = new Map(dataset.terms.map((t) => [t.id, t]));

  const cases = getCasesOfActor(dataset, actor.id);
  const events = getEventsOfActor(dataset, actor.id);
  const heldTerms = getTermsOfActor(dataset, actor.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/aktor" className="text-sm text-[var(--muted)] hover:text-white">
        ← Direktori tokoh
      </Link>

      <h1 className="mt-3 text-3xl font-bold">{actor.name}</h1>
      {actor.aliases.length > 0 && (
        <p className="mt-1 text-sm text-[var(--muted)]">
          Juga dikenal sebagai: {actor.aliases.join(" · ")}
        </p>
      )}
      {actor.bio_id && <p className="mt-3 text-sm leading-relaxed">{actor.bio_id}</p>}

      {/* Riwayat jabatan */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Riwayat jabatan</h2>
        <ul className="mt-4 space-y-2.5">
          {actor.roles.map((r, i) => {
            const inst = r.institution_id ? institutionsById.get(r.institution_id) : undefined;
            const term = r.term_id ? termsById.get(r.term_id) : undefined;
            return (
              <li
                key={`${r.title_id}-${i}`}
                className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="font-medium text-white/95">{r.title_id}</span>
                  <span className="font-mono text-xs text-[var(--muted)]">
                    {r.start_date
                      ? periodLabel(r.start_date, r.end_date ?? null)
                      : "periode tidak tercantum di sumber"}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {inst ? inst.name_id : "Di luar 8 organ konstitusional"}
                  {term && (
                    <>
                      {" · "}
                      <Link
                        href={`/lembaga/${institutionsById.get(term.institution_id)?.slug}/${term.id}`}
                        className="text-sky-400 hover:text-sky-300"
                      >
                        {term.label_id} →
                      </Link>
                    </>
                  )}
                </div>
                {r.note_id && (
                  <p className="mt-1.5 text-[11px] italic text-[var(--muted)]">{r.note_id}</p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Perkara hukum */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">Perkara hukum</h2>
        {cases.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-[var(--line)] px-4 py-4 text-sm leading-relaxed text-[var(--muted)]">
            Tidak ada perkara yang tercatat di dataset ini untuk yang bersangkutan.
            Kosong di sini berarti <em>belum ada dokumen yang masuk korpus</em> - bukan
            pernyataan bahwa yang bersangkutan bersih, dan bukan pula tuduhan. Perkara
            hanya boleh masuk bila ada putusan, dakwaan, atau dokumen penyidikan yang
            disitasi.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {cases.map((c) => (
              <CaseCard key={c.id} c={c} />
            ))}
          </ul>
        )}
      </section>

      {/* Skor masa jabatan yang ia duduki */}
      {heldTerms.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Indeks masa jabatan yang ia duduki</h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            Indeks Pancasila dinilai per <strong>masa jabatan lembaga</strong>, bukan per
            kepala. Angka di bawah adalah skor lembaga pada periode tersebut - bukan nilai
            pribadi orang ini.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {heldTerms.map((t) => {
              const summary = termSummary(t.id);
              const inst = institutionsById.get(t.institution_id);
              return (
                <Link
                  key={t.id}
                  href={`/lembaga/${inst?.slug}/${t.id}`}
                  className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-slate-500"
                >
                  <div className="pr-3">
                    <div className="text-sm font-medium text-white/95">{t.label_id}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {periodLabel(t.start_date, t.end_date)} · {inst?.short_id}
                    </div>
                  </div>
                  <span
                    className="shrink-0 font-mono text-2xl font-bold tabular-nums"
                    style={{ color: scoreColor((summary?.index ?? 50) / 25 - 2) }}
                  >
                    {indexLabel(summary?.index ?? null)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Peristiwa yang menyebut orang ini */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">Peristiwa yang menyebut namanya</h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Belum ada peristiwa yang menaut nama ini lewat <code>actor_ids</code>.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {events.map((ev) => {
              const recordedIn = termsById.get(ev.term_id);
              const recordedInst = recordedIn
                ? institutionsById.get(recordedIn.institution_id)
                : undefined;
              return (
                <li
                  key={ev.id}
                  className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-mono text-xs text-[var(--muted)]">{ev.date}</span>
                    <span className="text-[11px] uppercase tracking-wide text-red-400/80">
                      {ev.category}
                    </span>
                    {recordedIn && recordedInst && (
                      <Link
                        href={`/lembaga/${recordedInst.slug}/${recordedIn.id}`}
                        className="text-[11px] text-sky-400 hover:text-sky-300"
                      >
                        dicatat di {recordedIn.label_id} →
                      </Link>
                    )}
                  </div>
                  <div className="mt-1 font-medium">{ev.title_id}</div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{ev.summary_id}</p>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {actor.source_ids.length > 0 && (
        <section className="mt-12 border-t border-[var(--line)] pt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Sumber identitas & riwayat jabatan
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {actor.source_ids.map((sid) => {
              const src = dataset.sources.find((s) => s.id === sid);
              const href = src?.resolved_url ?? src?.url;
              return href ? (
                <a
                  key={sid}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-md truncate rounded border border-[var(--line)] bg-[var(--bg)] px-2 py-0.5 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  📄 {src?.title_id ?? sid} ↗
                </a>
              ) : (
                <span key={sid} className="text-[11px] text-[var(--muted)]">
                  📄 {src?.title_id ?? sid}
                </span>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
