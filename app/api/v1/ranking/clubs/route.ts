import { rankingClubs } from "@/lib/db/clubs";
import { json, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const clubs = await rankingClubs();
    return json(
      clubs.map((c) => ({ id: c.id, name: c.name, balance: c.balance })),
    );
  } catch (e) {
    return handleError(e);
  }
}
