import { db, firstAs, rowsAs } from "./client";
import type { ClubRow } from "./types";

export async function getClubById(id: string): Promise<ClubRow | null> {
  const res = await db.execute({
    sql: "SELECT * FROM clubs WHERE id = ?",
    args: [id],
  });
  return firstAs<ClubRow>(res.rows);
}

export async function listClubs(): Promise<ClubRow[]> {
  const res = await db.execute(
    "SELECT * FROM clubs ORDER BY balance DESC, id ASC",
  );
  return rowsAs<ClubRow>(res.rows);
}

export interface CreateClubInput {
  id: string;
  name: string;
  balance?: number;
}

export async function createClub(input: CreateClubInput): Promise<void> {
  await db.execute({
    sql: "INSERT INTO clubs (id, name, balance) VALUES (?, ?, ?)",
    args: [input.id, input.name, input.balance ?? 0],
  });
}

export async function rankingClubs(limit = 200): Promise<ClubRow[]> {
  const res = await db.execute({
    sql: "SELECT * FROM clubs ORDER BY balance DESC, id ASC LIMIT ?",
    args: [limit],
  });
  return rowsAs<ClubRow>(res.rows);
}

export async function countClubs(): Promise<number> {
  const res = await db.execute("SELECT COUNT(*) AS n FROM clubs");
  return Number((res.rows[0] as unknown as { n: number }).n);
}
