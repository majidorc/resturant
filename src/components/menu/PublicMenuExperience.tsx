"use client";

import { useState } from "react";
import { MenuList } from "@/components/MenuList";
import { WifiGate } from "@/components/WifiGate";

type MenuData = {
  id: string;
  name: string;
  items: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
  }[];
};

type PublicMenuExperienceProps = {
  restaurantId: string;
  restaurantName: string;
  menus: MenuData[];
};

export function PublicMenuExperience({
  restaurantId,
  restaurantName,
  menus,
}: PublicMenuExperienceProps) {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <>
      <div
        className={`transition-all duration-500 ${
          unlocked ? "opacity-100 blur-0" : "pointer-events-none select-none opacity-60 blur-[2px]"
        }`}
      >
        <MenuList menus={menus} />
      </div>
      <WifiGate
        onUnlock={() => setUnlocked(true)}
        restaurantId={restaurantId}
        restaurantName={restaurantName}
        unlocked={unlocked}
      />
    </>
  );
}
