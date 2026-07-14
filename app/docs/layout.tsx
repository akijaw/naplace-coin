import type { ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg text-fg">{children}</div>
  );
}
