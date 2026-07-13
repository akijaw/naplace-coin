import type { ReactNode } from "react";
import { cn } from "./primitives";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-content px-4 py-8 sm:py-10", className)}>
      {children}
    </div>
  );
}
