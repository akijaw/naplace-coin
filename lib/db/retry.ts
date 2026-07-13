import { AppError } from "../errors";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// 단일 커넥션(로컬 file) 또는 Turso 에서 동시 쓰기 트랜잭션이 부딪힐 때 나는
// 일시적 오류만 재시도합니다. 도메인 오류(AppError: 잔액부족/미존재 등)는 즉시 전달.
function isTransient(e: unknown): boolean {
  const m = String((e as Error)?.message || "").toLowerCase();
  return (
    m.includes("busy") ||
    m.includes("locked") ||
    m.includes("transaction") ||
    m.includes("stream not found")
  );
}

async function attempt<T>(fn: () => Promise<T>, tries: number): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof AppError || !isTransient(e)) throw e;
      last = e;
      // 지터를 넣어 재시도가 한꺼번에 몰리지 않도록 분산 (lockstep 방지)
      const backoff = 8 + Math.floor(Math.random() * (20 + i * 8));
      await sleep(backoff);
    }
  }
  throw last;
}

// 로컬 file: URL 은 단일 SQLite 커넥션이라 쓰기 트랜잭션을 동시에 열 수 없습니다.
// (BEGIN IMMEDIATE 가 겹치면 SQLITE_BUSY 로 무더기 실패 → retry 만으로는 thundering-herd)
// 프로세스 내 쓰기를 한 줄로 직렬화해 커넥션 경합을 없애고, 남는 크로스-프로세스
// 경합(다른 프로세스: dev 서버 등)만 retry 로 흡수합니다.
let writeChain: Promise<unknown> = Promise.resolve();

export async function withWriteRetry<T>(fn: () => Promise<T>, tries = 25): Promise<T> {
  const run = writeChain.then(() => attempt(fn, tries));
  // 성공/실패와 무관하게 다음 쓰기가 이어지도록 체인을 이어줍니다.
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
