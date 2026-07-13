// 아주 단순한 인메모리 레이트리밋 (베스트 에포트).
// 서버리스에서는 인스턴스별로 동작하므로 전역 보장은 아닙니다 — 사고 방지용.
type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}
