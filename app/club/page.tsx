import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { listClubs } from "@/lib/db/clubs";
import { Container } from "@/components/ui/Container";
import { ClubConsole } from "@/components/club/ClubConsole";

export const dynamic = "force-dynamic";

export default async function ClubPage() {
  // 부스 결제 콘솔은 운영진(관리자) 전용. 일반 학생은 접근 불가.
  if (!(await isAdmin())) redirect("/admin/login");

  const clubs = await listClubs();

  return (
    <Container className="max-w-[760px] space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">부스 결제 콘솔</h1>
        <p className="mt-1.5 text-[15px] text-muted">QR 스캔 또는 학번 입력으로 결제를 처리하세요</p>
      </div>
      <ClubConsole clubs={clubs} />
    </Container>
  );
}
