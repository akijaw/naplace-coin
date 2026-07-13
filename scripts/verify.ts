// 원장 무결성 검증: 결제요청 승인(원자적) + 동시성(음수 방지). tsx scripts/verify.ts
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db } = await import("../lib/db/client");
  const { getUserById } = await import("../lib/db/users");
  const { createTransfer } = await import("../lib/db/transactions");
  const { createPaymentRequest, approvePaymentRequest, getPaymentRequest } = await import(
    "../lib/db/paymentRequests"
  );

  // --- 1) 결제요청 승인: 상태 전이 + 코인 이동이 원자적으로 =---
  const before = (await getUserById("2601"))!.balance;
  const { request } = await createPaymentRequest({
    studentId: "2601",
    clubId: "montyhall",
    amount: 100,
    title: "검증 결제요청",
  });
  await approvePaymentRequest(request.id, "2601");
  const pr = await getPaymentRequest(request.id);
  const after = (await getUserById("2601"))!.balance;
  console.log("[승인] 잔액", before, "→", after, "| 이동", before - after, "| 상태", pr?.status);
  const approveOk = before - after === 100 && pr?.status === "approved";

  // --- 2) 동시성: 잔액 300, 50코인 베팅 10건 동시 → 정확히 6건만 성공, 음수 불가 ---
  await db.execute("UPDATE users SET balance = 300 WHERE id = '2604'");
  const start = (await getUserById("2604"))!.balance;
  const results = await Promise.allSettled(
    Array.from({ length: 10 }, () =>
      createTransfer({
        studentId: "2604",
        clubId: "montyhall",
        amount: 50,
        type: "student_to_club",
        title: "동시성 테스트",
      }),
    ),
  );
  const ok = results.filter((r) => r.status === "fulfilled").length;
  const reasons = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => String((r.reason as Error)?.message));
  const counts: Record<string, number> = {};
  for (const m of reasons) counts[m] = (counts[m] ?? 0) + 1;
  console.log("[동시성] 실패 사유:", counts);
  const end = (await getUserById("2604"))!.balance;
  console.log("[동시성] 시작", start, "| 성공", ok, "/10 (기대 6) | 종료 잔액", end, "| 음수아님", end >= 0);
  const concOk = ok === 6 && end === 0;

  console.log("\n결과:", approveOk && concOk ? "✅ 통과" : "❌ 실패");
  process.exit(approveOk && concOk ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
