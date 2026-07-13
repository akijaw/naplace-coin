import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getStudentTransactions } from "@/lib/db/transactions";
import { listPendingForStudent } from "@/lib/db/paymentRequests";
import { listClubs } from "@/lib/db/clubs";
import { Container } from "@/components/ui/Container";
import { Card, CardTitle } from "@/components/ui/primitives";
import { AutoRefresh } from "@/components/ui/AutoRefresh";
import { QrCard } from "@/components/wallet/QrCard";
import { PendingRequestCard } from "@/components/wallet/PendingRequestCard";
import { formatCoin, formatDateTime, isCreditForStudent, txLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [txs, pending, clubs] = await Promise.all([
    getStudentTransactions(user.id, 100),
    listPendingForStudent(user.id),
    listClubs(),
  ]);
  const clubName = new Map(clubs.map((c) => [c.id, c.name]));

  return (
    <Container className="space-y-6">
      <AutoRefresh intervalMs={3000} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* 잔액 */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardTitle>내 계좌</CardTitle>
            <div className="mt-1 text-sm text-muted">
              {user.name} · 학번 {user.id}
            </div>
          </div>
          <div className="mt-8">
            <div className="text-sm text-muted">보유 코인</div>
            <div className="mt-1 text-4xl font-extrabold tracking-tight">
              {formatCoin(user.balance)}
              <span className="ml-2 text-lg font-semibold text-muted">코인</span>
            </div>
          </div>
        </Card>

        {/* QR */}
        <QrCard userId={user.id} />
      </div>

      {/* 대기중 결제 요청 */}
      {pending.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">대기중인 결제 요청</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {pending.map((p) => (
              <PendingRequestCard
                key={p.id}
                id={p.id}
                amount={p.amount}
                title={p.title}
                clubName={clubName.get(p.club_id) ?? null}
                expiresAt={p.expires_at}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* 거래 내역 */}
      <Card>
        <CardTitle>활동 내역</CardTitle>
        {txs.length === 0 ? (
          <p className="mt-4 text-sm text-muted">거래 내역이 없습니다.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {txs.map((t) => {
              const credit = isCreditForStudent(t.transaction_type);
              return (
                <li key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">
                      {t.title || txLabel(t.transaction_type)}
                    </div>
                    <div className="text-xs text-muted">
                      {txLabel(t.transaction_type)} · {formatDateTime(t.created_at)}
                    </div>
                  </div>
                  <div
                    className={
                      credit
                        ? "font-bold text-emerald-600 dark:text-emerald-400"
                        : "font-bold text-rose-600 dark:text-rose-400"
                    }
                  >
                    {credit ? "+" : "−"}
                    {formatCoin(t.amount)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </Container>
  );
}
