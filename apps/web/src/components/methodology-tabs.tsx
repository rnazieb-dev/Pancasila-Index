"use client";

import { useState, type ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  badge?: string;
  content: ReactNode;
}

export function MethodologyTabs({ tabs }: { tabs: Tab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id || "");

  if (!tabs.length) return null;

  return (
    <div className="mt-8 flex flex-col md:flex-row items-start gap-8">
      {/* Sidebar Navigation */}
      <nav className="flex md:flex-col gap-2 overflow-x-auto w-full md:w-72 shrink-0 pb-2 md:pb-0 md:sticky top-24 no-scrollbar">
        {tabs.map((tab, idx) => {
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              className={`text-left px-4 py-3 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap md:whitespace-normal font-sans font-semibold border flex items-center justify-between gap-3 cursor-pointer ${
                isActive
                  ? "bg-[var(--text)] text-[var(--panel)] border-[var(--text)] shadow-sm"
                  : "bg-[var(--panel)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
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
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 pb-20">
        <div key={activeId} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {tabs.find((t) => t.id === activeId)?.content}
        </div>
      </div>
    </div>
  );
}
