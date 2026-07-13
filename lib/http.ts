import { NextResponse } from "next/server";
import { AppError } from "./errors";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// 모든 에러 응답은 { message } 형태로 통일합니다 (SADA 규격).
export function err(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export function handleError(e: unknown) {
  if (e instanceof AppError) return err(e.message, e.status);
  console.error("[api] 처리되지 않은 오류:", e);
  return err("서버 오류가 발생했습니다.", 500);
}
