import { CopyButton } from "./CopyButton";

export function CodeBlock({
  code,
  label,
}: {
  code: string;
  label?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100">
      {label ? (
        <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-2">
          <span className="text-xs font-semibold text-zinc-400">{label}</span>
          <CopyButton value={code} className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" />
        </div>
      ) : null}
      <div className="relative">
        {!label ? (
          <div className="absolute right-2 top-2">
            <CopyButton value={code} className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" />
          </div>
        ) : null}
        <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed">
          <code className="font-mono">{code}</code>
        </pre>
      </div>
    </div>
  );
}
