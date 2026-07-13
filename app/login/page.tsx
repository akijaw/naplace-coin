"use client";

import { useFormState, useFormStatus } from "react-dom";
import { studentLogin, adminLogin, type LoginState } from "@/app/actions";
import { Container } from "@/components/ui/Container";
import { Card, CardTitle, Field, Input, buttonStyles } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/Tabs";

const initial: LoginState = {};

function SubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonStyles("primary", "w-full")}>
      {pending ? "처리 중…" : children}
    </button>
  );
}

function StudentForm() {
  const [state, action] = useFormState(studentLogin, initial);
  return (
    <form action={action} className="space-y-4">
      <Field label="아이디(username)">
        <Input name="username" autoComplete="username" placeholder="예: naplace" />
      </Field>
      <Field label="비밀번호">
        <Input name="password" type="password" autoComplete="current-password" placeholder="비밀번호" />
      </Field>
      {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
      <SubmitButton>학생 로그인</SubmitButton>
      <p className="text-center text-xs text-muted">데모 계정 — naplace / 1234</p>
    </form>
  );
}

function AdminForm() {
  const [state, action] = useFormState(adminLogin, initial);
  return (
    <form action={action} className="space-y-4">
      <Field label="관리자 비밀번호">
        <Input name="password" type="password" autoComplete="off" placeholder="ADMIN_PASSWORD" />
      </Field>
      {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
      <SubmitButton>관리자 로그인</SubmitButton>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Container className="max-w-md">
      <Card>
        <CardTitle className="text-center">NA&apos;PLACE 코인 로그인</CardTitle>
        <div className="mt-6">
          <Tabs
            tabs={[
              { key: "student", label: "학생", content: <StudentForm /> },
              { key: "admin", label: "관리자", content: <AdminForm /> },
            ]}
          />
        </div>
      </Card>
    </Container>
  );
}
