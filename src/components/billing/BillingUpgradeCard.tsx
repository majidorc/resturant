"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import type { PlanAccess } from "@/lib/plan";
import { Button } from "@/components/ui/button";

type BillingUpgradeCardProps = {
  planAccess: PlanAccess;
  labels: {
    title: string;
    freePlan: string;
    proPlan: string;
    proPrice: string;
    proDescription: string;
    upgradeCta: string;
    activeBadge: string;
    trialBadge: string;
    trialDaysLeft: string;
    checkoutError: string;
  };
};

export function BillingUpgradeCard({ planAccess, labels }: BillingUpgradeCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPaidPro = planAccess.isPaidPro;
  const showUpgrade = !isPaidPro;

  async function handleUpgrade() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await response.json();

      if (!response.ok || !data.url) {
        setError(data.error ?? labels.checkoutError);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError(labels.checkoutError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" id="billing">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-slate-900">{labels.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isPaidPro
              ? labels.proPlan
              : planAccess.isTrialActive
                ? labels.trialDaysLeft.replace("{days}", String(planAccess.daysLeftInTrial ?? 0))
                : labels.freePlan}
            {isPaidPro ? (
              <span className="ml-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                {labels.activeBadge}
              </span>
            ) : null}
            {planAccess.isTrialActive ? (
              <span className="ml-2 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800">
                {labels.trialBadge}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {showUpgrade ? (
        <div className="mt-5 rounded-2xl border border-slate-950 bg-slate-950 p-5 text-white">
          <p className="text-sm font-medium text-slate-300">{labels.proPlan}</p>
          <p className="mt-2 text-3xl font-semibold">{labels.proPrice}</p>
          <p className="mt-1 text-sm text-slate-300">{labels.proDescription}</p>
          <Button
            className="mt-5 w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
            disabled={loading}
            onClick={handleUpgrade}
            type="button"
          >
            {loading ? (
              <>
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                {labels.upgradeCta}
              </>
            ) : (
              labels.upgradeCta
            )}
          </Button>
          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
