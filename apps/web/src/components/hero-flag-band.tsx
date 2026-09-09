"use client";

import Link from "next/link";
import type { AssessmentSummary } from "@pancasila-index/core";

/**
 * Pita indeks kepatuhan konstitusional per masa jabatan presiden.
 *
 * Bentuk: batang tegak dari 0 ke nilai indeksnya pada skala 0-100, dengan
 * garis acuan netral di 50. Batang lebih panjang = indeks lebih tinggi.
 *
 * Kenapa bukan batang simpangan dari 50. Versi sebelumnya memakai panjang
 * batang untuk |indeks - 50|. Aritmetikanya benar, tetapi pengkodeannya
 * terbalik di separuh bawah: masa jabatan berindeks 21 mendapat batang LEBIH
 * PANJANG daripada yang berindeks 25, karena 21 lebih jauh dari netral.
 * Pembaca pertama yang melihatnya langsung menanyakan hal itu - dan pembaca
 * yang bertanya "kenapa batang 21 lebih panjang dari 25" sudah membuktikan
 * grafiknya gagal. Pada bentuk sekarang panjang batang selalu searah dengan
 * angkanya: lebih panjang berarti lebih tinggi, tanpa kecuali.
 *
 * Kenapa juga bukan lagi isian merah-putih. Bentuk yang lebih awal mengisi
 * kolom dengan merah sebesar (100 - indeks) sehingga kolom berbentuk bendera
 * saat indeks 50. Itu keliru dua kali: (1) ia mengkodekan JARAK MENUJU
 * SEMPURNA sebagai bidang merah, jadi indeks 67 pun terbaca sepertiga rusak;
 * (2) memakai lambang negara sebagai geometri grafik membuat indeksnya
 * terbaca sebagai pernyataan simbolik, bukan sebagai ukuran.
 *
 * Warna mengerjakan POLARITAS saja - di sisi mana angkanya terhadap netral -
 * sementara panjang batang mengerjakan magnitudo. Pasangan diverging
 * biru/merah (token --idx-above/--idx-below) lolos keenam pemeriksaan palet
 * di kedua tema terhadap permukaan panel proyek ini; rinciannya di
 * globals.css. Identitas tidak bersandar pada warna saja: sisi garis acuan
 * dan angka di bawah tiap kolom membawanya juga.
 *
 * Kolom TIDAK pernah dikarang: indeks yang ditahan (cakupan bukti belum
 * cukup) tampil berarsir tanpa batang, karena nol berarti "dinilai dan
 * hasilnya nol" - klaim yang berbeda. Pada data sekarang tidak ada masa
 * jabatan yang ditahan, tetapi cabangnya tetap ada agar penambahan lembaga
 * atau periode baru tidak pernah menampilkan nol palsu.
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

/** Titik netral skala indeks; garis acuan mendatar. */
const NETRAL = 50;
/** Tinggi area grafik, dalam piksel; mewakili rentang penuh 0-100. */
const TINGGI = 150;

export function HeroFlagBand({ terms }: { terms: FlagBandTerm[] }) {
  const dinilai = terms.filter((t) => t.summary?.index != null);
  const ditahan = terms.length - dinilai.length;

  return (
    <figure className="mt-8 border-[3px] border-[var(--text)] bg-[var(--panel)]">
      <figcaption className="border-b-[3px] border-[var(--text)] px-4 py-3 sm:px-5">
        <h2 className="text-sm font-black uppercase tracking-wide text-[var(--text)]">
          Indeks kesetiaan konstitusional tiap masa jabatan presiden, 1945–kini
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
          Tinggi batang adalah nilai indeksnya pada skala 0–100 — makin tinggi
          batang, makin tinggi indeksnya. Garis putus-putus menandai titik
          netral {NETRAL}.
        </p>

        {/* Kunci polaritas warna. */}
        <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[var(--muted)]">
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-[2px]"
              style={{ background: "var(--idx-above)" }}
            />
            di atas netral
          </li>
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-[2px]"
              style={{ background: "var(--idx-below)" }}
            />
            di bawah netral
          </li>
          {/* Kunci arsir hanya muncul bila ada indeks yang benar-benar
              ditahan. Menjelaskan keadaan yang tidak terjadi di data hanya
              menambah beban baca. */}
          {ditahan > 0 && (
            <li className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-[2px] opacity-70"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, var(--muted) 0 2px, transparent 2px 4px)",
                }}
              />
              indeks ditahan
            </li>
          )}
        </ul>
      </figcaption>

      <div className="px-3 pt-4 sm:px-5">
        <div className="relative" style={{ height: TINGGI }}>
          <ul className="flex h-full items-stretch gap-0.5">
            {terms.map((t) => {
              const idx = t.summary?.index ?? null;
              const capped = t.summary?.index_capped === true;
              /* Tinggi penuh mewakili 100 satuan indeks. */
              const panjang =
                idx === null ? 0 : (Math.max(0, Math.min(100, idx)) / 100) * TINGGI;
              const diAtas = (idx ?? 0) >= NETRAL;
              const deskripsi =
                idx === null
                  ? `${t.label_id} (${t.period}) — indeks ditahan, bukti belum cukup`
                  : `${t.label_id} (${t.period}) — indeks ${Math.round(idx)} dari 100, ` +
                    `${
                      Math.round(idx) === NETRAL
                        ? "tepat di titik netral"
                        : `di ${diAtas ? "atas" : "bawah"} titik netral ${NETRAL}`
                    }${capped ? ", dibatasi karena pelanggaran hak dasar" : ""}`;

              return (
                <li key={t.id} className="h-full min-w-0 flex-1">
                  <Link
                    href={t.href}
                    title={deskripsi}
                    aria-label={deskripsi}
                    className="group relative block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acc-sky)]"
                  >
                    {idx === null ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 opacity-60"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, var(--line) 0 4px, transparent 4px 8px)",
                        }}
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 transition-[filter] group-hover:brightness-110"
                        style={{
                          height: panjang,
                          background: diAtas
                            ? "var(--idx-above)"
                            : "var(--idx-below)",
                          /* Ujung data dibulatkan 4 px; pangkalnya menempel
                             garis nol agar acuannya tak kabur. */
                          borderRadius: "4px 4px 0 0",
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Garis acuan netral 50, melintasi seluruh pita. Putus-putus supaya
              terbaca sebagai acuan, bukan sebagai data. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0"
            style={{
              top: TINGGI / 2,
              borderTop: "1px dashed color-mix(in srgb, var(--text) 45%, transparent)",
            }}
          />
          {/* Label garis acuan hanya di layar >= sm. Pada 320 px, 11 kolom
              memakai seluruh lebar pita: label ini menindih dua kolom terakhir
              dan memotong garis putus-putusnya. Keterangannya sudah dibawa
              teks pengantar di atas, jadi menyembunyikannya di ponsel tidak
              menghilangkan informasi apa pun. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0 hidden bg-[var(--panel)] pl-1 text-[9px] font-mono leading-none text-[var(--muted)] sm:block"
            style={{ top: TINGGI / 2 - 4 }}
          >
            netral {NETRAL}
          </span>
        </div>

        {/* Angka indeks - label langsung, sekaligus jalur baca tanpa warna. */}
        <ul className="mt-1.5 flex gap-0.5">
          {terms.map((t) => {
            const idx = t.summary?.index ?? null;
            return (
              <li
                key={t.id}
                className={`min-w-0 flex-1 text-center text-[11px] font-bold tabular-nums sm:text-xs ${
                  t.ongoing ? "text-[var(--text)]" : "text-[var(--muted)]"
                }`}
              >
                {/* Angka saja. Tanda bintang untuk indeks yang dibatasi sudah
                    dicabut bersama catatan kakinya: penanda tanpa keterangan
                    di tempat yang sama justru menggantung. Alasan pembatasan
                    dibawa deskripsi kolomnya dan dijelaskan penuh di halaman
                    masa jabatan bersangkutan. */}
                {idx === null ? "—" : Math.round(idx)}
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
        <ul className="flex gap-0.5 pb-3">
          {terms.map((t) => (
            <li
              key={t.id}
              className="flex min-w-0 flex-1 justify-center text-[9px] leading-tight text-[var(--muted)] sm:block sm:text-center sm:text-[10px]"
            >
              <span className="font-semibold [writing-mode:vertical-rl] rotate-180 h-[62px] overflow-hidden sm:h-auto sm:block sm:truncate sm:[writing-mode:horizontal-tb] sm:rotate-0">
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
      </div>
    </figure>
  );
}
