import { countUsers, totalCirculation } from "@/lib/db/users";
import { countClubs } from "@/lib/db/clubs";
import { totalMinted, listTransactions } from "@/lib/db/stats";
import { Card, CardTitle, StatCard } from "@/components/ui/primitives";
import { formatCoin, formatDateTime, txLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [minted, users, clubs, circulation, recent] = await Promise.all([
    totalMinted(),
    countUsers(),
    countClubs(),
    totalCirculation(),
    listTransactions({ limit: 10 }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="총 발행량" value={formatCoin(minted)} sub="관리자 지급 − 회수" />
        <StatCard label="학생 유통량" value={formatCoin(circulation)} sub="전체 학생 잔액 합" />
        <StatCard label="유저 수" value={formatCoin(users)} sub="활성 학생" />
        <StatCard label="부스 수" value={formatCoin(clubs)} />
      </div>

      <Card>
        <CardTitle>최근 거래</CardTitle>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted">거래 내역이 없습니다.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{t.title || txLabel(t.transaction_type)}</div>
                  <div className="text-xs text-muted">
                    {txLabel(t.transaction_type)} ·{" "}
                    {t.student_name ?? t.student_id ?? "-"}
                    {t.club_name ? ` · ${t.club_name}` : ""} · {formatDateTime(t.created_at)}
                  </div>
                </div>
                <div className="font-bold">{formatCoin(t.amount)}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
