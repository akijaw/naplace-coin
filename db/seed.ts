// 데모 데이터 시드 (멱등). `npm run db:seed`
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient, type Client } from "@libsql/client";

const DEMO_API_KEY = "nap_live_montyhall_demokey";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL 이 설정되지 않았습니다 (.env.local).");
  const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });

  // 1) CLUBS (부스) — users 보다 먼저
  await insertClubs(db);
  // 2) API KEYS + ACTIVITIES
  await insertApiKeys(db);
  await insertActivities(db);
  // 3) USERS (학생/플레이어)
  await insertUsers(db);

  console.log("\n✅ 시드 완료\n");
  console.log("────────────────────────────────────────────");
  console.log(" 몬티홀 부스 API 키 :", DEMO_API_KEY);
  console.log(" 데모 학생 로그인    : username=naplace  password=1234  (학번 2601)");
  console.log(" 관리자 비밀번호     :", process.env.ADMIN_PASSWORD || "(ADMIN_PASSWORD 미설정)");
  console.log("────────────────────────────────────────────\n");
  db.close();
}

async function insertClubs(db: Client) {
  const clubs: [string, string, number][] = [
    ["montyhall", "몬티홀 도박 부스", 1_000_000],
    ["quizbooth", "퀴즈 체험 부스", 50_000],
  ];
  for (const [id, name, balance] of clubs) {
    await db.execute({
      sql: "INSERT INTO clubs (id, name, balance) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING",
      args: [id, name, balance],
    });
  }
}

async function insertApiKeys(db: Client) {
  await db.execute({
    sql: "INSERT INTO api_keys (key, club_id, label, active) VALUES (?, ?, ?, 1) ON CONFLICT(key) DO NOTHING",
    args: [DEMO_API_KEY, "montyhall", "데모 키"],
  });
}

async function insertActivities(db: Client) {
  const acts: [string, string, number, string][] = [
    ["montyhall", "게임 참여비", 100, "student_to_club"],
    ["montyhall", "게임 승리 보상", 300, "club_to_student"],
    ["quizbooth", "퀴즈 정답 보상", 50, "club_to_student"],
  ];
  for (const [clubId, name, amount, direction] of acts) {
    // 활동은 이름 유니크 제약이 없으므로, 중복 시드 방지를 위해 존재 여부 확인
    const exists = await db.execute({
      sql: "SELECT 1 FROM activities WHERE club_id = ? AND name = ? LIMIT 1",
      args: [clubId, name],
    });
    if (exists.rows.length === 0) {
      await db.execute({
        sql: "INSERT INTO activities (club_id, name, amount, direction) VALUES (?, ?, ?, ?)",
        args: [clubId, name, amount, direction],
      });
    }
  }
}

async function insertUsers(db: Client) {
  const users: [string, string, string, string, number, string | null][] = [
    // id,   username,   password, name,          balance, club_id
    ["2601", "naplace", "1234", "나플 데모 학생", 1000, null],
    ["2602", "newton", "1234", "뉴턴", 5000, null],
    ["2603", "leibniz", "1234", "라이프니츠", 3000, null],
    ["2604", "gauss", "1234", "가우스", 2400, null],
  ];
  for (const [id, username, password, name, balance, clubId] of users) {
    await db.execute({
      sql: "INSERT INTO users (id, username, password, name, balance, club_id) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
      args: [id, username, password, name, balance, clubId],
    });
  }
}

main().catch((err) => {
  console.error("❌ db:seed 실패:", err);
  process.exit(1);
});
