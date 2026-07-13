import { listClubs } from "@/lib/db/clubs";
import { listAll } from "@/lib/db/paymentRequests";
import { cancelAdminRequest } from "@/app/admin/actions";
import { Card, CardTitle, StatusPill } from "@/components/ui/primitives";
import { AutoRefresh } from "@/components/ui/AutoRefresh";
import { PaymentRequestForm } from "@/components/admin/PaymentRequestForm";
import { formatCoin, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const [clubs, requests] = await Promise.all([listClubs(), listAll(200)]);

  return (
    <div className="space-y-6">
      <AutoRefresh intervalMs={3000} />
      <h1 className="text-2xl font-extrabold tracking-tight">자동 결제</h1>

      <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
        <PaymentRequestForm clubs={clubs} />

        <Card>
          <CardTitle>결제 기록</CardTitle>
          {requests.length === 0 ? (
            <p className="mt-4 text-sm text-muted">결제 기록이 없습니다.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="py-2 pr-2 font-semibold">학생</th>
                    <th className="py-2 pr-2 font-semibold">부스</th>
                    <th className="py-2 pr-2 font-semibold">금액</th>
                    <th className="py-2 pr-2 font-semibold">상태</th>
                    <th className="py-2 pr-2 font-semibold">생성</th>
                    <th className="py-2 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-2">
                        {r.student_name ?? r.student_id}
                        <span className="block text-xs text-muted">{r.student_id}</span>
                      </td>
                      <td className="py-2.5 pr-2">{r.club_name ?? r.club_id}</td>
                      <td className="py-2.5 pr-2 font-semibold">{formatCoin(r.amount)}</td>
                      <td className="py-2.5 pr-2">
                        <StatusPill status={r.status} />
                      </td>
                      <td className="py-2.5 pr-2 text-xs text-muted">
                        {formatDateTime(r.created_at)}
                      </td>
                      <td className="py-2.5">
                        {r.status === "pending" ? (
                          <form action={cancelAdminRequest}>
                            <input type="hidden" name="id" value={r.id} />
                            <button className="text-xs font-semibold text-red-500 hover:underline">
                              취소
                            </button>
                          </form>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
