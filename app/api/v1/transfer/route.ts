import type { NextRequest } from "next/server";
import { getClubFromApiKey } from "@/lib/auth";
import { createTransfer } from "@/lib/db/transactions";
import { json, handleError } from "@/lib/http";
import { parseAmount } from "@/lib/validate";
import { RateLimitError, ValidationError } from "@/lib/errors";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 핵심 엔드포인트: 베팅(student_to_club) / 당첨·지급(club_to_student).
// 보안 최소화 정책상 QR 스캔 없이 student_id(학번)로 바로 처리합니다.
// (원본 호환을 위해 student_hash 도 학번으로 간주해 허용)
export async function POST(req: NextRequest) {
  try {
    const club = await getClubFromApiKey(req);
    if (!rateLimit(`transfer:${club.id}`, 20)) throw new RateLimitError();

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const sid = String(body.student_id ?? body.student_hash ?? "").trim();
    if (!sid) throw new ValidationError("student_id 가 필요합니다.");

    const amount = parseAmount(body.amount);
    const type = body.type;
    if (type !== "club_to_student" && type !== "student_to_club") {
      throw new ValidationError("잘못된 거래 유형입니다.");
    }

    await createTransfer({
      studentId: sid,
      clubId: club.id,
      amount,
      type,
      title: typeof body.title === "string" ? body.title : null,
    });

    return json({ message: "결제가 완료되었습니다." });
  } catch (e) {
    return handleError(e);
  }
}
