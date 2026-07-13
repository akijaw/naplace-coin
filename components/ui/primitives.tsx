import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------- Card ---------- */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-card border border-border bg-card p-6 sm:p-8", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-lg font-extrabold tracking-tight sm:text-xl", className)}>
      {children}
    </h2>
  );
}

/* ---------- Button ---------- */
type Variant = "primary" | "secondary" | "ghost" | "danger";

export function buttonStyles(variant: Variant = "primary", className?: string): string {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<Variant, string> = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    secondary: "border border-border bg-card text-fg hover:bg-subtle",
    ghost: "text-muted hover:text-fg hover:bg-subtle",
    danger: "border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20",
  };
  return cn(base, variants[variant], className);
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: { variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonStyles(variant, className)} {...props}>
      {children}
    </button>
  );
}

/* ---------- Form fields ---------- */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-bold text-fg/80">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-border bg-subtle px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-brand",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-2xl border border-border bg-subtle px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-brand",
        className,
      )}
      {...props}
    />
  );
}

/* ---------- Misc ---------- */
export function Callout({
  title,
  children,
  tone = "default",
}: {
  title?: string;
  children: ReactNode;
  tone?: "default" | "warn";
}) {
  const tones = {
    default: "border-border bg-subtle",
    warn: "border-amber-500/40 bg-amber-500/10",
  };
  return (
    <div className={cn("rounded-xl border p-4 text-sm leading-relaxed", tones[tone])}>
      {title ? <div className="mb-1 font-bold">{title}</div> : null}
      <div className="text-muted">{children}</div>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
  expired: "bg-zinc-500/15 text-muted",
  canceled: "bg-zinc-500/15 text-muted",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "대기중",
  approved: "승인됨",
  rejected: "거절됨",
  expired: "만료됨",
  canceled: "취소됨",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        STATUS_STYLES[status] ?? "bg-subtle text-muted",
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function Divider() {
  return <hr className="my-8 border-border" />;
}

export function IconCircle({
  children,
  tone = "purple",
}: {
  children: ReactNode;
  tone?: "purple" | "green" | "blue";
}) {
  const tones = {
    purple: "bg-orange-tint text-brand",
    green: "bg-blue-tint text-blue",
    blue: "bg-blue-tint text-blue",
  };
  return (
    <div className={cn("flex h-14 w-14 items-center justify-center rounded-full", tones[tone])}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="text-[13px] font-semibold text-muted">{label}</div>
      <div className="mt-1.5 text-2xl font-extrabold tracking-tight">{value}</div>
      {sub ? <div className="mt-1 text-xs text-muted">{sub}</div> : null}
    </div>
  );
}
