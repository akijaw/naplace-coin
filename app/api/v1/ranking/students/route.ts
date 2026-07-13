import { rankingStudents } from "@/lib/db/users";
import { json, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const students = await rankingStudents();
    return json(
      students.map((s) => ({
        id: s.id,
        name: s.name,
        balance: s.balance,
        club_id: s.club_id,
        club_name: s.club_name,
      })),
    );
  } catch (e) {
    return handleError(e);
  }
}
