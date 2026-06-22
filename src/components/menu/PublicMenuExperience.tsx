"use client";

import { useState } from "react";
import { MenuList } from "@/components/MenuList";
import { WifiGate } from "@/components/WifiGate";
import { Button } from "@/components/ui/button";

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
  currency: string;
  language: string;
};

function WifiLockedBanner({ onReopen }: { onReopen: () => void }) {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-amber-950">
          Wi-Fi password locked. Provide your email to unlock high-speed internet.
        </p>
        <Button className="shrink-0 whitespace-nowrap" onClick={onReopen} size="sm" type="button">
          Unlock Wi-Fi
        </Button>
      </div>
    </div>
  );
}

export function PublicMenuExperience({
  restaurantId,
  restaurantName,
  menus,
  currency,
  language,
}: PublicMenuExperienceProps) {
  const [gateOpen, setGateOpen] = useState(true);
  const [wifiUnlocked, setWifiUnlocked] = useState(false);

  const gateBlockingMenu = gateOpen && !wifiUnlocked;
  const showLockedBanner = !gateOpen && !wifiUnlocked;

  return (
    <>
      {showLockedBanner && <WifiLockedBanner onReopen={() => setGateOpen(true)} />}

      <div
        className={`transition-all duration-500 ${
          gateBlockingMenu
            ? "pointer-events-none select-none opacity-60 blur-[2px]"
            : "opacity-100 blur-0"
        }`}
      >
        <MenuList currency={currency} language={language} menus={menus} />
      </div>

      <WifiGate
        onSkip={() => setGateOpen(false)}
        onUnlock={() => {
          setWifiUnlocked(true);
          setGateOpen(false);
        }}
        restaurantId={restaurantId}
        restaurantName={restaurantName}
        visible={gateOpen && !wifiUnlocked}
      />
    </>
  );
}
