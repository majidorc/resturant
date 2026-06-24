import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";

export default async function SettingsPage() {
  const session = await auth();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: {
      wifiSsid: true,
      wifiPassword: true,
      googleReviewUrl: true,
      slug: true,
      currency: true,
      uiLanguage: true,
      languages: true,
      logoUrl: true,
      city: true,
      country: true,
      instagramUrl: true,
      facebookUrl: true,
      tiktokUrl: true,
      whatsappUrl: true,
      tablesCount: true,
    },
  });

  if (!restaurant) {
    redirect("/dashboard");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const publicMenuUrl = `${baseUrl}/menu/${restaurant.slug}`;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {dict.dashboard.settingsEyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          {dict.dashboard.settingsTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{dict.dashboard.settingsSubtitle}</p>
      </div>

      <SettingsForm publicMenuUrl={publicMenuUrl} restaurant={restaurant} />
    </div>
  );
}
