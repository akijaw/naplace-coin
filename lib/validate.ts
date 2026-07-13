import { ValidationError } from "./errors";

/** 양의 정수 금액으로 파싱. 아니면 400. */
export function parseAmount(input: unknown): number {
  const n = Number(input);
  if (!Number.isFinite(n) || n <= 0) {
    throw new ValidationError("금액은 0보다 커야 합니다.");
  }
  return Math.trunc(n);
}

export function requireString(input: unknown, field: string): string {
  const s = typeof input === "string" ? input.trim() : "";
  if (!s) throw new ValidationError(`${field} 값이 필요합니다.`);
  return s;
}
