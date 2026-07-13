"use client";

import Link from "next/link";
import Image from "next/image";
import { useFormState, useFormStatus } from "react-dom";
import { signup } from "@/app/actions";
import type { LoginState } from "@/app/actions";
import { Container } from "@/components/ui/Container";
import { Field, Input } from "@/components/ui/primitives";

const initial: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-[52px] w-full rounded-2xl bg-brand text-base font-extrabold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
    >
      {pending ? "처리 중…" : "회원가입"}
    </button>
  );
}

function SignupForm() {
  const [state, action] = useFormState(signup, initial);
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="학번(ID)">
          <Input name="id" inputMode="numeric" placeholder="예: 2605" className="h-[50px]" />
        </Field>
        <Field label="이름">
          <Input name="name" placeholder="예: 오일러" className="h-[50px]" />
        </Field>
      </div>
      <Field label="아이디(username)">
        <Input name="username" autoComplete="username" placeholder="예: euler" className="h-[50px]" />
      </Field>
      <Field label="비밀번호">
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="4자 이상"
          className="h-[50px]"
        />
      </Field>
      <Field label="비밀번호 확인">
        <Input
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          placeholder="비밀번호 재입력"
          className="h-[50px]"
        />
      </Field>
      {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}

export default function SignupPage() {
  return (
    <Container className="max-w-[440px] py-14">
      <div className="mb-6 flex flex-col items-center gap-2.5">
        <Image src="/logo.png" alt="NA'PLACE 로고" width={64} height={70} className="object-contain" priority />
        <div className="text-[22px] font-extrabold tracking-tight">
          NA&apos;PLACE <span className="text-brand">코인</span>
        </div>
        <div className="text-sm text-muted">회원가입하고 코인을 받아보세요</div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-7 shadow-card">
        <SignupForm />
      </div>
      <p className="mt-5 text-center text-sm text-muted">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-bold text-brand hover:text-brand-dark">
          로그인
        </Link>
      </p>
    </Container>
  );
}
