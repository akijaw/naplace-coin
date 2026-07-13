"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserByLogin } from "@/lib/db/users";
import { ADMIN_COOKIE, signAdminToken, verifyAdminPassword } from "@/lib/admin";
import { SESSION_COOKIE, makeSessionValue } from "@/lib/session";

export type LoginState = { error?: string };

export async function studentLogin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "아이디와 비밀번호를 입력하세요." };

  const user = await getUserByLogin(username, password);
  if (!user) return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };

  (await cookies()).set(SESSION_COOKIE, makeSessionValue(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
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
