import Link from "next/link";

import { dataset } from "@pancasila-index/data";

import {
  indexLabel,
  periodLabel,
  scoreColor,
  termSummary,
} from "@/lib/view";

export default function Beranda() {
  const presidents = dataset.terms
    .filter((t) => t.institution_id === "presiden-ri")
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  const pasalCount = dataset.uud.babs.reduce(
    (acc, bab) => acc + bab.pasal.length,
    0
  );

  const stats = [
    { value: dataset.institutions.length, label: "lembaga negara" },
    { value: dataset.terms.length, label: "masa jabatan" },
    { value: dataset.events.length, label: "peristiwa berbukti" },
    { value: dataset.sources.length, label: "sumber primer" },
    { value: pasalCount, label: "pasal UUD terpetakan" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-14">
        <p className="text-xs uppercase tracking-widest text-red-500 font-semibold">
          Indeks Kepancasilaan Terbuka
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">
          Seberapa Pancasila para pemangku kekuasaan kita?
        </h1>
        <p className="mt-5 max-w-2xl text-[var(--muted)] leading-relaxed">
          Pancasila Index menilai kesetiaan eksekutif, legislatif, dan yudikatif
          Republik Indonesia — dari kemerdekaan hingga kini — terhadap Lima Sila,
          empat tujuan bernegara Pembukaan UUD 1945 alinea IV, dan norma
          struktural UUD 1945. Setiap skor wajib bersitasi bukti primer.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
          <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
          Fase seed: seluruh indeks di bawah adalah DRAF belum dikurasi
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4"
          >
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-[var(--muted)] mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Indeks draf per era kepresidenan</h2>
          <Link href="/lembaga/presiden" className="text-sm text-[var(--muted)] hover:text-white">
            lihat semua lembaga →
          </Link>
        </div>

        <div className="mt-5 space-y-2">
          {presidents.map((term) => {
            const summary = termSummary(term.id);
            const index = summary?.index ?? null;
            const pct = index === null ? 0 : Math.min(100, Math.max(0, index));
            return (
              <Link
                key={term.id}
                href={`/lembaga/presiden/${term.id}`}
                className="group flex items-center gap-4 rounded-lg border border-transparent hover:border-[var(--line)] hover:bg-[var(--panel)] px-3 py-2.5 transition"
              >
                <span className="w-44 shrink-0 text-sm truncate">{term.label_id.replace("Presiden ", "")}</span>
                <span className="w-20 shrink-0 text-xs text-[var(--muted)]">
                  {periodLabel(term.start_date, term.end_date)}
                </span>
                <span className="flex-1 h-2 rounded-full bg-[var(--line)] overflow-hidden">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: scoreColor((pct / 100) * 4 - 2),
                    }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums" title="indeks 0-100; 50 = netral">
                  {indexLabel(index)}
                </span>
              </Link>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Skala indeks 0–100; pusat 50 = netral. Klik era untuk melihat bukti per dimensi.
        </p>
      </section>
    </div>
  );
}
