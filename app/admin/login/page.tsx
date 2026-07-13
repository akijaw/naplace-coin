"use client";

import { useFormState, useFormStatus } from "react-dom";
import { adminLogin, type LoginState } from "@/app/actions";
import { Container } from "@/components/ui/Container";
import { Card, CardTitle, Field, Input } from "@/components/ui/primitives";

const initial: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-[52px] w-full rounded-2xl bg-ink text-base font-extrabold text-white transition-colors hover:bg-ink/90 disabled:opacity-50"
    >
      {pending ? "확인 중…" : "관리자 로그인"}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, action] = useFormState(adminLogin, initial);
  return (
    <Container className="max-w-md">
      <Card>
        <CardTitle className="text-center">관리자 로그인</CardTitle>
        <p className="mt-1 text-center text-sm text-muted">NA&apos;PLACE 코인 관리 콘솔</p>
        <form action={action} className="mt-6 space-y-4">
          <Field label="관리자 비밀번호">
            <Input name="password" type="password" autoComplete="off" placeholder="ADMIN_PASSWORD" />
          </Field>
          {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
          <SubmitButton />
        </form>
      </Card>
    </Container>
  );
}
