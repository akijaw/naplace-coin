import { nanoid } from "nanoid";
import { db, firstAs, rowsAs } from "./client";
import { applyTransfer } from "./transactions";
import { withWriteRetry } from "./retry";
import { getUserById } from "./users";
import { AppError, NotFoundError, ValidationError } from "../errors";
import type { PaymentRequestRow } from "./types";

const NOW = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";

/** 만료 시각이 지난 pending 요청을 일괄 expired 로 정리 (읽기 전 호출). */
async function expireStale(): Promise<void> {
  await db.execute(
    `UPDATE payment_requests SET status='expired', resolved_at=${NOW}
     WHERE status='pending' AND expires_at <= ${NOW}`,
  );
}

async function getRaw(id: string): Promise<PaymentRequestRow | null> {
  const res = await db.execute({
    sql: "SELECT * FROM payment_requests WHERE id = ?",
    args: [id],
  });
  return firstAs<PaymentRequestRow>(res.rows);
}

export interface CreatePaymentRequestInput {
  studentId: string;
  clubId: string;
  amount: number;
  title?: string | null;
}

export interface CreatedPaymentRequest {
  request: PaymentRequestRow;
  student: { id: string; name: string };
}

export async function createPaymentRequest(
  input: CreatePaymentRequestInput,
): Promise<CreatedPaymentRequest> {
  const student = await getUserById(input.studentId);
  if (!student) throw new NotFoundError("학생을 찾을 수 없습니다.");

  const id = "pr_" + nanoid();
  await db.execute({
    sql: `INSERT INTO payment_requests (id, student_id, club_id, amount, title, status, expires_at)
          VALUES (?, ?, ?, ?, ?, 'pending', strftime('%Y-%m-%dT%H:%M:%fZ','now','+120 seconds'))`,
    args: [id, input.studentId, input.clubId, input.amount, input.title ?? null],
  });
  const request = await getRaw(id);
  return { request: request!, student: { id: student.id, name: student.name } };
}

/** 상태 조회 (지연 만료 반영). */
export async function getPaymentRequest(id: string): Promise<PaymentRequestRow | null> {
  await expireStale();
  return getRaw(id);
}

/** 학생 지갑용: 아직 유효한 pending 요청 목록. */
export async function listPendingForStudent(
  studentId: string,
): Promise<PaymentRequestRow[]> {
  await expireStale();
  const res = await db.execute({
    sql: "SELECT * FROM payment_requests WHERE student_id = ? AND status = 'pending' ORDER BY created_at DESC",
    args: [studentId],
  });
  return rowsAs<PaymentRequestRow>(res.rows);
}

export async function listByClub(
  clubId: string,
  limit = 100,
): Promise<PaymentRequestRow[]> {
  await expireStale();
  const res = await db.execute({
    sql: "SELECT * FROM payment_requests WHERE club_id = ? ORDER BY created_at DESC LIMIT ?",
    args: [clubId, limit],
  });
  return rowsAs<PaymentRequestRow>(res.rows);
}

export interface PaymentRequestWithNames extends PaymentRequestRow {
  student_name: string | null;
  club_name: string | null;
}

export async function listAll(limit = 200): Promise<PaymentRequestWithNames[]> {
  await expireStale();
  const res = await db.execute({
    sql: `SELECT p.*, u.name AS student_name, c.name AS club_name
          FROM payment_requests p
          LEFT JOIN users u ON p.student_id = u.id
          LEFT JOIN clubs c ON p.club_id = c.id
          ORDER BY p.created_at DESC LIMIT ?`,
    args: [limit],
  });
  return rowsAs<PaymentRequestWithNames>(res.rows);
}

/** 요청 취소 (요청한 부스 또는 관리자). pending 일 때만. */
export async function cancelPaymentRequest(
  id: string,
  clubId?: string,
): Promise<PaymentRequestRow> {
  const guardClub = clubId ? " AND club_id = ?" : "";
  const args = clubId ? [id, clubId] : [id];
  const res = await db.execute({
    sql: `UPDATE payment_requests SET status='canceled', resolved_at=${NOW}
          WHERE id = ? AND status='pending'${guardClub}`,
    args,
  });
  if (res.rowsAffected !== 1) {
    const existing = await getRaw(id);
    if (!existing) throw new NotFoundError("결제 요청을 찾을 수 없습니다.");
    throw new ValidationError("이미 처리된 요청은 취소할 수 없습니다.");
  }
  return (await getRaw(id))!;
}

/** 학생 승인 — 상태 전이와 코인 이동을 같은 트랜잭션에서 원자적으로. */
export async function approvePaymentRequest(
  id: string,
  studentId: string,
): Promise<void> {
  return withWriteRetry(async () => {
  const tx = await db.transaction("write");
  try {
    const sel = await tx.execute({
      sql: "SELECT * FROM payment_requests WHERE id = ?",
      args: [id],
    });
    const req = firstAs<PaymentRequestRow>(sel.rows);
    if (!req) throw new NotFoundError("결제 요청을 찾을 수 없습니다.");
    if (req.student_id !== studentId)
      throw new AppError("본인의 결제 요청이 아닙니다.", 403);
    if (req.status !== "pending") throw new ValidationError("이미 처리된 요청입니다.");
    if (Date.parse(req.expires_at) <= Date.now()) {
      await tx.execute({
        sql: `UPDATE payment_requests SET status='expired', resolved_at=${NOW} WHERE id = ? AND status='pending'`,
        args: [id],
      });
      await tx.commit();
      throw new ValidationError("결제 요청이 만료되었습니다.");
    }

    const flip = await tx.execute({
      sql: `UPDATE payment_requests SET status='approved', resolved_at=${NOW} WHERE id = ? AND status='pending'`,
      args: [id],
    });
    if (flip.rowsAffected !== 1) throw new ValidationError("이미 처리된 요청입니다.");

    // 승인 = 학생 → 부스 결제. 잔액 부족 시 여기서 throw → 전체 롤백(요청은 pending 유지).
    await applyTransfer(tx, {
      studentId: req.student_id,
      clubId: req.club_id,
      amount: req.amount,
      type: "student_to_club",
      title: req.title ?? "결제 요청 승인",
    });
    await tx.commit();
  } catch (e) {
    try {
      await tx.rollback();
    } catch {
      /* noop */
    }
    throw e;
  }
  });
}

/** 학생 거절 — pending 일 때만. */
export async function rejectPaymentRequest(
  id: string,
  studentId: string,
): Promise<void> {
  const res = await db.execute({
    sql: `UPDATE payment_requests SET status='rejected', resolved_at=${NOW}
          WHERE id = ? AND student_id = ? AND status='pending'`,
    args: [id, studentId],
  });
  if (res.rowsAffected !== 1) {
    const existing = await getRaw(id);
    if (!existing) throw new NotFoundError("결제 요청을 찾을 수 없습니다.");
    if (existing.student_id !== studentId)
      throw new AppError("본인의 결제 요청이 아닙니다.", 403);
    throw new ValidationError("이미 처리된 요청입니다.");
  }
}
