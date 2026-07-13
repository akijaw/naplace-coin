import { countUsers, totalCirculation } from "@/lib/db/users";
import { countClubs } from "@/lib/db/clubs";
import { totalMinted, listTransactions } from "@/lib/db/stats";
import { formatCoin, formatDateTime, isCreditForStudent, txLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card px-6 py-5">
      <div className="text-[13px] font-semibold text-muted">{label}</div>
      <div className="mt-1.5 text-[28px] font-extrabold tracking-tight">{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-muted/80">{sub}</div> : null}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [minted, users, clubs, circulation, recent] = await Promise.all([
    totalMinted(),
    countUsers(),
    countClubs(),
    totalCirculation(),
    listTransactions({ limit: 10 }),
  ]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">대시보드</h1>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* 총 발행량 — 네이비 강조 */}
        <div className="rounded-3xl bg-ink px-6 py-5">
          <div className="text-[13px] font-semibold text-ink-soft">총 발행량</div>
          <div className="mt-1.5 text-[28px] font-extrabold tracking-tight text-white">
            {formatCoin(minted)}
          </div>
          <div className="mt-0.5 text-xs text-[#63788F]">관리자 지급 − 회수</div>
        </div>
        <StatTile label="학생 유통량" value={formatCoin(circulation)} sub="전체 학생 잔액 합" />
        <StatTile label="유저 수" value={formatCoin(users)} sub="활성 학생" />
        <StatTile label="부스 수" value={formatCoin(clubs)} />
      </div>

      <div className="rounded-card border border-border bg-card p-7 sm:p-8">
        <h2 className="text-lg font-extrabold tracking-tight">최근 거래</h2>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted">거래 내역이 없습니다.</p>
        ) : (
          <ul className="mt-3">
            {recent.map((t, i) => {
              const credit = isCreditForStudent(t.transaction_type);
              return (
                <li
                  key={t.id}
                  className={`flex items-center justify-between py-3 ${
                    i < recent.length - 1 ? "border-b border-divider" : ""
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`flex h-[38px] w-[38px] items-center justify-center rounded-full text-sm font-extrabold ${
                        credit ? "bg-blue-tint text-blue" : "bg-orange-tint text-brand"
                      }`}
                    >
                      {credit ? "+" : "−"}
                    </span>
                    <div>
                      <div className="text-sm font-bold">{t.title || txLabel(t.transaction_type)}</div>
                      <div className="text-xs text-muted">
                        {txLabel(t.transaction_type)} · {t.student_name ?? t.student_id ?? "-"}
                        {t.club_name ? ` · ${t.club_name}` : ""} · {formatDateTime(t.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="text-[15px] font-extrabold">{formatCoin(t.amount)}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
