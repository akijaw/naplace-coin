import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { getUserById } from "./db/users";
import { AppError } from "./errors";
import type { UserRow } from "./db/types";

export const SESSION_COOKIE = "np_user";

function secret(): string {
  return process.env.ADMIN_PASSWORD || "naplace-dev-secret";
}

function sign(id: string): string {
  return createHmac("sha256", secret()).update(id).digest("hex").slice(0, 16);
}

export function makeSessionValue(id: string): string {
  return `${id}.${sign(id)}`;
}

export function parseSession(val: string | undefined): string | null {
  if (!val) return null;
  const i = val.lastIndexOf(".");
  if (i < 0) return null;
  const id = val.slice(0, i);
  const sig = val.slice(i + 1);
  return sign(id) === sig ? id : null;
}

export async function getSessionUserId(): Promise<string | null> {
  return parseSession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function getSessionUser(): Promise<UserRow | null> {
  const id = await getSessionUserId();
  if (!id) return null;
  return getUserById(id);
}

export async function assertStudent(): Promise<UserRow> {
  const u = await getSessionUser();
  if (!u) throw new AppError("로그인이 필요합니다.", 401);
  return u;
}
