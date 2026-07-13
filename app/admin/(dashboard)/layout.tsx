import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { Container } from "@/components/ui/Container";
import { AdminSidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <Container className="!max-w-none px-3 sm:px-4 lg:px-5">
      <div className="grid gap-10 md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="md:sticky md:top-24 md:self-start">
          <AdminSidebar />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
