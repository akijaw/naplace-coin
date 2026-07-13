import { db, rowsAs } from "./client";
import { InsufficientFundsError, NotFoundError } from "../errors";
import { withWriteRetry } from "./retry";
import type { Direction, TransactionRow } from "./types";
import type { Transaction } from "@libsql/client";

export interface TransferInput {
  studentId: string;
  clubId: string;
  amount: number; // 양의 정수
  type: Direction; // club_to_student(지급) | student_to_club(결제)
  title?: string | null;
}

/**
 * 열린 트랜잭션 안에서 차감·적립·원장기록을 수행 (commit/rollback 하지 않음).
 * createTransfer 와 결제요청 승인(approvePaymentRequest)이 공유합니다.
 */
export async function applyTransfer(
  tx: Transaction,
  input: TransferInput,
): Promise<void> {
  const { studentId, clubId, amount, type, title } = input;
  if (type === "student_to_club") {
    // 학생 → 부스 (결제/베팅): 학생 차감, 부스 적립
    const debit = await tx.execute({
      sql: "UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?",
      args: [amount, studentId, amount],
    });
    if (debit.rowsAffected !== 1) {
      const exists = await tx.execute({
        sql: "SELECT 1 FROM users WHERE id = ?",
        args: [studentId],
      });
      throw exists.rows.length === 0
        ? new NotFoundError()
        : new InsufficientFundsError();
    }
    const credit = await tx.execute({
      sql: "UPDATE clubs SET balance = balance + ? WHERE id = ?",
      args: [amount, clubId],
    });
    if (credit.rowsAffected !== 1) throw new NotFoundError("부스를 찾을 수 없습니다.");
  } else {
    // 부스 → 학생 (지급/당첨): 부스 차감, 학생 적립
    const debit = await tx.execute({
      sql: "UPDATE clubs SET balance = balance - ? WHERE id = ? AND balance >= ?",
      args: [amount, clubId, amount],
    });
    if (debit.rowsAffected !== 1) {
      const exists = await tx.execute({
        sql: "SELECT 1 FROM clubs WHERE id = ?",
        args: [clubId],
      });
      throw exists.rows.length === 0
        ? new NotFoundError("부스를 찾을 수 없습니다.")
        : new InsufficientFundsError("부스 잔액이 부족합니다.");
    }
    const credit = await tx.execute({
      sql: "UPDATE users SET balance = balance + ? WHERE id = ?",
      args: [amount, studentId],
    });
    if (credit.rowsAffected !== 1) throw new NotFoundError();
  }

  await tx.execute({
    sql: "INSERT INTO transactions (student_id, club_id, amount, transaction_type, title) VALUES (?, ?, ?, ?, ?)",
    args: [studentId, clubId, amount, type, title ?? null],
  });
}

/**
 * 부스↔학생 코인 이동 (원자적).
 * 차감 가드를 SQL(WHERE balance >= ?)에 두고 rowsAffected 를 검증하므로,
 * 동시 요청에도 잔액이 음수가 되거나 코인이 유실/중복되지 않습니다.
 */
export async function createTransfer(input: TransferInput): Promise<void> {
  return withWriteRetry(async () => {
    const tx = await db.transaction("write");
    try {
      await applyTransfer(tx, input);
      await tx.commit();
    } catch (e) {
      try {
        await tx.rollback();
      } catch {
        /* 이미 종료된 트랜잭션 — 무시 */
      }
      throw e;
    }
  });
}

/** 관리자 코인 지급 (발행/mint). 부스 없이 학생 잔액 증가. */
export async function adminGrant(
  studentId: string,
  amount: number,
  title?: string | null,
): Promise<void> {
  return withWriteRetry(async () => {
    const tx = await db.transaction("write");
    try {
      const credit = await tx.execute({
        sql: "UPDATE users SET balance = balance + ? WHERE id = ?",
        args: [amount, studentId],
      });
      if (credit.rowsAffected !== 1) throw new NotFoundError("사용자를 찾을 수 없습니다.");
      await tx.execute({
        sql: "INSERT INTO transactions (student_id, club_id, amount, transaction_type, title) VALUES (?, NULL, ?, 'admin_grant', ?)",
        args: [studentId, amount, title ?? null],
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

/** 관리자 코인 회수 (차감/burn). 잔액 부족 시 실패. */
export async function adminDeduct(
  studentId: string,
  amount: number,
  title?: string | null,
): Promise<void> {
  return withWriteRetry(async () => {
    const tx = await db.transaction("write");
    try {
      const debit = await tx.execute({
        sql: "UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?",
        args: [amount, studentId, amount],
      });
      if (debit.rowsAffected !== 1) {
        const exists = await tx.execute({
          sql: "SELECT 1 FROM users WHERE id = ?",
          args: [studentId],
        });
        throw exists.rows.length === 0
          ? new NotFoundError("사용자를 찾을 수 없습니다.")
          : new InsufficientFundsError();
      }
      await tx.execute({
        sql: "INSERT INTO transactions (student_id, club_id, amount, transaction_type, title) VALUES (?, NULL, ?, 'admin_deduct', ?)",
        args: [studentId, amount, title ?? null],
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

/** 특정 부스의 원장 (최신순). */
export async function getClubTransactions(
  clubId: string,
  limit = 100,
): Promise<TransactionRow[]> {
  const res = await db.execute({
    sql: "SELECT * FROM transactions WHERE club_id = ? ORDER BY id DESC LIMIT ?",
    args: [clubId, limit],
  });
  return rowsAs<TransactionRow>(res.rows);
}

/** 특정 학생의 원장 (최신순). */
export async function getStudentTransactions(
  studentId: string,
  limit = 100,
): Promise<TransactionRow[]> {
  const res = await db.execute({
    sql: "SELECT * FROM transactions WHERE student_id = ? ORDER BY id DESC LIMIT ?",
    args: [studentId, limit],
  });
  return rowsAs<TransactionRow>(res.rows);
}
