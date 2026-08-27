import Link from "next/link";
import { dataset } from "@pancasila-index/data";

interface ActorEntry {
  name: string;
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

  // Agregasi seluruh aktor ketatanegaraan
  const actorEntries: ActorEntry[] = dataset.terms.flatMap((term) => {
    const inst = institutionsById.get(term.institution_id);
    return term.actors.map((a) => ({
      name: a.name,
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">Direktori Tokoh & Pemangku Kekuasaan</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          Daftar pemimpin 8 organ konstitusional Republik Indonesia lintas generasi, dari 1945 hingga kini.
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
                {actors.map((actor, idx) => (
                  <Link
                    key={`${actor.term_id}-${actor.name}-${idx}`}
                    href={`/lembaga/${actor.institution_slug}/${actor.term_id}`}
                    className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-slate-500 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-semibold text-base text-white/95">{actor.name}</div>
                      <div className="text-xs text-red-400/90 mt-0.5">{actor.role_id}</div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[var(--line)] text-[11px] text-[var(--muted)] flex justify-between">
                      <span className="truncate max-w-[140px]">{actor.term_label}</span>
                      <span>{actor.start_date.slice(0, 4)}–{actor.end_date ? actor.end_date.slice(0, 4) : "kini"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
