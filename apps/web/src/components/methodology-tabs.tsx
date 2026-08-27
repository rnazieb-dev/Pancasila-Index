"use client";

import { useState, type ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

export function MethodologyTabs({ tabs }: { tabs: Tab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id || "");

  if (!tabs.length) return null;

  return (
    <div className="mt-8 flex flex-col md:flex-row items-start gap-8">
      {/* Sidebar Navigation */}
      <nav className="flex md:flex-col gap-2 overflow-x-auto w-full md:w-64 shrink-0 pb-2 md:pb-0 md:sticky top-24 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              className={`text-left px-4 py-3 rounded-xl text-sm transition-all whitespace-nowrap md:whitespace-normal font-medium border ${
                isActive
                  ? "bg-[var(--text)] text-[var(--bg)] border-[var(--text)] shadow-sm"
                  : "bg-transparent border-transparent text-[var(--muted)] hover:bg-[var(--line)] hover:text-[var(--text)]"
              }`}
            >
              {tab.label}
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
