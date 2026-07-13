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

const BASE = "https://<your-app>/api/v1";

export default function DocsPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[220px_1fr]">
      {/* 사이드바 */}
      <aside className="hidden lg:block">
        <nav className="sticky top-24 space-y-4 text-sm">
          <div className="font-bold uppercase tracking-widest text-stone-500">
            NA&apos;PLACE COIN API
          </div>
          {NAV.map((section, i) => (
            <div key={i} className="space-y-1">
              {section.group ? (
                <div className="pt-2 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-500">
                  {section.group}
                </div>
              ) : null}
              {section.items.map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block rounded px-2 py-1 text-stone-600 transition-colors hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
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
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-tight">
            부스가 직접 만드는
            <br />
            결제/조회 도구를 위한 API
          </h1>
          <p className="mt-5 leading-relaxed text-stone-600 dark:text-stone-300">
            공식 웹앱 없이도 부스 자체 키오스크·스크립트(예: 몬티홀 도박 게임)에서 코인 잔액을 조회하고
            학생에게 지급하거나 학생에게서 수금할 수 있습니다.{" "}
            <strong>보안을 최소화한 시스템이라, 학생 잔액에 영향을 주는 요청도 학번(student_id)만으로 처리됩니다.</strong>{" "}
            QR 스캔이나 해시 토큰은 필요하지 않습니다.
          </p>
          <div className="mt-6">
            <div className="inline-flex items-center gap-3 rounded-lg bg-stone-900 px-3 py-2 text-stone-100">
              <span className="text-xs font-semibold text-stone-400">BASE URL</span>
              <code className="font-mono text-sm">/api/v1</code>
              <CopyButton value="/api/v1" className="text-stone-400 hover:bg-stone-800 hover:text-stone-100" />
            </div>
            <p className="mt-2 text-xs text-stone-500">
              실제 호출 시 앞에 배포 도메인을 붙이세요 (예: {BASE}).
            </p>
          </div>
        </DocSection>

        {/* 인증 */}
        <DocSection id="auth">
          <DocH2 id="auth-h">인증</DocH2>
          <p className="mt-3 leading-relaxed text-stone-600 dark:text-stone-300">
            모든 요청에 부스 API 키를 <code className="font-mono">X-API-Key</code> 헤더로 담아 보냅니다.
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
          <DocH2 id="errors-h">에러 & 레이트리밋</DocH2>
          <p className="mt-3 leading-relaxed text-stone-600 dark:text-stone-300">
            모든 에러는 <code className="font-mono">{`{ "message": "..." }`}</code> 형태의 JSON 으로 응답합니다.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-stone-300 dark:border-stone-700">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["200", "성공"],
                  ["400", "필수값 누락 / 잘못된 금액 / 잘못된 거래 유형 / 잔액 부족"],
                  ["401", "X-API-Key 누락 또는 유효하지 않음"],
                  ["404", "학생/부스/요청을 찾을 수 없음"],
                  ["429", "요청이 너무 많음 (레이트리밋)"],
                ].map(([code, meaning]) => (
                  <tr key={code} className="border-b border-stone-200 last:border-0 dark:border-stone-800">
                    <td className="w-20 px-4 py-2.5 font-mono font-semibold">{code}</td>
                    <td className="px-4 py-2.5 text-stone-600 dark:text-stone-300">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-stone-500">
            레이트리밋: 조회 60회/분, <code className="font-mono">/transfer</code> 20회/분 (부스 키 기준, 베스트 에포트).
          </p>
        </DocSection>

        {/* ---------- 조회 ---------- */}
        <DocSection id="me">
          <EndpointHeading method="GET" path="/me" />
          <p className="mt-3 text-stone-600 dark:text-stone-300">
            API 키에 해당하는 부스의 정보와 잔액을 반환합니다.
          </p>
          <div className="mt-4">
            <CodeBlock label="200 응답" code={`{ "id": "montyhall", "name": "몬티홀 도박 부스", "balance": 1000000, "type": "club" }`} />
          </div>
        </DocSection>

        <DocSection id="students">
          <EndpointHeading method="GET" path="/students/{id}" />
          <p className="mt-3 text-stone-600 dark:text-stone-300">
            학번(id)으로 학생 이름과 잔액을 조회합니다. 게임 시작 전 잔액 확인에 사용하세요.
          </p>
          <div className="mt-4">
            <CodeBlock label="200 응답" code={`{ "id": "2601", "name": "나플 데모 학생", "balance": 1000, "club_id": null }`} />
          </div>
        </DocSection>

        <DocSection id="lookup">
          <EndpointHeading method="GET" path="/students/lookup?student_id=" />
          <p className="mt-3 text-stone-600 dark:text-stone-300">
            호환용. 원본은 QR 해시로 조회했지만, 본 시스템은 보안 최소화 정책상 학번 그 자체로 조회합니다.
            <code className="ml-1 font-mono">?student_id=2601</code> 또는 <code className="ml-1 font-mono">?hash=2601</code> 모두 허용합니다.
          </p>
        </DocSection>

        <DocSection id="ranking-clubs">
          <EndpointHeading method="GET" path="/ranking/clubs" />
          <p className="mt-3 text-stone-600 dark:text-stone-300">잔액 내림차순 부스 랭킹.</p>
        </DocSection>

        <DocSection id="ranking-students">
          <EndpointHeading method="GET" path="/ranking/students" />
          <p className="mt-3 text-stone-600 dark:text-stone-300">잔액 내림차순 학생 랭킹 (소속 부스 포함).</p>
        </DocSection>

        <DocSection id="transactions">
          <EndpointHeading method="GET" path="/transactions/me" />
          <p className="mt-3 text-stone-600 dark:text-stone-300">우리 부스의 거래 내역 (최신순).</p>
          <div className="mt-4">
            <CodeBlock
              label="200 응답"
              code={`[\n  { "amount": 100, "title": "몬티홀 베팅", "transaction_type": "student_to_club", "timestamp": "2026-07-13T..." }\n]`}
            />
          </div>
        </DocSection>

        {/* ---------- 결제 ---------- */}
        <DocSection id="transfer">
          <DocH2 id="transfer-h">POST /transfer</DocH2>
          <p className="mt-3 leading-relaxed text-stone-600 dark:text-stone-300">
            우리 부스와 학생 사이의 코인을 이동합니다. 지급/결제 방향은 <code className="font-mono">type</code> 으로 정하고,
            부스 쪽 계좌는 API 키로 자동 지정됩니다. <strong>보안 최소화 정책상 QR 없이 학번(student_id)으로 바로 처리됩니다.</strong>
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
              label="요청 · 학생에게 지급(당첨)"
              code={`curl -X POST ${BASE}/transfer \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "student_id": "2601",\n    "amount": 300,\n    "type": "club_to_student",\n    "title": "몬티홀 당첨"\n  }'`}
            />
            <CodeBlock
              label="요청 · 학생에게 결제받기(베팅)"
              code={`curl -X POST ${BASE}/transfer \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "student_id": "2601",\n    "amount": 100,\n    "type": "student_to_club",\n    "title": "몬티홀 베팅"\n  }'`}
            />
            <CodeBlock
              label="200 응답"
              code={`{ "message": "결제가 완료되었습니다." }\n// 잔액 부족: 400 { "message": "잔액이 부족합니다." }\n// 학생 없음: 404 { "message": "학생을 찾을 수 없거나 QR이 만료되었습니다." }`}
            />
          </div>
        </DocSection>

        <DocSection id="payment-requests">
          <DocH2 id="pr-h">POST /payment-requests</DocH2>
          <p className="mt-3 leading-relaxed text-stone-600 dark:text-stone-300">
            학번으로 결제 요청을 생성합니다. 학생 지갑 화면에 요청이 표시되고, 학생이 승인하면 결제됩니다.
            120초 후 자동 만료됩니다. (즉시 결제가 필요하면 <code className="font-mono">/transfer</code> 를 사용하세요.)
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
              label="요청"
              code={`curl -X POST ${BASE}/payment-requests \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{ "student_id": "2601", "amount": 500, "title": "몬티홀 칩 구매" }'`}
            />
            <CodeBlock
              label="201 응답"
              code={`{\n  "request_id": "pr_abc123",\n  "status": "pending",\n  "student": { "id": "2601", "name": "나플 데모 학생" },\n  "amount": 500,\n  "expires_at": "2026-07-13T..."\n}`}
            />
          </div>
        </DocSection>

        <DocSection id="pr-get">
          <EndpointHeading method="GET" path="/payment-requests/{id}" />
          <p className="mt-3 text-stone-600 dark:text-stone-300">
            결제 요청 상태를 폴링합니다. status: pending, approved, rejected, expired, canceled.
          </p>
        </DocSection>

        <DocSection id="pr-cancel">
          <EndpointHeading method="POST" path="/payment-requests/{id}/cancel" />
          <p className="mt-3 text-stone-600 dark:text-stone-300">대기중(pending)인 결제 요청을 취소합니다.</p>
        </DocSection>
      </article>
    </div>
  );
}
