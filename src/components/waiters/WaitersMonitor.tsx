"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { BellRing, Check, Loader2, Receipt, VolumeX } from "lucide-react";
import { archiveTableServiceRequest } from "@/lib/actions/table-requests";
import {
  buildUrgentTitle,
  DEFAULT_WAITER_DASHBOARD_TITLE,
  playServiceChime,
  requestNotificationPermission,
  showTableRequestNotification,
  startChimeLoop,
  startTitleFlash,
  stopAlertSequence,
  stopTitleFlash,
} from "@/lib/waiter-alerts";
import { Button } from "@/components/ui/button";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";

export type WaiterRequestItem = {
  id: string;
  tableNumber: string;
  type: "CALL_WAITER" | "REQUEST_BILL";
  createdAt: string;
};

type WaitersMonitorProps = {
  initialRequests: WaiterRequestItem[];
  labels: {
    callWaiter: string;
    requestBill: string;
    tableLabel: string;
    markComplete: string;
    noPendingRequests: string;
    liveRefreshHint: string;
    notificationPrompt: string;
    enableAlerts: string;
    silenceAlerts: string;
    refreshError: string;
    urgentBanner: string;
    installDescription: string;
    installApp: string;
    iosInstallTitle: string;
    iosInstallSteps: string;
    installMenuHint: string;
    close: string;
  };
};

const POLL_INTERVAL_MS = 4000;

function formatTime(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function WaitersMonitor({ initialRequests, labels }: WaitersMonitorProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set());
  const [unacknowledgedIds, setUnacknowledgedIds] = useState<Set<string>>(new Set());
  const [alertsActive, setAlertsActive] = useState(false);
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const previousCountRef = useRef(initialRequests.length);
  const knownIdsRef = useRef(new Set(initialRequests.map((request) => request.id)));
  const alertsActiveRef = useRef(false);
  const unacknowledgedIdsRef = useRef(unacknowledgedIds);

  useEffect(() => {
    unacknowledgedIdsRef.current = unacknowledgedIds;
  }, [unacknowledgedIds]);

  const stopAllAlerts = useCallback(() => {
    stopAlertSequence();
    setAlertsActive(false);
    alertsActiveRef.current = false;
  }, []);

  const triggerUrgentInboundAlert = useCallback(
    (newRequests: WaiterRequestItem[]) => {
      if (newRequests.length === 0) {
        return;
      }

      setAlertsActive(true);
      alertsActiveRef.current = true;

      startChimeLoop(() => alertsActiveRef.current && unacknowledgedIdsRef.current.size > 0);

      const latestRequest = newRequests[0];
      startTitleFlash(
        buildUrgentTitle(latestRequest.tableNumber),
        DEFAULT_WAITER_DASHBOARD_TITLE,
      );

      for (const request of newRequests) {
        showTableRequestNotification(request);
      }
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    setShowPermissionBanner(Notification.permission === "default");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function pollRequests() {
      try {
        const response = await fetch("/api/waiter-requests", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to fetch waiter requests.");
        }

        const data: { requests: WaiterRequestItem[] } = await response.json();

        if (cancelled) {
          return;
        }

        const incomingRequests = data.requests;
        const newRequests = incomingRequests.filter((request) => !knownIdsRef.current.has(request.id));

        if (
          incomingRequests.length > previousCountRef.current &&
          newRequests.length > 0
        ) {
          setUnacknowledgedIds((current) => {
            const next = new Set(current);
            newRequests.forEach((request) => next.add(request.id));
            return next;
          });
          triggerUrgentInboundAlert(newRequests);
        }

        previousCountRef.current = incomingRequests.length;
        knownIdsRef.current = new Set(incomingRequests.map((request) => request.id));
        setRequests(incomingRequests);
        setPollError(null);

        if (incomingRequests.length === 0 && alertsActiveRef.current) {
          stopAllAlerts();
          setUnacknowledgedIds(new Set());
        }
      } catch {
        if (!cancelled) {
          setPollError(labels.refreshError);
        }
      }
    }

    void pollRequests();
    const intervalId = window.setInterval(() => {
      void pollRequests();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [labels.refreshError, stopAllAlerts, triggerUrgentInboundAlert]);

  useEffect(() => {
    return () => {
      stopAlertSequence();
    };
  }, []);

  useEffect(() => {
    function handleWorkspaceInteraction() {
      stopTitleFlash();
    }

    window.addEventListener("focus", handleWorkspaceInteraction);
    document.addEventListener("click", handleWorkspaceInteraction, { capture: true });

    return () => {
      window.removeEventListener("focus", handleWorkspaceInteraction);
      document.removeEventListener("click", handleWorkspaceInteraction, { capture: true });
    };
  }, []);

  async function handleEnableAlerts() {
    const permission = await requestNotificationPermission();
    setShowPermissionBanner(permission === "default");

    // Unlock audio after an explicit user gesture.
    void playServiceChime();
  }

  function handleSilenceAlerts() {
    stopAllAlerts();
  }

  function removeUnacknowledged(requestId: string) {
    setUnacknowledgedIds((current) => {
      const next = new Set(current);
      next.delete(requestId);

      if (next.size === 0) {
        stopAllAlerts();
      }

      return next;
    });
  }

  function dismissRequest(requestId: string) {
    removeUnacknowledged(requestId);
    setDismissingIds((current) => new Set(current).add(requestId));

    startTransition(async () => {
      await archiveTableServiceRequest(requestId);
      setDismissingIds((current) => {
        const next = new Set(current);
        next.delete(requestId);
        return next;
      });
      setRequests((current) => current.filter((request) => request.id !== requestId));
      knownIdsRef.current.delete(requestId);
      previousCountRef.current = Math.max(0, previousCountRef.current - 1);
    });
  }

  const visibleRequests = requests.filter((request) => !dismissingIds.has(request.id));

  return (
    <div className="space-y-4">
      <PwaInstallPrompt
        labels={{
          close: labels.close,
          installApp: labels.installApp,
          installDescription: labels.installDescription,
          installMenuHint: labels.installMenuHint,
          iosInstallSteps: labels.iosInstallSteps,
          iosInstallTitle: labels.iosInstallTitle,
        }}
      />

      {showPermissionBanner ? (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 px-4 py-4 shadow-sm sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-indigo-950">{labels.notificationPrompt}</p>
            <Button onClick={handleEnableAlerts} size="sm" type="button">
              {labels.enableAlerts}
            </Button>
          </div>
        </div>
      ) : null}

      {alertsActive ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-rose-900">{labels.urgentBanner}</p>
          <Button onClick={handleSilenceAlerts} size="sm" type="button" variant="secondary">
            <VolumeX className="h-4 w-4" />
            {labels.silenceAlerts}
          </Button>
        </div>
      ) : null}

      {pollError ? (
        <p className="text-xs text-amber-700" role="status">
          {pollError}
        </p>
      ) : (
        <p className="text-xs text-slate-500">{labels.liveRefreshHint}</p>
      )}

      {visibleRequests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <BellRing className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700">{labels.noPendingRequests}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleRequests.map((request) => {
            const isBill = request.type === "REQUEST_BILL";
            const isDismissing = dismissingIds.has(request.id);
            const isUnacknowledged = unacknowledgedIds.has(request.id);

            return (
              <article
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 ${
                  isUnacknowledged
                    ? "animate-urgent-pulse border-rose-500 bg-rose-50/50 ring-4 ring-rose-500"
                    : isBill
                      ? "border-amber-300/80 ring-1 ring-amber-100"
                      : "border-slate-200"
                }`}
                key={request.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isUnacknowledged
                        ? "bg-rose-100 text-rose-700"
                        : isBill
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
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
                      isUnacknowledged
                        ? "bg-rose-100 text-rose-800"
                        : isBill
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
                  variant={isUnacknowledged || isBill ? "primary" : "secondary"}
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
      )}
    </div>
  );
}
