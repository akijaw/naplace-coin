import type { NextRequest } from "next/server";
import { getClubFromApiKey } from "@/lib/auth";
import { getUserById } from "@/lib/db/users";
import { json, handleError } from "@/lib/http";
import { NotFoundError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getClubFromApiKey(req);
    const { id } = await params;
    const student = await getUserById(id);
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
