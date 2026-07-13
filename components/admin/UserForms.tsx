"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createUserAction, adjustBalance, type AdminState } from "@/app/admin/actions";
import { Card, CardTitle, Field, Input, buttonStyles } from "@/components/ui/primitives";
import type { ClubRow } from "@/lib/db/types";

const initial: AdminState = {};

function Submit({ label, busy }: { label: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonStyles("primary", "w-full")}>
      {pending ? busy : label}
    </button>
  );
}

function Result({ state }: { state: AdminState }) {
  if (state.error) return <p className="text-sm text-red-500">{state.error}</p>;
  if (state.ok) return <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.message}</p>;
  return null;
}

export function CreateUserForm({ clubs }: { clubs: ClubRow[] }) {
  const [state, action] = useFormState(createUserAction, initial);
  return (
    <Card>
      <CardTitle>사용자 생성</CardTitle>
      <form action={action} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="학번(ID)">
            <Input name="id" placeholder="예: 2605" />
          </Field>
          <Field label="이름">
            <Input name="name" placeholder="예: 오일러" />
          </Field>
          <Field label="아이디(username)">
            <Input name="username" placeholder="예: euler" />
          </Field>
          <Field label="비밀번호">
            <Input name="password" placeholder="기본값 1234" />
          </Field>
          <Field label="초기 코인(선택)">
            <Input name="balance" placeholder="예: 1000" inputMode="numeric" />
          </Field>
          <Field label="소속 부스(선택)">
            <select
              name="clubId"
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-fg/40"
            >
              <option value="">없음</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Result state={state} />
        <Submit label="사용자 생성" busy="생성 중…" />
      </form>
    </Card>
  );
}

export function AdjustBalanceForm() {
  const [state, action] = useFormState(adjustBalance, initial);
  return (
    <Card>
      <CardTitle>잔액 조정</CardTitle>
      <p className="mt-1 text-sm text-muted">사용자 코인을 지급하거나 회수합니다 (원장에 기록).</p>
      <form action={action} className="mt-5 space-y-4">
        <Field label="사용자 ID(학번)">
          <Input name="userId" placeholder="예: 2601" inputMode="numeric" />
        </Field>
        <Field label="금액(코인)">
          <Input name="amount" placeholder="예: 100" inputMode="numeric" />
        </Field>
        <Field label="유형">
          <select
            name="direction"
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-fg/40"
          >
            <option value="grant">지급 (+)</option>
            <option value="deduct">회수 (−)</option>
          </select>
        </Field>
        <Field label="사유(선택)">
          <Input name="reason" placeholder="예: 오류 보정" />
        </Field>
        <Result state={state} />
        <Submit label="잔액 조정" busy="조정 중…" />
      </form>
    </Card>
  );
}
