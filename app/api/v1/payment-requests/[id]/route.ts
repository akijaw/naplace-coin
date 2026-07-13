import type { NextRequest } from "next/server";
import { getClubFromApiKey } from "@/lib/auth";
import { getPaymentRequest } from "@/lib/db/paymentRequests";
import { json, handleError } from "@/lib/http";
import { NotFoundError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 결제 기록 상태 확인. 자동 결제 성공 시 즉시 approved.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const club = await getClubFromApiKey(req);
    const { id } = await params;
    const pr = await getPaymentRequest(id);
    if (!pr || pr.club_id !== club.id) {
      throw new NotFoundError("결제 요청을 찾을 수 없습니다.");
    }
    return json({
      request_id: pr.id,
      status: pr.status,
      amount: pr.amount,
      title: pr.title,
      expires_at: pr.expires_at,
      resolved_at: pr.resolved_at,
    });
  } catch (e) {
    return handleError(e);
  }
}
