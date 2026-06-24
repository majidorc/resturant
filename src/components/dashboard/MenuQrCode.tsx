"use client";

import { useRef, useState } from "react";
import { Check, Copy, Download, Printer, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useDictionary } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/button";

type MenuQrCodeProps = {
  publicMenuUrl: string;
  restaurantSlug: string;
  tablesCount: number;
};

function buildTableUrl(publicMenuUrl: string, tableNumber: number) {
  const url = new URL(publicMenuUrl);
  url.searchParams.set("table", String(tableNumber));
  return url.toString();
}

export function MenuQrCode({ publicMenuUrl, restaurantSlug, tablesCount }: MenuQrCodeProps) {
  const dict = useDictionary();
  const s = dict.settings;
  const c = dict.common;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedTable, setCopiedTable] = useState<number | null>(null);

  function downloadMainQrCode() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${restaurantSlug}-menu-qr.png`;
    link.href = pngUrl;
    link.click();
  }

  function downloadTableQr(tableNumber: number, trigger: HTMLButtonElement) {
    const card = trigger.closest("[data-table-card]");
    const canvas = card?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${restaurantSlug}-table-${tableNumber}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function copyTableLink(tableNumber: number, url: string) {
    await navigator.clipboard.writeText(url);
    setCopiedTable(tableNumber);
    window.setTimeout(() => setCopiedTable(null), 2000);
  }

  function printTableLinks() {
    const tableRows = Array.from({ length: tablesCount }, (_, index) => {
      const tableNumber = index + 1;
      const url = buildTableUrl(publicMenuUrl, tableNumber);
      return `<tr><td style="padding:12px;border:1px solid #e2e8f0;font-weight:600;">Table ${tableNumber}</td><td style="padding:12px;border:1px solid #e2e8f0;word-break:break-all;">${url}</td></tr>`;
    }).join("");

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${restaurantSlug} table menu links</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #0f172a; }
    h1 { font-size: 20px; margin-bottom: 8px; }
    p { color: #64748b; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
  </style>
</head>
<body>
  <h1>Table menu QR links</h1>
  <p>Scan or copy each table-specific menu URL for signage and QR printing.</p>
  <table>
    <thead>
      <tr>
        <th style="padding:12px;border:1px solid #e2e8f0;text-align:left;">Table</th>
        <th style="padding:12px;border:1px solid #e2e8f0;text-align:left;">Menu URL</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="space-y-6">
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
            onClick={downloadMainQrCode}
            type="button"
          >
            <Download className="h-4 w-4 shrink-0" />
            {s.downloadQr}
          </Button>
        </div>
      </div>

      {tablesCount > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-900">{s.tableQrTitle}</h3>
              <p className="mt-0.5 text-sm text-slate-500">{s.tableQrSubtitle}</p>
            </div>
            <Button onClick={printTableLinks} type="button" variant="secondary">
              <Printer className="h-4 w-4 shrink-0" />
              {s.printTableLinks}
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: tablesCount }, (_, index) => {
              const tableNumber = index + 1;
              const tableUrl = buildTableUrl(publicMenuUrl, tableNumber);

              return (
                <div
                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"
                  data-table-card
                  key={tableNumber}
                >
                  <p className="text-sm font-semibold text-zinc-900">
                    {s.tableQrItemLabel} {tableNumber}
                  </p>
                  <div className="mt-3 flex justify-center rounded-lg border border-slate-100 bg-white p-3">
                    <QRCodeCanvas includeMargin level="H" size={120} value={tableUrl} />
                  </div>
                  <p className="mt-3 break-all text-xs text-slate-500">{tableUrl}</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Button
                      className="flex-1"
                      onClick={() => copyTableLink(tableNumber, tableUrl)}
                      type="button"
                      variant="secondary"
                    >
                      {copiedTable === tableNumber ? (
                        <>
                          <Check className="h-4 w-4 shrink-0" />
                          {c.copied}
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 shrink-0" />
                          {s.copyTableLink}
                        </>
                      )}
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={(event) => downloadTableQr(tableNumber, event.currentTarget)}
                      type="button"
                    >
                      <Download className="h-4 w-4 shrink-0" />
                      {s.downloadQr}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
