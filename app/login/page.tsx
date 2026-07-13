"use client";

import Link from "next/link";
import Image from "next/image";
import { useFormState, useFormStatus } from "react-dom";
import { studentLogin, adminLogin, type LoginState } from "@/app/actions";
import { Container } from "@/components/ui/Container";
import { Field, Input } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/Tabs";

const initial: LoginState = {};

function SubmitButton({ children, tone }: { children: string; tone: "brand" | "ink" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`h-[52px] w-full rounded-2xl text-base font-extrabold text-white transition-colors disabled:opacity-50 ${
        tone === "brand" ? "bg-brand hover:bg-brand-dark" : "bg-ink hover:bg-ink/90"
      }`}
    >
      {pending ? "처리 중…" : children}
    </button>
  );
}

function StudentForm() {
  const [state, action] = useFormState(studentLogin, initial);
  return (
    <form action={action} className="space-y-4">
      <Field label="아이디(username)">
        <Input name="username" autoComplete="username" placeholder="예: naplace" className="h-[50px]" />
      </Field>
      <Field label="비밀번호">
        <Input name="password" type="password" autoComplete="current-password" placeholder="비밀번호" className="h-[50px]" />
      </Field>
      {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
      <SubmitButton tone="brand">학생 로그인</SubmitButton>
      <p className="text-center text-xs text-muted">데모 계정 — naplace / 1234</p>
      <p className="text-center text-sm text-muted">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-bold text-brand hover:text-brand-dark">
          회원가입
        </Link>
      </p>
    </form>
  );
}

function AdminForm() {
  const [state, action] = useFormState(adminLogin, initial);
  return (
    <form action={action} className="space-y-4">
      <Field label="관리자 비밀번호">
        <Input name="password" type="password" autoComplete="off" placeholder="ADMIN_PASSWORD" className="h-[50px]" />
      </Field>
      {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
      <SubmitButton tone="ink">관리자 로그인</SubmitButton>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Container className="max-w-[440px] py-14">
      <div className="mb-6 flex flex-col items-center gap-2.5">
        <Image src="/logo.png" alt="NA'PLACE 로고" width={64} height={70} className="object-contain" priority />
        <div className="text-[22px] font-extrabold tracking-tight">
          NA&apos;PLACE <span className="text-brand">코인</span>
        </div>
        <div className="text-sm text-muted">학번으로 로그인하고 코인을 관리하세요</div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-7 shadow-card">
        <Tabs
          tabs={[
            { key: "student", label: "학생", content: <StudentForm /> },
            { key: "admin", label: "관리자", content: <AdminForm /> },
          ]}
        />
      </div>
    </Container>
  );
}
