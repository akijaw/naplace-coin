import { rankingStudents } from "@/lib/db/users";
import { rankingClubs } from "@/lib/db/clubs";
import { Container } from "@/components/ui/Container";
import { Card, CardTitle } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/Tabs";
import { formatCoin } from "@/lib/format";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  name: string;
  balance: number;
  sub?: string | null;
}

const MEDALS = ["🥇", "🥈", "🥉"];

function RankList({ rows, emptyLabel }: { rows: Row[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">{emptyLabel}</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {rows.map((r, i) => (
        <li key={r.id} className="flex items-center justify-between py-3.5">
          <div className="flex items-center gap-3">
            <span className="w-7 text-center text-sm font-bold text-muted">
              {i < 3 ? MEDALS[i] : i + 1}
            </span>
            <div>
              <div className="font-semibold">{r.name}</div>
              {r.sub ? <div className="text-xs text-muted">{r.sub}</div> : null}
            </div>
          </div>
          <div className="font-bold">{formatCoin(r.balance)} 코인</div>
        </li>
      ))}
    </ul>
  );
}

export default async function RankingPage() {
  const [students, clubs] = await Promise.all([rankingStudents(), rankingClubs()]);

  const studentRows: Row[] = students.map((s) => ({
    id: s.id,
    name: s.name,
    balance: s.balance,
    sub: s.club_name ?? `학번 ${s.id}`,
  }));
  const clubRows: Row[] = clubs.map((c) => ({ id: c.id, name: c.name, balance: c.balance }));

  return (
    <Container>
      <Card>
        <CardTitle>랭킹</CardTitle>
        <div className="mt-6">
          <Tabs
            tabs={[
              {
                key: "students",
                label: "개인 랭킹",
                content: <RankList rows={studentRows} emptyLabel="등록된 학생이 없습니다." />,
              },
              {
                key: "clubs",
                label: "부스 랭킹",
                content: <RankList rows={clubRows} emptyLabel="등록된 부스가 없습니다." />,
              },
            ]}
          />
        </div>
      </Card>
    </Container>
  );
}
