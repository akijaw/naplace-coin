"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogout } from "@/app/actions";
import { cn } from "@/components/ui/primitives";
import {
  LayoutDashboard,
  HandCoins,
  ReceiptText,
  Users,
  Store,
  ScrollText,
  LogOut,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/grant", label: "코인 지급", icon: HandCoins, star: true },
  { href: "/admin/payments", label: "자동 결제", icon: ReceiptText, star: true },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
  { href: "/admin/clubs", label: "부스 · API 키", icon: Store },
  { href: "/admin/transactions", label: "전체 거래 내역", icon: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      <div className="px-3 pb-2 text-xs font-bold uppercase tracking-widest text-muted">
        관리 콘솔
      </div>
      {LINKS.map((l) => {
        const active = pathname === l.href;
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm transition-colors",
              active
                ? "bg-ink font-extrabold text-white"
                : "font-semibold text-muted hover:bg-subtle hover:text-fg",
            )}
          >
            <Icon className="h-4 w-4" />
            {l.label}
            {l.star ? <span className="ml-auto text-xs text-brand">★</span> : null}
          </Link>
        );
      })}
      <form action={adminLogout} className="pt-2">
        <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-subtle hover:text-fg">
          <LogOut className="h-4 w-4" /> 로그아웃
        </button>
      </form>
    </nav>
  );
}
