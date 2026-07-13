// db/schema.sql 을 데이터베이스에 적용합니다. `npm run db:push`
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL 이 설정되지 않았습니다 (.env.local).");

  const db = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });

  const sql = readFileSync(resolve(process.cwd(), "db/schema.sql"), "utf-8");
  await db.executeMultiple(sql);

  console.log(`✅ 스키마 적용 완료 → ${url}`);
  db.close();
}

main().catch((err) => {
  console.error("❌ db:push 실패:", err);
  process.exit(1);
});
