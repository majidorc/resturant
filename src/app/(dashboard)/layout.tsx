import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DashboardMobileHeader,
  DashboardSidebar,
} from "@/components/dashboard/DashboardSidebar";
import { PlanStatusBanner } from "@/components/plan/PlanStatusBanner";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";
import { resolvePlanAccess } from "@/lib/plan";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role === "SUPERADMIN") {
    redirect("/admin");
  }

  const locale = await getLocale();
  const d = getDictionary(locale).dashboard;

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: {
      name: true,
      isActive: true,
      plan: true,
      subscriptionStatus: true,
      trialEndsAt: true,
    },
  });

  const restaurantName = restaurant?.name ?? "My Restaurant";
  const planAccess = restaurant ? resolvePlanAccess(restaurant) : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/50">
      <DashboardSidebar hasProAccess={planAccess?.hasProAccess ?? false} restaurantName={restaurantName} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardMobileHeader hasProAccess={planAccess?.hasProAccess ?? false} restaurantName={restaurantName} />
        {planAccess ? (
          <PlanStatusBanner
            labels={{
              trialActive: d.planTrialActive,
              trialExpired: d.planTrialExpired,
              upgradeCta: d.billingUpgradeCta,
            }}
            planAccess={planAccess}
          />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-8">
          {restaurant && !restaurant.isActive ? (
            <div className="mx-auto flex w-full max-w-lg flex-1 items-center">
              <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center shadow-sm">
                <h1 className="text-xl font-semibold text-amber-900">{d.accountDeactivatedTitle}</h1>
                <p className="mt-3 text-sm leading-relaxed text-amber-800">{d.accountDeactivatedMessage}</p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
