import { GrantForm } from "@/components/admin/GrantForm";

export const dynamic = "force-dynamic";

export default function AdminGrantPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">코인 지급</h1>
      <div className="max-w-2xl">
        <GrantForm />
      </div>
    </div>
  );
}
