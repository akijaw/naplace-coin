import { db, firstAs, rowsAs } from "./client";
import type { UserRow } from "./types";

export async function getUserById(id: string): Promise<UserRow | null> {
  const res = await db.execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [id],
  });
  return firstAs<UserRow>(res.rows);
}

export async function getUserByUsername(username: string): Promise<UserRow | null> {
  const res = await db.execute({
    sql: "SELECT * FROM users WHERE username = ?",
    args: [username],
  });
  return firstAs<UserRow>(res.rows);
}

/** 로그인용 — username + password 평문 비교 (보안 최소화 정책). */
export async function getUserByLogin(
  username: string,
  password: string,
): Promise<UserRow | null> {
  const res = await db.execute({
    sql: "SELECT * FROM users WHERE username = ? AND password = ? AND active = 1",
    args: [username, password],
  });
  return firstAs<UserRow>(res.rows);
}

export async function listUsers(): Promise<UserRow[]> {
  const res = await db.execute(
    "SELECT * FROM users ORDER BY balance DESC, id ASC",
  );
  return rowsAs<UserRow>(res.rows);
}

export interface CreateUserInput {
  id: string;
  username: string;
  password: string;
  name: string;
  balance?: number;
  clubId?: string | null;
}

export async function createUser(input: CreateUserInput): Promise<void> {
  await db.execute({
    sql: "INSERT INTO users (id, username, password, name, balance, club_id) VALUES (?, ?, ?, ?, ?, ?)",
    args: [
      input.id,
      input.username,
      input.password,
      input.name,
      input.balance ?? 0,
      input.clubId ?? null,
    ],
  });
}

export interface UpdateUserInput {
  name?: string;
  username?: string;
  password?: string;
  clubId?: string | null;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<void> {
  const sets: string[] = [];
  const args: (string | null)[] = [];
  if (input.name !== undefined) {
    sets.push("name = ?");
    args.push(input.name);
  }
  if (input.username !== undefined) {
    sets.push("username = ?");
    args.push(input.username);
  }
  if (input.password !== undefined) {
    sets.push("password = ?");
    args.push(input.password);
  }
  if (input.clubId !== undefined) {
    sets.push("club_id = ?");
    args.push(input.clubId);
  }
  if (sets.length === 0) return;
  args.push(id);
  await db.execute({
    sql: `UPDATE users SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

export async function setUserActive(id: string, active: boolean): Promise<void> {
  await db.execute({
    sql: "UPDATE users SET active = ? WHERE id = ?",
    args: [active ? 1 : 0, id],
  });
}

export interface StudentRankRow {
  id: string;
  name: string;
  balance: number;
  club_id: string | null;
  club_name: string | null;
}

export async function rankingStudents(limit = 200): Promise<StudentRankRow[]> {
  const res = await db.execute({
    sql: `SELECT u.id, u.name, u.balance, u.club_id, c.name AS club_name
          FROM users u LEFT JOIN clubs c ON u.club_id = c.id
          WHERE u.active = 1
          ORDER BY u.balance DESC, u.id ASC
          LIMIT ?`,
    args: [limit],
  });
  return rowsAs<StudentRankRow>(res.rows);
}

export async function countUsers(): Promise<number> {
  const res = await db.execute("SELECT COUNT(*) AS n FROM users WHERE active = 1");
  return Number((res.rows[0] as unknown as { n: number }).n);
}

/** 발행/유통 통계용. */
export async function totalCirculation(): Promise<number> {
  const res = await db.execute("SELECT COALESCE(SUM(balance),0) AS n FROM users");
  return Number((res.rows[0] as unknown as { n: number }).n);
}
