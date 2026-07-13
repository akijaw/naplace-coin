import Link from "next/link";
import Image from "next/image";
import { getSessionUser } from "@/lib/session";
import { Container } from "@/components/ui/Container";
import { buttonStyles } from "@/components/ui/primitives";
import { formatCoin } from "@/lib/format";

export const dynamic = "force-dynamic";

function Bullet({ title, desc, tone }: { title: string; desc: string; tone: "brand" | "blue" }) {
  return (
    <li className="flex gap-2.5">
      <span
        className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone === "brand" ? "bg-brand" : "bg-blue"}`}
      />
      <span className="text-[15px]">
        <span className="font-extrabold">{title}</span>{" "}
        <span className="text-muted">— {desc}</span>
      </span>
    </li>
  );
}

function Step({ n, tone, children }: { n: number; tone: "blue" | "brand"; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
          tone === "blue" ? "bg-blue-tint text-blue" : "bg-orange-tint text-brand-dark"
        }`}
      >
        {n}
      </span>
      <span className="text-sm text-fg/75">{children}</span>
    </li>
  );
}

const cardCls = "rounded-card border border-border bg-card p-7 sm:p-8";

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <Container className="space-y-5 pb-16">
      {/* 히어로 */}
      <section className="relative overflow-hidden rounded-3xl bg-ink p-8 sm:p-11">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-[520px]">
            <div className="text-[13px] font-extrabold tracking-[0.12em] text-brand">
              NA&apos;PLACE COIN
            </div>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-[38px]">
              축제의 모든 코인,
              <br />한 곳에서.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              NA&apos;PLACE 코인은 몬티홀 도박 부스를 비롯한 여러 부스에서 사용하는 자체 화폐입니다.
              부스에서 코인을 획득하거나, 게임에 참여하며 코인을 사용할 수 있습니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                href={user ? "/wallet" : "/login"}
                className="inline-flex h-[50px] items-center rounded-2xl bg-brand px-6 text-[15px] font-extrabold text-white transition-colors hover:bg-brand-dark"
              >
                {user ? "내 지갑 열기" : "로그인하고 시작하기"}
              </Link>
              <Link
                href="/ranking"
                className="inline-flex h-[50px] items-center rounded-2xl border border-ink-line bg-blue/10 px-6 text-[15px] font-bold text-[#BCD3EA] transition-colors hover:bg-blue/20"
              >
                랭킹 보기
              </Link>
            </div>
          </div>
          <Image
            src="/logo.png"
            alt="NA'PLACE 로고"
            width={180}
            height={198}
            className="hidden rounded-[28px] bg-white p-6 sm:block"
            style={{ width: 180, height: 198, objectFit: "contain" }}
            priority
          />
        </div>
      </section>

      {/* 내 정보 (로그인 시) */}
      {user ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card px-6 py-5">
            <div className="text-[13px] font-semibold text-muted">이름</div>
            <div className="mt-1.5 text-xl font-extrabold">{user.name}</div>
          </div>
          <div className="rounded-3xl border border-border bg-card px-6 py-5">
            <div className="text-[13px] font-semibold text-muted">학번(ID)</div>
            <div className="mt-1.5 text-xl font-extrabold">{user.id}</div>
          </div>
          <div className="rounded-3xl border border-border bg-card px-6 py-5">
            <div className="text-[13px] font-semibold text-muted">보유 코인</div>
            <div className="mt-1.5 text-xl font-extrabold text-brand">
              {formatCoin(user.balance)} 코인
            </div>
          </div>
        </div>
      ) : null}

      {/* 기능 2열 */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className={cardCls}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-tint text-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            </span>
            <h2 className="text-lg font-extrabold tracking-tight">학생용 기능</h2>
          </div>
          <ul className="mt-5 space-y-3">
            <Bullet tone="brand" title="내 계좌" desc="잔액 조회 및 QR 코드 생성" />
            <Bullet tone="brand" title="활동 내역" desc="거래 히스토리 확인" />
            <Bullet tone="brand" title="랭킹" desc="개인 및 부스 순위 확인" />
            <Bullet tone="brand" title="결제 승인" desc="부스의 결제 요청을 확인하고 승인" />
          </ul>
        </div>
        <div className={cardCls}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-tint text-brand">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9" /><path d="M4 11v9h16v-9" /><path d="M9 20v-5h6v5" /></svg>
            </span>
            <h2 className="text-lg font-extrabold tracking-tight">동아리·부스용 기능</h2>
          </div>
          <ul className="mt-5 space-y-3">
            <Bullet tone="blue" title="결제 처리" desc="코인 지급/차감 처리" />
            <Bullet tone="blue" title="학번 결제 요청" desc="학번 입력으로 결제 요청 전송" />
            <Bullet tone="blue" title="활동 관리" desc="다양한 활동 유형 관리" />
            <Bullet tone="blue" title="API 연동" desc="부스 자체 프로그램에서 API 호출" />
          </ul>
        </div>
      </div>

      {/* 활동 유형 */}
      <div className={cardCls}>
        <h2 className="text-lg font-extrabold tracking-tight">활동 유형</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-blue-tint p-5">
            <div className="font-extrabold text-blue">코인 획득 (부스 → 학생)</div>
            <ul className="mt-2.5 space-y-1.5 text-sm text-[#4A6076]">
              <li>· 부스 방문 보상</li>
              <li>· 게임 당첨 보상</li>
              <li>· 체험 활동 완료 보상</li>
              <li>· 퀴즈 정답 보상</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-orange-tint p-5">
            <div className="font-extrabold text-brand-dark">코인 사용 (학생 → 부스)</div>
            <ul className="mt-2.5 space-y-1.5 text-sm text-[#8A5A3C]">
              <li>· 몬티홀 게임 참여비(베팅)</li>
              <li>· 상품 구매</li>
              <li>· 특별 체험 이용료</li>
              <li>· 기념품 구매</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 사용 방법 */}
      <div className={cardCls}>
        <h2 className="text-lg font-extrabold tracking-tight">사용 방법</h2>
        <div className="mt-5 grid gap-8 md:grid-cols-2">
          <div>
            <div className="text-[15px] font-extrabold text-blue">학생 사용법</div>
            <ol className="mt-2.5 space-y-2.5">
              <Step n={1} tone="blue">학번과 비밀번호로 로그인</Step>
              <Step n={2} tone="blue">내 계좌에서 QR 코드 확인</Step>
              <Step n={3} tone="blue">부스에서 QR 코드 제시 또는 학번 전달</Step>
              <Step n={4} tone="blue">결제 요청이 오면 지갑에서 승인</Step>
              <Step n={5} tone="blue">활동 내역에서 거래 기록 확인</Step>
            </ol>
          </div>
          <div>
            <div className="text-[15px] font-extrabold text-brand-dark">부스 운영법</div>
            <ol className="mt-2.5 space-y-2.5">
              <Step n={1} tone="brand">학생의 학번(또는 QR) 확인</Step>
              <Step n={2} tone="brand">지급/결제 금액과 활동 선택</Step>
              <Step n={3} tone="brand">결제 요청 전송 또는 API 호출</Step>
              <Step n={4} tone="brand">학생 승인 후 거래 완료</Step>
              <Step n={5} tone="brand">성공/실패 메시지 확인</Step>
            </ol>
          </div>
        </div>
      </div>

      {/* 문제 해결 */}
      <div className={cardCls}>
        <h2 className="text-lg font-extrabold tracking-tight">문제 해결</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            ["결제 요청이 안 보여요", "지갑 페이지를 새로고침하고, 요청이 만료(120초)되지 않았는지 확인하세요."],
            ["거래가 처리되지 않아요", "네트워크 연결을 확인하고 잔액이 충분한지 확인하세요."],
            ["잔액이 업데이트되지 않아요", "페이지를 새로고침해 주세요."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl bg-subtle p-5">
              <div className="text-sm font-extrabold">{t}</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="pt-2 text-center text-[17px] font-extrabold">즐거운 학술발표회 되세요! 🎉</p>
    </Container>
  );
}
