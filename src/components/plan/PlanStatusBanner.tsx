"use client";

import Link from "next/link";
import type { PlanAccess } from "@/lib/plan";
import { Button } from "@/components/ui/button";

type PlanStatusBannerProps = {
  planAccess: PlanAccess;
  labels: {
    trialActive: string;
    trialExpired: string;
    upgradeCta: string;
  };
};

export function PlanStatusBanner({ planAccess, labels }: PlanStatusBannerProps) {
  if (planAccess.isPaidPro) {
    return null;
  }

  if (planAccess.isTrialActive && planAccess.daysLeftInTrial !== null) {
    return (
      <div className="border-b border-indigo-200 bg-indigo-50 px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-indigo-950">
            {labels.trialActive.replace("{days}", String(planAccess.daysLeftInTrial))}
          </p>
          <Link href="/dashboard/settings#billing">
            <Button size="sm" type="button" variant="secondary">
              {labels.upgradeCta}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (planAccess.isFreeTier && planAccess.trialEndsAt) {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-950">{labels.trialExpired}</p>
          <Link href="/dashboard/settings#billing">
            <Button size="sm" type="button">
              {labels.upgradeCta}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
