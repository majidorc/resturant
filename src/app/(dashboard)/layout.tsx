import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DashboardMobileHeader,
  DashboardSidebar,
} from "@/components/dashboard/DashboardSidebar";

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

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: { name: true },
  });

  const restaurantName = restaurant?.name ?? "My Restaurant";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/50">
      <DashboardSidebar restaurantName={restaurantName} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardMobileHeader restaurantName={restaurantName} />
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
