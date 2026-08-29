"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { dataset } from "@pancasila-index/data";

const AKAR_SEJARAH_DATA = [
  {
    "year": "1905 / 1911",
    "title": "Syarikat Dagang Islam (SDI): Solidaritas Ekonomi Pribumi",
    "summary": "Haji Samanhudi & RM. Tirto Adhi Soerjo merintis kemandirian ekonomi pribumi dan perlawanan monopoli kolonial.",
    "link": "/akar-sejarah#sdi-1905",
    "category": "Arus Islam & Kerakyatan"
  },
  {
    "year": "1908",
    "title": "Boedi Oetomo: Fajar Kesadaran Organisasi Modern",
    "summary": "Dr. Soetomo & dr. Wahidin mempelopori persatuan kemajuan kebudayaan dan intelektual modern bangsa.",
    "link": "/akar-sejarah#boedi-oetomo-1908",
    "category": "Pendidikan & Kebudayaan"
  },
  {
    "year": "1912",
    "title": "Syarikat Islam & Muhammadiyah: Demokrasi & Pelayanan Publik",
    "summary": "Tjokroaminoto merumuskan Zelfbestuur (demokrasi kerakyatan), K.H. Ahmad Dahlan mempelopori pembaruan sekolah & PKO.",
    "link": "/akar-sejarah#si-muhammadiyah-1912",
    "category": "Arus Islam & Kerakyatan"
  },
  {
    "year": "1922",
    "title": "Perguruan Tamansiswa: Pendidikan Kemerdekaan Jiwa",
    "summary": "Ki Hadjar Dewantara merumuskan filosofi Tut Wuri Handayani dan membentuk manusia merdeka lahir-batin.",
    "link": "/akar-sejarah#tamansiswa-1922",
    "category": "Pendidikan & Kebudayaan"
  },
  {
    "year": "1925",
    "title": "Perhimpunan Indonesia: Demokrasi Asli Desa & Republik",
    "summary": "Mohammad Hatta & Tan Malaka menggali demokrasi musyawarah gotong royong asli nusantara.",
    "link": "/akar-sejarah#perhimpunan-indonesia-1925",
    "category": "Sosio-Demokrasi Desa"
  },
  {
    "year": "1926",
    "title": "Nahdlatul Ulama: Hubbul Wathan Minal Iman",
    "summary": "K.H. Hasyim Asy'ari & ulama pesantren menegaskan cinta tanah air adalah bagian dari iman dan ukhuwah wathaniyah.",
    "link": "/akar-sejarah#nu-1926",
    "category": "Arus Islam & Kerakyatan"
  },
  {
    "year": "1928",
    "title": "Sumpah Pemuda: Peleburan Sukuisme Nusantara",
    "summary": "Kongres Pemuda II menyatukan Jong Java, Sumatra, Ambon, Batak, Celebes, JIB, Betawi jadi Satu Bangsa.",
    "link": "/akar-sejarah#sumpah-pemuda-1928",
    "category": "Pemuda & Kebhinekaan"
  },
  {
    "year": "1928",
    "title": "Kongres Perempuan Indonesia I: Emansipasi & Keadilan Gender",
    "summary": "30 organisasi perempuan nusantara di Yogyakarta menuntut kesetaraan hak pendidikan dan perlindungan perempuan.",
    "link": "/akar-sejarah#kongres-perempuan-1928",
    "category": "Gerakan Perempuan"
  },
  {
    "year": "1945",
    "title": "Sidang BPUPK: Draf Rancang UUD Al-Qur'an & Sunnah",
    "summary": "Ki Bagus Hadikusumo, Wahid Hasyim, Kahar Muzakkir mengajukan dalil QS. Asy-Syura 38 & draf Pasal 6(1) UUD.",
    "link": "/akar-sejarah#bpupk-draft-islam-1945",
    "category": "Draf Konstitusi BPUPK"
  },
  {
    "year": "1945",
    "title": "Piagam Jakarta (22 Juni 1945): Konsensus Panitia Sembilan",
    "summary": "Kompromi luhur merumuskan Mukaddimah UUD 1945 dan falsafah 5 Sila negara.",
    "link": "/akar-sejarah#piagam-jakarta-1945",
    "category": "Draf Konstitusi BPUPK"
  },
  {
    "year": "1945",
    "title": "Pengesahan UUD 1945 (18 Agustus): Ketuhanan Yang Maha Esa",
    "summary": "Kenegarawanan tokoh Islam PPKI menetapkan Sila 1 Tauhid demi keutuhan wilayah Indonesia Timur.",
    "link": "/akar-sejarah#ppki-konsensus-18-agustus-1945",
    "category": "Draf Konstitusi BPUPK"
  },
  {
    "year": "1957–1959",
    "title": "Konstituante & Dekrit 5 Juli 1959: Piagam Madinah & Menjiwai UUD",
    "summary": "Natsir memaparkan Piagam Madinah 622 M; Dekrit 1959 menyatakan Piagam Jakarta menjiwai UUD 1945.",
    "link": "/akar-sejarah#konstituante-dekrit-1959",
    "category": "Arus Islam & Kerakyatan"
  }
];

export default function CariPage() {
  const [query, setQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState<string>("all");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const termsById = useMemo(() => new Map(dataset.terms.map((t) => [t.id, t])), []);
  const institutionsById = useMemo(() => new Map(dataset.institutions.map((i) => [i.id, i])), []);

  // Hasil pencarian terpadu
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1. Events
    const matchingEvents = dataset.events.filter((ev) => {
      const term = termsById.get(ev.term_id);
      if (selectedEra !== "all" && term?.era !== selectedEra) return false;
      if (selectedInstitution !== "all" && term?.institution_id !== selectedInstitution) return false;

      if (!q) return true;
      return (
        ev.title_id.toLowerCase().includes(q) ||
        ev.summary_id.toLowerCase().includes(q) ||
        ev.date.includes(q) ||
        ev.category.toLowerCase().includes(q)
      );
    });

    // 2. Sources
    const matchingSources = dataset.sources.filter((src) => {
      if (!q) return true;
      return (
        src.title_id.toLowerCase().includes(q) ||
        (src.citation_id && src.citation_id.toLowerCase().includes(q)) ||
        src.type.toLowerCase().includes(q) ||
        (src.year && src.year.toString().includes(q))
      );
    });

    // 3. Terms / Masa Jabatan
    const matchingTerms = dataset.terms.filter((term) => {
      if (selectedEra !== "all" && term.era !== selectedEra) return false;
      if (selectedInstitution !== "all" && term.institution_id !== selectedInstitution) return false;

      if (!q) return true;
      const actorsMatch = term.actors.some(
        (a) => a.name.toLowerCase().includes(q) || a.role_id.toLowerCase().includes(q)
      );
      return (
        term.label_id.toLowerCase().includes(q) ||
        term.era.toLowerCase().includes(q) ||
        actorsMatch
      );
    });

    
    // 4. Tokoh Bangsa / Aktor
    const matchingActors = (dataset.actors || []).filter((actor) => {
      if (!q) return true;
      const aliasesMatch = (actor.aliases || []).some(a => a.toLowerCase().includes(q));
      const rolesMatch = (actor.roles || []).some(r => r.title_id?.toLowerCase().includes(q));
      return (
        actor.name.toLowerCase().includes(q) ||
        (actor.bio_id && actor.bio_id.toLowerCase().includes(q)) ||
        aliasesMatch ||
        rolesMatch
      );
    });

    // 5. Akar Sejarah
    const matchingHistory = AKAR_SEJARAH_DATA.filter((h) => {
      if (!q) return true;
      return (
        h.title.toLowerCase().includes(q) ||
        h.summary.toLowerCase().includes(q) ||
        h.year.includes(q) ||
        h.category.toLowerCase().includes(q)
      );
    });

    // 6. Dimensi Rubrik
    const matchingDimensions = dataset.rubric.dimensions.filter((dim) => {
      if (!q) return true;
      return (
        dim.name_id.toLowerCase().includes(q) ||
        dim.question_id.toLowerCase().includes(q) ||
        dim.id.toLowerCase().includes(q)
      );
    });

    // 7. Pasal UUD
    const matchingPasal: Array<{ nomor: string; babNomor: string; ringkas_id: string }> = [];
    for (const bab of dataset.uud.babs) {
      for (const p of bab.pasal) {
        if (!q || p.ringkas_id.toLowerCase().includes(q) || p.nomor.toLowerCase().includes(q) || bab.nama_id.toLowerCase().includes(q)) {
          matchingPasal.push({ nomor: p.nomor, babNomor: bab.nomor, ringkas_id: p.ringkas_id });
        }
      }
    }

    return {
      events: matchingEvents,
      sources: matchingSources,
      terms: matchingTerms,
      actors: matchingActors,
      history: matchingHistory,
      dimensions: matchingDimensions,
      pasal: matchingPasal,
    };
  }, [query, selectedEra, selectedInstitution, termsById]);

  const totalMatches =
    (categoryFilter === "all" || categoryFilter === "event" ? results.events.length : 0) +
    (categoryFilter === "all" || categoryFilter === "source" ? results.sources.length : 0) +
    (categoryFilter === "all" || categoryFilter === "term" ? results.terms.length : 0) +
    (categoryFilter === "all" || categoryFilter === "pasal" ? results.pasal.length : 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold">Pencarian Konstitusional</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          Telusuri ratusan peristiwa berbukti, instrumen hukum primer, masa jabatan, dan pasal UUD 1945.
        </p>
      </div>

      {/* Input Pencarian */}
      <div className="mt-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik kata kunci, nomor UU, tokoh, atau topik (misal: HAM, korupsi, otonomi, Bagir Manan, Pemilu)..."
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3.5 pl-11 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition"
          />
          <span className="absolute left-4 top-3.5 text-[var(--muted)]">🔍</span>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-3.5 text-xs text-[var(--muted)] hover:text-[var(--text)]"
            >
              ✕ Bersihkan
            </button>
          )}
        </div>
      </div>

      {/* Filter Kontrol */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
        {/* Filter Kategori */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: "all", label: `Semua (${totalMatches})` },
            { id: "event", label: `Peristiwa (${results.events.length})` },
            { id: "source", label: `Sumber Primer (${results.sources.length})` },
            { id: "term", label: `Masa Jabatan (${results.terms.length})` },
            { id: "pasal", label: `Pasal UUD (${results.pasal.length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-lg px-3 py-1.5 transition ${
                categoryFilter === cat.id
                  ? "bg-red-600 text-white font-semibold"
                  : "bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter Era */}
        <select
          value={selectedEra}
          onChange={(e) => setSelectedEra(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--muted)] focus:text-[var(--text)] focus:outline-none"
        >
          <option value="all">Semua Era</option>
          <option value="revolusi">Era Revolusi</option>
          <option value="demokrasi-liberal">Demokrasi Liberal</option>
          <option value="demokrasi-terpimpin">Demokrasi Terpimpin</option>
          <option value="orde-baru">Orde Baru</option>
          <option value="reformasi">Era Reformasi</option>
        </select>

        {/* Filter Lembaga */}
        <select
          value={selectedInstitution}
          onChange={(e) => setSelectedInstitution(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--muted)] focus:text-[var(--text)] focus:outline-none"
        >
          <option value="all">Semua Lembaga</option>
          {dataset.institutions.map((i) => (
            <option key={i.id} value={i.id}>
              {i.short_id}
            </option>
          ))}
        </select>
      </div>

      {/* Hasil Pencarian */}
      <div className="mt-8 space-y-10">
        {/* 1. Peristiwa */}
        {(categoryFilter === "all" || categoryFilter === "event") && results.events.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[var(--acc-red)] uppercase tracking-wide">
              Peristiwa Berbukti ({results.events.length})
            </h2>
            <div className="mt-3 space-y-3">
              {results.events.slice(0, 30).map((ev) => {
                const term = termsById.get(ev.term_id);
                const inst = term ? institutionsById.get(term.institution_id) : undefined;
                return (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 space-y-2 hover:border-slate-500 transition"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs font-mono text-[var(--muted)]">{ev.date}</span>
                      <span className="text-[11px] uppercase tracking-wide font-semibold text-[var(--acc-red)]">
                        {inst?.short_id ?? ""}: {term?.label_id ?? ev.term_id}
                      </span>
                    </div>
                    <div className="font-semibold text-[var(--text)]">{ev.title_id}</div>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{ev.summary_id}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ev.source_ids.map((sid) => {
                        const src = dataset.sources.find((s) => s.id === sid);
                        const href = src?.resolved_url ?? src?.url;
                        return href ? (
                          <a
                            key={sid}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--acc-sky)] hover:text-[var(--acc-sky-strong)]"
                          >
                            📄 {src?.title_id ?? sid} ↗
                          </a>
                        ) : (
                          <span
                            key={sid}
                            className="rounded bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--muted)]"
                          >
                            📄 {src?.title_id ?? sid}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {results.events.length > 30 && (
                <p className="text-center text-xs text-[var(--muted)]">
                  Menampilkan 30 dari {results.events.length} peristiwa. Persempit kata kunci untuk hasil lebih spesifik.
                </p>
              )}
            </div>
          </section>
        )}

        {/* 2. Sumber Primer */}
        {(categoryFilter === "all" || categoryFilter === "source") && results.sources.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[var(--acc-sky)] uppercase tracking-wide">
              Sumber Primer & Dokumen Hukum ({results.sources.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {results.sources.slice(0, 30).map((src) => {
                const href = src.resolved_url ?? src.url;
                return (
                  <div
                    key={src.id}
                    className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)]">
                          {src.type} {src.year ? `· ${src.year}` : ""}
                        </span>
                        {src.citation_id && (
                          <span className="text-[10px] text-[var(--muted)] truncate max-w-[140px]">
                            {src.citation_id}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-sm text-[var(--text)] mt-1">{src.title_id}</div>
                    </div>
                    {href && (
                      <div className="pt-2">
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--acc-sky)] hover:text-[var(--acc-sky-strong)] underline decoration-dotted"
                        >
                          Buka rujukan dokumen ↗
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. Masa Jabatan */}
        {(categoryFilter === "all" || categoryFilter === "term") && results.terms.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[var(--acc-amber)] uppercase tracking-wide">
              Masa Jabatan & Tokoh ({results.terms.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {results.terms.map((term) => {
                const inst = institutionsById.get(term.institution_id);
                return (
                  <Link
                    key={term.id}
                    href={`/lembaga/${inst?.slug ?? ""}/${term.id}`}
                    className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-slate-500 transition block"
                  >
                    <div className="text-xs text-[var(--acc-red)] font-semibold uppercase">{inst?.name_id}</div>
                    <div className="font-semibold text-base text-[var(--text)] mt-1">{term.label_id}</div>
                    <div className="text-xs text-[var(--muted)] mt-1">
                      {term.start_date} s.d. {term.end_date ?? "sekarang"} · era {term.era}
                    </div>
                    {term.actors.length > 0 && (
                      <div className="text-xs text-[var(--muted)] mt-2">
                        Tokoh: {term.actors.map((a) => `${a.name} (${a.role_id})`).join(" · ")}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        
        {/* Tokoh Bangsa */}
        {(categoryFilter === "all" || categoryFilter === "actor") && results.actors.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-amber-500 uppercase tracking-wide">
              Tokoh Bangsa & Aktor ({results.actors.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {results.actors.slice(0, 30).map((actor) => (
                <Link
                  key={actor.id}
                  href={`/aktor/${actor.id}`}
                  className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-slate-500 transition block space-y-1"
                >
                  <div className="font-bold text-sm text-[var(--text)]">{actor.name}</div>
                  {actor.roles && actor.roles.length > 0 && (
                    <div className="text-xs text-[var(--acc-amber)]">
                      {actor.roles.map(r => r.title_id).filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {actor.bio_id && (
                    <p className="text-xs text-[var(--muted)] line-clamp-2 mt-1 leading-relaxed">
                      {actor.bio_id}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Akar Sejarah */}
        {(categoryFilter === "all" || categoryFilter === "history") && results.history.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-emerald-500 uppercase tracking-wide">
              Akar Sejarah & Genealogi Konstitusi ({results.history.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {results.history.map((h) => (
                <Link
                  key={h.year}
                  href={h.link}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 hover:border-emerald-400 transition block space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-400">{h.year} · {h.category}</span>
                    <span className="text-[10px] text-emerald-400 underline">Lihat Linimasa &rarr;</span>
                  </div>
                  <div className="font-bold text-sm text-[var(--text)]">{h.title}</div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{h.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Dimensi Rubrik */}
        {(categoryFilter === "all" || categoryFilter === "dimension") && results.dimensions.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-purple-400 uppercase tracking-wide">
              Dimensi Rubrik UUD 1945 ({results.dimensions.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {results.dimensions.map((dim) => (
                <div
                  key={dim.id}
                  className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 space-y-1"
                >
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                    {dim.id}
                  </div>
                  <div className="font-bold text-sm text-[var(--text)]">{dim.name_id}</div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mt-1">{dim.question_id}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Pasal UUD */}
        {(categoryFilter === "all" || categoryFilter === "pasal") && results.pasal.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[var(--acc-emerald)] uppercase tracking-wide">
              Pasal UUD 1945 ({results.pasal.length})
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {results.pasal.slice(0, 20).map((p) => (
                <div
                  key={`${p.babNomor}-${p.nomor}`}
                  className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 space-y-1"
                >
                  <div className="text-xs font-bold text-[var(--acc-emerald)]">
                    Bab {p.babNomor} · Pasal {p.nomor}
                  </div>
                  <p className="text-xs text-[var(--text)] leading-relaxed">{p.ringkas_id}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {totalMatches === 0 && (
          <div className="text-center py-16 rounded-xl border border-dashed border-[var(--line)]">
            <p className="text-base font-medium text-[var(--muted)]">
              Tidak ditemukan hasil yang cocok dengan &quot;{query}&quot;
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              Coba gunakan kata kunci lain atau ubah filter era/lembaga.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
