import type { ReactNode } from "react";
import { cn } from "@/components/ui/primitives";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">
      {children}
    </div>
  );
}

/* GET = 조회(blue), POST = 실행(brand). 앱 전반의 blue=읽기 / orange=액션 규칙과 일치. */
const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue",
  POST: "bg-brand",
};

export function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-extrabold tracking-wide text-white",
        METHOD_COLORS[method] ?? "bg-ink",
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
    <h2 id={id} className="scroll-mt-24 text-2xl font-extrabold tracking-tight">
      {children}
    </h2>
  );
}

export function EndpointHeading({ method, path }: { method: string; path: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-border bg-subtle px-3.5 py-2.5">
      <MethodBadge method={method} />
      <code className="font-mono text-[15px] font-bold text-fg">{path}</code>
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
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <tbody>
          {fields.map((f) => (
            <tr key={f.name} className="border-b border-border last:border-0">
              <td className="whitespace-nowrap px-4 py-2.5 align-top font-mono font-bold text-fg">
                {f.name}
              </td>
              <td className="whitespace-nowrap px-2 py-2.5 align-top">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                    f.required
                      ? "bg-brand/10 text-brand-dark dark:text-brand"
                      : "bg-subtle text-muted",
                  )}
                >
                  {f.required ? "필수" : "선택"}
                </span>
              </td>
              <td className="px-4 py-2.5 align-top text-muted">{f.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
