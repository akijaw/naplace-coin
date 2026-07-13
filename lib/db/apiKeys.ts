import { randomBytes } from "node:crypto";
import { db, firstAs, rowsAs } from "./client";
import type { ApiKeyRow, ClubRow } from "./types";

export function generateApiKey(): string {
  return "nap_live_" + randomBytes(20).toString("hex");
}

/** X-API-Key → 활성 부스. 유효하면 last_used_at 갱신. */
export async function getClubByApiKey(key: string): Promise<ClubRow | null> {
  const res = await db.execute({
    sql: `SELECT c.* FROM api_keys k
          JOIN clubs c ON c.id = k.club_id
          WHERE k.key = ? AND k.active = 1`,
    args: [key],
  });
  const club = firstAs<ClubRow>(res.rows);
  if (club) {
    // 사용 시각 갱신 (실패해도 무시)
    db.execute({
      sql: "UPDATE api_keys SET last_used_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE key = ?",
      args: [key],
    }).catch(() => {});
  }
  return club;
}

export async function listApiKeysByClub(clubId: string): Promise<ApiKeyRow[]> {
  const res = await db.execute({
    sql: "SELECT * FROM api_keys WHERE club_id = ? ORDER BY created_at DESC",
    args: [clubId],
  });
  return rowsAs<ApiKeyRow>(res.rows);
}

export async function listAllApiKeys(): Promise<ApiKeyRow[]> {
  const res = await db.execute(
    "SELECT * FROM api_keys ORDER BY created_at DESC",
  );
  return rowsAs<ApiKeyRow>(res.rows);
}

/** 새 키 발급. 생성된 키 문자열을 반환 (한 번만 보여줌). */
export async function issueApiKey(
  clubId: string,
  label?: string | null,
): Promise<string> {
  const key = generateApiKey();
  await db.execute({
    sql: "INSERT INTO api_keys (key, club_id, label, active) VALUES (?, ?, ?, 1)",
    args: [key, clubId, label ?? null],
  });
  return key;
}

export async function setApiKeyActive(key: string, active: boolean): Promise<void> {
  await db.execute({
    sql: "UPDATE api_keys SET active = ? WHERE key = ?",
    args: [active ? 1 : 0, key],
  });
}

/** 재발급 = 기존 활성 키 전부 비활성화 후 새 키 발급. */
export async function rotateApiKey(
  clubId: string,
  label?: string | null,
): Promise<string> {
  await db.execute({
    sql: "UPDATE api_keys SET active = 0 WHERE club_id = ? AND active = 1",
    args: [clubId],
  });
  return issueApiKey(clubId, label ?? "재발급");
}
