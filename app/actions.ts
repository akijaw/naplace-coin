"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserByLogin, getUserById, getUserByUsername, createUser } from "@/lib/db/users";
import { ADMIN_COOKIE, signAdminToken, verifyAdminPassword } from "@/lib/admin";
import { SESSION_COOKIE, makeSessionValue } from "@/lib/session";

export type LoginState = { error?: string };

/** 학생 세션 쿠키 발급 (로그인·회원가입 공용). */
async function startStudentSession(id: string) {
  (await cookies()).set(SESSION_COOKIE, makeSessionValue(id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function studentLogin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "아이디와 비밀번호를 입력하세요." };

  const user = await getUserByLogin(username, password);
  if (!user) return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };

  await startStudentSession(user.id);
  redirect("/wallet");
}

export async function signup(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("passwordConfirm") ?? "");

  // 1) 필수/형식 검증
  if (!id || !name || !username || !password) return { error: "모든 항목을 입력하세요." };
  if (!/^\d{3,6}$/.test(id)) return { error: "학번은 3~6자리 숫자여야 합니다." };
  if (!/^[A-Za-z0-9_]{2,20}$/.test(username))
    return { error: "아이디는 영문/숫자/밑줄 2~20자여야 합니다." };
  if (password.length < 4) return { error: "비밀번호는 4자 이상이어야 합니다." };
  if (password !== confirm) return { error: "비밀번호가 일치하지 않습니다." };

  // 2) 중복 사전 확인 (친절한 메시지)
  if (await getUserById(id)) return { error: "이미 등록된 학번입니다." };
  if (await getUserByUsername(username)) return { error: "이미 사용 중인 아이디입니다." };

  // 3) 저장 — 사전확인과 INSERT 사이 경합은 UNIQUE/PK 제약이 backstop
  try {
    await createUser({ id, username, password, name }); // balance=0, clubId=null
  } catch {
    return { error: "이미 등록된 학번 또는 아이디입니다." };
  }

  // 4) 자동 로그인 → 지갑 (redirect 는 내부적으로 throw 하므로 try/catch 밖)
  await startStudentSession(id);
  redirect("/wallet");
}

export async function adminLogin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!verifyAdminPassword(password)) {
    return { error: "관리자 비밀번호가 올바르지 않습니다." };
  }
  (await cookies()).set(ADMIN_COOKIE, signAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}

export async function adminLogout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
