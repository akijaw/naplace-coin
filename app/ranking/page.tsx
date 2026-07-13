import { rankingStudents } from "@/lib/db/users";
import { rankingClubs } from "@/lib/db/clubs";
import { getSessionUser } from "@/lib/session";
import { Container } from "@/components/ui/Container";
import { Tabs } from "@/components/ui/Tabs";
import { formatCoin } from "@/lib/format";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  name: string;
  balance: number;
  sub?: string | null;
}

function RankList({
  rows,
  emptyLabel,
  meId,
}: {
  rows: Row[];
  emptyLabel: string;
  meId?: string;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">{emptyLabel}</p>;
  }
  const [first, ...rest] = rows;
  const isMe = (r: Row) => meId && r.id === meId;

  return (
    <div className="flex flex-col gap-3">
      {/* 1위 — 네이비 카드 */}
      <div className="flex items-center justify-between rounded-card bg-ink px-6 py-5">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-white">
            1
          </span>
          <div>
            <div className="text-[17px] font-extrabold text-white">
              {first.name}
              {isMe(first) ? (
                <span className="ml-1.5 rounded-full bg-orange-tint px-2 py-0.5 text-[11px] font-extrabold text-brand">
                  나
                </span>
              ) : null}
            </div>
            {first.sub ? <div className="text-[13px] text-ink-soft">{first.sub}</div> : null}
          </div>
        </div>
        <div className="whitespace-nowrap text-xl font-extrabold text-white">
          {formatCoin(first.balance)}
          <span className="ml-1 text-[13px] font-semibold text-ink-soft">코인</span>
        </div>
      </div>

      {/* 2위 이하 — 흰 카드 리스트 */}
      {rest.length > 0 ? (
        <div className="rounded-card border border-border bg-card px-6 py-1.5">
          {rest.map((r, i) => {
            const me = isMe(r);
            return (
              <div
                key={r.id}
                className={`flex items-center justify-between py-4 ${
                  i < rest.length - 1 ? "border-b border-divider" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-extrabold ${
                      me ? "bg-orange-tint text-brand" : "bg-blue-tint text-blue"
                    }`}
                  >
                    {i + 2}
                  </span>
                  <div>
                    <div className="text-base font-bold">
                      {r.name}
                      {me ? (
                        <span className="ml-1.5 rounded-full bg-orange-tint px-2 py-0.5 text-[11px] font-extrabold text-brand">
                          나
                        </span>
                      ) : null}
                    </div>
                    {r.sub ? <div className="text-[13px] text-muted">{r.sub}</div> : null}
                  </div>
                </div>
                <div className="whitespace-nowrap text-base font-extrabold">
                  {formatCoin(r.balance)}
                  <span className="ml-1 text-xs font-semibold text-muted">코인</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default async function RankingPage() {
  const [students, clubs, me] = await Promise.all([
    rankingStudents(),
    rankingClubs(),
    getSessionUser(),
  ]);

  const studentRows: Row[] = students.map((s) => ({
    id: s.id,
    name: s.name,
    balance: s.balance,
    sub: s.club_name ?? `학번 ${s.id}`,
  }));
  const clubRows: Row[] = clubs.map((c) => ({ id: c.id, name: c.name, balance: c.balance }));

  return (
    <Container className="max-w-[760px] space-y-4">
      <h1 className="text-2xl font-extrabold tracking-tight">랭킹</h1>
      <Tabs
        tabs={[
          {
            key: "students",
            label: "개인 랭킹",
            content: (
              <RankList rows={studentRows} emptyLabel="등록된 학생이 없습니다." meId={me?.id} />
            ),
          },
          {
            key: "clubs",
            label: "부스 랭킹",
            content: <RankList rows={clubRows} emptyLabel="등록된 부스가 없습니다." />,
          },
        ]}
      />
    </Container>
  );
}
