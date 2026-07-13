"use client";

import { QRCodeSVG } from "qrcode.react";

export function QrCard({ userId }: { userId: string }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-border bg-card p-8 text-center">
      <div className="self-start text-lg font-extrabold tracking-tight">내 QR 코드</div>
      <div className="mt-4 rounded-3xl border border-border bg-white p-3.5">
        <QRCodeSVG value={userId} size={168} fgColor="#14263C" bgColor="#ffffff" level="M" />
      </div>
      <p className="mt-3.5 text-sm font-semibold text-muted">부스에서 이 QR(또는 학번)을 보여주세요</p>
      <span className="mt-2 rounded-full bg-blue-tint px-3 py-1.5 text-xs font-extrabold text-blue">
        학번 {userId}
      </span>
    </div>
  );
}
