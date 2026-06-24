"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";

type TableServiceBarProps = {
  restaurantId: string;
  tableNumber: string;
  labels: {
    callWaiter: string;
    requestBill: string;
    waiterNotified: string;
    billRequested: string;
    sending: string;
  };
};

type ButtonState = "idle" | "loading" | "success";

async function submitTableRequest(
  restaurantId: string,
  tableNumber: string,
  type: "CALL_WAITER" | "REQUEST_BILL",
): Promise<boolean> {
  const response = await fetch("/api/table-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ restaurantId, tableNumber, type }),
  });

  return response.ok;
}

export function TableServiceBar({
  restaurantId,
  tableNumber,
  labels,
}: TableServiceBarProps) {
  const [waiterState, setWaiterState] = useState<ButtonState>("idle");
  const [billState, setBillState] = useState<ButtonState>("idle");
  const [, startTransition] = useTransition();

  function handleRequest(
    type: "CALL_WAITER" | "REQUEST_BILL",
    setState: (state: ButtonState) => void,
  ) {
    setState("loading");
    startTransition(async () => {
      const ok = await submitTableRequest(restaurantId, tableNumber, type);
      if (!ok) {
        setState("idle");
        return;
      }

      setState("success");
      window.setTimeout(() => setState("idle"), 2800);
    });
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="animate-slide-up pointer-events-auto flex w-[90%] max-w-md gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-lg backdrop-blur-md">
        <ServiceButton
          idleLabel={labels.callWaiter}
          loading={waiterState === "loading"}
          onClick={() => handleRequest("CALL_WAITER", setWaiterState)}
          state={waiterState}
          successLabel={labels.waiterNotified}
          variant="neutral"
        />
        <ServiceButton
          idleLabel={labels.requestBill}
          loading={billState === "loading"}
          onClick={() => handleRequest("REQUEST_BILL", setBillState)}
          state={billState}
          successLabel={labels.billRequested}
          variant="dark"
        />
      </div>
    </div>
  );
}

function ServiceButton({
  idleLabel,
  successLabel,
  state,
  loading,
  onClick,
  variant,
}: {
  idleLabel: string;
  successLabel: string;
  state: ButtonState;
  loading: boolean;
  onClick: () => void;
  variant: "neutral" | "dark";
}) {
  const isSuccess = state === "success";
  const baseClass =
    variant === "dark"
      ? "bg-slate-950 text-white hover:bg-slate-800"
      : "border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50";

  return (
    <button
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${baseClass} ${
        isSuccess ? "bg-emerald-600 text-white hover:bg-emerald-600" : ""
      }`}
      disabled={loading || isSuccess}
      onClick={onClick}
      type="button"
    >
      {loading ? (
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
      ) : isSuccess ? (
        <>
          <Check aria-hidden className="h-4 w-4" />
          <span>{successLabel}</span>
        </>
      ) : (
        <span>{idleLabel}</span>
      )}
    </button>
  );
}
