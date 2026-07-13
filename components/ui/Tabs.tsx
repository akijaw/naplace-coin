"use client";

import { useState, type ReactNode } from "react";
import { cn } from "./primitives";

export interface TabDef {
  key: string;
  label: ReactNode;
  content: ReactNode;
}

export function Tabs({ tabs }: { tabs: TabDef[] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  return (
    <div>
      <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-subtle p-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
              active === t.key
                ? "bg-bg text-fg shadow-sm"
                : "text-muted hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6">{current?.content}</div>
    </div>
  );
}
