import { listClubs } from "@/lib/db/clubs";
import { Container } from "@/components/ui/Container";
import { ClubConsole } from "@/components/club/ClubConsole";

export const dynamic = "force-dynamic";

export default async function ClubPage() {
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
