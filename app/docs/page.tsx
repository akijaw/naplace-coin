import type { Metadata } from "next";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CopyButton } from "@/components/ui/CopyButton";
import {
  DocH2,
  DocSection,
  EndpointHeading,
  Eyebrow,
  FieldTable,
} from "@/components/docs/DocsBits";

export const metadata: Metadata = { title: "API 문서 | NA'PLACE COIN" };

const NAV = [
  { group: null, items: [["개요", "overview"], ["인증", "auth"], ["에러 & 레이트리밋", "errors"]] },
  {
    group: "조회",
    items: [
      ["GET /me", "me"],
      ["GET /students/{id}", "students"],
      ["GET /students/lookup", "lookup"],
      ["GET /ranking/clubs", "ranking-clubs"],
      ["GET /ranking/students", "ranking-students"],
      ["GET /transactions/me", "transactions"],
    ],
  },
  {
    group: "결제",
    items: [
      ["POST /transfer", "transfer"],
      ["POST /payment-requests", "payment-requests"],
      ["GET /payment-requests/{id}", "pr-get"],
      ["POST /payment-requests/{id}/cancel", "pr-cancel"],
    ],
  },
] as const;

// NA'PLACE 동아리 부스(게임) — 문서 예시에 쓰는 슬러그/이름.
const BOOTHS = [
  ["montyhall", "몬티홀"],
  ["penney", "페니게임"],
  ["mathtetris", "수학테트리스"],
  ["exchange", "환전소"],
] as const;

const BASE = "https://<your-app>/api/v1";

export default function DocsPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[220px_1fr]">
      {/* 사이드바 */}
      <aside className="hidden lg:block">
        <nav className="sticky top-24 space-y-4 text-sm">
          <div className="text-xs font-extrabold uppercase tracking-widest text-muted">
            NA&apos;PLACE COIN API
          </div>
          {NAV.map((section, i) => (
            <div key={i} className="space-y-1">
              {section.group ? (
                <div className="pt-2 text-xs font-extrabold uppercase tracking-widest text-brand">
                  {section.group}
                </div>
              ) : null}
              {section.items.map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block rounded-lg px-2 py-1 font-medium text-muted transition-colors hover:bg-subtle hover:text-fg"
                >
                  {label}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* 본문 */}
      <article className="max-w-3xl space-y-12">
        {/* 개요 */}
        <DocSection id="overview">
          <Eyebrow>NA&apos;PLACE COIN · 부스 연동 API V1</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-[2.75rem]">
            우리 동아리 부스가
            <br />
            <span className="text-brand">직접 코인을 다루는</span> API
          </h1>
          <p className="mt-5 leading-relaxed text-muted">
            NA&apos;PLACE 코인은 우리 동아리 축제의 여러 게임 부스에서 함께 쓰는 플레이머니입니다.
            공식 웹앱 없이도 각 부스의 키오스크·게임 스크립트에서 학생 잔액을 조회하고, 참가비를 받거나
            보상을 지급할 수 있습니다.{" "}
            <strong className="text-fg">
              보안을 최소화한 축제용 시스템이라, 잔액에 영향을 주는 요청도 학번(student_id)만으로 처리됩니다.
            </strong>{" "}
            QR 스캔이나 해시 토큰은 필요하지 않습니다.
          </p>

          {/* 부스 예시 칩 */}
          <div className="mt-6 flex flex-wrap gap-2">
            {BOOTHS.map(([slug, name]) => (
              <span
                key={slug}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-semibold"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {name}
                <code className="font-mono text-xs text-muted">{slug}</code>
              </span>
            ))}
          </div>

          <div className="mt-6">
            <div className="inline-flex items-center gap-3 rounded-xl bg-ink px-3.5 py-2.5 text-white">
              <span className="text-xs font-bold text-ink-soft">BASE URL</span>
              <code className="font-mono text-sm">/api/v1</code>
              <CopyButton value="/api/v1" className="text-ink-soft hover:bg-white/10 hover:text-white" />
            </div>
            <p className="mt-2 text-xs text-muted">
              실제 호출 시 앞에 배포 도메인을 붙이세요 (예: {BASE}).
            </p>
          </div>
        </DocSection>

        {/* 인증 */}
        <DocSection id="auth">
          <DocH2 id="auth-h">인증</DocH2>
          <p className="mt-3 leading-relaxed text-muted">
            모든 요청에 부스 API 키를 <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-fg">X-API-Key</code> 헤더로 담아 보냅니다.
            키는 관리자 페이지에서 부스별로 발급/재발급되며, 재발급 시 이전 키는 즉시 무효화됩니다.
          </p>
          <div className="mt-4">
            <CodeBlock
              label="curl"
              code={`curl -H "X-API-Key: YOUR_API_KEY" \\\n  ${BASE}/me`}
            />
          </div>
        </DocSection>

        {/* 에러 & 레이트리밋 */}
        <DocSection id="errors">
          <DocH2 id="errors-h">에러 &amp; 레이트리밋</DocH2>
          <p className="mt-3 leading-relaxed text-muted">
            모든 에러는 <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-fg">{`{ "message": "..." }`}</code> 형태의 JSON 으로 응답합니다.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["200", "성공"],
                  ["400", "필수값 누락 / 잘못된 금액 / 잘못된 거래 유형 / 잔액 부족"],
                  ["401", "X-API-Key 누락 또는 유효하지 않음"],
                  ["404", "학생/부스/요청을 찾을 수 없음"],
                  ["429", "요청이 너무 많음 (레이트리밋)"],
                ].map(([code, meaning]) => (
                  <tr key={code} className="border-b border-border last:border-0">
                    <td className="w-20 px-4 py-2.5 font-mono font-bold text-fg">{code}</td>
                    <td className="px-4 py-2.5 text-muted">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">
            레이트리밋: 조회 60회/분, <code className="font-mono">/transfer</code> 20회/분 (부스 키 기준, 베스트 에포트).
          </p>
        </DocSection>

        {/* ---------- 조회 ---------- */}
        <DocSection id="me">
          <EndpointHeading method="GET" path="/me" />
          <p className="mt-3 text-muted">
            API 키에 해당하는 부스의 정보와 잔액을 반환합니다.
          </p>
          <div className="mt-4">
            <CodeBlock label="200 응답" code={`{ "id": "penney", "name": "페니게임 부스", "balance": 1000000, "type": "club" }`} />
          </div>
        </DocSection>

        <DocSection id="students">
          <EndpointHeading method="GET" path="/students/{id}" />
          <p className="mt-3 text-muted">
            학번(id)으로 학생 이름과 잔액을 조회합니다. 게임 시작 전 잔액 확인에 사용하세요.
          </p>
          <div className="mt-4">
            <CodeBlock label="200 응답" code={`{ "id": "2601", "name": "나플 데모 학생", "balance": 1000, "club_id": null }`} />
          </div>
        </DocSection>

        <DocSection id="lookup">
          <EndpointHeading method="GET" path="/students/lookup?student_id=" />
          <p className="mt-3 text-muted">
            호환용. 원본은 QR 해시로 조회했지만, 본 시스템은 보안 최소화 정책상 학번 그 자체로 조회합니다.
            <code className="ml-1 font-mono">?student_id=2601</code> 또는 <code className="ml-1 font-mono">?hash=2601</code> 모두 허용합니다.
          </p>
        </DocSection>

        <DocSection id="ranking-clubs">
          <EndpointHeading method="GET" path="/ranking/clubs" />
          <p className="mt-3 text-muted">잔액 내림차순 부스 랭킹.</p>
        </DocSection>

        <DocSection id="ranking-students">
          <EndpointHeading method="GET" path="/ranking/students" />
          <p className="mt-3 text-muted">잔액 내림차순 학생 랭킹 (소속 부스 포함).</p>
        </DocSection>

        <DocSection id="transactions">
          <EndpointHeading method="GET" path="/transactions/me" />
          <p className="mt-3 text-muted">우리 부스의 거래 내역 (최신순).</p>
          <div className="mt-4">
            <CodeBlock
              label="200 응답"
              code={`[\n  { "amount": 100, "title": "페니게임 참가비", "transaction_type": "student_to_club", "timestamp": "2026-07-14T..." },\n  { "amount": 200, "title": "페니게임 승리 보상", "transaction_type": "club_to_student", "timestamp": "2026-07-14T..." }\n]`}
            />
          </div>
        </DocSection>

        {/* ---------- 결제 ---------- */}
        <DocSection id="transfer">
          <DocH2 id="transfer-h">POST /transfer</DocH2>
          <p className="mt-3 leading-relaxed text-muted">
            우리 부스와 학생 사이의 코인을 이동합니다. 지급/결제 방향은 <code className="font-mono text-fg">type</code> 으로 정하고,
            부스 쪽 계좌는 API 키로 자동 지정됩니다. <strong className="text-fg">보안 최소화 정책상 QR 없이 학번(student_id)으로 바로 처리됩니다.</strong>
          </p>
          <div className="mt-4">
            <FieldTable
              fields={[
                { name: "student_id", required: true, desc: "학번. (원본 호환을 위해 student_hash 도 학번으로 간주)" },
                { name: "amount", required: true, desc: "0보다 큰 금액" },
                { name: "type", required: true, desc: "club_to_student(부스→학생 지급) 또는 student_to_club(학생→부스 결제)" },
                { name: "title", desc: '거래 내역에 남길 설명, 예: "몬티홀 당첨"' },
              ]}
            />
          </div>
          <div className="mt-5 space-y-4">
            <CodeBlock
              label="요청 · 학생에게 지급 (예: 몬티홀 당첨 보상)"
              code={`curl -X POST ${BASE}/transfer \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "student_id": "2601",\n    "amount": 300,\n    "type": "club_to_student",\n    "title": "몬티홀 당첨"\n  }'`}
            />
            <CodeBlock
              label="요청 · 학생에게 결제받기 (예: 페니게임 참가비)"
              code={`curl -X POST ${BASE}/transfer \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "student_id": "2601",\n    "amount": 100,\n    "type": "student_to_club",\n    "title": "페니게임 참가비"\n  }'`}
            />
            <CodeBlock
              label="200 응답"
              code={`{ "message": "결제가 완료되었습니다." }\n// 잔액 부족: 400 { "message": "잔액이 부족합니다." }\n// 학생 없음: 404 { "message": "학생을 찾을 수 없거나 QR이 만료되었습니다." }`}
            />
          </div>
        </DocSection>

        <DocSection id="payment-requests">
          <DocH2 id="pr-h">POST /payment-requests</DocH2>
          <p className="mt-3 leading-relaxed text-muted">
            학번으로 자동 결제를 실행합니다. 학생의 별도 승인 없이 학생 잔액에서 부스 잔액으로 즉시 이동합니다.
            수학테트리스·환전소처럼 &ldquo;참가비/이용료를 즉시 차감&rdquo;하는 부스에 적합합니다.
          </p>
          <div className="mt-4">
            <FieldTable
              fields={[
                { name: "student_id", required: true, desc: "학번" },
                { name: "amount", required: true, desc: "0보다 큰 금액" },
                { name: "title", desc: "학생에게 표시될 설명" },
              ]}
            />
          </div>
          <div className="mt-5 space-y-4">
            <CodeBlock
              label="요청 (예: 수학테트리스 참가비)"
              code={`curl -X POST ${BASE}/payment-requests \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{ "student_id": "2601", "amount": 500, "title": "수학테트리스 참가비" }'`}
            />
            <CodeBlock
              label="201 응답"
              code={`{\n  "request_id": "pr_abc123",\n  "status": "approved",\n  "student": { "id": "2601", "name": "나플 데모 학생" },\n  "amount": 500,\n  "completed_at": "2026-07-14T..."\n}`}
            />
          </div>
        </DocSection>

        <DocSection id="pr-get">
          <EndpointHeading method="GET" path="/payment-requests/{id}" />
          <p className="mt-3 text-muted">
            결제 기록의 상태를 조회합니다. 자동 결제가 성공하면 status는 즉시 approved입니다.
          </p>
        </DocSection>

        <DocSection id="pr-cancel">
          <EndpointHeading method="POST" path="/payment-requests/{id}/cancel" />
          <p className="mt-3 text-muted">이전 방식으로 생성된 대기중(pending) 요청만 취소할 수 있습니다.</p>
        </DocSection>
      </article>
    </div>
  );
}
