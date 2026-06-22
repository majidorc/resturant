import { notFound } from "next/navigation";
import { PublicMenuExperience } from "@/components/menu/PublicMenuExperience";
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
    <main className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white pb-28">
      <header className="border-b border-slate-100/80 bg-white px-4 py-5">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          Digital Menu
        </p>
        <h1 className="mt-1 text-center text-2xl font-semibold tracking-tight text-slate-900">
          {restaurant.name}
        </h1>
      </header>

      <PublicMenuExperience
        currency={restaurant.currency}
        language={restaurant.language}
        menus={restaurant.menus}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />
    </main>
  );
}
