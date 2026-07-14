"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin";
import { adminGrant, adminDeduct, adminFundClub } from "@/lib/db/transactions";
import { getUserById, createUser, setUserActive } from "@/lib/db/users";
import { createClub, getClubById } from "@/lib/db/clubs";
import { issueApiKey, rotateApiKey, setApiKeyActive } from "@/lib/db/apiKeys";
import { createPaymentRequest, cancelPaymentRequest } from "@/lib/db/paymentRequests";
import { parseAmount } from "@/lib/validate";
import { AppError } from "@/lib/errors";
import type { Direction } from "@/lib/db/types";

export type AdminState = {
  ok?: boolean;
  message?: string;
  error?: string;
  secret?: string; // 발급된 API 키 등 1회성 노출
};

function fail(e: unknown): AdminState {
  return { error: e instanceof AppError ? e.message : "처리 중 오류가 발생했습니다." };
}

function s(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/grant");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/users");
  revalidatePath("/admin/clubs");
  revalidatePath("/admin/transactions");
}

/* ---------- 코인 지급 (must-have) ---------- */
export async function grantCoins(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await assertAdmin();
    const userId = s(formData, "userId");
    if (!userId) return { error: "사용자 ID(학번)를 입력하세요." };
    const amount = parseAmount(formData.get("amount"));
    const reason = s(formData, "reason") || "관리자 지급";
    await adminGrant(userId, amount, reason);
    const u = await getUserById(userId);
    revalidateAdmin();
    return {
      ok: true,
      message: `지급 완료: ${u?.name ?? userId} +${amount}코인 (잔액 ${u?.balance ?? "?"})`,
    };
  } catch (e) {
    return fail(e);
  }
}

/** 사용자 잔액 조정 (지급 또는 회수). */
export async function adjustBalance(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await assertAdmin();
    const userId = s(formData, "userId");
    if (!userId) return { error: "사용자 ID를 입력하세요." };
    const amount = parseAmount(formData.get("amount"));
    const direction = s(formData, "direction");
    const reason = s(formData, "reason") || "관리자 조정";
    if (direction === "deduct") await adminDeduct(userId, amount, reason);
    else await adminGrant(userId, amount, reason);
    const u = await getUserById(userId);
    revalidateAdmin();
    return { ok: true, message: `조정 완료: ${u?.name ?? userId} (잔액 ${u?.balance ?? "?"})` };
  } catch (e) {
    return fail(e);
  }
}

/** 실시간 사용자 조회 (지급 전 미리보기용). */
export async function adminLookupUser(
  userId: string,
): Promise<{ name: string; balance: number } | null> {
  await assertAdmin();
  const u = await getUserById(userId.trim());
  return u ? { name: u.name, balance: u.balance } : null;
}

/* ---------- 자동 결제 ---------- */
export async function createAdminPaymentRequest(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  try {
    await assertAdmin();
    const studentId = s(formData, "studentId");
    const clubId = s(formData, "clubId");
    if (!studentId || !clubId) return { error: "학생 ID와 청구 부스를 선택하세요." };
    const amount = parseAmount(formData.get("amount"));
    const title = s(formData, "title") || null;
    await createPaymentRequest({ studentId, clubId, amount, title });
    revalidateAdmin();
    return { ok: true, message: "자동 결제가 완료되었습니다." };
  } catch (e) {
    return fail(e);
  }
}

export async function cancelAdminRequest(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = s(formData, "id");
  try {
    await cancelPaymentRequest(id);
  } catch {
    /* 이미 처리됨 — 무시 */
  }
  revalidateAdmin();
}

/* ---------- 사용자 관리 ---------- */
export async function createUserAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await assertAdmin();
    const id = s(formData, "id");
    const username = s(formData, "username");
    const password = s(formData, "password") || "1234";
    const name = s(formData, "name");
    const clubId = s(formData, "clubId") || null;
    if (!id || !username || !name) return { error: "학번, 아이디, 이름은 필수입니다." };
    await createUser({ id, username, password, name, balance: 0, clubId });
    const initial = Number(formData.get("balance") ?? 0);
    if (Number.isFinite(initial) && initial > 0) {
      await adminGrant(id, Math.trunc(initial), "계정 생성 초기 지급");
    }
    revalidateAdmin();
    return { ok: true, message: `사용자 생성: ${name} (${id})` };
  } catch (e) {
    return fail(e);
  }
}

export async function toggleUserActive(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = s(formData, "id");
  const active = s(formData, "active") === "1";
  await setUserActive(id, active);
  revalidateAdmin();
}

/* ---------- 부스 & API 키 관리 ---------- */
export async function createClubAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await assertAdmin();
    const id = s(formData, "id");
    const name = s(formData, "name");
    if (!id || !name) return { error: "부스 ID(슬러그)와 이름은 필수입니다." };
    const balanceRaw = Number(formData.get("balance") ?? 0);
    const balance = Number.isFinite(balanceRaw) && balanceRaw > 0 ? Math.trunc(balanceRaw) : 0;
    await createClub({ id, name, balance });
    revalidateAdmin();
    return { ok: true, message: `부스 생성: ${name} (${id})` };
  } catch (e) {
    return fail(e);
  }
}

export async function depositClubAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await assertAdmin();
    const clubId = s(formData, "clubId");
    if (!clubId) return { error: "부스를 선택하세요." };
    const amount = parseAmount(formData.get("amount"));
    const reason = s(formData, "reason") || "관리자 금고 입금";
    await adminFundClub(clubId, amount, reason);
    const club = await getClubById(clubId);
    revalidateAdmin();
    return { ok: true, message: `금고 입금 완료: ${club?.name ?? clubId} +${amount}코인 (잔액 ${club?.balance ?? "?"})` };
  } catch (e) {
    return fail(e);
  }
}

export async function issueKeyAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await assertAdmin();
    const clubId = s(formData, "clubId");
    const label = s(formData, "label") || null;
    if (!clubId) return { error: "부스를 선택하세요." };
    const key = await issueApiKey(clubId, label);
    revalidateAdmin();
    return { ok: true, message: "API 키를 발급했습니다. 이 키는 다시 표시되지 않습니다.", secret: key };
  } catch (e) {
    return fail(e);
  }
}

export async function rotateKeyAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  try {
    await assertAdmin();
    const clubId = s(formData, "clubId");
    if (!clubId) return { error: "부스를 선택하세요." };
    const key = await rotateApiKey(clubId);
    revalidateAdmin();
    return { ok: true, message: "재발급 완료. 기존 키는 무효화되었습니다.", secret: key };
  } catch (e) {
    return fail(e);
  }
}

export async function deactivateKeyAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const key = s(formData, "key");
  await setApiKeyActive(key, false);
  revalidateAdmin();
}

export type { Direction };
