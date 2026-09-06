"use client";

import type {
  AiDisclosure,
  DimensionScore,
  ExpertQuote,
  QuoteKind,
  QuoteVerification,
  Source,
} from "@pancasila-index/core";
import { formatApa } from "@pancasila-index/core";
import {
  IconQuote,
  IconScale,
  IconAlertTriangle,
  IconFileText,
  IconExternalLink,
  IconBot,
} from "./icons";

/**
 * Label jenis kutipan. Sengaja ditampilkan, bukan disembunyikan: pembaca
 * berhak tahu apakah yang dibacanya kata-kata pakar itu sendiri atau
 * ringkasan kita atas argumennya.
 */
const KIND_VIEW: Record<QuoteKind, { label: string; kutipMiring: boolean }> = {
  "kutipan-langsung": { label: "Kutipan langsung", kutipMiring: true },
  parafrasa: { label: "Parafrasa argumen", kutipMiring: false },
  "temuan-laporan": { label: "Temuan lembaga", kutipMiring: false },
};

const VERIFICATION_VIEW: Record<
  QuoteVerification,
  { label: string; className: string }
> = {
  "naskah-primer": {
    label: "dicocokkan ke naskah",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  "kutipan-sekunder": {
    label: "dari terbitan yang mengutip",
    className: "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]",
  },
  "belum-terverifikasi": {
    label: "belum diperiksa ke naskahnya",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
};

/** Rujukan APA, dengan bagian yang seharusnya miring benar-benar dimiringkan. */
function ApaReference({ source, quote }: { source: Source; quote: ExpertQuote }) {
  const apa = formatApa(source);
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
        Rujukan (APA 7)
      </div>
      <p className="text-[11px] leading-relaxed text-[var(--muted)] break-words">
        {apa.parts.map((part, i) =>
          part.italic ? (
            <em key={i} className="italic">
              {part.text}
            </em>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
        {quote.locator ? (
          <span className="text-[var(--text)]"> {quote.locator}.</span>
        ) : null}
      </p>
    </div>
  );
}

interface Props {
  dimensionScore: DimensionScore;
  sources: Source[];
  /** Dipakai untuk membaca status telaah manusia yang sebenarnya, bukan menebaknya. */
  disclosure?: AiDisclosure;
}

export function DialecticalRationale({ dimensionScore, sources, disclosure }: Props) {
  const {
    rationale_id,
    thesis_id,
    antithesis_id,
    synthesis_id,
    expert_quotes = [],
  } = dimensionScore;

  const hasStructuredDialectic =
    Boolean(thesis_id) ||
    Boolean(antithesis_id) ||
    Boolean(synthesis_id) ||
    expert_quotes.length > 0;

  /*
   * Penanda AI menempel pada blok analisisnya sendiri, bukan hanya tersembunyi
   * di dialog transparansi tingkat penilaian. Analisis dan skor pada indeks ini
   * memang disusun model AI - yang wajib adalah pembacanya tahu itu di tempat
   * ia membaca analisisnya.
   */
  const ho = disclosure?.human_oversight;
  const ditinjauManusia = ho?.status === "verified" && (ho?.approvers?.length ?? 0) > 0;

  const aiMarker = (
    <div
      className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider ${
        ditinjauManusia ? "text-[var(--muted)]" : "text-amber-600 dark:text-amber-400"
      }`}
    >
      <IconBot size={12} className="shrink-0" />
      <span>
        Analisis &amp; skor disusun AI ·{" "}
        {ditinjauManusia
          ? `ditinjau ${ho!.approvers.length} penelaah manusia`
          : "belum ditinjau penelaah manusia"}
      </span>
    </div>
  );

  if (!hasStructuredDialectic) {
    return (
      <div className="rounded-lg border border-[var(--line)] bg-[var(--bg)]/60 p-3.5 space-y-2">
        <div className="text-sm leading-relaxed text-[var(--text)]">{rationale_id.trim()}</div>
        {aiMarker}
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {aiMarker}
      {/* Grid Dialektika Tesis vs Antitesis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Kolom Tesis: Dalil Yuridis & Klaim Kebijakan Formal */}
        {thesis_id && (
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3.5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold text-[11px] uppercase tracking-wider">
                <IconScale size={14} className="shrink-0" />
                <span>Tesis / Dalil Formal Institusi</span>
              </div>
              <p className="text-xs sm:text-[13px] leading-relaxed text-[var(--text)]">
                {thesis_id}
              </p>
            </div>
            <div className="text-[10px] font-mono text-[var(--muted)] pt-1 border-t border-sky-500/15">
              Klaim regulasi resmi &amp; konsiderans formal negara
            </div>
          </div>
        )}

        {/* Kolom Antitesis: Kritik Pakar, Dissenting Opinion, & Realitas Lapangan */}
        {antithesis_id && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                <IconAlertTriangle size={14} className="shrink-0" />
                <span>Antitesis &amp; Fakta Empiris Lapangan</span>
              </div>
              <p className="text-xs sm:text-[13px] leading-relaxed text-[var(--text)]">
                {antithesis_id}
              </p>
            </div>
            <div className="text-[10px] font-mono text-[var(--muted)] pt-1 border-t border-amber-500/15">
              Kritik doktriner, pengawasan independen, &amp; anomali lapangan
            </div>
          </div>
        )}
      </div>

      {/*
       * Celah doktrin dinyatakan, bukan didiamkan.
       *
       * Tab ini bernama "Dialektika & Doktrin Pakar", jadi antitesis tanpa
       * satu pun kutipan pakar atau temuan lembaga terbaca seolah punya
       * sandaran doktriner padahal tidak. Menyatakannya terbuka lebih baik
       * daripada membiarkan pembaca menyimpulkan sendiri - dan jauh lebih
       * baik daripada menambalnya dengan kutipan yang tak dapat diperiksa.
       */}
      {antithesis_id && expert_quotes.length === 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
          <IconAlertTriangle
            size={14}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />
          <p className="text-[11px] leading-relaxed text-[var(--muted)]">
            <strong className="text-amber-700 dark:text-amber-400">
              Antitesis ini belum bersandar pada doktrin pakar.
            </strong>{" "}
            Tidak ada kutipan ahli hukum tata negara maupun temuan lembaga yang
            menopangnya - yang Anda baca adalah pembacaan AI atas bukti yang
            disitasi di tab <em>Pustaka Bukti &amp; Norma</em>. Bukti primernya
            tetap dapat Anda periksa sendiri, tetapi penafsirannya belum diuji
            terhadap pendapat pakar mana pun.
          </p>
        </div>
      )}

      {/* Kartu Kutipan Langsung Pakar Terkemuka (Expert Quotes) */}
      {expert_quotes.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] flex items-center gap-1.5">
            <IconQuote size={13} className="text-[var(--acc-sky)]" />
            <span>Kutipan Langsung Pakar Hukum &amp; Putusan Peradilan:</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {expert_quotes.map((eq, idx) => {
              const src = eq.source_id
                ? sources.find((s) => s.id === eq.source_id)
                : undefined;
              const href = src?.detail_url ?? src?.resolved_url ?? src?.url;

              const kind = KIND_VIEW[eq.kind];
              const ver = VERIFICATION_VIEW[eq.verification];

              return (
                <div
                  key={idx}
                  className="relative rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3.5 pl-4 sm:pl-5 space-y-2 shadow-2xs border-l-3 border-l-[var(--acc-sky)]"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded border border-[var(--line)] bg-[var(--panel)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      {kind.label}
                    </span>
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold ${ver.className}`}
                    >
                      {ver.label}
                    </span>
                  </div>

                  {/*
                   * Hanya kutipan kata-demi-kata yang memakai tanda kutip.
                   * Parafrasa dan temuan lembaga ditampilkan tanpa tanda kutip
                   * supaya tidak terbaca sebagai ucapan langsung seseorang -
                   * membungkus susunan sendiri dengan tanda kutip atas nama
                   * pakar yang masih hidup adalah menaruh kata di mulut orang.
                   */}
                  <div
                    className={`text-xs sm:text-[13px] leading-relaxed text-[var(--text)] ${
                      kind.kutipMiring ? "italic font-serif" : ""
                    }`}
                  >
                    {kind.kutipMiring ? `“${eq.quote}”` : eq.quote}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--line)]/50 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[var(--text)]">{eq.author}</span>
                      <span className="text-[var(--muted)]">·</span>
                      <span className="text-[var(--muted)]">{eq.role}</span>
                      {eq.year && (
                        <>
                          <span className="text-[var(--muted)]">·</span>
                          <span className="font-mono text-[var(--muted)]">
                            {eq.year}
                          </span>
                        </>
                      )}
                    </div>

                    {src && href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] text-[var(--acc-sky)] hover:underline"
                        title={src.title_id}
                      >
                        <IconFileText size={11} className="shrink-0" />
                        <span>Buka sumber</span>
                        <IconExternalLink size={9} className="shrink-0" />
                      </a>
                    )}
                  </div>

                  {src && (
                    <div className="pt-1 border-t border-[var(--line)]/50">
                      <ApaReference source={src} quote={eq} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sintesis Konstitusional / Pertimbangan Final */}
      <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)]/70 p-3 space-y-1">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
          Sintesis Penilaian Konstitusional:
        </div>
        <p className="text-xs sm:text-[13px] leading-relaxed text-[var(--text)]">
          {synthesis_id ? synthesis_id.trim() : rationale_id.trim()}
        </p>
      </div>
    </div>
  );
}
