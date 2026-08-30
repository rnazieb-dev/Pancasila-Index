import Link from "next/link";

import { dataset } from "@pancasila-index/data";

export default function LandasanUudPage() {
  const { uud } = dataset;
  const totalPasal = uud.babs.reduce((acc, bab) => acc + bab.pasal.length, 0);
  const terpetakan = uud.babs.reduce(
    (acc, bab) =>
      acc + bab.pasal.filter((p) => p.dimension_ids.length > 0).length,
    0
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Landasan UUD</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] max-w-2xl">
        {uud.title_id}. Setiap pasal dipetakan ke dimensi{" "}
        <Link href="/metodologi" className="underline hover:text-[var(--text)]">
          Rubrik Kepancasilaan
        </Link>{" "}
        sebagai jaminan bahwa tidak ada norma konstitusi yang lolos dari
        penilaian.
      </p>

      <div className="mt-6 flex gap-3">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2">
          <span className="text-xl font-bold">{uud.babs.length}</span>
          <span className="text-xs text-[var(--muted)]"> bab</span>
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2">
          <span className="text-xl font-bold">{totalPasal}</span>
          <span className="text-xs text-[var(--muted)]"> pasal</span>
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2">
          <span className="text-xl font-bold">{terpetakan}</span>
          <span className="text-xs text-[var(--muted)]"> terhubung dimensi</span>
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--muted)] leading-relaxed">
        Ringkasan isi disusun untuk navigasi penilaian dan bukan pengganti teks
        resmi. Naskah otoritatif: publikasi MPR &ldquo;UUD 1945 dalam Satu
        Naskah&rdquo; (Risalah Paripurna ke-5 Sidang Tahunan MPR 2002).
      </p>

      <div className="mt-10 space-y-8">
        {uud.babs.map((bab) => (
          <section key={bab.nomor}>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h2 className="font-semibold">
                <span className="text-[var(--acc-red)] mr-2">Bab {bab.nomor}</span>
                {bab.nama_id}
              </h2>
              {bab.catatan_id && (
                <span className="text-xs rounded-full border border-slate-600 px-2 py-0.5 text-[var(--muted)]">
                  {bab.catatan_id}
                </span>
              )}
            </div>

            {bab.pasal.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--muted)] italic px-3 border-l-2 border-[var(--line)] py-1">
                Tidak memuat pasal.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {bab.pasal.map((pasal) => (
                  <li
                    key={pasal.nomor}
                    className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-mono text-sm text-[var(--acc-red)] shrink-0">
                        Pasal {pasal.nomor}
                      </span>
                      <p className="text-sm grow">{pasal.ringkas_id}</p>
                    </div>
                    {pasal.dimension_ids.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {pasal.dimension_ids.map((dimId) => (
                          <Link
                            key={dimId}
                            href="/metodologi#skala"
                            className="rounded bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-500"
                          >
                            {dataset.rubric.dimensions.find(
                              (d) => d.id === dimId
                            )?.name_id ?? dimId}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
