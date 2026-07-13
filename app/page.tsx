import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { Container } from "@/components/ui/Container";
import { Card, CardTitle, buttonStyles } from "@/components/ui/primitives";
import { formatCoin } from "@/lib/format";

export const dynamic = "force-dynamic";

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <li className="flex gap-2">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fg" />
      <span>
        <span className="font-bold">{title}:</span>{" "}
        <span className="text-muted">{desc}</span>
      </span>
    </li>
  );
}

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <Container className="space-y-6">
      {/* 환영 카드 */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <CardTitle>환영합니다!</CardTitle>
          {user ? (
            <Link href="/wallet" className={buttonStyles("primary")}>
              내 페이지
            </Link>
          ) : (
            <Link href="/login" className={buttonStyles("primary")}>
              로그인
            </Link>
          )}
        </div>

        {user ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-subtle p-4">
              <div className="text-sm text-muted">이름</div>
              <div className="mt-0.5 text-lg font-bold">{user.name}</div>
            </div>
            <div className="rounded-xl bg-subtle p-4">
              <div className="text-sm text-muted">학번(ID)</div>
              <div className="mt-0.5 text-lg font-bold">{user.id}</div>
            </div>
            <div className="rounded-xl bg-subtle p-4 sm:col-span-2">
              <div className="text-sm text-muted">보유 코인</div>
              <div className="mt-0.5 text-lg font-bold">{formatCoin(user.balance)} 코인</div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-muted">
            로그인하면 내 코인 잔액과 QR 코드, 거래 내역을 확인할 수 있습니다.
          </p>
        )}
      </Card>

      {/* 시스템 소개 */}
      <Card>
        <CardTitle>NA&apos;PLACE 코인 시스템</CardTitle>
        <p className="mt-4 leading-relaxed text-muted">
          NA&apos;PLACE 코인은 몬티홀 도박 부스를 비롯한 여러 부스에서 사용하는 자체 화폐입니다.
          부스에서 코인을 획득하거나, 게임에 참여하며 코인을 사용할 수 있습니다.
        </p>
      </Card>

      {/* 기능 카드 2열 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle>학생용 기능</CardTitle>
          <ul className="mt-4 space-y-3 text-sm">
            <Feature title="내 계좌" desc="잔액 조회 및 QR 코드 생성" />
            <Feature title="활동 내역" desc="거래 히스토리 확인" />
            <Feature title="랭킹" desc="개인 및 부스 순위 확인" />
            <Feature title="결제 승인" desc="부스의 결제 요청을 확인하고 승인" />
          </ul>
        </Card>
        <Card>
          <CardTitle>동아리·부스용 기능</CardTitle>
          <ul className="mt-4 space-y-3 text-sm">
            <Feature title="결제 처리" desc="코인 지급/차감 처리" />
            <Feature title="학번 결제 요청" desc="학번 입력으로 결제 요청 전송" />
            <Feature title="활동 관리" desc="다양한 활동 유형 관리" />
            <Feature title="API 연동" desc="부스 자체 프로그램에서 API 호출" />
          </ul>
        </Card>
      </div>

      {/* 활동 유형 */}
      <Card>
        <CardTitle>활동 유형</CardTitle>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">
              코인 획득 (부스 → 학생)
            </div>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              <li>• 부스 방문 보상</li>
              <li>• 게임 당첨 보상</li>
              <li>• 체험 활동 완료 보상</li>
              <li>• 퀴즈 정답 보상</li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-rose-600 dark:text-rose-400">
              코인 사용 (학생 → 부스)
            </div>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              <li>• 몬티홀 게임 참여비(베팅)</li>
              <li>• 상품 구매</li>
              <li>• 특별 체험 이용료</li>
              <li>• 기념품 구매</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* 사용 방법 */}
      <Card>
        <CardTitle>사용 방법</CardTitle>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <div className="font-bold">학생 사용법</div>
            <ol className="mt-2 space-y-1 text-sm text-muted">
              <li>1. 학번과 비밀번호로 로그인</li>
              <li>2. 내 계좌에서 QR 코드 확인</li>
              <li>3. 부스에서 QR 코드 제시 또는 학번 전달</li>
              <li>4. 결제 요청이 오면 지갑에서 승인</li>
              <li>5. 활동 내역에서 거래 기록 확인</li>
            </ol>
          </div>
          <div>
            <div className="font-bold">부스 운영법</div>
            <ol className="mt-2 space-y-1 text-sm text-muted">
              <li>1. 학생의 학번(또는 QR) 확인</li>
              <li>2. 지급/결제 금액과 활동 선택</li>
              <li>3. 결제 요청 전송 또는 API 호출</li>
              <li>4. 학생 승인 후 거래 완료</li>
              <li>5. 성공/실패 메시지 확인</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* 문제 해결 */}
      <Card>
        <CardTitle>문제 해결</CardTitle>
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <div className="font-bold">결제 요청이 안 보여요</div>
            <p className="mt-1 text-muted">지갑 페이지를 새로고침하고, 요청이 만료(120초)되지 않았는지 확인하세요.</p>
          </div>
          <div>
            <div className="font-bold">거래가 처리되지 않아요</div>
            <p className="mt-1 text-muted">네트워크 연결을 확인하고 잔액이 충분한지 확인하세요.</p>
          </div>
          <div>
            <div className="font-bold">잔액이 업데이트되지 않아요</div>
            <p className="mt-1 text-muted">페이지를 새로고침해 주세요.</p>
          </div>
        </div>
      </Card>

      <p className="pt-2 text-center text-lg font-bold">🎉 즐거운 학술발표회 되세요!</p>
    </Container>
  );
}
