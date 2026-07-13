import { createClient, type Client, type Row } from "@libsql/client";

// libSQL/Turso 클라이언트 싱글턴.
// - 개발: TURSO_DATABASE_URL=file:local.db (토큰 불필요)
// - 배포: TURSO_DATABASE_URL=libsql://... + TURSO_AUTH_TOKEN
//
// Next.js 는 .env.local 을 자동 로드하므로 앱 런타임에서는 그대로 동작합니다.
// (독립 실행 스크립트 db-push/seed 는 자체적으로 dotenv 를 로드합니다.)

const globalForDb = globalThis as unknown as { __naplaceDb?: Client };

function getClient(): Client {
  if (globalForDb.__naplaceDb) return globalForDb.__naplaceDb;

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL 환경변수가 설정되지 않았습니다. .env.local 을 확인하세요.",
    );
  }

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });
  globalForDb.__naplaceDb = client;
  client.execute("PRAGMA busy_timeout = 5000").catch(() => {});
  return client;
}

// 빌드 시에는 운영 비밀변수를 노출하지 않고, 실제 DB 호출 시점에만 연결한다.
export const db = new Proxy({} as Client, {
  get(_target, property) {
    const client = getClient();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// libSQL 은 행을 배열이면서 이름으로도 접근 가능한 객체로 반환합니다.
// 타입 지정된 접근을 위해 얇게 캐스팅하는 헬퍼.
export function rowsAs<T>(rows: Row[]): T[] {
  return rows as unknown as T[];
}
export function firstAs<T>(rows: Row[]): T | null {
  return (rows[0] as unknown as T) ?? null;
}
