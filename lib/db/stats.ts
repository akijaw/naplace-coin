import { db, rowsAs } from "./client";
import type { TransactionRow } from "./types";

/** 총 발행량 = 관리자 지급 - 관리자 회수. */
export async function totalMinted(): Promise<number> {
  const res = await db.execute(
    `SELECT COALESCE(SUM(CASE
        WHEN transaction_type='admin_grant'  THEN amount
        WHEN transaction_type='admin_deduct' THEN -amount
        ELSE 0 END), 0) AS n
     FROM transactions`,
  );
  return Number((res.rows[0] as unknown as { n: number }).n);
}

export interface TransactionWithNames extends TransactionRow {
  student_name: string | null;
  club_name: string | null;
}

export interface TransactionFilter {
  type?: string;
  accountId?: string; // student_id 또는 club_id 매칭
  limit?: number;
}

export async function listTransactions(
  filter: TransactionFilter = {},
): Promise<TransactionWithNames[]> {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (filter.type) {
    where.push("t.transaction_type = ?");
    args.push(filter.type);
  }
  if (filter.accountId) {
    where.push("(t.student_id = ? OR t.club_id = ?)");
    args.push(filter.accountId, filter.accountId);
  }
  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
  args.push(filter.limit ?? 200);
  const res = await db.execute({
    sql: `SELECT t.*, u.name AS student_name, c.name AS club_name
          FROM transactions t
          LEFT JOIN users u ON t.student_id = u.id
          LEFT JOIN clubs c ON t.club_id = c.id
          ${whereSql}
          ORDER BY t.id DESC LIMIT ?`,
    args,
  });
  return rowsAs<TransactionWithNames>(res.rows);
}
