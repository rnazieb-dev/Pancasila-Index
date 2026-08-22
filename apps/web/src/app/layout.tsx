import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pancasila Index",
  description:
    "Indeks Kepancasilaan terbuka: menilai kesetiaan pemangku kekuasaan Indonesia pada Pancasila, Pembukaan UUD 1945, dan UUD 1945 — berbasis bukti.",
};

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/timeline", label: "Timeline" },
  { href: "/lembaga", label: "Lembaga" },
  { href: "/landasan-uud", label: "Landasan UUD" },
  { href: "/metodologi", label: "Metodologi" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col antialiased">
        <header className="border-b border-[var(--line)]">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-6">
            <Link href="/" className="font-bold tracking-tight text-lg">
              Pancasila<span className="text-red-500">·</span>Index
            </Link>
            <nav className="flex gap-4 text-sm text-[var(--muted)] overflow-x-auto">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-white whitespace-nowrap">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-[var(--line)] mt-16">
          <div className="mx-auto max-w-6xl px-4 py-8 text-xs leading-relaxed text-[var(--muted)] space-y-2">
            <p>
              <strong className="text-[var(--text)]">Catatan:</strong> seluruh penilaian pada fase ini
              berstatus <em>draf</em> hasil demonstrasi metodologi dan belum dikurasi dewan editorial.
              Indeks bukan vonis akhir.
            </p>
            <p>
              Kode AGPL-3.0 · Data CC BY-SA 4.0 ·{" "}
              <a
                className="underline hover:text-white"
                href="https://github.com/pancasila-index/pancasila-index"
              >
                kontribusi via pull request
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
