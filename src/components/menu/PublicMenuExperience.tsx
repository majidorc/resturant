"use client";

import { useState } from "react";
import { TableServiceBar } from "@/components/menu/TableServiceBar";
import { MenuList } from "@/components/MenuList";
import { WifiGate } from "@/components/WifiGate";
import { useDictionary } from "@/components/LocaleProvider";
import type { MenuLanguage } from "@/lib/locale";
import type { Locale } from "@/types/dictionary";
import type { JsonTranslationField } from "@/types/translations";

type MenuData = {
  id: string;
  name: JsonTranslationField;
  items: {
    id: string;
    name: JsonTranslationField;
    description: JsonTranslationField;
    price: number;
    images: string[];
  }[];
};

type PublicMenuExperienceProps = {
  restaurantId: string;
  restaurantName: string;
  menus: MenuData[];
  currency: string;
  locale: Locale;
  enabledLanguages: MenuLanguage[];
  tableNumber?: string | null;
};

function WifiLockedBanner({ onReopen }: { onReopen: () => void }) {
  const dict = useDictionary();

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
      <div className="mx-auto max-w-2xl text-center sm:text-left">
        <p className="text-sm text-amber-950">
          <span aria-hidden className="mr-1">
            🔒
          </span>
          {dict.wifi.lockedBanner}{" "}
          <button
            className="font-semibold text-slate-900 underline underline-offset-2 transition-colors hover:text-slate-700"
            onClick={onReopen}
            type="button"
          >
            {dict.wifi.reopenGate}
          </button>
        </p>
      </div>
    </div>
  );
}

export function PublicMenuExperience({
  restaurantId,
  restaurantName,
  menus,
  currency,
  locale,
  enabledLanguages,
  tableNumber,
}: PublicMenuExperienceProps) {
  const dict = useDictionary();
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
        <MenuList
          currency={currency}
          enabledLanguages={enabledLanguages}
          locale={locale}
          menus={menus}
        />
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

      {tableNumber ? (
        <TableServiceBar
          labels={{
            billRequested: dict.publicMenu.billRequested,
            callWaiter: dict.publicMenu.callWaiter,
            requestBill: dict.publicMenu.requestBill,
            sending: dict.publicMenu.sendingRequest,
            waiterNotified: dict.publicMenu.waiterNotified,
          }}
          restaurantId={restaurantId}
          tableNumber={tableNumber}
        />
      ) : null}
    </>
  );
}
