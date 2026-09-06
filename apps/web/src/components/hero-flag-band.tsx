"use client";

import Link from "next/link";
import type { AssessmentSummary } from "@pancasila-index/core";

/**
 * Pita Merah Putih: bendera dipakai SEBAGAI sumbu, bukan sebagai hiasan.
 *
 * Tiap kolom satu masa jabatan presiden, urut 1945 ke kini. Merah mengisi
 * dari atas sebesar (100 - indeks), putih mengisi sisanya dari bawah.
 * Akibatnya:
 *
 *   indeks 100 -> seluruhnya putih
 *   indeks  50 -> merah separuh di atas, putih separuh di bawah = BENDERA
 *   indeks   0 -> seluruhnya merah
 *
 * Jadi bendera yang utuh persis muncul di titik netral skala ini (50), dan
 * setiap penyimpangan dari bentuk bendera adalah penyimpangan dari netral.
 * Benderanya menjadi tolok ukur, bukan korban perbandingan - itu sebabnya
 * arah pengisiannya mengikuti orientasi asli Sang Merah Putih (merah di
 * atas), bukan dibalik demi kemudahan menggambar.
 *
 * Kolom TIDAK pernah dikarang. Masa jabatan yang indeksnya ditahan (cakupan
 * bukti belum cukup) tampil sebagai kolom kosong berarsir, bukan sebagai
 * nol - nol berarti "dinilai dan hasilnya nol", dan itu klaim yang berbeda.
 */

export interface FlagBandTerm {
  id: string;
  /** Nama singkat untuk sumbu, mis. "Sukarno II". */
  short_id: string;
  label_id: string;
  period: string;
  summary: AssessmentSummary | null;
  href: string;
  ongoing: boolean;
}

/** Titik tengah skala indeks; di sinilah kolom berbentuk bendera utuh. */
const NETRAL = 50;

export function HeroFlagBand({ terms }: { terms: FlagBandTerm[] }) {
  const dinilai = terms.filter((t) => t.summary?.index != null);
  const ditahan = terms.length - dinilai.length;
  const dibatasi = terms.filter((t) => t.summary?.index_capped === true).length;

  return (
    <figure className="mt-8 border-[3px] border-[var(--text)] bg-[var(--panel)]">
      <figcaption className="border-b-[3px] border-[var(--text)] px-4 py-3 sm:px-5">
        <h2 className="text-sm font-black uppercase tracking-wide text-[var(--text)]">
          Indeks kesetiaan konstitusional tiap masa jabatan presiden, 1945–kini
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
          Merah mengisi dari atas sebesar jarak menuju 100. Pada indeks{" "}
          {NETRAL} kolomnya berbentuk{" "}
          <strong className="text-[var(--text)]">Sang Merah Putih utuh</strong> —
          itulah titik netral skala ini. Makin banyak merah, makin jauh di
          bawahnya.
        </p>
      </figcaption>

      <div className="px-3 pt-4 sm:px-5">
        {/*
         * Area grafik terpisah dari baris angka dan nama supaya garis netral
         * bisa digambar SATU KALI melintasi seluruh pita. Digambar per kolom,
         * ia terputus-putus di tiap batas dan berhenti terbaca sebagai
         * patokan bersama - padahal justru patokan itulah maksudnya.
         */}
        <div className="relative" style={{ height: 150 }}>
          <ul className="flex h-full items-stretch gap-[3px] sm:gap-1.5">
            {terms.map((t) => {
              const idx = t.summary?.index ?? null;
              const capped = t.summary?.index_capped === true;
              const merahPersen =
                idx === null ? null : Math.max(0, Math.min(100, 100 - idx));
              const deskripsi =
                idx === null
                  ? `${t.label_id} (${t.period}) — indeks ditahan, bukti belum cukup`
                  : `${t.label_id} (${t.period}) — indeks ${Math.round(idx)} dari 100${
                      capped ? ", dibatasi karena pelanggaran hak dasar" : ""
                    }`;

              return (
                <li key={t.id} className="h-full min-w-0 flex-1">
                  <Link
                    href={t.href}
                    title={deskripsi}
                    aria-label={deskripsi}
                    className={`relative block h-full overflow-hidden border-[2px] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acc-sky)] ${
                      t.ongoing ? "border-[var(--text)]" : "border-[var(--text)]/45"
                    }`}
                  >
                    {merahPersen === null ? (
                      /* Indeks ditahan: arsir, bukan angka nol yang dikarang. */
                      <div
                        className="h-full w-full opacity-70"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, var(--line) 0 4px, transparent 4px 8px)",
                        }}
                      />
                    ) : (
                      <>
                        <div
                          style={{
                            height: `${merahPersen}%`,
                            background: "var(--flag-red)",
                          }}
                        />
                        <div
                          style={{
                            height: `${100 - merahPersen}%`,
                            background: "#ffffff",
                          }}
                        />
                        {capped && (
                          /* Dibatasi di 50 bukan "netral"; tanpa penanda,
                             kolomnya menyamar jadi bendera utuh. */
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "repeating-linear-gradient(45deg, rgba(15,23,42,.5) 0 3px, transparent 3px 7px)",
                            }}
                          />
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Garis netral tunggal: batas merah-putih pada bendera utuh. */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-[var(--text)]/55" />
        </div>

        {/* Angka indeks */}
        <ul className="mt-1.5 flex gap-[3px] sm:gap-1.5">
          {terms.map((t) => {
            const idx = t.summary?.index ?? null;
            return (
              <li
                key={t.id}
                className={`min-w-0 flex-1 text-center text-[11px] font-bold tabular-nums sm:text-xs ${
                  t.ongoing ? "text-[var(--text)]" : "text-[var(--muted)]"
                }`}
              >
                {idx === null ? "—" : Math.round(idx)}
                {t.summary?.index_capped === true && (
                  <span className="text-[var(--acc-red)]">*</span>
                )}
              </li>
            );
          })}
        </ul>

        {/*
         * Sumbu nama. Di ponsel nama diputar tegak, tidak dipendekkan lagi
         * dan tidak digulung mendatar: 11 kolom pada layar 390 px hanya
         * menyisakan ~30 px per kolom, cukup sempit untuk memotong SEMUA
         * nama - termasuk membuat "SBY I" dan "SBY II" tampil identik.
         * Menggulung pitanya juga bukan jawaban, karena yang dibaca dari
         * grafik ini justru bentuk lintasannya secara utuh; memotong
         * separuh periode sama dengan menghilangkan isinya.
         */}
        <ul className="flex gap-[3px] pb-3 sm:gap-1.5">
          {terms.map((t) => (
            <li
              key={t.id}
              className="flex min-w-0 flex-1 justify-center text-[9px] leading-tight text-[var(--muted)] sm:block sm:text-center sm:text-[10px]"
            >
              <span className="font-semibold [writing-mode:vertical-rl] rotate-180 h-[58px] sm:h-auto sm:block sm:truncate sm:[writing-mode:horizontal-tb] sm:rotate-0">
                {t.short_id}
              </span>
              <span className="hidden font-mono opacity-70 sm:block sm:truncate">
                {t.period.replace("–kini", "–")}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-[var(--line)] px-4 py-2.5 text-[10px] leading-relaxed text-[var(--muted)] sm:px-5">
        {/*
         * Keterangan disusun kondisional. Kalimat tetap "sisanya ditahan"
         * berbunyi omong kosong ketika semua indeks terbit ("11 dari 11 ...
         * sisanya ditahan"), dan penjelasan tanda * menggantung kalau tidak
         * ada satu pun kolom yang dibatasi.
         */}
        <span className="font-semibold text-[var(--text)]">
          {dinilai.length} dari {terms.length} masa jabatan
        </span>{" "}
        punya indeks terbit
        {ditahan > 0 ? (
          <>
            ; {ditahan} sisanya ditahan karena cakupan buktinya belum cukup dan
            ditampilkan berarsir, bukan sebagai nol
          </>
        ) : null}
        .
        {dibatasi > 0 && (
          <>
            {" "}
            <span className="text-[var(--acc-red)]">*</span> menandai indeks
            yang dibatasi di {NETRAL} karena temuan pelanggaran hak dasar —
            kolomnya berbentuk bendera utuh bukan karena netral, melainkan
            karena ditahan di sana.
          </>
        )}
      </div>
    </figure>
  );
}
