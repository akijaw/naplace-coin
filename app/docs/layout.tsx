import type { ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f4efe4] text-stone-900 dark:bg-[#1b1917] dark:text-stone-100">
      {children}
    </div>
  );
}
