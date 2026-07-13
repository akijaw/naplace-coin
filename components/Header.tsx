import Link from "next/link";
import Image from "next/image";
import { logout } from "@/app/actions";
import { ThemeToggle } from "./ui/ThemeToggle";
import { buttonStyles } from "./ui/primitives";
import type { UserRow } from "@/lib/db/types";

export function Header({ user }: { user: UserRow | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-content items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="NA'PLACE 로고"
            width={28}
            height={31}
            className="h-[31px] w-7 object-contain"
            priority
          />
          <span className="text-lg font-extrabold tracking-tight">
            NA&apos;PLACE <span className="text-brand">코인</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-[15px] font-semibold text-muted md:flex">
          <Link href="/wallet" className="transition-colors hover:text-fg">지갑</Link>
          <Link href="/ranking" className="transition-colors hover:text-fg">랭킹</Link>
          <Link href="/club" className="transition-colors hover:text-fg">부스</Link>
          <Link href="/docs" className="transition-colors hover:text-fg">문서</Link>
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link href="/wallet" className="flex items-center gap-2">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-blue-tint text-[13px] font-extrabold text-blue">
                  {user.name.slice(0, 1)}
                </span>
                <span className="hidden text-sm font-bold sm:inline">{user.name}님</span>
              </Link>
              <form action={logout}>
                <button className={buttonStyles("secondary", "!px-3.5 !text-muted")}>
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="hidden text-sm font-semibold text-muted transition-colors hover:text-fg sm:inline"
              >
                회원가입
              </Link>
              <Link href="/login" className={buttonStyles("primary", "!px-4")}>
                로그인
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
