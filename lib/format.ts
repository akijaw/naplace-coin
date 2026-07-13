export function formatCoin(n: number): string {
  return Math.trunc(n).toLocaleString("ko-KR");
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function secondsUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 1000));
}

const TX_LABELS: Record<string, string> = {
  club_to_student: "부스 → 학생 지급",
  student_to_club: "학생 → 부스 결제",
  admin_grant: "관리자 지급",
  admin_deduct: "관리자 회수",
};

export function txLabel(type: string): string {
  return TX_LABELS[type] ?? type;
}

/** 이 유형이 해당 학생 관점에서 잔액을 늘리는가? (지갑 내역 +/- 표시용) */
export function isCreditForStudent(type: string): boolean {
  return type === "club_to_student" || type === "admin_grant";
}
