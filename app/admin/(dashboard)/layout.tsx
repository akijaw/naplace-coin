import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { Container } from "@/components/ui/Container";
import { AdminSidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <Container className="max-w-6xl">
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <AdminSidebar />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
