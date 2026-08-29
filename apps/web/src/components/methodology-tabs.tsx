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
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm"
                  : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`size-5 rounded-full flex items-center justify-center font-mono text-[10px] font-black shrink-0 ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate md:whitespace-normal">{tab.label}</span>
              </div>
              {tab.badge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900 border-transparent"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
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
