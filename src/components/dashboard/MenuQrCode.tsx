"use client";

import { useRef } from "react";
import { Download, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useDictionary } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/button";

type MenuQrCodeProps = {
  publicMenuUrl: string;
  restaurantSlug: string;
};

export function MenuQrCode({ publicMenuUrl, restaurantSlug }: MenuQrCodeProps) {
  const dict = useDictionary();
  const s = dict.settings;
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-zinc-900">{s.printStation}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{s.printStationSubtitle}</p>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-xs flex-col items-center">
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <QRCodeCanvas includeMargin level="H" ref={canvasRef} size={200} value={publicMenuUrl} />
        </div>
        <p className="mt-4 break-all text-center text-xs text-slate-500">{publicMenuUrl}</p>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          className="w-full whitespace-nowrap sm:w-auto"
          onClick={downloadQrCode}
          type="button"
        >
          <Download className="h-4 w-4 shrink-0" />
          {s.downloadQr}
        </Button>
      </div>
    </div>
  );
}
