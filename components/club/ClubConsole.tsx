"use client";

import { useCallback, useEffect, useState } from "react";
import { Camera, Hash, ScanLine, Send } from "lucide-react";
import {
  Card,
  CardTitle,
  Field,
  Input,
  IconCircle,
  StatusPill,
  buttonStyles,
  cn,
} from "@/components/ui/primitives";
import { QrScanner } from "./QrScanner";
import {
  clubCreatePaymentRequest,
  getRequestStatus,
  cancelClubRequest,
  clubTransfer,
  listActivities,
  addActivity,
  removeActivity,
} from "@/app/club/actions";
import { formatCoin } from "@/lib/format";
import type { ActivityRow, ClubRow, Direction } from "@/lib/db/types";

type Msg = { type: "ok" | "err"; text: string } | null;

export function ClubConsole({ clubs }: { clubs: ClubRow[] }) {
  const [clubId, setClubId] = useState(clubs[0]?.id ?? "");
  const [tab, setTab] = useState<"qr" | "id">("id");
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [req, setReq] = useState<{ id: string; status: string } | null>(null);
  const [activities, setActivities] = useState<ActivityRow[]>([]);

  const refreshActivities = useCallback(async (cid: string) => {
    if (!cid) return;
    setActivities(await listActivities(cid));
  }, []);

  useEffect(() => {
    void refreshActivities(clubId);
  }, [clubId, refreshActivities]);

  // 결제 요청 상태 폴링
  useEffect(() => {
    if (!req || req.status !== "pending") return;
    const t = setInterval(async () => {
      const s = await getRequestStatus(req.id);
      if (s && s.status !== req.status) setReq({ id: req.id, status: s.status });
    }, 2000);
    return () => clearInterval(t);
  }, [req]);

  function onScan(id: string) {
    setStudentId(id);
    setTab("id");
    setMsg({ type: "ok", text: `스캔됨: 학번 ${id}` });
  }

  async function sendRequest() {
    if (!clubId) return setMsg({ type: "err", text: "부스를 선택하세요." });
    if (!studentId.trim()) return setMsg({ type: "err", text: "학번을 입력하세요." });
    setBusy(true);
    setMsg(null);
    const res = await clubCreatePaymentRequest(clubId, studentId, amount, title);
    setBusy(false);
    if (res.ok) {
      setReq({ id: res.requestId, status: "pending" });
      setMsg({ type: "ok", text: "결제 요청을 보냈습니다. 학생 승인을 기다립니다." });
    } else {
      setMsg({ type: "err", text: res.error });
    }
  }

  async function doTransfer(type: Direction) {
    if (!clubId) return setMsg({ type: "err", text: "부스를 선택하세요." });
    if (!studentId.trim()) return setMsg({ type: "err", text: "학번을 입력하세요." });
    setBusy(true);
    setMsg(null);
    const res = await clubTransfer(clubId, studentId, amount, type, title);
    setBusy(false);
    setMsg(
      res.ok
        ? {
            type: "ok",
            text: type === "club_to_student" ? "지급이 완료되었습니다." : "결제가 완료되었습니다.",
          }
        : { type: "err", text: res.error },
    );
  }

  async function cancelReq() {
    if (!req) return;
    await cancelClubRequest(req.id, clubId);
    setReq({ id: req.id, status: "canceled" });
  }

  return (
    <div className="space-y-6">
      {/* 부스 선택 */}
      <Card>
        <Field label="부스 선택">
          <select
            value={clubId}
            onChange={(e) => setClubId(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-fg/40"
          >
            {clubs.length === 0 ? <option value="">부스 없음</option> : null}
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id}) · {formatCoin(c.balance)} 코인
              </option>
            ))}
          </select>
        </Field>
      </Card>

      {/* 이용 방법 */}
      <Card>
        <CardTitle>이용 방법</CardTitle>
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          {[
            { icon: <Camera className="h-6 w-6" />, tone: "purple" as const, t: "1. 학번 확인", d: "QR 스캔 또는 학번 입력" },
            { icon: <ScanLine className="h-6 w-6" />, tone: "purple" as const, t: "2. 금액 입력", d: "지급/결제 금액과 사유" },
            { icon: <Send className="h-6 w-6" />, tone: "green" as const, t: "3. 결제 진행", d: "요청 전송 또는 즉시 처리" },
          ].map((s) => (
            <div key={s.t} className="flex flex-col items-center text-center">
              <IconCircle tone={s.tone}>{s.icon}</IconCircle>
              <div className="mt-3 font-bold">{s.t}</div>
              <div className="mt-0.5 text-sm text-muted">{s.d}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* 탭 */}
      <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-subtle p-1.5">
        <button
          type="button"
          onClick={() => setTab("qr")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
            tab === "qr" ? "bg-bg text-fg shadow-sm" : "text-muted hover:text-fg",
          )}
        >
          <ScanLine className="h-4 w-4" /> QR 스캔
        </button>
        <button
          type="button"
          onClick={() => setTab("id")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
            tab === "id" ? "bg-bg text-fg shadow-sm" : "text-muted hover:text-fg",
          )}
        >
          <Hash className="h-4 w-4" /> 학번 입력
        </button>
      </div>

      {tab === "qr" ? (
        <Card>
          <CardTitle>QR 코드 스캐너</CardTitle>
          <p className="mt-1 text-sm text-muted">카메라를 QR 코드에 맞추면 학번이 입력됩니다.</p>
          <div className="mt-4">
            <QrScanner onScan={onScan} />
          </div>
        </Card>
      ) : (
        <Card>
          <CardTitle>학번으로 결제 요청</CardTitle>
          <p className="mt-1 text-sm text-muted">
            학번을 입력하면 학생 화면으로 결제 요청이 전달되고, 학생이 승인하면 결제됩니다.
          </p>
          <div className="mt-5 space-y-4">
            <Field label="학번">
              <Input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="예: 2601"
                inputMode="numeric"
              />
            </Field>
            <Field label="금액(코인)">
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="예: 100"
                inputMode="numeric"
              />
            </Field>
            <Field label="사유(선택)">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 몬티홀 게임 참여비"
              />
            </Field>

            <button
              type="button"
              onClick={sendRequest}
              disabled={busy}
              className={buttonStyles("primary", "w-full")}
            >
              {busy ? "처리 중…" : "요청 보내기 (학생 승인)"}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => doTransfer("club_to_student")}
                disabled={busy}
                className={buttonStyles("secondary", "flex-1")}
              >
                즉시 지급 →
              </button>
              <button
                type="button"
                onClick={() => doTransfer("student_to_club")}
                disabled={busy}
                className={buttonStyles("secondary", "flex-1")}
              >
                ← 즉시 결제
              </button>
            </div>
            <p className="text-center text-xs text-muted">
              즉시 지급/결제는 승인 없이 학번만으로 처리됩니다 (보안 최소화 정책).
            </p>

            {msg ? (
              <p className={cn("text-sm", msg.type === "ok" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                {msg.text}
              </p>
            ) : null}

            {req ? (
              <div className="flex items-center justify-between rounded-xl border border-border bg-subtle p-3 text-sm">
                <span className="flex items-center gap-2">
                  결제 요청 상태 <StatusPill status={req.status} />
                </span>
                {req.status === "pending" ? (
                  <button type="button" onClick={cancelReq} className="text-xs font-semibold text-red-500 hover:underline">
                    취소
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </Card>
      )}

      {/* 활동 관리 */}
      <ActivityManager
        clubId={clubId}
        activities={activities}
        onChange={() => refreshActivities(clubId)}
        onApply={(a) => {
          setAmount(String(a.amount));
          setTitle(a.name);
          setTab("id");
        }}
      />
    </div>
  );
}

function ActivityManager({
  clubId,
  activities,
  onChange,
  onApply,
}: {
  clubId: string;
  activities: ActivityRow[];
  onChange: () => void;
  onApply: (a: ActivityRow) => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<Direction>("student_to_club");
  const [err, setErr] = useState<string | null>(null);

  async function add() {
    setErr(null);
    const res = await addActivity(clubId, name, amount, direction);
    if (res.ok) {
      setName("");
      setAmount("");
      onChange();
    } else {
      setErr(res.error ?? "오류");
    }
  }

  async function remove(id: number) {
    await removeActivity(id, clubId);
    onChange();
  }

  return (
    <Card>
      <CardTitle>활동 관리</CardTitle>
      <p className="mt-1 text-sm text-muted">부스 활동을 생성·삭제할 수 있습니다. 클릭하면 금액이 채워집니다.</p>

      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold">활동 목록</div>
        {activities.length === 0 ? (
          <p className="text-sm text-muted">등록된 활동이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {activities.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-subtle px-3 py-2">
                <button type="button" onClick={() => onApply(a)} className="text-left">
                  <span className="font-medium">{a.name}</span>
                  <span className="ml-2 text-sm text-muted">
                    {formatCoin(a.amount)} 코인 · {a.direction === "club_to_student" ? "지급" : "결제"}
                  </span>
                </button>
                <button type="button" onClick={() => remove(a.id)} className="text-xs font-semibold text-red-500 hover:underline">
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_7rem_8rem_auto]">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="활동 이름" />
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="금액" inputMode="numeric" />
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as Direction)}
          className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-fg/40"
        >
          <option value="student_to_club">결제(학생→부스)</option>
          <option value="club_to_student">지급(부스→학생)</option>
        </select>
        <button type="button" onClick={add} className={buttonStyles("primary")}>
          추가
        </button>
      </div>
      {err ? <p className="mt-2 text-sm text-red-500">{err}</p> : null}
    </Card>
  );
}
