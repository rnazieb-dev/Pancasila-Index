import Link from "next/link";

/**
 * Direktori kontributor & kontributor.
 *
 * SENGAJA KOSONG. Sebelumnya halaman ini memuat data contoh berisi nama
 * pakar hukum tata negara yang NYATA (lengkap dengan jabatan, afiliasi,
 * deklarasi pendanaan, dan jumlah kontribusi) padahal tidak seorang pun
 * dari mereka pernah berkontribusi. Atribusi palsu pada orang nyata di
 * indeks politik adalah masalah integritas, bukan sekadar placeholder.
 *
 * Isi hanya dari data terverifikasi: kontributor yang benar-benar
 * mengirim usulan dan menyetujui pencantuman namanya. Sumbernya nanti
 * tabel User + Review (Prisma), bukan konstanta di file ini.
 */
type Contributor = {
  nama: string;
  jabatan: string;
  afiliasi: string;
  funding: string;
  kontribusi: number;
  status: "Aktif" | "Tidak aktif";
  avatar: string;
};

const CONTRIBUTORS: Contributor[] = [];

export default function KontributorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/peer-review"
        className="text-xs text-[var(--muted)] hover:text-[var(--text)]"
      >
        ← Kembali ke Portal Peer Review
      </Link>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Direktori Kontributor &amp; Kontributor</h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Daftar peneliti dan pakar hukum tata negara yang telah berkontribusi pada
            Pancasila Index, lengkap dengan afiliasi institusi dan deklarasi sumber
            pendanaan mereka secara terbuka.
          </p>
        </div>
        <Link
          href="/peer-review/usulan"
          className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500"
        >
          + Ajukan Kontribusi Baru
        </Link>
      </div>

      {/* Prinsip COPE */}
      <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-xs leading-relaxed text-[var(--muted)]">
        <strong className="text-[var(--text)]">Standar Transparansi:</strong> Pancasila Index
        mengikuti panduan{" "}
        <strong className="text-[var(--acc-sky)]">COPE (Committee on Publication Ethics)</strong>{" "}
        untuk tinjauan ilmiah. Seluruh kontributor wajib mendeklarasikan afiliasi,
        sumber pendanaan, dan potensi konflik kepentingan. Informasi ini dipublikasikan
        terbuka agar pembaca dapat menilai independensi setiap kontribusi.
      </div>

      {CONTRIBUTORS.length === 0 ? (
        /* Keadaan kosong — jujur, bukan diisi data contoh */
        <div className="mt-8 rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel)]/50 px-6 py-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--line)] text-xl text-[var(--muted)]">
            ◍
          </div>
          <h2 className="mt-4 text-base font-semibold text-[var(--text)]">
            Belum ada kontributor terdaftar
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Direktori ini hanya memuat kontributor terverifikasi — yaitu yang usulannya
            telah diterima Dewan Editorial dan yang menyetujui pencantuman nama,
            afiliasi, serta deklarasi pendanaannya. Tidak ada nama yang dicantumkan
            tanpa kontribusi nyata dan persetujuan eksplisit.
          </p>
          <Link
            href="/peer-review/usulan"
            className="mt-6 inline-block rounded-lg border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:border-slate-500 hover:text-[var(--text)]"
          >
            Jadi kontributor pertama
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {CONTRIBUTORS.map((c) => (
            <div
              key={c.nama}
              className="grid items-start gap-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:grid-cols-[auto_1fr_auto]"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-sm font-bold text-[var(--acc-red)]">
                {c.avatar}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="text-sm font-bold text-[var(--text)]">{c.nama}</div>
                <div className="text-xs text-[var(--acc-red)]">{c.jabatan}</div>
                <div className="text-xs text-[var(--muted)]">{c.afiliasi}</div>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                  <span className="text-[var(--muted)]">
                    <span className="font-semibold text-[var(--muted)]">Funding:</span>{" "}
                    {c.funding}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-xl font-bold text-[var(--text)]">{c.kontribusi}</div>
                <div className="text-[11px] text-[var(--muted)]">Kontribusi</div>
                <div
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    c.status === "Aktif"
                      ? "bg-emerald-500/20 text-[var(--acc-emerald)]"
                      : "bg-slate-500/20 text-[var(--muted)]"
                  }`}
                >
                  {c.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[var(--muted)]">
        Ingin bergabung sebagai kontributor?{" "}
        <Link href="/peer-review/usulan" className="text-[var(--acc-sky)] hover:text-[var(--acc-sky-strong)]">
          Ajukan kontribusi pertama Anda
        </Link>{" "}
        dan nama Anda akan muncul di sini setelah usulan diterima.
      </p>
    </div>
  );
}
