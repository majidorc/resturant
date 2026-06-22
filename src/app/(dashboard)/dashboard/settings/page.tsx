import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const session = await auth();

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
    },
  });

  if (!restaurant) {
    redirect("/dashboard");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const publicMenuUrl = `${baseUrl}/menu/${restaurant.slug}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Update Wi-Fi credentials and your Google review destination.</p>
      </div>

      <SettingsForm publicMenuUrl={publicMenuUrl} restaurant={restaurant} />
    </div>
  );
}
