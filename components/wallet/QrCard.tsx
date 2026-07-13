"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardTitle } from "@/components/ui/primitives";

export function QrCard({ userId }: { userId: string }) {
  return (
    <Card className="flex flex-col items-center text-center">
      <CardTitle className="self-start">내 QR 코드</CardTitle>
      <div className="mt-5 rounded-2xl bg-white p-4">
        <QRCodeSVG value={userId} size={168} fgColor="#0a0a0a" bgColor="#ffffff" level="M" />
      </div>
      <p className="mt-4 text-sm text-muted">부스에서 이 QR(또는 학번)을 보여주세요</p>
      <p className="mt-1 text-xs text-muted">학번 · {userId}</p>
    </Card>
  );
}
