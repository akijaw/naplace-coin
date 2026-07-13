import type { NextRequest } from "next/server";
import { getClubFromApiKey } from "@/lib/auth";
import { getClubTransactions } from "@/lib/db/transactions";
import { json, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const club = await getClubFromApiKey(req);
    const txs = await getClubTransactions(club.id);
    return json(
      txs.map((t) => ({
        amount: t.amount,
        title: t.title,
        transaction_type: t.transaction_type,
        timestamp: t.created_at,
      })),
    );
  } catch (e) {
    return handleError(e);
  }
}
