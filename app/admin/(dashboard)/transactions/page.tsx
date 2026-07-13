import Link from "next/link";
import { listTransactions } from "@/lib/db/stats";
import { Card, CardTitle, cn } from "@/components/ui/primitives";
import { formatCoin, formatDateTime, txLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

const TYPES = [
  ["", "전체"],
  ["admin_grant", "관리자 지급"],
  ["admin_deduct", "관리자 회수"],
  ["club_to_student", "부스→학생"],
  ["student_to_club", "학생→부스"],
] as const;

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; account?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const type = resolvedSearchParams.type || undefined;
  const account = resolvedSearchParams.account || undefined;
  const txs = await listTransactions({ type, accountId: account, limit: 300 });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">전체 거래 내역</h1>

      <Card>
        <form className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1.5 block font-semibold">유형</span>
            <select
              name="type"
              defaultValue={type ?? ""}
              className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-fg/40"
            >
              {TYPES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-semibold">계정 ID (학번/부스)</span>
            <input
              name="account"
              defaultValue={account ?? ""}
              placeholder="예: 2601 또는 montyhall"
              className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-fg/40"
            />
          </label>
          <button className="rounded-xl bg-fg px-4 py-2.5 text-sm font-semibold text-bg">필터</button>
          <Link href="/admin/transactions" className="px-2 py-2.5 text-sm text-muted hover:text-fg">
            초기화
          </Link>
        </form>
      </Card>

      <Card>
        <CardTitle>거래 ({txs.length})</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="py-2 pr-2 font-semibold">#</th>
                <th className="py-2 pr-2 font-semibold">유형</th>
                <th className="py-2 pr-2 font-semibold">학생</th>
                <th className="py-2 pr-2 font-semibold">부스</th>
                <th className="py-2 pr-2 font-semibold">금액</th>
                <th className="py-2 pr-2 font-semibold">제목</th>
                <th className="py-2 font-semibold">시각</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-2 text-muted">{t.id}</td>
                  <td className="py-2.5 pr-2">
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        t.transaction_type === "admin_grant" || t.transaction_type === "club_to_student"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400",
                      )}
                    >
                      {txLabel(t.transaction_type)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-2">{t.student_name ?? t.student_id ?? "-"}</td>
                  <td className="py-2.5 pr-2">{t.club_name ?? t.club_id ?? "-"}</td>
                  <td className="py-2.5 pr-2 font-semibold">{formatCoin(t.amount)}</td>
                  <td className="py-2.5 pr-2 text-muted">{t.title ?? "-"}</td>
                  <td className="py-2.5 text-xs text-muted">{formatDateTime(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
