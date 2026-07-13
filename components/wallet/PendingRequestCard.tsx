"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { approveRequest, rejectRequest, type ActionState } from "@/app/wallet/actions";
import { buttonStyles } from "@/components/ui/primitives";
import { formatCoin, secondsUntil } from "@/lib/format";

const initial: ActionState = {};

function ActionButton({
  variant,
  children,
}: {
  variant: "primary" | "secondary";
  children: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonStyles(variant, "flex-1")}>
      {pending ? "처리 중…" : children}
    </button>
  );
}

export function PendingRequestCard({
  id,
  amount,
  title,
  clubName,
  expiresAt,
}: {
  id: string;
  amount: number;
  title: string | null;
  clubName: string | null;
  expiresAt: string;
}) {
  const [approveState, approveAction] = useFormState(approveRequest, initial);
  const [rejectState, rejectAction] = useFormState(rejectRequest, initial);
  const [remaining, setRemaining] = useState(() => secondsUntil(expiresAt));

  useEffect(() => {
    const t = setInterval(() => setRemaining(secondsUntil(expiresAt)), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const error = approveState.error || rejectState.error;

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
          결제 요청 대기중
        </span>
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
          {remaining}초 남음
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold">{formatCoin(amount)}</span>
        <span className="text-sm text-muted">코인 결제</span>
      </div>
      <p className="mt-1 text-sm text-muted">
        {clubName ? `${clubName} · ` : ""}
        {title || "결제 요청"}
      </p>

      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}

      <div className="mt-4 flex gap-2">
        <form action={approveAction} className="flex-1">
          <input type="hidden" name="id" value={id} />
          <ActionButton variant="primary">승인</ActionButton>
        </form>
        <form action={rejectAction} className="flex-1">
          <input type="hidden" name="id" value={id} />
          <ActionButton variant="secondary">거절</ActionButton>
        </form>
      </div>
    </div>
  );
}
