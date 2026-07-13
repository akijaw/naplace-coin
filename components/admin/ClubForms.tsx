"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  createClubAction,
  issueKeyAction,
  rotateKeyAction,
  type AdminState,
} from "@/app/admin/actions";
import { Card, CardTitle, Field, Input, buttonStyles } from "@/components/ui/primitives";
import { CopyButton } from "@/components/ui/CopyButton";
import type { ClubRow } from "@/lib/db/types";

const initial: AdminState = {};

function Submit({ label, busy, variant = "primary" }: { label: string; busy: string; variant?: "primary" | "secondary" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonStyles(variant, "w-full")}>
      {pending ? busy : label}
    </button>
  );
}

export function CreateClubForm() {
  const [state, action] = useFormState(createClubAction, initial);
  return (
    <Card>
      <CardTitle>부스 생성</CardTitle>
      <p className="mt-1 text-sm text-muted">몬티홀 도박 부스 등 API 로 연동할 부스를 만듭니다.</p>
      <form action={action} className="mt-5 space-y-4">
        <Field label="부스 ID(슬러그)">
          <Input name="id" placeholder="예: montyhall" />
        </Field>
        <Field label="부스 이름">
          <Input name="name" placeholder="예: 몬티홀 도박 부스" />
        </Field>
        <Field label="초기 금고 잔액(선택)">
          <Input name="balance" placeholder="예: 1000000" inputMode="numeric" />
        </Field>
        {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
        {state.ok ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.message}</p> : null}
        <Submit label="부스 생성" busy="생성 중…" />
      </form>
    </Card>
  );
}

export function KeyIssueForm({ clubs }: { clubs: ClubRow[] }) {
  const [issueState, issueAction] = useFormState(issueKeyAction, initial);
  const [rotateState, rotateAction] = useFormState(rotateKeyAction, initial);
  const [clubId, setClubId] = useState(clubs[0]?.id ?? "");

  const secret = issueState.secret || rotateState.secret;
  const message = issueState.message || rotateState.message;
  const error = issueState.error || rotateState.error;

  return (
    <Card>
      <CardTitle>API 키 발급 / 재발급</CardTitle>
      <p className="mt-1 text-sm text-muted">부스별 X-API-Key 를 발급합니다. 몬티홀 사이트에 이 키를 넣으세요.</p>

      <div className="mt-5 space-y-4">
        <Field label="부스">
          <select
            value={clubId}
            onChange={(e) => setClubId(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-fg/40"
          >
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-2 sm:grid-cols-2">
          <form action={issueAction}>
            <input type="hidden" name="clubId" value={clubId} />
            <input type="hidden" name="label" value="추가 키" />
            <Submit label="새 키 발급" busy="발급 중…" />
          </form>
          <form action={rotateAction}>
            <input type="hidden" name="clubId" value={clubId} />
            <Submit label="재발급(기존 무효화)" busy="재발급 중…" variant="secondary" />
          </form>
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {secret ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
            <div className="text-sm font-bold">{message}</div>
            <div className="mt-2 flex items-center gap-2 overflow-x-auto rounded-lg bg-zinc-900 px-3 py-2 text-zinc-100">
              <code className="whitespace-nowrap font-mono text-sm">{secret}</code>
              <CopyButton value={secret} className="ml-auto text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" />
            </div>
          </div>
        ) : message ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
        ) : null}
      </div>
    </Card>
  );
}
