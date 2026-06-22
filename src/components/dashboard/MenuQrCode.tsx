"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

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
    <Card className="mt-6 overflow-hidden">
      <CardBody className="bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Print Station</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Table QR Code</h3>
          <p className="mt-1 text-sm text-slate-500">Download and print for guest table scans.</p>
        </div>

        <div className="mx-auto mt-6 max-w-[260px] rounded-3xl border border-slate-100/80 bg-white p-5 shadow-sm">
          <div className="rounded-2xl bg-white p-3 shadow-inner">
            <QRCodeCanvas includeMargin level="H" ref={canvasRef} size={200} value={publicMenuUrl} />
          </div>
          <p className="mt-4 break-all text-center text-xs text-slate-400">{publicMenuUrl}</p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={downloadQrCode} type="button">
            Download QR Code
          </Button>
          <Button className="flex-1" onClick={downloadQrCode} type="button" variant="secondary">
            Save for Print
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
