import { db, rowsAs } from "./client";
import type { ActivityRow, Direction } from "./types";

export async function listActivitiesByClub(clubId: string): Promise<ActivityRow[]> {
  const res = await db.execute({
    sql: "SELECT * FROM activities WHERE club_id = ? ORDER BY id ASC",
    args: [clubId],
  });
  return rowsAs<ActivityRow>(res.rows);
}

export interface CreateActivityInput {
  clubId: string;
  name: string;
  amount: number;
  direction: Direction;
}

export async function createActivity(input: CreateActivityInput): Promise<void> {
  await db.execute({
    sql: "INSERT INTO activities (club_id, name, amount, direction) VALUES (?, ?, ?, ?)",
    args: [input.clubId, input.name, input.amount, input.direction],
  });
}

export async function deleteActivity(id: number, clubId: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM activities WHERE id = ? AND club_id = ?",
    args: [id, clubId],
  });
}
