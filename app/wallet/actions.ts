"use server";

import { revalidatePath } from "next/cache";
import { assertStudent } from "@/lib/session";
import { approvePaymentRequest, rejectPaymentRequest } from "@/lib/db/paymentRequests";
import { AppError } from "@/lib/errors";

export type ActionState = { error?: string; ok?: boolean };

export async function approveRequest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const student = await assertStudent();
    await approvePaymentRequest(String(formData.get("id") ?? ""), student.id);
    revalidatePath("/wallet");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof AppError ? e.message : "처리 중 오류가 발생했습니다." };
  }
}

export async function rejectRequest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const student = await assertStudent();
    await rejectPaymentRequest(String(formData.get("id") ?? ""), student.id);
    revalidatePath("/wallet");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof AppError ? e.message : "처리 중 오류가 발생했습니다." };
  }
}
