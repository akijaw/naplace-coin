"use server";

import { createPaymentRequest } from "@/lib/db/paymentRequests";
import { createTransfer } from "@/lib/db/transactions";
import {
  listActivitiesByClub,
  createActivity,
  deleteActivity,
} from "@/lib/db/activities";
import { parseAmount } from "@/lib/validate";
import { AppError } from "@/lib/errors";
import { assertAdmin } from "@/lib/admin";
import type { ActivityRow, Direction } from "@/lib/db/types";

function errMsg(e: unknown): string {
  return e instanceof AppError ? e.message : "처리 중 오류가 발생했습니다.";
}

export type ReqResult =
  | { ok: true; requestId: string; status: "approved" }
  | { ok: false; error: string };

// 학번 결제 = 즉시 결제. 요청 생성 즉시 학생 지갑에서 차감되고 approved 로 확정됩니다.
export async function clubCreatePaymentRequest(
  clubId: string,
  studentId: string,
  amountInput: string,
  title: string,
): Promise<ReqResult> {
  try {
    await assertAdmin();
    const amount = parseAmount(amountInput);
    const { request } = await createPaymentRequest({
      studentId: studentId.trim(),
      clubId,
      amount,
      title: title.trim() || null,
    });
    return { ok: true, requestId: request.id, status: "approved" };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export type TransferResult = { ok: true } | { ok: false; error: string };

export async function clubTransfer(
  clubId: string,
  studentId: string,
  amountInput: string,
  type: Direction,
  title: string,
): Promise<TransferResult> {
  try {
    await assertAdmin();
    const amount = parseAmount(amountInput);
    await createTransfer({
      studentId: studentId.trim(),
      clubId,
      amount,
      type,
      title: title.trim() || null,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function listActivities(clubId: string): Promise<ActivityRow[]> {
  await assertAdmin();
  return listActivitiesByClub(clubId);
}

export async function addActivity(
  clubId: string,
  name: string,
  amountInput: string,
  direction: Direction,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
    const amount = parseAmount(amountInput);
    if (!name.trim()) return { ok: false, error: "활동 이름을 입력하세요." };
    await createActivity({ clubId, name: name.trim(), amount, direction });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function removeActivity(
  id: number,
  clubId: string,
): Promise<{ ok: boolean }> {
  await assertAdmin();
  await deleteActivity(id, clubId);
  return { ok: true };
}
