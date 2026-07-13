import Link from "next/link";
import { logout } from "@/app/actions";
import { ThemeToggle } from "./ui/ThemeToggle";
import { buttonStyles } from "./ui/primitives";
import type { UserRow } from "@/lib/db/types";

export function Header({ user }: { user: UserRow | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4">
        <Link href="/" className="text-xl font-extrabold italic tracking-tight">
          NA&apos;PLACE
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
          <Link href="/wallet" className="transition-colors hover:text-fg">지갑</Link>
          <Link href="/ranking" className="transition-colors hover:text-fg">랭킹</Link>
          <Link href="/club" className="transition-colors hover:text-fg">부스</Link>
          <Link href="/docs" className="transition-colors hover:text-fg">문서</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/wallet" className="text-sm font-medium hover:underline">
                {user.name}님
              </Link>
              <form action={logout}>
                <button className={buttonStyles("primary", "!px-3 !py-2")}>로그아웃</button>
              </form>
            </>
          ) : (
            <Link href="/login" className={buttonStyles("primary", "!px-3 !py-2")}>
              로그인
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
