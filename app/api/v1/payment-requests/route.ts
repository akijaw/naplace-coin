import type { NextRequest } from "next/server";
import { getClubFromApiKey } from "@/lib/auth";
import { createPaymentRequest } from "@/lib/db/paymentRequests";
import { json, handleError } from "@/lib/http";
import { parseAmount, requireString } from "@/lib/validate";
import { RateLimitError } from "@/lib/errors";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 학번으로 자동 결제. 학생 승인 없이 즉시 학생 → 부스로 코인을 이동한다.
export async function POST(req: NextRequest) {
  try {
    const club = await getClubFromApiKey(req);
    if (!rateLimit(`transfer:${club.id}`, 20)) throw new RateLimitError();

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const studentId = requireString(body.student_id, "student_id");
    const amount = parseAmount(body.amount);

    const { request, student } = await createPaymentRequest({
      studentId,
      clubId: club.id,
      amount,
      title: typeof body.title === "string" ? body.title : null,
    });

    return json(
      {
        request_id: request.id,
        status: request.status,
        student,
        amount: request.amount,
        completed_at: request.resolved_at,
      },
      201,
    );
  } catch (e) {
    return handleError(e);
  }
}
