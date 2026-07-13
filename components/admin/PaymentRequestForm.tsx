"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createAdminPaymentRequest, type AdminState } from "@/app/admin/actions";
import { Card, CardTitle, Field, Input, buttonStyles } from "@/components/ui/primitives";
import type { ClubRow } from "@/lib/db/types";

const initial: AdminState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonStyles("primary", "w-full")}>
      {pending ? "요청 생성 중…" : "결제 요청 생성"}
    </button>
  );
}

export function PaymentRequestForm({ clubs }: { clubs: ClubRow[] }) {
  const [state, action] = useFormState(createAdminPaymentRequest, initial);
  return (
    <Card>
      <CardTitle>결제 요청 생성</CardTitle>
      <p className="mt-1 text-sm text-muted">
        학생에게 결제 요청을 보냅니다. 학생이 지갑에서 승인하면 코인이 이동합니다 (120초 후 만료).
      </p>
      <form action={action} className="mt-5 space-y-4">
        <Field label="사용자 ID(학번)">
          <Input name="studentId" placeholder="예: 2601" inputMode="numeric" />
        </Field>
        <Field label="청구 부스">
          <select
            name="clubId"
            className="w-full rounded-2xl border border-border bg-subtle px-4 py-3 text-sm outline-none focus:border-brand"
          >
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </Field>
        <Field label="금액(코인)">
          <Input name="amount" placeholder="예: 500" inputMode="numeric" />
        </Field>
        <Field label="사유(선택)">
          <Input name="title" placeholder="예: 몬티홀 칩 구매" />
        </Field>
        {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
        {state.ok ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.message}</p> : null}
        <SubmitButton />
      </form>
    </Card>
  );
}
