export const PLAN_LIMITS = {
  freeMaxMenus: 1,
  freeMaxLeadsPerMonth: 50,
  freeMaxLanguages: 1,
  trialMonths: 3,
} as const;

export type RestaurantPlanFields = {
  plan: "FREE" | "PRO";
  subscriptionStatus: string | null;
  trialEndsAt: Date | null;
};

export type PlanAccess = {
  hasProAccess: boolean;
  isPaidPro: boolean;
  isTrialActive: boolean;
  isFreeTier: boolean;
  trialEndsAt: Date | null;
  daysLeftInTrial: number | null;
};

export function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function resolvePlanAccess(fields: RestaurantPlanFields): PlanAccess {
  const now = new Date();
  const isPaidPro = fields.subscriptionStatus === "active";
  const isTrialActive = Boolean(fields.trialEndsAt && fields.trialEndsAt > now);
  const hasProAccess = isPaidPro || isTrialActive;

  let daysLeftInTrial: number | null = null;
  if (isTrialActive && fields.trialEndsAt && !isPaidPro) {
    daysLeftInTrial = Math.max(
      0,
      Math.ceil((fields.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }

  return {
    hasProAccess,
    isPaidPro,
    isTrialActive: isTrialActive && !isPaidPro,
    isFreeTier: !hasProAccess,
    trialEndsAt: fields.trialEndsAt,
    daysLeftInTrial,
  };
}

export function getTrialEndsAtForNewRegistration() {
  return addMonths(new Date(), PLAN_LIMITS.trialMonths);
}

export function planUpgradeRequiredMessage(feature: string) {
  return `${feature} is available on Pro. Upgrade your plan to continue using this feature.`;
}
