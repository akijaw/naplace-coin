"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { buttonStyles } from "@/components/ui/primitives";

// html5-qrcode 인스턴스 타입은 동적 import 라 any 로 보관
type ScannerLike = { stop: () => Promise<void>; clear: () => void };

const ELEMENT_ID = "np-qr-reader";

export function QrScanner({ onScan }: { onScan: (id: string) => void }) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<ScannerLike | null>(null);

  async function stop() {
    try {
      await scannerRef.current?.stop();
      scannerRef.current?.clear();
    } catch {
      /* noop */
    }
    scannerRef.current = null;
    setActive(false);
  }

  async function start() {
    setError(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(ELEMENT_ID);
      scannerRef.current = scanner as unknown as ScannerLike;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        (text: string) => onScan(text.trim()),
        () => {},
      );
      setActive(true);
    } catch {
      setError("카메라를 시작할 수 없습니다. 권한을 확인하거나 학번 입력을 사용하세요.");
      setActive(false);
    }
  }

  useEffect(() => {
    return () => {
      void stop();
    };
  }, []);

  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={start}
          disabled={active}
          className={buttonStyles("primary", "flex-1")}
        >
          <Camera className="h-4 w-4" /> 카메라 시작
        </button>
        <button
          type="button"
          onClick={stop}
          disabled={!active}
          className={buttonStyles("secondary", "flex-1")}
        >
          <CameraOff className="h-4 w-4" /> 카메라 중지
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-ink">
        <div id={ELEMENT_ID} className="mx-auto w-full" />
        {!active ? (
          <div className="flex h-[300px] items-center justify-center text-sm font-semibold text-ink-soft">
            카메라가 꺼져 있습니다
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
