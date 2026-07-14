import { listClubs } from "@/lib/db/clubs";
import { listAllApiKeys } from "@/lib/db/apiKeys";
import { deactivateKeyAction } from "@/app/admin/actions";
import { Card, CardTitle } from "@/components/ui/primitives";
import { CreateClubForm, KeyIssueForm, VaultDepositForm } from "@/components/admin/ClubForms";
import { formatCoin, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminClubsPage() {
  const [clubs, keys] = await Promise.all([listClubs(), listAllApiKeys()]);
  const keysByClub = new Map<string, typeof keys>();
  for (const k of keys) {
    const arr = keysByClub.get(k.club_id) ?? [];
    arr.push(k);
    keysByClub.set(k.club_id, arr);
  }

  function maskKey(key: string) {
    return key.length > 16 ? `${key.slice(0, 12)}…${key.slice(-4)}` : key;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">부스 · API 키</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <CreateClubForm />
        <KeyIssueForm clubs={clubs} />
      </div>

      <Card>
        <CardTitle>부스 목록 ({clubs.length})</CardTitle>
        <div className="mt-4 space-y-4">
          {clubs.map((c) => {
            const clubKeys = keysByClub.get(c.id) ?? [];
            return (
              <div key={c.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold">{c.name}</span>
                    <span className="ml-2 text-sm text-muted">{c.id}</span>
                  </div>
                  <div className="text-sm font-semibold">금고 {formatCoin(c.balance)} 코인</div>
                </div>

                <VaultDepositForm club={c} />

                <div className="mt-3 space-y-1.5">
                  {clubKeys.length === 0 ? (
                    <p className="text-xs text-muted">발급된 키 없음</p>
                  ) : (
                    clubKeys.map((k) => (
                      <div
                        key={k.key}
                        className="flex items-center justify-between gap-2 rounded-lg bg-subtle px-3 py-2 text-xs"
                      >
                        <code className="font-mono">{maskKey(k.key)}</code>
                        <span className="text-muted">
                          {k.active ? (
                            <span className="text-emerald-600 dark:text-emerald-400">활성</span>
                          ) : (
                            "비활성"
                          )}
                          {" · "}
                          {k.last_used_at ? `마지막 사용 ${formatDateTime(k.last_used_at)}` : "미사용"}
                        </span>
                        {k.active ? (
                          <form action={deactivateKeyAction}>
                            <input type="hidden" name="key" value={k.key} />
                            <button className="font-semibold text-red-500 hover:underline">
                              비활성화
                            </button>
                          </form>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
