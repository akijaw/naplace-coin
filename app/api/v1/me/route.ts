import type { NextRequest } from "next/server";
import { getClubFromApiKey } from "@/lib/auth";
import { json, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const club = await getClubFromApiKey(req);
    return json({
      id: club.id,
      name: club.name,
      balance: club.balance,
      type: "club",
    });
  } catch (e) {
    return handleError(e);
  }
}
