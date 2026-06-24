"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellRing, Check, Loader2, Receipt } from "lucide-react";
import { archiveTableServiceRequest } from "@/lib/actions/table-requests";
import { Button } from "@/components/ui/button";

export type WaiterRequestItem = {
  id: string;
  tableNumber: string;
  type: "CALL_WAITER" | "REQUEST_BILL";
  createdAt: string;
};

type WaiterRequestMonitorProps = {
  initialRequests: WaiterRequestItem[];
  labels: {
    callWaiter: string;
    requestBill: string;
    tableLabel: string;
    markComplete: string;
    noPendingRequests: string;
    liveRefreshHint: string;
  };
};

function formatTime(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function WaiterRequestMonitor({ initialRequests, labels }: WaiterRequestMonitorProps) {
  const router = useRouter();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, 4000);

    return () => window.clearInterval(interval);
  }, [router]);

  function dismissRequest(requestId: string) {
    setPendingIds((current) => new Set(current).add(requestId));
    startTransition(async () => {
      await archiveTableServiceRequest(requestId);
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(requestId);
        return next;
      });
      router.refresh();
    });
  }

  const visibleRequests = initialRequests.filter((request) => !pendingIds.has(request.id));

  if (visibleRequests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <BellRing className="h-5 w-5" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-700">{labels.noPendingRequests}</p>
        <p className="mt-1 text-xs text-slate-500">{labels.liveRefreshHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{labels.liveRefreshHint}</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleRequests.map((request) => {
          const isBill = request.type === "REQUEST_BILL";
          const isDismissing = pendingIds.has(request.id);

          return (
            <article
              className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 ${
                isBill
                  ? "border-amber-300/80 ring-1 ring-amber-100"
                  : "border-slate-200"
              }`}
              key={request.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isBill ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {isBill ? (
                    <Receipt className="h-5 w-5" />
                  ) : (
                    <BellRing className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                    isBill
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {isBill ? labels.requestBill : labels.callWaiter}
                </span>
              </div>

              <p className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900">
                {labels.tableLabel} {request.tableNumber}
              </p>
              <p className="mt-1 text-sm text-slate-500">{formatTime(request.createdAt)}</p>

              <Button
                className="mt-5 w-full"
                disabled={isDismissing}
                onClick={() => dismissRequest(request.id)}
                type="button"
                variant={isBill ? "primary" : "secondary"}
              >
                {isDismissing ? (
                  <>
                    <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                    {labels.markComplete}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {labels.markComplete}
                  </>
                )}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
