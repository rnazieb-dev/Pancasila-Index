"use client";

import { useState } from "react";
import Link from "next/link";
import { dataset, getEventsOfTerm } from "@pancasila-index/data";
import { useLocale } from "@/components/locale-provider";
import { InstitutionLogo } from "@/components/institution-logo";
import {
  IconSearch,
  IconCompare,
  IconTimeline,
  IconUsers,
  IconScale,
  IconFilePlus,
  IconExport,
  IconArchive,
  IconMethodology,
} from "@/components/icons";
import {
  indexLabel,
  periodLabel,
  scoreColor,
  scoreTextColor,
  summaryIndexLabel,
  termSummary,
} from "@/lib/view";

/**
 * Judul hero menandai satu kata (mis. "Penguasa") lewat karakter penggabung
 * Unicode U+0336 di tiap locale (lihat lib/i18n.ts) - dipakai HANYA sebagai
 * penanda kata mana yang harus dicoret, bukan sebagai coretannya sendiri.
 * Karakter penggabung per-huruf itu tipis dan sering terputus antar huruf
 * tergantung font; render sungguhannya memakai <del> + text-decoration CSS
 * asli agar garisnya satu garis utuh yang tersambung, dan warnanya bisa
 * diatur (merah) lepas dari warna teks di sekitarnya.
 */
function HeroTitle({ title }: { title: string }) {
  const tokens = title.split(/(\s+)/);
  return (
    <>
      {tokens.map((tok, i) =>
        tok.includes("̶") ? (
          <del
            key={i}
            className="line-through decoration-red-600 decoration-[3px]"
          >
            {tok.replace(/̶/g, "")}
          </del>
        ) : (
          <span key={i}>{tok}</span>
        ),
      )}
    </>
  );
}

export default function Beranda() {
  const { t, locale } = useLocale();
  const [activeStat, setActiveStat] = useState<number | null>(null);

  const presidents = dataset.terms
    .filter((t) => t.institution_id === "presiden-ri")
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  const pasalCount = dataset.uud.babs.reduce(
    (acc, bab) => acc + bab.pasal.length,
    0
  );

  const stats = [
    {
      value: dataset.institutions.length,
      label: t("statInstitutions"),
      explain:
        "8 organ konstitusional yang kesetiaannya dinilai: Presiden, DPR, MPR, DPD, MK, MA, BPK, dan KY.",
      href: "/lembaga",
      hrefLabel: "Jelajahi 8 lembaga",
    },
    {
      value: dataset.terms.length,
      label: t("statTerms"),
      explain:
        "50 periode jabatan individual di 8 lembaga tersebut, dari 1945 hingga masa jabatan yang sedang berjalan.",
      href: "/lembaga",
      hrefLabel: "Lihat daftar masa jabatan",
    },
    {
      value: dataset.events.length,
      label: t("statEvents"),
      explain:
        "695 peristiwa terdokumentasi yang dipakai sebagai bukti penilaian, masing-masing bersitasi sumber primer.",
      href: "/timeline",
      hrefLabel: "Jelajahi linimasa peristiwa",
    },
    {
      value: dataset.sources.length,
      label: t("statSources"),
      explain:
        "634 dokumen sumber primer — undang-undang, putusan pengadilan, risalah sidang, laporan resmi lembaga negara — yang disitir sebagai bukti.",
      href: "/ekspor",
      hrefLabel: "Unduh daftar sumber",
    },
    {
      // Sebelumnya menjumlahkan seluruh titik data historis (103) tapi
      // labelnya "Indeks Independen" - menyiratkan jumlah indeks, bukan
      // jumlah titik data. Diperbaiki ke jumlah indeks yang sebenarnya (7).
      value: dataset.external_indices?.length ?? 0,
      label: "Indeks Independen",
      explain:
        "7 indeks independen pihak ketiga (WJP Rule of Law, CPI, V-Dem, dan lainnya) dipakai memvalidasi silang penilaian internal, bukan sekadar dikutip.",
      href: "/metodologi#pilar",
      hrefLabel: "Lihat 7 indeks pembanding",
    },
    {
      value: pasalCount,
      label: t("statArticles"),
      explain:
        "73 pasal utama (dari 37 semula, akibat pemekaran pasal seperti 28A–28J) + 3 pasal Aturan Peralihan + 2 pasal Aturan Tambahan, pasca 4 kali amandemen 1999–2002.",
      href: "/landasan-uud",
      hrefLabel: "Telusuri per pasal",
    },
  ];

  // Ambil peristiwa-peristiwa kunci penting lintas masa
  const featuredEvents = dataset.events
    .filter((e) => e.source_ids.length > 0)
    .slice(-8)
    .reverse();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero Section — neo-brutalism: border tebal, bayangan keras, tanpa gradasi */}
      <section className="relative my-6 border-[3px] border-[var(--text)] bg-[var(--panel)] p-6 md:p-8 shadow-[8px_8px_0_0_var(--acc-red)]">
        <p className="inline-block bg-[var(--acc-red)] px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
          {t("heroBadge")}
        </p>
        <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
          <HeroTitle title={t("heroTitle")} />
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-[var(--muted)] md:text-lg">
          {t("heroSubtitle")}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/metodologi"
            className="border-[3px] border-[var(--text)] bg-[var(--panel)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--text)] shadow-[4px_4px_0_0_var(--text)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--text)]"
          >
            {t("heroCtaMethod")} →
          </Link>
          <Link
            href="/akar-sejarah"
            className="border-[3px] border-[var(--text)] bg-[var(--acc-red)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-[4px_4px_0_0_var(--text)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--text)]"
          >
            {t("heroCtaAkarSejarah")} →
          </Link>
        </div>
      </section>

      {/*
        Stats Counter Bar - tiap kartu adalah tombol (bukan navigasi):
        mengeklik membuka penjelasan singkat di panel bawah tanpa
        meninggalkan halaman. Panel itu sendiri berisi tautan opsional
        bagi yang ingin melihat rincian lengkapnya di halaman lain.
      */}
      <section className="mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((stat, i) => {
            const isActive = activeStat === i;
            return (
              <button
                key={stat.label}
                type="button"
                onClick={() => setActiveStat(isActive ? null : i)}
                aria-expanded={isActive}
                aria-controls="stat-explain-panel"
                className={`rounded-xl border p-4 text-center sm:text-left shadow-sm transition-colors cursor-pointer ${
                  isActive
                    ? "border-[var(--acc-red)] bg-[var(--panel)] ring-1 ring-[var(--acc-red)]"
                    : "border-[var(--line)] bg-[var(--panel)] hover:border-slate-400"
                }`}
              >
                <div className="text-2xl lg:text-3xl font-extrabold text-[var(--text)]">{stat.value}</div>
                <div className="text-[11px] text-[var(--muted)] mt-1 font-medium">{stat.label}</div>
              </button>
            );
          })}
        </div>

        {activeStat !== null && stats[activeStat] && (
          <div
            id="stat-explain-panel"
            role="region"
            className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm leading-relaxed text-[var(--text)]"
          >
            <p>{stats[activeStat].explain}</p>
            <Link
              href={stats[activeStat].href}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--acc-sky)] hover:underline"
            >
              {stats[activeStat].hrefLabel} →
            </Link>
          </div>
        )}
      </section>

      {/* 8 Organ Konstitusional Grid */}
      <section className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <h2 className="text-2xl font-bold">{t("secOrgansTitle")}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {t("secOrgansDesc")}
            </p>
          </div>
          <Link href="/lembaga" className="text-sm font-medium text-[var(--acc-sky)] hover:underline">
            {t("heroCtaExplore")} →
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
                className="group flex flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-[var(--acc-red)] hover:shadow-lg transition duration-200"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="uppercase tracking-wider text-[var(--acc-red)] font-semibold text-[10px]">
                      {inst.branch}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] font-mono">
                      {terms.length} {t("statTerms")}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <InstitutionLogo id={inst.id} size="md" />
                    <div>
                      <h3 className="text-base font-bold group-hover:text-[var(--acc-red)] transition leading-snug">
                        {inst.short_id || inst.name_id}
                      </h3>
                      <div className="text-[11px] text-[var(--muted)] line-clamp-1">{inst.name_id}</div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {inst.description_id}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
                  <span className="text-[var(--muted)] font-medium text-[11px]">
                    {eventsCount} {t("eventsLabel")}
                  </span>
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-bold tabular-nums"
                    style={{
                      background: latestIndex === null ? "#1e293b" : `${scoreColor(latestIndex / 25 - 2)}22`,
                      color: latestIndex === null ? "var(--score-zero)" : scoreTextColor(latestIndex / 25 - 2),
                    }}
                  >
                    {summaryIndexLabel(latestSummary)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Linimasa Era Kepresidenan */}
      <section className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] pb-3">
          <div>
            <h2 className="text-2xl font-bold">{t("secTimelineTitle")}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {t("secTimelineDesc")}
            </p>
          </div>
          <Link href="/timeline" className="text-sm font-medium text-[var(--acc-sky)] hover:underline">
            {t("heroCtaTimeline")} →
          </Link>
        </div>

        {/*
          Judul kolom hanya tampil sm ke atas: pada mobile tiap baris tetap
          bertumpuk vertikal (grid-cols-1), sehingga label kolom tidak
          relevan di sana.
        */}
        <div className="mt-6 hidden gap-4 px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] sm:grid sm:grid-cols-[220px_140px_1fr_140px]">
          <span>Presiden &amp; Periode</span>
          <span>Era</span>
          <span>Indeks Kepatuhan (Draf)</span>
          <span className="text-right">Peristiwa &amp; Skor</span>
        </div>

        {/*
          Grid dengan lebar kolom TETAP (bukan flex + min-w), agar semua
          baris sejajar terlepas dari panjang nama presiden. Sebelumnya nama
          hanya diberi min-width, sehingga nama yang panjang (mis. "Susilo
          Bambang Yudhoyono (Periode Pertama)") mendorong seluruh kolom di
          kanannya - termasuk titik awal progress bar - bergeser per baris.
        */}
        <div className="mt-2 space-y-3">
          {presidents.map((tItem) => {
            const summary = termSummary(tItem.id);
            const index = summary?.index ?? null;
            const evs = getEventsOfTerm(dataset, tItem.id);
            const pct = index !== null ? Math.max(0, Math.min(100, index)) : 50;

            // Nama presiden (label_id) kadang punya keterangan tambahan
            // dalam kurung di ujung - "(Revolusi & Demokrasi Liberal)",
            // "(Periode Pertama)", "(berjalan)", dst. Keterangan itu sudah
            // terwakili di tempat lain pada baris yang sama: era di kolom
            // Era, dan status "masih berjalan" di baris periode yang
            // menampilkan "kini" sebagai tanggal akhir. Jadi khusus untuk
            // tampilan di sini, kurungnya dipangkas agar Era tidak perlu
            // disembunyikan dan namanya tetap ringkas.
            const namaTanpaKurung = tItem.label_id
              .replace(/\s*\([^)]*\)\s*$/, "")
              .trim();

            return (
              <Link
                key={tItem.id}
                href={`/lembaga/presiden/${tItem.id}`}
                className="group grid grid-cols-1 gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-slate-400 hover:shadow sm:grid-cols-[220px_140px_1fr_140px] sm:items-center sm:gap-4"
              >
                <div>
                  <div className="font-bold text-sm text-[var(--text)] transition group-hover:text-[var(--acc-sky)]">
                    {namaTanpaKurung}
                  </div>
                  <div className="text-xs font-mono text-[var(--muted)]">
                    {periodLabel(tItem.start_date, tItem.end_date)}
                  </div>
                </div>

                <span className="text-[11px] font-semibold uppercase text-[var(--muted)]">
                  {tItem.era}
                </span>

                <div className="h-3 overflow-hidden rounded-full border border-[var(--line)] bg-[var(--bg)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: scoreColor((pct / 100) * 4 - 2),
                    }}
                  />
                </div>

                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="text-[11px] text-[var(--muted)]">
                    {evs.length} {t("eventsLabel")}
                  </span>
                  <span
                    className="w-14 shrink-0 rounded-md py-0.5 text-center text-xs font-bold tabular-nums"
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
            <h2 className="text-2xl font-bold">{t("secEventsTitle")}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {t("secEventsDesc")}
            </p>
          </div>
          <Link href="/cari" className="text-sm font-medium text-[var(--acc-sky)] hover:underline">
            {t("actSearch")} {dataset.events.length} {t("eventsLabel")} →
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

                <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-[11px]">
                  <span className="text-[var(--acc-sky)] font-semibold flex items-center gap-1">
                    <IconArchive size={13} />
                    <span>{ev.source_ids.length} {t("sourcesLabel")}</span>
                  </span>
                  {term && (
                    <Link
                      href={`/lembaga/${inst?.slug ?? "presiden"}/${term.id}`}
                      className="text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      {t("viewEra")}
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
        <h2 className="text-xl font-bold">{t("secFeaturesTitle")}</h2>
        <p className="text-xs text-[var(--muted)] mt-1 max-w-xl">
          {t("secFeaturesDesc")}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/cari"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconSearch size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("featSearchTitle")} (/cari)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featSearchDesc")}</p>
          </Link>

          <Link
            href="/bandingkan"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconCompare size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("featCompareTitle")} (/bandingkan)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featCompareDesc")}</p>
          </Link>

          <Link
            href="/timeline/tren"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconTimeline size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("featTrendTitle")} (/timeline/tren)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featTrendDesc")}</p>
          </Link>

          <Link
            href="/aktor"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconUsers size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("featActorsTitle")} (/aktor)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featActorsDesc")}</p>
          </Link>

          <Link
            href="/landasan-uud"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconScale size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("featUudTitle")} (/landasan-uud)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featUudDesc")}</p>
          </Link>

          <Link
            href="/usulkan-bukti"
            className="group rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 hover:border-emerald-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-emerald-500/30 text-emerald-500">
              <IconFilePlus size={20} />
            </div>
            <div className="mt-3 font-bold text-emerald-400">{t("featProposeTitle")} (/usulkan-bukti)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featProposeDesc")}</p>
          </Link>

          <Link
            href="/timeline"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconTimeline size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("navTimeline")} (/timeline)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Kronologi penilaian lintas cabang eksekutif, legislatif, yudikatif, dan eksaminatif dari 1945 s/d kini.
            </p>
          </Link>

          <Link
            href="/ekspor"
            className="group rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 hover:border-slate-400 transition"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
              <IconExport size={20} />
            </div>
            <div className="mt-3 font-bold group-hover:text-[var(--acc-sky)]">{t("featExportTitle")} (/ekspor)</div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t("featExportDesc")}</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
