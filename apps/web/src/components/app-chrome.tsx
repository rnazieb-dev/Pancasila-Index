"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { LOCALES } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";

/* ─── Struktur navigasi ─── */
const NAV_EXPLORE = [
  { href: "/lembaga", label: "Lembaga Negara" },
  { href: "/timeline", label: "Timeline Penilaian" },
  { href: "/bandingkan", label: "Bandingkan Era & Organ" },
  { href: "/aktor", label: "Direktori Tokoh" },
];

const NAV_DATA = [
  { href: "/metodologi", label: "Metodologi" },
  { href: "/landasan-uud", label: "Peta Pasal UUD" },
  { href: "/ekspor", label: "Ekspor Dataset" },
  { href: "/api-docs", label: "REST API Docs" },
];

/* ─── Helpers ─── */
function useTheme() {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("pi-theme") as "dark" | "light" | null;
    const preferred = window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
    const t = saved ?? preferred;
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    localStorage.setItem("pi-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return { theme, toggleTheme };
}

/* ─── Dropdown komponen ─── */
function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = items.some((i) => pathname?.startsWith(i.href));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        className={`flex items-center gap-1 text-sm transition hover:text-white ${
          isActive ? "text-white font-semibold" : "text-[var(--muted)]"
        }`}
      >
        {label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className={`mt-0.5 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 w-52 rounded-xl border border-[var(--line)] bg-[var(--panel)] py-1.5 shadow-xl">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2 text-sm transition hover:bg-[var(--line)] ${
                pathname === item.href
                  ? "text-white font-semibold"
                  : "text-[var(--muted)] hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Komponen utama ─── */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const { locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-6">

          {/* Logo */}
          <Link href="/" className="font-bold tracking-tight text-lg whitespace-nowrap shrink-0">
            Pancasila<span className="text-red-500">·</span>Index
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden md:flex items-center gap-5 flex-1">
            <Link
              href="/"
              className={`text-sm transition hover:text-white ${
                pathname === "/" ? "text-white font-semibold" : "text-[var(--muted)]"
              }`}
            >
              Beranda
            </Link>
            <NavDropdown label="Eksplorasi" items={NAV_EXPLORE} />
            <NavDropdown label="Metodologi & Data" items={NAV_DATA} />
          </nav>

          {/* Kanan Desktop */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            {/* Cari */}
            <Link
              href="/cari"
              title="Cari"
              className="rounded-lg p-2 text-[var(--muted)] hover:text-white hover:bg-[var(--line)] transition"
              aria-label="Cari"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="7.5" cy="7.5" r="5" />
                <path d="M13 13l2.5 2.5" />
              </svg>
            </Link>

            {/* Peer Review (bukan Kurasi) */}
            <Link
              href="/kurasi"
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                pathname?.startsWith("/kurasi")
                  ? "border-red-500 bg-red-500/10 text-red-400"
                  : "border-[var(--line)] text-[var(--muted)] hover:border-slate-500 hover:text-white"
              }`}
            >
              Peer Review
            </Link>

            {/* Toggle Tema */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
              className="rounded-lg p-2 text-[var(--muted)] hover:text-white hover:bg-[var(--line)] transition"
              aria-label="Toggle tema"
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              )}
            </button>

            {/* Pilih Bahasa */}
            <div className="flex gap-1">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLocale(l.code as typeof locale)}
                  title={l.native + (l.beta ? " (beta)" : "")}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase transition ${
                    locale === l.code
                      ? "bg-red-500/20 text-red-400"
                      : "text-[var(--muted)] hover:text-white"
                  }`}
                >
                  {l.code}
                </button>
              ))}
            </div>
          </div>

          {/* Kanan Mobile: Cari + Hamburger */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <Link
              href="/cari"
              aria-label="Cari"
              className="rounded-lg p-2 text-[var(--muted)] hover:text-white hover:bg-[var(--line)] transition"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="7.5" cy="7.5" r="5" />
                <path d="M13 13l2.5 2.5" />
              </svg>
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu"
              className="rounded-lg p-2 text-[var(--muted)] hover:text-white hover:bg-[var(--line)] transition"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE DRAWER ═══ */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <nav className="fixed top-0 right-0 z-50 h-full w-72 bg-[var(--panel)] border-l border-[var(--line)] shadow-2xl flex flex-col">
            {/* Header Drawer */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
              <span className="font-bold text-base">
                Pancasila<span className="text-red-500">·</span>Index
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Tutup menu"
                className="rounded-lg p-1.5 text-[var(--muted)] hover:text-white hover:bg-[var(--line)] transition"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 3l12 12M15 3L3 15" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
              <Link href="/" onClick={() => setDrawerOpen(false)} className="drawer-link">Beranda</Link>

              <p className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">Eksplorasi</p>
              {NAV_EXPLORE.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} className="drawer-link">{item.label}</Link>
              ))}

              <p className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">Metodologi & Data</p>
              {NAV_DATA.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} className="drawer-link">{item.label}</Link>
              ))}

              <p className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">Tinjauan</p>
              <Link href="/kurasi" onClick={() => setDrawerOpen(false)} className="drawer-link text-red-400 font-semibold">Peer Review</Link>
            </div>

            {/* Footer Drawer: tema & bahasa */}
            <div className="border-t border-[var(--line)] px-5 py-4 space-y-3">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-white transition"
              >
                {theme === "dark" ? "🌙 Mode Gelap" : "☀️ Mode Terang"}
                <span className="ml-auto text-xs border border-[var(--line)] rounded px-2 py-0.5">
                  Ganti
                </span>
              </button>
              <div className="flex gap-1">
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLocale(l.code as typeof locale); setDrawerOpen(false); }}
                    className={`rounded px-2 py-1 text-[10px] font-semibold uppercase transition ${
                      locale === l.code
                        ? "bg-red-500/20 text-red-400"
                        : "text-[var(--muted)] hover:text-white"
                    }`}
                  >
                    {l.code}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </>
      )}

      <style>{`
        .drawer-link {
          display: block;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: var(--muted);
          transition: background 0.15s, color 0.15s;
        }
        .drawer-link:hover {
          background: var(--line);
          color: white;
        }
      `}</style>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--line)] mt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs leading-relaxed text-[var(--muted)] space-y-2">
          <p>
            <strong className="text-[var(--text)]">Catatan:</strong>{" "}
            seluruh penilaian pada fase ini berstatus draf hasil demonstrasi metodologi dan belum dikurasi dewan editorial. Indeks bukan vonis akhir.
          </p>
          <p>Kode AGPL-3.0 · Data CC BY-SA 4.0 · kontribusi via Peer Review</p>
        </div>
      </footer>
    </>
  );
}
