import { ScanLine } from "lucide-react";
import { listClubs } from "@/lib/db/clubs";
import { Container } from "@/components/ui/Container";
import { ClubConsole } from "@/components/club/ClubConsole";

export const dynamic = "force-dynamic";

export default async function ClubPage() {
  const clubs = await listClubs();

  return (
    <Container className="space-y-6">
      <div className="text-center">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight">
          <ScanLine className="h-7 w-7 text-violet-500" /> 결제 처리
        </h1>
        <p className="mt-2 text-muted">QR 스캔 또는 학번 입력으로 결제를 처리하세요</p>
      </div>
      <ClubConsole clubs={clubs} />
    </Container>
  );
}
