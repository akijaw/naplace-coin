import type { ReactNode } from "react";
import { cn } from "@/components/ui/primitives";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-500">
      {children}
    </div>
  );
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-sky-600",
  POST: "bg-emerald-600",
};

export function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold text-white",
        METHOD_COLORS[method] ?? "bg-stone-600",
      )}
    >
      {method}
    </span>
  );
}

export function DocSection({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      {children}
    </section>
  );
}

export function DocH2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 font-serif text-2xl font-bold tracking-tight">
      <span className="text-amber-700 dark:text-amber-500">§</span> {children}
    </h2>
  );
}

export function EndpointHeading({ method, path }: { method: string; path: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <MethodBadge method={method} />
      <code className="font-mono text-lg font-semibold">{path}</code>
    </div>
  );
}

export interface FieldDef {
  name: string;
  required?: boolean;
  desc: string;
}

export function FieldTable({ fields }: { fields: FieldDef[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-300 dark:border-stone-700">
      <table className="w-full text-sm">
        <tbody>
          {fields.map((f) => (
            <tr
              key={f.name}
              className="border-b border-stone-200 last:border-0 dark:border-stone-800"
            >
              <td className="whitespace-nowrap px-4 py-2.5 align-top font-mono font-semibold">
                {f.name}
              </td>
              <td className="whitespace-nowrap px-2 py-2.5 align-top">
                <span
                  className={cn(
                    "text-xs font-semibold",
                    f.required ? "text-red-600 dark:text-red-400" : "text-stone-500",
                  )}
                >
                  {f.required ? "필수" : "선택"}
                </span>
              </td>
              <td className="px-4 py-2.5 align-top text-stone-600 dark:text-stone-300">
                {f.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
