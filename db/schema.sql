-- NA'PLACE 코인 — 스키마 (libSQL / SQLite)
-- 모든 문장은 멱등(IF NOT EXISTS). `npm run db:push` 로 적용됩니다.

PRAGMA foreign_keys = ON;

-- CLUBS (부스/동아리 — 몬티홀 도박 사이트 포함). users 보다 먼저 생성 (FK 참조 대상).
CREATE TABLE IF NOT EXISTS clubs (
  id          TEXT    PRIMARY KEY,             -- 슬러그: "montyhall"
  name        TEXT    NOT NULL,
  balance     INTEGER NOT NULL DEFAULT 0,      -- 부스 금고 잔액
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (balance >= 0)
);

-- USERS (학생/플레이어): 짧은 숫자형 공개 id 를 TEXT 로 보관(선행 0 보존)
CREATE TABLE IF NOT EXISTS users (
  id          TEXT    PRIMARY KEY,             -- "2601"
  username    TEXT    NOT NULL UNIQUE,         -- 로그인 아이디
  password    TEXT    NOT NULL,                -- 평문(보안 최소화 정책)
  name        TEXT    NOT NULL,
  balance     INTEGER NOT NULL DEFAULT 0,
  club_id     TEXT,                            -- 소속 부스(선택)
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (balance >= 0),
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_users_club ON users(club_id);

-- API KEYS (부스별 X-API-Key)
CREATE TABLE IF NOT EXISTS api_keys (
  key          TEXT    PRIMARY KEY,            -- "nap_live_9f3a…"
  club_id      TEXT    NOT NULL,
  label        TEXT,
  active       INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_used_at TEXT,
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_apikeys_club ON api_keys(club_id);

-- TRANSACTIONS (원장). amount = 양수 크기; 방향은 transaction_type 으로.
CREATE TABLE IF NOT EXISTS transactions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id        TEXT,
  club_id           TEXT,                       -- admin_grant(발행) 시 NULL
  amount            INTEGER NOT NULL,
  transaction_type  TEXT    NOT NULL,           -- club_to_student | student_to_club | admin_grant | admin_deduct
  title             TEXT,
  created_at        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (amount > 0),
  CHECK (transaction_type IN ('club_to_student','student_to_club','admin_grant','admin_deduct')),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (club_id)    REFERENCES clubs(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_tx_student ON transactions(student_id, id DESC);
CREATE INDEX IF NOT EXISTS idx_tx_club    ON transactions(club_id, id DESC);

-- PAYMENT REQUESTS (승인 기반 결제 요청)
CREATE TABLE IF NOT EXISTS payment_requests (
  id          TEXT    PRIMARY KEY,             -- "pr_<nanoid>"
  student_id  TEXT    NOT NULL,
  club_id     TEXT    NOT NULL,
  amount      INTEGER NOT NULL,
  title       TEXT,
  status      TEXT    NOT NULL DEFAULT 'pending',  -- pending|approved|rejected|expired|canceled
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at  TEXT    NOT NULL,                -- created_at + 120초
  resolved_at TEXT,
  CHECK (amount > 0),
  CHECK (status IN ('pending','approved','rejected','expired','canceled')),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (club_id)    REFERENCES clubs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_pr_student ON payment_requests(student_id, status);
CREATE INDEX IF NOT EXISTS idx_pr_club    ON payment_requests(club_id, id DESC);

-- ACTIVITIES (부스 활동 프리셋: 활동 관리)
CREATE TABLE IF NOT EXISTS activities (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  club_id     TEXT    NOT NULL,
  name        TEXT    NOT NULL,
  amount      INTEGER NOT NULL,
  direction   TEXT    NOT NULL,                -- club_to_student | student_to_club
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (amount > 0),
  CHECK (direction IN ('club_to_student','student_to_club')),
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_activities_club ON activities(club_id);
