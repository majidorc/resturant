import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";
import { WaitersMonitor } from "@/components/waiters/WaitersMonitor";
import { ProFeatureLock } from "@/components/plan/ProFeatureLock";
import { resolvePlanAccess } from "@/lib/plan";

export default async function WaitersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const d = dict.dashboard;

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      plan: true,
      subscriptionStatus: true,
      trialEndsAt: true,
    },
  });

  if (!restaurant) {
    redirect("/dashboard");
  }

  const pendingRequests = await prisma.tableServiceRequest.findMany({
    where: { restaurantId: restaurant.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      tableNumber: true,
      type: true,
      createdAt: true,
    },
  });

  const planAccess = resolvePlanAccess(restaurant);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {d.waitersEyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          {d.waitersTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{d.waitersSubtitle}</p>
      </div>

      {!planAccess.hasProAccess ? (
        <ProFeatureLock
          description={d.planWaiterLockedDescription}
          title={d.planWaiterLockedTitle}
          upgradeCta={d.billingUpgradeCta}
        />
      ) : (
        <WaitersMonitor
        initialRequests={pendingRequests.map((request) => ({
          ...request,
          createdAt: request.createdAt.toISOString(),
        }))}
        labels={{
          callWaiter: d.waiterCallType,
          requestBill: d.waiterBillType,
          tableLabel: d.waiterTableLabel,
          markComplete: d.waiterMarkComplete,
          noPendingRequests: d.waiterNoPending,
          liveRefreshHint: d.waiterLiveHint,
          notificationPrompt: d.waiterNotificationPrompt,
          enableAlerts: d.waiterEnableAlerts,
          silenceAlerts: d.waiterSilenceAlerts,
          refreshError: d.waiterRefreshError,
          urgentBanner: d.waiterUrgentBanner,
          installDescription: d.waiterInstallDescription,
          installApp: d.waiterInstallApp,
          installPreparing: d.waiterInstallPreparing,
          iosInstallTitle: d.waiterIosInstallTitle,
          iosInstallSteps: d.waiterIosInstallSteps,
          androidInstallTitle: d.waiterAndroidInstallTitle,
          androidInstallSteps: d.waiterAndroidInstallSteps,
          close: dict.common.close,
        }}
      />
      )}
    </div>
  );
}
