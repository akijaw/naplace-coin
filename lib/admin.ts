import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { AppError } from "./errors";

export const ADMIN_COOKIE = "np_admin";

function secret(): string {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.");
  return s;
}

/** 관리자 비밀번호에서 파생된 쿠키 토큰. 비밀번호가 바뀌면 자동 무효화됩니다. */
export function signAdminToken(): string {
  return createHmac("sha256", secret()).update("naplace-admin-session").digest("hex");
}

/** 로그인 시 평문 비교 (보안 최소화 정책). */
export function verifyAdminPassword(password: string): boolean {
  return password === secret();
}

export function isValidAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = signAdminToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  return isValidAdminToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

export async function assertAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new AppError("관리자 권한이 필요합니다.", 401);
}
