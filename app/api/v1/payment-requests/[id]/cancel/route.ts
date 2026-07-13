import type { NextRequest } from "next/server";
import { getClubFromApiKey } from "@/lib/auth";
import { cancelPaymentRequest } from "@/lib/db/paymentRequests";
import { json, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 이전 방식으로 생성된 pending 요청만 요청한 부스가 취소할 수 있습니다.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const club = await getClubFromApiKey(req);
    const { id } = await params;
    const pr = await cancelPaymentRequest(id, club.id);
    return json({ request_id: pr.id, status: pr.status });
  } catch (e) {
    return handleError(e);
  }
}
