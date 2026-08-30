import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Transparansi Pendanaan — Pancasila Index",
  description:
    "Pernyataan independensi dan transparansi pendanaan Pancasila Index: hanya menerima sumbangan individu, tidak dari partai/BUMN/pihak yang dinilai.",
};

export default function TransparansiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-8">
      <nav className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--text)] transition">Beranda</Link>
        <span>&rsaquo;</span>
        <span className="text-[var(--text)]">Transparansi Pendanaan</span>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-[var(--text)]">Transparansi Pendanaan</h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Pancasila Index didanai secara independen. Dokumen ini menjelaskan
          <strong className="text-[var(--text)]"> siapa yang mendanai</strong>,{" "}
          <strong className="text-[var(--text)]">berapa</strong>, dan{" "}
          <strong className="text-[var(--text)]">untuk apa</strong>. Terakhir
          diperbarui: 30 Agustus 2026.
        </p>
      </header>

      <Section n="1" title="Pernyataan independensi">
        <p>
          Pancasila Index <strong className="text-[var(--text)]">tidak menerima</strong> pendanaan
          dari:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Partai politik atau kandidat pemilu.</li>
          <li>Badan usaha milik negara (BUMN) atau badan usaha milik daerah (BUMD).</li>
          <li>Organisasi yang memiliki afiliasi langsung dengan pihak yang dinilai dalam indeks.</li>
          <li>Lembaga negara yang menjadi subjek penilaian.</li>
          <li>Perusahaan atau yayasan yang terafiliasi dengan aktor yang dinilai.</li>
        </ul>
        <p>
          Pendanaan hanya dapat berasal dari{" "}
          <strong className="text-[var(--text)]">sumbangan individu (crowdfunding)</strong>{" "}
          yang dilakukan secara sukarela, tanpa imbalan, dan tanpa
          mengharapkan pengaruh terhadap isi indeks.
        </p>
      </Section>

      <Section n="2" title="Daftar donasi">
        <p>
          Per awal periode pelaporan ini, Pancasila Index{" "}
          <strong className="text-[var(--text)]">belum menerima sumbangan tercatat</strong>.
          Pengelolaan dilakukan dengan biaya pribadi dan sumber daya
          sukarela.
        </p>
        <p>
          Apabila di kemudian hari ada sumbangan yang diterima, daftar
          berikut akan diisi dengan:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Nama donor (bila diizinkan; bila tidak, &ldquo;Anonim&rdquo;).</li>
          <li>Tanggal sumbangan.</li>
          <li>Jumlah (dalam rupiah).</li>
          <li>Saluran penerimaan (platform, nomor referensi).</li>
        </ul>
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--panel)]">
          <table className="w-full text-xs">
            <thead className="bg-[var(--bg)]/50 text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Tanggal</th>
                <th className="px-3 py-2 text-left font-semibold">Donor</th>
                <th className="px-3 py-2 text-left font-semibold">Jumlah</th>
                <th className="px-3 py-2 text-left font-semibold">Saluran</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-[var(--muted)]">
                <td className="px-3 py-3" colSpan={4}>
                  Belum ada sumbangan tercatat.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="3" title="Penggunaan dana">
        <p>
          Dana (apabila ada) akan digunakan secara transparan untuk:
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Biaya hosting dan infrastruktur (saat ini: Vercel untuk web, Cloudflare R2 untuk arsip).</li>
          <li>Pemeliharaan repositori arsip primer.</li>
          <li>Audit internal dan tinjauan metodologi.</li>
          <li>Biaya hukum terbatas untuk konsultasi (bukan litigasi).</li>
        </ul>
        <p>
          Pengelola <strong className="text-[var(--text)]">tidak menerima kompensasi</strong>{" "}
          atas waktu yang dicurahkan untuk pengelolaan platform, kecuali
          berupa penggantian biaya langsung yang dikeluarkan.
        </p>
      </Section>

      <Section n="4" title="Saluran donasi (kalau ada)">
        <p>
          Saluran donasi akan dipublikasikan hanya setelah kebijakan
          ini diterapkan secara penuh. Untuk saat ini, sumbangan
          dilakukan secara langsung dengan konfirmasi manual ke
          kontak pengelola yang tercantum di{" "}
          <Link href="/legal" className="underline hover:text-[var(--text)]">LEGAL.md</Link>.
        </p>
      </Section>

      <Section n="5" title="Audit">
        <p>
          Ringkasan audit pendanaan akan diterbitkan setiap akhir tahun
          fiskal. Laporan akan mencakup: total penerimaan, total
          pengeluaran, saldo, dan kategori penggunaan dana.
        </p>
        <p>
          Rujukan: praktik terbaik <em>media funding transparency</em>{" "}
          (mis. <em>Reporters Without Borders</em>, <em>Committee to
          Protect Journalists</em>) dan prinsip OECD tentang pendanaan
          organisasi riset independen.
        </p>
      </Section>

      <p className="text-xs text-[var(--muted)] pt-4 border-t border-[var(--line)]">
        Jika Anda mengetahui adanya sumbangan yang tidak sesuai
        pernyataan di atas, mohon laporkan lewat{" "}
        <Link href="/security" className="underline hover:text-[var(--text)]">SECURITY.md</Link>{" "}
        (jalur privat).
      </p>
    </div>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-[var(--text)]">
        <span className="text-[var(--acc-red)]">{n}.</span> {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--text)]">
        {children}
      </div>
    </section>
  );
}
