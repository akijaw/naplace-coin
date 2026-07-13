import type { NextRequest } from "next/server";
import { getClubByApiKey } from "./db/apiKeys";
import { AuthError } from "./errors";
import type { ClubRow } from "./db/types";

/** X-API-Key 헤더 → 활성 부스. 없거나 유효하지 않으면 AuthError. */
export async function getClubFromApiKey(req: NextRequest): Promise<ClubRow> {
  const key = req.headers.get("x-api-key");
  if (!key) throw new AuthError("X-API-Key 헤더가 필요합니다.");
  const club = await getClubByApiKey(key);
  if (!club) throw new AuthError();
  return club;
}
