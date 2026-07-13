import { listUsers } from "@/lib/db/users";
import { listClubs } from "@/lib/db/clubs";
import { toggleUserActive } from "@/app/admin/actions";
import { Card, CardTitle } from "@/components/ui/primitives";
import { CreateUserForm, AdjustBalanceForm } from "@/components/admin/UserForms";
import { formatCoin } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, clubs] = await Promise.all([listUsers(), listClubs()]);
  const clubName = new Map(clubs.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">사용자 관리</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <CreateUserForm clubs={clubs} />
        <AdjustBalanceForm />
      </div>

      <Card>
        <CardTitle>사용자 목록 ({users.length})</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="py-2 pr-2 font-semibold">이름 / 학번</th>
                <th className="py-2 pr-2 font-semibold">아이디</th>
                <th className="py-2 pr-2 font-semibold">부스</th>
                <th className="py-2 pr-2 font-semibold">잔액</th>
                <th className="py-2 pr-2 font-semibold">상태</th>
                <th className="py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-2">
                    <span className="font-medium">{u.name}</span>
                    <span className="block text-xs text-muted">{u.id}</span>
                  </td>
                  <td className="py-2.5 pr-2 text-muted">{u.username}</td>
                  <td className="py-2.5 pr-2 text-muted">
                    {u.club_id ? clubName.get(u.club_id) ?? u.club_id : "-"}
                  </td>
                  <td className="py-2.5 pr-2 font-semibold">{formatCoin(u.balance)}</td>
                  <td className="py-2.5 pr-2">
                    {u.active ? (
                      <span className="text-emerald-600 dark:text-emerald-400">활성</span>
                    ) : (
                      <span className="text-muted">비활성</span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <form action={toggleUserActive}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="active" value={u.active ? "0" : "1"} />
                      <button className="text-xs font-semibold text-muted hover:text-fg hover:underline">
                        {u.active ? "비활성화" : "활성화"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
