import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminMobileHeader, AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "SUPERADMIN") {
    redirect("/access-denied");
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/50">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminMobileHeader />
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
