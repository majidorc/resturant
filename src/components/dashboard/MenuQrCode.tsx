"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";

type MenuQrCodeProps = {
  publicMenuUrl: string;
  restaurantSlug: string;
};

export function MenuQrCode({ publicMenuUrl, restaurantSlug }: MenuQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function downloadQrCode() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${restaurantSlug}-menu-qr.png`;
    link.href = pngUrl;
    link.click();
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6">
      <p className="text-sm font-medium text-zinc-700">QR Code Preview</p>
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <QRCodeCanvas
          includeMargin
          level="H"
          ref={canvasRef}
          size={220}
          value={publicMenuUrl}
        />
      </div>
      <p className="max-w-xs text-center text-xs text-zinc-500">
        Scan to open your public menu. Print and place on tables.
      </p>
      <Button onClick={downloadQrCode} type="button" variant="secondary">
        Download QR Code
      </Button>
    </div>
  );
}
