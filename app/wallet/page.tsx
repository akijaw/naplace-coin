import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getStudentTransactions } from "@/lib/db/transactions";
import { listPendingForStudent } from "@/lib/db/paymentRequests";
import { listClubs } from "@/lib/db/clubs";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
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

      <div className="grid gap-5 md:grid-cols-2">
        {/* 잔액 */}
        <div className="flex min-h-[280px] flex-col justify-between rounded-card bg-ink p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-extrabold text-white">내 계좌</div>
              <div className="mt-1 text-[13px] font-semibold text-ink-soft">
                {user.name} · 학번 {user.id}
              </div>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <Image src="/logo.png" alt="" width={26} height={29} className="object-contain" />
            </span>
          </div>
          <div>
            <div className="text-[13px] font-bold text-ink-soft">보유 코인</div>
            <div className="mt-1.5 whitespace-nowrap text-5xl font-extrabold tracking-tight text-white">
              {formatCoin(user.balance)}
              <span className="ml-2 text-xl font-bold text-ink-soft">코인</span>
            </div>
            <div className="mt-5 flex gap-2.5">
              <Link
                href="/ranking"
                className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-brand text-[15px] font-extrabold text-white transition-colors hover:bg-brand-dark"
              >
                내 순위 보기
              </Link>
              <a
                href="#history"
                className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-ink-line bg-blue/10 text-[15px] font-bold text-[#BCD3EA] transition-colors hover:bg-blue/20"
              >
                활동 내역
              </a>
            </div>
          </div>
        </div>

        {/* QR */}
        <QrCard userId={user.id} />
      </div>

      {/* 대기중 결제 요청 */}
      {pending.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold tracking-tight">대기중인 결제 요청</h2>
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
      <div id="history" className="rounded-card border border-border bg-card p-7 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight">활동 내역</h2>
          <span className="text-[13px] font-semibold text-muted/80">3초마다 자동 새로고침</span>
        </div>
        {txs.length === 0 ? (
          <p className="mt-4 text-sm text-muted">거래 내역이 없습니다.</p>
        ) : (
          <ul className="mt-3">
            {txs.map((t, i) => {
              const credit = isCreditForStudent(t.transaction_type);
              return (
                <li
                  key={t.id}
                  className={`flex items-center justify-between py-3.5 ${
                    i < txs.length - 1 ? "border-b border-divider" : ""
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`flex h-[42px] w-[42px] items-center justify-center rounded-full text-base font-extrabold ${
                        credit ? "bg-blue-tint text-blue" : "bg-orange-tint text-brand"
                      }`}
                    >
                      {credit ? "+" : "−"}
                    </span>
                    <div>
                      <div className="text-[15px] font-bold">
                        {t.title || txLabel(t.transaction_type)}
                      </div>
                      <div className="text-[13px] text-muted">
                        {txLabel(t.transaction_type)} · {formatDateTime(t.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className={`text-base font-extrabold ${credit ? "text-blue" : "text-brand"}`}>
                    {credit ? "+" : "−"}
                    {formatCoin(t.amount)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Container>
  );
}
