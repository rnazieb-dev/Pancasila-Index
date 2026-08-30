"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { LOCALES, type UiKey } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";

/* ─── Struktur navigasi: label sebagai kunci i18n dengan ikon pendukung ─── */
interface NavItem {
  href: string;
  key: UiKey;
  icon: string;
}

const NAV_EXPLORE: NavItem[] = [
  { href: "/lembaga", key: "navInstitutions", icon: "🏛️" },
  { href: "/timeline", key: "navTimeline", icon: "⏳" },
  { href: "/bandingkan", key: "navCompare", icon: "📊" },
  { href: "/aktor", key: "navActors", icon: "👥" },
];

const NAV_DATA: NavItem[] = [
  { href: "/metodologi", key: "navMethodology", icon: "📖" },
  { href: "/akar-sejarah", key: "navAkarSejarah", icon: "📜" },
  { href: "/arsip", key: "navArsip", icon: "🏛️" },
  { href: "/landasan-uud", key: "navUud", icon: "⚖️" },
  { href: "/ekspor", key: "navExport", icon: "📥" },
  { href: "/api-docs", key: "navApiDocs", icon: "⚡" },
  { href: "/kurasi/log", key: "navAuditLog", icon: "📋" },
];

const NAV_PEER_REVIEW: { href: string; label: string; icon: string }[] = [
  { href: "/peer-review", label: "Portal Peer Review", icon: "⚖️" },
  { href: "/peer-review/usulan", label: "Antrean Usulan Bukti", icon: "📑" },
  { href: "/peer-review/draf", label: "Draf Usulan Saya", icon: "📝" },
  { href: "/peer-review/terjemahan", label: "Tinjauan Bahasa", icon: "🌐" },
  { href: "/peer-review/import-data", label: "Audit Data CKAN", icon: "🗄️" },
];

/* ─── Helpers ─── */
function useTheme() {
  const [theme, setThemeState] = useState<"dark" | "light">("light");

  useEffect(() => {
    const saved = localStorage.getItem("pi-theme") as "dark" | "light" | null;
    const t = saved || "light";
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    localStorage.setItem("pi-theme", next);
    document.documentElement.setAttribute("data-theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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
      className={`mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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

/* ─── Dropdown navigasi desktop ─── */
function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(() => setOpen(false), open);
  const pathname = usePathname();
  const { t } = useLocale();

  const isActive = items.some((i) => pathname === i.href || (i.href !== "/" && pathname?.startsWith(i.href)));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-1.5 text-xs sm:text-sm transition-colors py-1 px-2 rounded-md hover:bg-[var(--line)]/50 hover:text-[var(--text)] ${
          isActive ? "text-[var(--text)] font-bold" : "text-[var(--muted)]"
        }`}
      >
        {label}
        <Chevron open={open} />
      </button>

      {open && (
        <div role="menu" className={`${PANEL} left-0 w-60 py-2`}>
          {items.map((item) => {
            const isItemActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2 text-xs transition hover:bg-[var(--line)] ${
                  isItemActive
                    ? "text-[var(--acc-red)] font-bold bg-[var(--line)]/30"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <span className="text-sm shrink-0">{item.icon}</span>
                <span className="truncate">{t(item.key)}</span>
              </Link>
            );
          })}
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
        className="appearance-none rounded-lg border border-[var(--line)] bg-[var(--bg)] py-1.5 pl-3 pr-7 text-xs font-bold uppercase text-[var(--text)] outline-none hover:border-slate-400 cursor-pointer shadow-xs"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.short} — {l.native}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2 text-[10px] text-[var(--muted)]">
        ▼
      </div>
    </div>
  );
}

/* ─── Dropdown bahasa Desktop ─── */
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
                className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs transition hover:bg-[var(--line)] ${
                  active
                    ? "text-[var(--text)] font-bold bg-[var(--line)]/50"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <span
                  className={`w-8 shrink-0 text-xs font-bold uppercase ${
                    active ? "text-[var(--acc-red)]" : "text-[var(--muted)]"
                  }`}
                >
                  {l.short}
                </span>
                <span className="min-w-0 flex-1 truncate">{l.native}</span>
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
      width="16"
      height="16"
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

  // Kunci scroll body saat drawer mobile terbuka
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const themeTitle = theme === "dark" ? t("themeToLight") : t("themeToDark");

  if (pathname?.startsWith("/embed")) {
    return <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-3">{children}</main>;
  }

  return (
    <>
      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 whitespace-nowrap text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-1"
          >
            <span>Pancasila</span>
            <span className="text-[var(--acc-red)]">·</span>
            <span>Index</span>
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden flex-1 items-center gap-2 md:flex">
            <Link
              href="/"
              className={`text-xs sm:text-sm py-1 px-2.5 rounded-md transition hover:bg-[var(--line)]/50 hover:text-[var(--text)] ${
                pathname === "/"
                  ? "text-[var(--text)] font-bold bg-[var(--line)]/40"
                  : "text-[var(--muted)]"
              }`}
            >
              {t("navHome")}
            </Link>
            <NavDropdown label={t("navExplore")} items={NAV_EXPLORE} />
            <NavDropdown label={t("navMethodData")} items={NAV_DATA} />
            <Link
              href="/usulkan-bukti"
              className={`text-xs sm:text-sm py-1 px-2.5 rounded-md transition hover:bg-[var(--line)]/50 hover:text-[var(--text)] ${
                pathname === "/usulkan-bukti"
                  ? "text-[var(--acc-emerald-strong)] font-bold bg-emerald-500/10"
                  : "text-[var(--muted)]"
              }`}
            >
              ⚖️ Usulkan Bukti
            </Link>
          </nav>

          {/* Kanan Desktop */}
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Link
              href="/cari"
              title={t("actSearch")}
              aria-label={t("actSearch")}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:border-slate-400 hover:text-[var(--text)]"
            >
              <SearchIcon />
              <span className="font-medium">Cari...</span>
              <kbd className="rounded bg-[var(--bg)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--muted)] border border-[var(--line)]">
                /
              </kbd>
            </Link>

            <button
              onClick={toggleTheme}
              title={themeTitle}
              aria-label={themeTitle}
              className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-2 text-[var(--muted)] transition hover:border-slate-400 hover:text-[var(--text)] cursor-pointer"
            >
              {theme === "dark" ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              )}
            </button>

            <LocaleDropdown />

            <span className="mx-0.5 h-4 w-px bg-[var(--line)]" aria-hidden="true" />

            {userSession && (
              <Link
                href="/peer-review"
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  pathname?.startsWith("/peer-review")
                    ? "border-red-500 bg-red-500/10 text-[var(--acc-red)]"
                    : "border-[var(--line)] text-[var(--muted)] hover:border-slate-400 hover:text-[var(--text)]"
                }`}
              >
                {t("actPeerReview")}
              </Link>
            )}

            {userSession ? (
              <Link
                href="/pengaturan"
                title={`${userSession.name || userSession.email} (${userSession.role})`}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  pathname === "/pengaturan"
                    ? "border-sky-500 bg-sky-500/10 text-[var(--acc-sky)]"
                    : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:border-slate-400 hover:text-[var(--text)]"
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
                className="rounded-lg bg-[var(--acc-red)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:opacity-90"
              >
                {t("actSignIn")}
              </Link>
            )}
          </div>

          {/* Kanan Mobile */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <Link
              href="/cari"
              aria-label={t("actSearch")}
              className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-2 text-[var(--muted)] transition hover:text-[var(--text)]"
            >
              <SearchIcon />
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label={t("menuOpen")}
              className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-2 text-[var(--muted)] transition hover:text-[var(--text)] cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE NAVIGATION DRAWER (Rapi & Lengkap) ═══ */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <nav className="fixed top-0 right-0 z-50 flex h-full w-[85vw] max-w-xs flex-col border-l border-[var(--line)] bg-[var(--panel)] shadow-2xl transition-transform duration-300 animate-in slide-in-from-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 bg-[var(--bg)]/50">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="text-base font-extrabold tracking-tight flex items-center gap-1"
              >
                <span>Pancasila</span>
                <span className="text-[var(--acc-red)]">·</span>
                <span>Index</span>
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label={t("menuClose")}
                className="rounded-lg p-1.5 border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] transition hover:bg-[var(--line)] hover:text-[var(--text)] cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M3 3l12 12M15 3L3 15" />
                </svg>
              </button>
            </div>

            {/* Quick Search Bar */}
            <div className="px-4 pt-3.5 pb-2">
              <Link
                href="/cari"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-xs text-[var(--muted)] hover:border-slate-400 hover:text-[var(--text)] transition shadow-2xs"
              >
                <SearchIcon />
                <span className="flex-1 truncate">Cari 650+ peristiwa & arsip...</span>
                <span className="text-[10px] font-mono opacity-60">/</span>
              </Link>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-2 divide-y divide-[var(--line)]/50">
              {/* Grup 1: Beranda & Usulan */}
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    pathname === "/"
                      ? "bg-[var(--line)] text-[var(--text)] font-bold shadow-2xs"
                      : "text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
                  }`}
                >
                  <span className="text-base">🏠</span>
                  <span>{t("navHome")}</span>
                </Link>
                <Link
                  href="/usulkan-bukti"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    pathname === "/usulkan-bukti"
                      ? "bg-emerald-500/15 text-[var(--acc-emerald-strong)] font-bold shadow-2xs"
                      : "text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
                  }`}
                >
                  <span className="text-base">⚖️</span>
                  <span>Usulkan Bukti Primer</span>
                </Link>
              </div>

              {/* Grup 2: Eksplorasi */}
              <div className="pt-3 space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  {t("navExplore")}
                </div>
                {NAV_EXPLORE.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition ${
                        isActive
                          ? "bg-[var(--line)] text-[var(--text)] font-bold shadow-2xs"
                          : "text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="truncate">{t(item.key)}</span>
                      </div>
                      {isActive && <span className="size-1.5 rounded-full bg-[var(--acc-red)] shrink-0" />}
                    </Link>
                  );
                })}
              </div>

              {/* Grup 3: Metodologi & Data Publik */}
              <div className="pt-3 space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  {t("navMethodData")}
                </div>
                {NAV_DATA.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href + "/"));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition ${
                        isActive
                          ? "bg-[var(--line)] text-[var(--text)] font-bold shadow-2xs"
                          : "text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="truncate">{t(item.key)}</span>
                      </div>
                      {isActive && <span className="size-1.5 rounded-full bg-[var(--acc-red)] shrink-0" />}
                    </Link>
                  );
                })}
              </div>

              {/* Grup 4: Kurasi & Peer Review (Untuk Kontributor yang Sign-in) */}
              {userSession && (
                <div className="pt-3 space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--acc-red)]">
                    {t("secReview")} ({userSession.role})
                  </div>
                  {NAV_PEER_REVIEW.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition ${
                          isActive
                            ? "bg-red-500/15 text-[var(--acc-red)] font-bold shadow-2xs"
                            : "text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-base shrink-0">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isActive && <span className="size-1.5 rounded-full bg-[var(--acc-red)] shrink-0" />}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Grup 5: Autentikasi / Akun */}
              <div className="pt-3 pb-4">
                <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  {t("secAccount")}
                </div>
                {userSession ? (
                  <Link
                    href="/pengaturan"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-slate-400 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-7 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {userSession.name?.charAt(0) || "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--text)] truncate">
                          {userSession.name || "Kontributor"}
                        </div>
                        <div className="text-[10px] text-[var(--muted)] font-mono truncate">
                          {userSession.role}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--muted)]">⚙️</span>
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/masuk"
                      onClick={() => setDrawerOpen(false)}
                      className="rounded-xl bg-[var(--acc-red)] py-2 text-center text-xs font-bold text-white shadow-xs transition hover:opacity-90"
                    >
                      {t("actSignIn")}
                    </Link>
                    <Link
                      href="/daftar"
                      onClick={() => setDrawerOpen(false)}
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)] py-2 text-center text-xs font-bold text-[var(--muted)] transition hover:text-[var(--text)] hover:border-slate-400"
                    >
                      {t("actRegister")}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Drawer: Theme Switcher & Language Selector */}
            <div className="space-y-2.5 border-t border-[var(--line)] p-4 bg-[var(--bg)]/70">
              {/* Theme Toggle Pill */}
              <button
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2 text-xs text-[var(--text)] transition hover:border-slate-400 cursor-pointer shadow-2xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <span>{theme === "dark" ? "🌙" : "☀️"}</span>
                  <span>{theme === "dark" ? t("themeDarkLabel") : t("themeLightLabel")}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-[var(--acc-sky)] bg-[var(--bg)] px-2 py-0.5 rounded border border-[var(--line)]">
                  {t("themeSwitch")}
                </span>
              </button>

              {/* Language Selector */}
              <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3.5 py-1.5 shadow-2xs">
                <span className="text-xs text-[var(--muted)] font-medium flex items-center gap-1.5">
                  <span>🌐</span>
                  <span>{t("langChoose")}:</span>
                </span>
                <MobileLocaleSelect />
              </div>
            </div>
          </nav>
        </>
      )}

      <main className="flex-1">{children}</main>

      {/* ═══ FOOTER ═══ */}
      <footer className="mt-16 border-t border-[var(--line)] bg-[var(--panel)]/40">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 text-xs leading-relaxed text-[var(--muted)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
            <Link href="/" className="text-base font-bold tracking-tight">
              Pancasila<span className="text-[var(--acc-red)]">·</span>Index
            </Link>
            <div className="flex flex-wrap gap-4 text-xs font-semibold">
              <Link href="/metodologi" className="hover:text-[var(--text)] transition">Metodologi</Link>
              <Link href="/arsip" className="hover:text-[var(--text)] transition">Khazanah Arsip</Link>
              <Link href="/kurasi/log" className="hover:text-[var(--text)] transition">Log Aktivitas Kurasi</Link>
              <Link href="/api-docs" className="hover:text-[var(--text)] transition">REST API</Link>
              <Link href="/ekspor" className="hover:text-[var(--text)] transition">Ekspor Data</Link>
            </div>
          </div>
          <p>
            <strong className="text-[var(--text)]">{t("footerNote")}</strong>{" "}
            {t("footerDisclaimer")}
          </p>
        </div>
      </footer>
    </>
  );
}
