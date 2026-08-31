import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dukung Pancasila Index — Donasi Individu",
  description:
    "Donasi individu untuk pendirian yayasan/think tank yang akan mengelola Pancasila Index. 100% transparan, sesuai hukum Indonesia. Rekening OCBC Indonesia a.n. PT Aplikasi Profesi Indonesia.",
};

export default function DonasiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-10">
      <nav className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--text)] transition">Beranda</Link>
        <span>&rsaquo;</span>
        <span className="text-[var(--text)]">Dukung</span>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)]">
          Dukung Pancasila Index
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
          Donasi individu untuk pendirian yayasan/think tank yang akan mengelola
          Pancasila Index. 100% transparan, sesuai hukum Indonesia.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Penggunaan dana</h2>
        <p className="text-sm text-[var(--text)] leading-relaxed">
          Donasi yang masuk ke <strong>PT Aplikasi Profesi Indonesia</strong> (PT
          Perorangan, badan hukum UMK sesuai UU Cipta Kerja No. 11 Tahun 2020)
          akan digunakan untuk:
        </p>
        <ol className="space-y-3 list-decimal pl-5 text-sm text-[var(--text)] leading-relaxed">
          <li>
            <strong>Pembukaan yayasan / think tank</strong> — biaya notaris,
            pendaftaran Kemenkumham, NPWP badan hukum baru, izin operasional.
          </li>
          <li>
            <strong>Pengalihan kepemilikan Pancasila Index</strong> — setelah
            yayasan berdiri, kepemilikan dan pengelolaan platform dialihkan ke
            yayasan.
          </li>
          <li>
            <strong>Operasional yayasan</strong> — riset, audit independen,
            hosting (Vercel, Cloudflare R2), penerjemahan, tinjauan sejawat.
          </li>
          <li>
            <strong>Pembentukan dewan editorial</strong> — honorarium anggota
            dewan editorial, rapat pleno, dan proses rekrutmen.
          </li>
          <li>
            <strong>Pembentukan kepengurusan &amp; anggota</strong> —
            administrasi kepengurusan yayasan, rekrutmen anggota, pelatihan
            metodologi.
          </li>
          <li>
            <strong>Operasional &amp; risiko hukum</strong> — konsultan hukum,
            audit internal, biaya notaris lanjutan, dan operasional harian.
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Metode donasi</h2>
        <div className="grid gap-4 sm:grid-cols-1">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-2">
            <h3 className="text-base font-bold text-[var(--text)]">Kitabisa</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Donasi lewat Kitabisa: terverifikasi, terlapor, transparan. Donasi
              akan di-bridge ke rekening PT.
            </p>
            <a
              href="https://kitabisa.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs font-bold text-[var(--acc-red)] hover:underline"
            >
              Buka Kitabisa &rarr;
            </a>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-2">
            <h3 className="text-base font-bold text-[var(--text)]">Open Collective</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Donasi lewat Open Collective: transparansi penuh internasional,
              dashboard publik, laporan otomatis.
            </p>
            <a
              href="https://opencollective.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs font-bold text-[var(--acc-red)] hover:underline"
            >
              Buka Open Collective &rarr;
            </a>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-2">
            <h3 className="text-base font-bold text-[var(--text)]">
              Transfer bank ke rekening PT
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Langsung ke rekening PT Aplikasi Profesi Indonesia:
            </p>
            <ul className="text-xs text-[var(--text)] space-y-0.5 font-mono">
              <li><strong>Bank</strong>: OCBC Indonesia</li>
              <li><strong>No. Rekening</strong>: 693800145668</li>
              <li><strong>a.n.</strong>: PT Aplikasi Profesi Indonesia</li>
            </ul>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
              Setelah transfer, konfirmasi via{" "}
              <a
                href="https://github.com/rnazieb-dev/Pancasila-Index/security/advisories/new"
                className="underline text-[var(--acc-sky)] hover:text-[var(--text)]"
              >
                Security Advisories
              </a>{" "}
              agar donasi tercatat di halaman transparansi.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--acc-amber)]/30 bg-[var(--acc-amber)]/5 p-5 space-y-2">
        <h2 className="text-lg font-bold text-[var(--text)]">Transparansi</h2>
        <p className="text-sm text-[var(--text)] leading-relaxed">
          Setiap donasi yang masuk akan tercatat di halaman{" "}
          <Link
            href="/transparansi"
            className="font-bold text-[var(--acc-sky)] hover:underline"
          >
            /transparansi
          </Link>
          . Audit publik dilakukan setiap akhir tahun fiskal. Lihat juga{" "}
          <Link
            href="/legal"
            className="font-bold text-[var(--acc-sky)] hover:underline"
          >
            LEGAL.md
          </Link>{" "}
          untuk status badan hukum PT Aplikasi Profesi Indonesia.
        </p>
      </section>

      <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-2">
        <h2 className="text-lg font-bold text-[var(--text)]">Disclaimer</h2>
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Donasi sukarela, tidak ada imbalan. Donasi tidak memberikan hak
          istimewa atas isi indeks. Setelah yayasan berdiri, pengelolaan
          Pancasila Index dialihkan ke yayasan dan PT kembali ke aktivitas
          komersialnya yang tidak terkait platform ini.
        </p>
      </section>
    </div>
  );
}
