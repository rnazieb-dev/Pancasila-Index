"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { LOCALES, type UiKey } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";

/* ─── Struktur navigasi: label sebagai kunci i18n, bukan teks literal ─── */
const NAV_EXPLORE: { href: string; key: UiKey }[] = [
  { href: "/lembaga", key: "navInstitutions" },
  { href: "/timeline", key: "navTimeline" },
  { href: "/bandingkan", key: "navCompare" },
  { href: "/aktor", key: "navActors" },
];

const NAV_DATA: { href: string; key: UiKey }[] = [
  { href: "/metodologi", key: "navMethodology" },
  { href: "/landasan-uud", key: "navUud" },
  { href: "/ekspor", key: "navExport" },
  { href: "/api-docs", key: "navApiDocs" },
  { href: "/peer-review/draf", key: "navMyDrafts" },
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

/** Tutup panel saat klik di luar atau tekan Escape. */
function useDismiss<T extends HTMLElement>(
  onDismiss: () => void,
  active: boolean,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [active, onDismiss]);

  return ref;
}

const PANEL =
  "absolute top-full z-50 mt-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] py-1.5 shadow-xl";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={`mt-0.5 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2 4l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Dropdown navigasi ─── */
function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: { href: string; key: UiKey }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(() => setOpen(false), open);
  const pathname = usePathname();
  const { t } = useLocale();

  const isActive = items.some((i) => pathname?.startsWith(i.href));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-1 text-sm transition hover:text-[var(--text)] ${
          isActive ? "text-[var(--text)] font-semibold" : "text-[var(--muted)]"
        }`}
      >
        {label}
        <Chevron open={open} />
      </button>

      {open && (
        <div role="menu" className={`${PANEL} left-0 w-56`}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block px-4 py-2 text-sm transition hover:bg-[var(--line)] ${
                pathname === item.href
                  ? "text-[var(--text)] font-semibold"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Dropdown bahasa untuk Mobile/Tablet ─── */
function MobileLocaleSelect() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="relative inline-flex items-center">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as any)}
        aria-label="Pilih Bahasa / Language"
        className="appearance-none rounded-lg border border-[var(--line)] bg-[var(--bg)] py-1 pl-2 pr-5 text-xs font-bold uppercase text-[var(--text)] outline-none hover:border-slate-400 cursor-pointer shadow-sm"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.short} ({l.native})
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-1.5 text-[8px] text-[var(--muted)]">
        ▼
      </div>
    </div>
  );
}

/* ─── Dropdown bahasa ─── */
function LocaleDropdown({ align = "right" }: { align?: "left" | "right" }) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(() => setOpen(false), open);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("langChoose")}
        title={t("langChoose")}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[var(--muted)] transition hover:bg-[var(--line)] hover:text-[var(--text)]"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--text)]">
          {current.short}
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div
          role="listbox"
          className={`${PANEL} ${align === "right" ? "right-0" : "left-0"} w-56`}
        >
          {LOCALES.map((l) => {
            const active = locale === l.code;
            return (
              <button
                key={l.code}
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLocale(l.code as typeof locale);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs transition hover:bg-[var(--line)] ${
                  active
                    ? "text-[var(--text)] font-bold bg-[var(--line)]/50"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <span
                  className={`w-9 shrink-0 text-xs font-bold uppercase ${
                    active ? "text-[var(--acc-red)]" : "text-[var(--muted)]"
                  }`}
                >
                  {l.short}
                </span>
                <span className="min-w-0 flex-1 truncate">{l.native}</span>
                {l.needsReview && (
                  <span
                    title={t("langNeedsReview")}
                    className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[var(--acc-amber)]"
                  >
                    draf
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="7.5" cy="7.5" r="5" />
      <path d="M13 13l2.5 2.5" />
    </svg>
  );
}

/* ─── Komponen utama ─── */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userSession, setUserSession] = useState<{
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUserSession(data?.user ?? null))
      .catch(() => setUserSession(null));
  }, [pathname]);

  const themeTitle = theme === "dark" ? t("themeToLight") : t("themeToDark");

  if (pathname?.startsWith("/embed")) {
    return <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-3">{children}</main>;
  }

  return (
    <>
      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 whitespace-nowrap text-lg font-bold tracking-tight"
          >
            Pancasila<span className="text-[var(--acc-red)]">·</span>Index
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden flex-1 items-center gap-5 md:flex">
            <Link
              href="/"
              className={`text-sm transition hover:text-[var(--text)] ${
                pathname === "/"
                  ? "text-[var(--text)] font-semibold"
                  : "text-[var(--muted)]"
              }`}
            >
              {t("navHome")}
            </Link>
            <NavDropdown label={t("navExplore")} items={NAV_EXPLORE} />
            <NavDropdown label={t("navMethodData")} items={NAV_DATA} />
          </nav>

          {/* Kanan Desktop */}
          <div className="ml-auto hidden items-center gap-1.5 md:flex">
            <Link
              href="/cari"
              title={t("actSearch")}
              aria-label={t("actSearch")}
              className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--line)] hover:text-[var(--text)]"
            >
              <SearchIcon />
            </Link>

            <button
              onClick={toggleTheme}
              title={themeTitle}
              aria-label={themeTitle}
              className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--line)] hover:text-[var(--text)]"
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              )}
            </button>

            <LocaleDropdown />

            <span className="mx-1 h-5 w-px bg-[var(--line)]" aria-hidden="true" />

            <Link
              href="/peer-review"
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                pathname?.startsWith("/peer-review")
                  ? "border-red-500 bg-red-500/10 text-[var(--acc-red)]"
                  : "border-[var(--line)] text-[var(--muted)] hover:border-slate-500 hover:text-[var(--text)]"
              }`}
            >
              {t("actPeerReview")}
            </Link>

            {userSession ? (
              <Link
                href="/pengaturan"
                title={`${userSession.name || userSession.email} (${userSession.role})`}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  pathname === "/pengaturan"
                    ? "border-sky-500 bg-sky-500/10 text-[var(--acc-sky)]"
                    : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:border-slate-500 hover:text-[var(--text)]"
                }`}
              >
                <span className="size-2 rounded-full bg-emerald-400" />
                <span className="max-w-[100px] truncate">
                  {userSession.name?.split(" ")[0] || t("actSettings")}
                </span>
              </Link>
            ) : (
              <Link
                href="/masuk"
                className="rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-red-500"
              >
                {t("actSignIn")}
              </Link>
            )}
          </div>

          {/* Kanan Mobile */}
          <div className="ml-auto flex items-center gap-1.5 md:hidden">
            <Link
              href="/cari"
              aria-label={t("actSearch")}
              className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--line)] hover:text-[var(--text)]"
            >
              <SearchIcon />
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label={t("menuOpen")}
              className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--line)] hover:text-[var(--text)]"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
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
          <nav className="fixed top-0 right-0 z-50 flex h-full w-72 flex-col border-l border-[var(--line)] bg-[var(--panel)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
              <span className="text-base font-bold">
                Pancasila<span className="text-[var(--acc-red)]">·</span>Index
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label={t("menuClose")}
                className="rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--line)] hover:text-[var(--text)]"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M3 3l12 12M15 3L3 15" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
              <Link href="/" onClick={() => setDrawerOpen(false)} className="drawer-link">
                {t("navHome")}
              </Link>

              <p className="drawer-section">{t("navExplore")}</p>
              {NAV_EXPLORE.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} className="drawer-link">
                  {t(item.key)}
                </Link>
              ))}

              <p className="drawer-section">{t("navMethodData")}</p>
              {NAV_DATA.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} className="drawer-link">
                  {t(item.key)}
                </Link>
              ))}

              <p className="drawer-section">{t("secReview")}</p>
              <Link href="/peer-review" onClick={() => setDrawerOpen(false)} className="drawer-link font-semibold text-[var(--acc-red)]">
                {t("peerPortal")}
              </Link>

              <p className="drawer-section">{t("secAccount")}</p>
              {userSession ? (
                <Link href="/pengaturan" onClick={() => setDrawerOpen(false)} className="drawer-link font-semibold text-[var(--acc-sky)]">
                  {userSession.name || t("actSettings")} ({userSession.role})
                </Link>
              ) : (
                <div className="flex gap-2 px-1 pt-1">
                  <Link
                    href="/masuk"
                    onClick={() => setDrawerOpen(false)}
                    className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-red-500"
                  >
                    {t("actSignIn")}
                  </Link>
                  <Link
                    href="/daftar"
                    onClick={() => setDrawerOpen(false)}
                    className="flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-center text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--text)]"
                  >
                    {t("actRegister")}
                  </Link>
                </div>
              )}
            </div>

            {/* Footer Drawer: tema & bahasa */}
            <div className="space-y-3 border-t border-[var(--line)] px-5 py-4">
              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--text)]"
              >
                {theme === "dark" ? `🌙 ${t("themeDarkLabel")}` : `☀️ ${t("themeLightLabel")}`}
                <span className="ml-auto rounded border border-[var(--line)] px-2 py-0.5 text-xs">
                  {t("themeSwitch")}
                </span>
              </button>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--muted)] font-medium">🌐 {t("langChoose")}:</span>
                <MobileLocaleSelect />
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
          color: var(--text);
        }
        .drawer-section {
          padding: 0.75rem 0.5rem 0.25rem;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--muted);
        }
      `}</style>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-[var(--line)]">
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-8 text-xs leading-relaxed text-[var(--muted)]">
          <p>
            <strong className="text-[var(--text)]">{t("footerNote")}</strong>{" "}
            {t("footerDisclaimer")}
          </p>
        </div>
      </footer>
    </>
  );
}
