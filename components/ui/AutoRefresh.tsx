"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 서버 컴포넌트 데이터를 주기적으로 갱신합니다 (폴링). */
export function AutoRefresh({ intervalMs = 3000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(t);
  }, [router, intervalMs]);
  return null;
}
