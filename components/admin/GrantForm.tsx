"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { grantCoins, adminLookupUser, type AdminState } from "@/app/admin/actions";
import { Card, CardTitle, Field, Input, buttonStyles } from "@/components/ui/primitives";
import { formatCoin } from "@/lib/format";

const initial: AdminState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonStyles("primary", "w-full")}>
      {pending ? "지급 중…" : "코인 지급"}
    </button>
  );
}

export function GrantForm() {
  const [state, action] = useFormState(grantCoins, initial);
  const [preview, setPreview] = useState<string | null>(null);

  async function lookup(id: string) {
    const v = id.trim();
    if (!v) return setPreview(null);
    const u = await adminLookupUser(v);
    setPreview(u ? `${u.name} · 현재 ${formatCoin(u.balance)}코인` : "사용자를 찾을 수 없습니다.");
  }

  return (
    <Card>
      <CardTitle>코인 지급</CardTitle>
      <p className="mt-1 text-sm text-muted">현금 충전 등 관리자가 사용자에게 코인을 지급(발행)합니다.</p>
      <form action={action} className="mt-5 space-y-4">
        <Field label="사용자 ID(학번)">
          <Input name="userId" placeholder="예: 2601" inputMode="numeric" onBlur={(e) => lookup(e.target.value)} />
        </Field>
        {preview ? <p className="-mt-2 text-sm text-muted">{preview}</p> : null}
        <Field label="금액(코인)">
          <Input name="amount" placeholder="예: 100" inputMode="numeric" />
        </Field>
        <Field label="사유(선택)">
          <Input name="reason" placeholder="예: 현금 충전" />
        </Field>
        {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
        {state.ok ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.message}</p> : null}
        <SubmitButton />
      </form>
    </Card>
  );
}
