"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LOCALES } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";

const NAV = [
  { href: "/", key: "navHome" },
  { href: "/timeline", key: "navTimeline" },
  { href: "/lembaga", key: "navInstitutions" },
  { href: "/landasan-uud", key: "navUud" },
  { href: "/metodologi", key: "navMethodology" },
  { href: "/kurasi", key: "navCuration" },
];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const { locale, setLocale, t } = useLocale();
  const pathname = usePathname();

  return (
    <>
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-5">
          <Link href="/" className="font-bold tracking-tight text-lg whitespace-nowrap">
            Pancasila<span className="text-red-500">·</span>Index
          </Link>
          <nav className="flex gap-4 text-sm text-[var(--muted)] overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-white whitespace-nowrap ${
                  pathname === item.href ? "text-white" : ""
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex gap-1 shrink-0">
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
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--line)] mt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs leading-relaxed text-[var(--muted)] space-y-2">
          <p>
            <strong className="text-[var(--text)]">{t("footerNote")}</strong>{" "}
            {t("footerDisclaimer")}
          </p>
          <p>{t("footerLicense")}</p>
        </div>
      </footer>
    </>
  );
}
