import type { NextRequest } from "next/server";
import { getClubFromApiKey } from "@/lib/auth";
import { getUserById } from "@/lib/db/users";
import { json, handleError } from "@/lib/http";
import { NotFoundError, ValidationError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 호환용. 원본은 QR 해시로 조회했지만 보안 최소화 정책상 학번(id) 그 자체로 조회합니다.
// ?student_id= 또는 ?hash= (QR 값 == 학번) 모두 허용.
export async function GET(req: NextRequest) {
  try {
    await getClubFromApiKey(req);
    const url = new URL(req.url);
    const sid =
      url.searchParams.get("student_id") || url.searchParams.get("hash");
    if (!sid) {
      throw new ValidationError("student_id 또는 hash 파라미터가 필요합니다.");
    }
    const student = await getUserById(sid.trim());
    if (!student || !student.active) {
      throw new NotFoundError("학생을 찾을 수 없습니다.");
    }
    return json({
      id: student.id,
      name: student.name,
      balance: student.balance,
      club_id: student.club_id,
    });
  } catch (e) {
    return handleError(e);
  }
}
