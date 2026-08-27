import Link from "next/link";
import { dataset } from "@pancasila-index/data";

interface ActorEntry {
  name: string;
  actor_id?: string;
  role_id: string;
  term_id: string;
  term_label: string;
  institution_id: string;
  institution_slug: string;
  institution_name: string;
  era: string;
  start_date: string;
  end_date: string | null;
}

export default function AktorPage() {
  const institutionsById = new Map(dataset.institutions.map((i) => [i.id, i]));

  /** Jumlah perkara bersitasi per orang - dipakai sebagai penanda kartu. */
  const caseCount = new Map<string, number>();
  for (const c of dataset.actor_cases) {
    caseCount.set(c.actor_id, (caseCount.get(c.actor_id) ?? 0) + 1);
  }

  // Agregasi seluruh aktor ketatanegaraan
  const actorEntries: ActorEntry[] = dataset.terms.flatMap((term) => {
    const inst = institutionsById.get(term.institution_id);
    return term.actors.map((a) => ({
      name: a.name,
      actor_id: a.actor_id,
      role_id: a.role_id,
      term_id: term.id,
      term_label: term.label_id,
      institution_id: term.institution_id,
      institution_slug: inst?.slug ?? "",
      institution_name: inst?.name_id ?? term.institution_id,
      era: term.era,
      start_date: term.start_date,
      end_date: term.end_date,
    }));
  });

  // Kelompokkan per lembaga
  const actorsByInstitution = new Map<string, ActorEntry[]>();
  for (const entry of actorEntries) {
    const list = actorsByInstitution.get(entry.institution_id) ?? [];
    list.push(entry);
    actorsByInstitution.set(entry.institution_id, list);
  }

  // Pejabat di luar pimpinan 8 organ: tidak punya kursi masa jabatan, sehingga
  // dulu tidak muncul di direktori ini sama sekali.
  const seatedIds = new Set(
    actorEntries.map((e) => e.actor_id).filter((id): id is string => Boolean(id))
  );
  const nonSeated = dataset.actors
    .filter((a) => !seatedIds.has(a.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">Direktori Tokoh & Pemangku Kekuasaan</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          Daftar pemimpin 8 organ konstitusional Republik Indonesia lintas generasi, dari 1945 hingga kini.
        </p>
        <p className="mt-3 max-w-3xl rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-200/90">
          <strong className="text-amber-300">Batas cakupan.</strong> Unit penilaian indeks adalah{" "}
          <em>masa jabatan lembaga</em>, sehingga direktori ini lengkap hanya untuk pimpinan
          8 organ konstitusional. Pejabat di luar itu - menteri, kepala daerah, hakim
          non-ketua, direksi BUMN - baru muncul di sini bila sudah ada dokumen
          pendukungnya di korpus. Nama tanpa dokumen sengaja tidak dimasukkan.
        </p>
      </div>

      <div className="mt-10 space-y-12">
        {dataset.institutions.map((inst) => {
          const actors = actorsByInstitution.get(inst.id) ?? [];
          if (actors.length === 0) return null;

          return (
            <section key={inst.id} className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-2">
                <div>
                  <span className="text-xs uppercase tracking-wide text-red-500 font-semibold">
                    {inst.branch}
                  </span>
                  <h2 className="text-xl font-bold text-white/95">{inst.name_id}</h2>
                </div>
                <Link
                  href={`/lembaga/${inst.slug}`}
                  className="text-xs text-sky-400 hover:text-sky-300"
                >
                  Profil lembaga →
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {actors.map((actor, idx) => {
                  const cases = actor.actor_id ? (caseCount.get(actor.actor_id) ?? 0) : 0;
                  return (
                    <Link
                      key={`${actor.term_id}-${actor.name}-${idx}`}
                      href={
                        actor.actor_id
                          ? `/aktor/${actor.actor_id}`
                          : `/lembaga/${actor.institution_slug}/${actor.term_id}`
                      }
                      className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-slate-500 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-semibold text-base text-white/95">{actor.name}</div>
                        <div className="text-xs text-red-400/90 mt-0.5">{actor.role_id}</div>
                        {cases > 0 && (
                          <div className="mt-2 inline-block rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                            {cases} perkara bersitasi
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-2 border-t border-[var(--line)] text-[11px] text-[var(--muted)] flex justify-between">
                        <span className="truncate max-w-[140px]">{actor.term_label}</span>
                        <span>{actor.start_date.slice(0, 4)}–{actor.end_date ? actor.end_date.slice(0, 4) : "kini"}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {nonSeated.length > 0 && (
          <section className="space-y-4">
            <div className="border-b border-[var(--line)] pb-2">
              <span className="text-xs uppercase tracking-wide text-red-500 font-semibold">
                di luar pimpinan 8 organ
              </span>
              <h2 className="text-xl font-bold text-white/95">
                Pejabat lain yang menjadi subjek peristiwa berbukti
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                Bukan unit penilaian rubrik - mereka tidak punya skor indeks. Dicatat karena
                namanya melekat pada peristiwa dan perkara yang sudah bersitasi.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {nonSeated.map((a) => {
                const cases = caseCount.get(a.id) ?? 0;
                const first = a.roles[0];
                return (
                  <Link
                    key={a.id}
                    href={`/aktor/${a.id}`}
                    className="flex flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-slate-500"
                  >
                    <div>
                      <div className="text-base font-semibold text-white/95">{a.name}</div>
                      <div className="mt-0.5 text-xs text-red-400/90">{first?.title_id}</div>
                      {cases > 0 && (
                        <div className="mt-2 inline-block rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                          {cases} perkara bersitasi
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex justify-between border-t border-[var(--line)] pt-2 text-[11px] text-[var(--muted)]">
                      <span>{a.roles.length} jabatan tercatat</span>
                      <span>
                        {first?.start_date
                          ? `${first.start_date.slice(0, 4)}–${first.end_date ? first.end_date.slice(0, 4) : "kini"}`
                          : "tanpa tanggal"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
