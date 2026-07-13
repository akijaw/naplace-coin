# NA'PLACE 코인 시스템

SADA COIN(coin.sada.ai.kr)을 모방해 만든 **자체 플레이머니 코인 시스템**입니다.
직접 제작한 **몬티홀 도박 사이트**가 REST API로 연결되어 코인을 지급/차감합니다.

- **학생/플레이어**: 잔액·QR·거래내역·결제 승인
- **부스**(몬티홀 게임 포함): 학번으로 지급/결제, API 연동
- **관리자**: **코인 지급(발행)**, **결제 요청**, 사용자·부스·API 키 관리
- **보안 최소화 정책**: QR 스캔 없이 학번(student_id)만으로 처리 (축제용 플레이머니 전제)

## 기술 스택

Next.js 15 (App Router) · TypeScript · Tailwind CSS · libSQL/Turso(SQLite) · Vercel 배포.

## GitHub에서 새로 시작하기

```bash
git clone https://github.com/akijaw/naplace-coin.git
cd naplace-coin
copy .env.example .env.local   # macOS/Linux: cp .env.example .env.local
npm install
npm run db:push
npm run db:seed
npm run dev
```

운영 서비스: https://naplace-coin.vercel.app

## 로컬 실행

```bash
npm install
npm run db:push      # db/schema.sql 적용 (개발용 file:local.db 생성)
npm run db:seed      # 데모 데이터 시드 (API 키/로그인 정보 출력)
npm run dev          # http://localhost:3000
```

시드가 출력하는 데모 정보:

| 항목 | 값 |
|---|---|
| 몬티홀 부스 API 키 | `nap_live_montyhall_demokey` |
| 데모 학생 로그인 | `naplace` / `1234` (학번 2601) |
| 관리자 비밀번호 | `.env.local` 의 `ADMIN_PASSWORD` (기본 `naplace-admin`) |

## 환경변수 (`.env.local`)

```
TURSO_DATABASE_URL=file:local.db     # 배포 시: libsql://<org>.turso.io
TURSO_AUTH_TOKEN=                     # 배포(Turso)에서만 필요
ADMIN_PASSWORD=naplace-admin          # 관리자 비밀번호 (배포 시 변경!)
```

## 페이지

| 경로 | 설명 |
|---|---|
| `/` | 랜딩 (시스템 소개) |
| `/login` | 학생·관리자 로그인 |
| `/wallet` (`/me`) | 내 잔액·QR·거래내역·**결제 요청 승인** |
| `/ranking` | 개인·부스 랭킹 |
| `/club` | 부스 결제 콘솔 (QR 스캔 / 학번 결제 요청 / 활동 관리) |
| `/docs` | API 문서 |
| `/admin` | 관리자 콘솔 (코인 지급 · 결제 요청 · 사용자 · 부스/키 · 거래내역) |

## REST API (`/api/v1`, `X-API-Key`)

`GET /me` · `GET /students/{id}` · `GET /students/lookup` · `GET /ranking/clubs` ·
`GET /ranking/students` · `GET /transactions/me` · `POST /transfer` ·
`POST /payment-requests` · `GET /payment-requests/{id}` · `POST /payment-requests/{id}/cancel`

전체 설명은 앱의 `/docs` 페이지를 참고하세요.

## 몬티홀 도박 사이트 연동

1. `/admin` 로그인 → **부스 · API 키** → `montyhall` 부스 확인(또는 생성) → **API 키 발급**.
2. 발급된 `nap_live_...` 키를 몬티홀 사이트에 **서버 사이드**로 설정.
3. `public/naplaceCoin.js` 를 몬티홀 사이트에 넣고 아래처럼 사용:

```js
const coin = createNaplaceCoin({
  baseUrl: "https://<your-app>/api/v1",
  apiKey:  "nap_live_...",   // 서버에서만!
});

// 라운드 시작 — 베팅 차감
async function startRound(studentId, bet) {
  try {
    await coin.placeBet(studentId, bet);        // student_to_club
  } catch (e) {
    if (e.code === "INSUFFICIENT_FUNDS") return alert("코인이 부족합니다. 부스에서 충전하세요.");
    if (e.status === 404) return alert("학번을 찾을 수 없습니다.");
    throw e;
  }
  // ... 몬티홀 게임 진행 ...
}

// 당첨 — 배당 지급
async function settleWin(studentId, bet, multiplier) {
  await coin.payout(studentId, bet * multiplier); // club_to_student
}

// 칩 구매(학생 승인 방식)
async function buyChips(studentId, amount) {
  const { request_id } = await coin.createPaymentRequest(studentId, amount, "몬티홀 칩 구매");
  const status = await coin.pollPaymentRequest(request_id); // approved|rejected|expired
  return status === "approved";
}
```

- **베팅** = `placeBet` (`student_to_club`), **당첨** = `payout` (`club_to_student`).
- **현금 충전**은 `/admin` → **코인 지급**으로 처리합니다.
- 잔액이 음수가 되지 않도록 원장 트랜잭션이 원자적으로 보장합니다.

## 배포 (Vercel + Turso)

```bash
turso db create naplace
turso db show naplace --url        # → TURSO_DATABASE_URL
turso db tokens create naplace     # → TURSO_AUTH_TOKEN
turso db shell naplace < db/schema.sql
```

GitHub에 푸시 → Vercel import → 환경변수(`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
`ADMIN_PASSWORD`) 설정 → 배포. 배포 후 `/admin` 에서 몬티홀 부스의 **운영용 키**를 발급하세요.

## 보안 참고 (의도적으로 최소화)

학번만 알면 누구나 지급/결제가 가능하고, QR은 장식이며, 비밀번호는 평문이고 관리자 키는
하나입니다. 축제용 저위험 플레이머니라 허용되지만, **원장 무결성(음수 잔액·유실·중복 없음)** 은
항상 보장됩니다. 실제 가치를 다룬다면 세션 기반 결제·비밀번호 해싱·키 스코프/만료·QR TTL·
공유 레이트리밋이 필요합니다.
