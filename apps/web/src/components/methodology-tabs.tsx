"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  badge?: string;
  content: ReactNode;
}

export function MethodologyTabs({ tabs }: { tabs: Tab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id || "");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Sinkronisasi dua arah dengan hash URL: tab dapat ditautkan langsung
  // (mis. /metodologi#skala dari halaman landasan-uud) dan tombol Back
  // peramban berpindah tab, bukan meninggalkan halaman.
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && tabs.some((t) => t.id === hash)) {
        setActiveId(hash);
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [tabs]);

  const selectTab = (id: string, viaKeyboard = false) => {
    setActiveId(id);
    if (typeof window !== "undefined" && window.location.hash !== `#${id}`) {
      window.history.pushState(null, "", `#${id}`);
    }
    if (viaKeyboard) tabRefs.current[id]?.focus();
  };

  // Navigasi papan ketik sesuai pola tab ARIA: panah, Home, End.
  const onKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const last = tabs.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = idx === last ? 0 : idx + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = idx === 0 ? last : idx - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    const target = next === null ? undefined : tabs[next];
    if (!target) return;
    e.preventDefault();
    selectTab(target.id, true);
  };

  if (!tabs.length) return null;

  const activeTab = tabs.find((t) => t.id === activeId);

  return (
    <div className="mt-8 flex flex-col md:flex-row items-start gap-8">
      {/* Sidebar Navigation */}
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label="Bagian metodologi"
        className="flex md:flex-col gap-2 overflow-x-auto w-full md:w-72 shrink-0 pb-2 md:pb-0 md:sticky top-24 no-scrollbar"
      >
        {tabs.map((tab, idx) => {
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => selectTab(tab.id)}
              onKeyDown={(e) => onKeyDown(e, idx)}
              className={`text-left px-4 py-3 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap md:whitespace-normal font-sans font-semibold border flex items-center justify-between gap-3 cursor-pointer ${
                isActive
                  ? "bg-[var(--text)] text-[var(--panel)] border-[var(--text)] shadow-sm"
                  : "bg-[var(--panel)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  aria-hidden="true"
                  className={`size-5 rounded-full flex items-center justify-center font-mono text-[10px] font-black shrink-0 ${
                    isActive
                      ? "bg-[var(--panel)] text-[var(--text)]"
                      : "bg-[var(--bg)] text-[var(--muted)]"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate md:whitespace-normal">{tab.label}</span>
              </div>
              {tab.badge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 font-bold ${
                    isActive
                      ? "bg-[var(--panel)]/20 text-[var(--panel)] border-transparent"
                      : "bg-[var(--acc-amber)]/10 text-[var(--acc-amber-strong)] border-[var(--acc-amber)]/30"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {/*
        `w-full` wajib: kontainer luar memakai `items-start`, sehingga pada
        susunan kolom (mobile) anak menyusut ke lebar max-content. Rumus KaTeX
        yang lebar akan mendorong panel melampaui viewport dan memotong teks.
        Dengan `w-full` + `min-w-0`, panel mengikuti lebar layar dan rumus yang
        lebar bergulir di dalam pembungkus overflow-x-auto miliknya sendiri.
      */}
      <div className="flex-1 w-full min-w-0 pb-20">
        <div
          key={activeId}
          id={`panel-${activeId}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeId}`}
          tabIndex={0}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {activeTab?.content}
        </div>
      </div>
    </div>
  );
}
