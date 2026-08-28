import Link from "next/link";
import { dataset, getEventsOfTerm } from "@pancasila-index/data";
import {
  indexLabel,
  periodLabel,
  scoreColor,
  scoreTextColor,
  summaryIndexLabel,
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
    { value: dataset.institutions.length, label: "Organ Konstitusional" },
    { value: dataset.terms.length, label: "Masa Jabatan" },
    { value: dataset.events.length, label: "Peristiwa Berbukti" },
    { value: dataset.sources.length, label: "Sumber Primer Aktif" },
    { value: dataset.external_indices?.reduce((a, b) => a + b.data.length, 0) ?? 0, label: "Titik Indeks Independen" },
    { value: pasalCount, label: "Pasal UUD Terpetakan" },
  ];

  // Ambil peristiwa-peristiwa kunci penting lintas masa
  const featuredEvents = dataset.events
    .filter((e) => e.source_ids.length > 0)
    .slice(-8)
    .reverse();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero Section */}
      <section className="py-10 border-b border-[var(--line)]">
        <p className="text-xs uppercase tracking-widest text-[var(--acc-red)] font-semibold">
          Indeks Kepancasilaan Terbuka · Open Source Constitutional Assessment
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">
          Seberapa Pancasila para pemangku kekuasaan kita?
        </h1>
        <p className="mt-5 max-w-3xl text-[var(--muted)] text-base md:text-lg leading-relaxed">
          Pancasila Index menilai kesetiaan <strong>8 organ konstitusional</strong> Republik Indonesia
          — dari kemerdekaan 1945 hingga kini — terhadap Lima Sila, Pembukaan UUD 1945 alinea IV,
          dan norma struktural UUD 1945. Setiap skor wajib bersitasi bukti primer dengan telaah sejawat.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            v1.0: 652 peristiwa multi-bukti & 525 sumber primer terverifikasi
          </div>
          <Link
            href="/metodologi"
            className="text-xs text-[var(--muted)] hover:text-[var(--text)] underline decoration-dotted underline-offset-4"
          >
            Pelajari Metodologi & Rubrik →
          </Link>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-center sm:text-left"
          >
            <div className="text-2xl lg:text-3xl font-extrabold text-[var(--text)]">{stat.value}</div>
            <div className="text-[11px] text-[var(--muted)] mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* 8 Organ Konstitusional Grid */}
      <section className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <h2 className="text-2xl font-bold">8 Organ Konstitusional UUD 1945</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Seluruh cabang kekuasaan dinilai menggunakan rubrik 12 dimensi yang setara dan objektif
            </p>
          </div>
          <Link href="/lembaga" className="text-sm font-medium text-[var(--acc-sky)] hover:underline">
            Lihat semua lembaga →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dataset.institutions.map((inst) => {
            const terms = dataset.terms.filter((t) => t.institution_id === inst.id);
            const eventsCount = dataset.events.filter((e) =>
              terms.some((t) => t.id === e.term_id)
            ).length;
            const latestTerm = terms[terms.length - 1];
            const latestSummary = latestTerm ? termSummary(latestTerm.id) : null;
            const latestIndex = latestSummary?.index ?? null;

            return (
              <Link
                key={inst.id}
                href={`/lembaga/${inst.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 hover:border-[var(--acc-red)] hover:shadow-lg transition duration-200"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="uppercase tracking-wider text-[var(--acc-red)] font-semibold">
                      {inst.branch}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] font-mono">
                      {terms.length} Periode
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-bold group-hover:text-[var(--acc-red)] transition leading-snug">
                    {inst.name_id}
                  </h3>
                  <p className="mt-2 text-xs text-[var(--muted)] line-clamp-3 leading-relaxed">
                    {inst.description_id}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
                  <span className="text-[var(--muted)] font-medium">
                    {eventsCount} peristiwa berbukti
                  </span>
                  {latestIndex !== null && (
                    <span
                      className="rounded-full px-2 py-0.5 font-bold text-[11px]"
                      style={{
                        background: `${scoreColor(latestIndex / 25 - 2)}22`,
                        color: scoreTextColor(latestIndex / 25 - 2),
                      }}
                    >
                      {summaryIndexLabel(latestSummary)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Era Kepresidenan Timeline Visual */}
      <section className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <h2 className="text-2xl font-bold">Indeks Draf per Era Kepresidenan (1945–kini)</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Skala komposit 0–100 (50 = netral). Klik era untuk memeriksa matriks 12 dimensi dan bukti primer.
            </p>
          </div>
          <Link href="/timeline" className="text-sm font-medium text-[var(--acc-sky)] hover:underline">
            Buka timeline penuh →
          </Link>
        </div>

        <div className="mt-6 space-y-2.5">
          {presidents.map((term) => {
            const summary = termSummary(term.id);
            const index = summary?.index ?? null;
            const pct = index === null ? 0 : Math.min(100, Math.max(0, index));
            const evs = getEventsOfTerm(dataset, term.id);

            return (
              <Link
                key={term.id}
                href={`/lembaga/presiden/${term.id}`}
                className="group flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:border-slate-400 p-3.5 transition"
              >
                <span className="w-48 shrink-0 text-sm font-bold truncate group-hover:text-[var(--acc-sky)]">
                  {term.label_id.replace("Presiden ", "")}
                </span>
                <span className="w-24 shrink-0 text-xs text-[var(--muted)] font-mono">
                  {periodLabel(term.start_date, term.end_date)}
                </span>
                <div className="w-full sm:flex-1 h-3 rounded-full bg-[var(--bg)] border border-[var(--line)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: scoreColor((pct / 100) * 4 - 2),
                    }}
                  />
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-[var(--muted)]">
                    {evs.length} peristiwa
                  </span>
                  <span
                    className="w-14 rounded-md py-0.5 text-center text-xs font-bold tabular-nums"
                    style={{
                      background: index === null ? "#1e293b" : `${scoreColor(index / 25 - 2)}22`,
                      color: index === null ? "var(--score-zero)" : scoreTextColor(index / 25 - 2),
                    }}
                  >
                    {indexLabel(index)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Sorotan Peristiwa Sejarah Konstitusional */}
      <section className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <h2 className="text-2xl font-bold">Sorotan Peristiwa Sejarah Berbukti</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Setiap peristiwa diverifikasi dari lembaran negara, putusan pengadilan, risalah sidang, atau laporan resmi BPK/KY
            </p>
          </div>
          <Link href="/cari" className="text-sm font-medium text-[var(--acc-sky)] hover:underline">
            Cari 652 peristiwa →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredEvents.map((ev) => {
            const term = dataset.terms.find((t) => t.id === ev.term_id);
            const inst = term ? dataset.institutions.find((i) => i.id === term.institution_id) : null;
            return (
              <div
                key={ev.id}
                className="flex flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                    <span className="font-mono">{ev.date}</span>
                    <span className="uppercase text-[var(--acc-red)] font-semibold">{inst?.short_id ?? ev.category}</span>
                  </div>
                  <h4 className="mt-2 font-bold text-sm leading-snug line-clamp-2">{ev.title_id}</h4>
                  <p className="mt-2 text-[var(--muted)] line-clamp-3 leading-relaxed">{ev.summary_id}</p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-[var(--line)] flex items-center justify-between">
                  <span className="text-[10px] text-[var(--muted)]">
                    {ev.source_ids.length} sumber primer
                  </span>
                  {term && inst && (
                    <Link
                      href={`/lembaga/${inst.slug}/${term.id}`}
                      className="text-[11px] font-medium text-[var(--acc-sky)] hover:underline"
                    >
                      Buka era →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Jelajahi Fitur Terpadu Grid */}
      <section className="mt-14 rounded-2xl border border-[var(--line)] bg-gradient-to-b from-[var(--panel)] to-[var(--bg)] p-6 sm:p-8">
        <h2 className="text-xl font-bold">Jelajahi Fitur & Data Pancasila Index</h2>
        <p className="text-xs text-[var(--muted)] mt-1 max-w-xl">
          Gunakan alat analisis interaktif, direktori aktor, pencarian teks terpadu, dan ekspor data publik.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/cari"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="text-lg">🔍</div>
            <div className="mt-2 font-bold group-hover:text-[var(--acc-sky)]">Pencarian Terpadu (/cari)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Cari 652 peristiwa berbukti, 525 sumber primer, dan 73 pasal konstitusi dengan filter kategori instan.
            </p>
          </Link>

          <Link
            href="/bandingkan"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="text-lg">📊</div>
            <div className="mt-2 font-bold group-hover:text-[var(--acc-sky)]">Bandingkan Era (/bandingkan)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Komparasi radar multi-dimensi antar-presiden atau antar-organ konstitusional secara berdampingan.
            </p>
          </Link>

          <Link
            href="/aktor"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="text-lg">👥</div>
            <div className="mt-2 font-bold group-hover:text-[var(--acc-sky)]">Direktori Aktor (/aktor)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Profil 123 pimpinan organ konstitusional dan tokoh kenegaraan tertaut ke peristiwa hukum dan jabatannya.
            </p>
          </Link>

          <Link
            href="/landasan-uud"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="text-lg">📜</div>
            <div className="mt-2 font-bold group-hover:text-[var(--acc-sky)]">Landasan UUD 1945 (/landasan-uud)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Peta 73 pasal konstitusi hasil amandemen dan kaitannya dengan 12 dimensi penilaian Pancasila Index.
            </p>
          </Link>

          <Link
            href="/timeline"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="text-lg">⏳</div>
            <div className="mt-2 font-bold group-hover:text-[var(--acc-sky)]">Linimasa Penilaian (/timeline)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Kronologi penilaian lintas cabang eksekutif, legislatif, yudikatif, dan eksaminatif dari 1945 s/d kini.
            </p>
          </Link>

          <Link
            href="/timeline/tren"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="text-lg">📈</div>
            <div className="mt-2 font-bold group-hover:text-[var(--acc-sky)]">Grafik Tren Historis (/timeline/tren)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Visualisasi grafik garis multi-dekade 1945–2024 memetakan dinamika 3 pilar konstitusi lintas rezim.
            </p>
          </Link>

          <Link
            href="/usulkan-bukti"
            className="group rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 hover:border-emerald-400 transition"
          >
            <div className="text-lg">⚖️</div>
            <div className="mt-2 font-bold text-emerald-400">Usulkan Bukti Baru (/usulkan-bukti)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Kanal keterbukaan bagi publik, peneliti, dan mahasiswa hukum untuk mengusulkan putusan pengadilan baru.
            </p>
          </Link>

          <Link
            href="/ekspor"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="text-lg">📥</div>
            <div className="mt-2 font-bold group-hover:text-[var(--acc-sky)]">Ekspor Data Terbuka (/ekspor)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Unduh dataset kanonik lengkap dalam format CSV dan JSON untuk kebutuhan riset akademik dan jurnalisme.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

