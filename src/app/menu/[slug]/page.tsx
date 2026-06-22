import { notFound } from "next/navigation";
import { MenuList } from "@/components/MenuList";
import { WifiGate } from "@/components/WifiGate";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      menus: {
        where: { isActive: true },
        include: {
          items: {
            where: { isAvailable: true },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!restaurant) {
    notFound();
  }

  return (
    <main className="relative min-h-screen bg-zinc-50 pb-24">
      <header className="border-b border-zinc-200 bg-white px-4 py-6">
        <h1 className="text-center text-2xl font-semibold">{restaurant.name}</h1>
      </header>

      <div className="relative">
        <div className="pointer-events-none select-none blur-sm">
          <MenuList menus={restaurant.menus} />
        </div>
        <WifiGate restaurantId={restaurant.id} restaurantName={restaurant.name} />
      </div>
    </main>
  );
}
