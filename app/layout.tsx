import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Header } from "@/components/Header";
import { FloatingAvatar } from "@/components/FloatingAvatar";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "NA'PLACE COIN",
  description: "NA'PLACE 코인 시스템 — 몬티홀 도박 부스 연동 화폐 시스템",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <ThemeProvider>
          <Header user={user} />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <FloatingAvatar />
        </ThemeProvider>
      </body>
    </html>
  );
}
