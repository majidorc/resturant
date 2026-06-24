"use client";

import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { TableServiceBar } from "@/components/menu/TableServiceBar";
import { RestaurantSocialLinks } from "@/components/menu/RestaurantSocialLinks";
import { MenuList } from "@/components/MenuList";
import {
  WifiCredentialsCard,
  WifiGateModal,
  type WifiCredentials,
} from "@/components/WifiGate";
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
  logoUrl?: string | null;
  location?: string;
  switcherLocales: Locale[];
  socialLinks: {
    facebookUrl: string | null;
    instagramUrl: string | null;
    tiktokUrl: string | null;
    whatsappUrl: string | null;
    locationUrl?: string | null;
    locationLabel: string;
  };
  digitalMenuLabel: string;
};

function WifiLockedBanner({ onReopen }: { onReopen: () => void }) {
  const dict = useDictionary();

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
      <div className="mx-auto max-w-2xl text-center">
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
  logoUrl,
  location,
  switcherLocales,
  socialLinks,
  digitalMenuLabel,
}: PublicMenuExperienceProps) {
  const dict = useDictionary();
  const [gateOpen, setGateOpen] = useState(true);
  const [wifiUnlocked, setWifiUnlocked] = useState(false);
  const [wifiCredentials, setWifiCredentials] = useState<WifiCredentials | null>(null);
  const [wifiCardDismissed, setWifiCardDismissed] = useState(false);

  const gateBlockingMenu = gateOpen && !wifiUnlocked;
  const showLockedBanner = !gateOpen && !wifiUnlocked;
  const showWifiCard = Boolean(wifiCredentials) && !wifiCardDismissed;

  function handleWifiUnlock(credentials: WifiCredentials) {
    setWifiCredentials(credentials);
    setWifiUnlocked(true);
    setGateOpen(false);
    setWifiCardDismissed(false);
  }

  return (
    <div className="relative flex flex-col">
      <header
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-5 backdrop-blur-md"
        id="public-menu-header"
      >
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-3 text-center">
          {logoUrl ? (
            <img
              alt={`${restaurantName} logo`}
              className="h-16 w-16 rounded-2xl border border-slate-200 object-cover shadow-sm"
              src={logoUrl}
            />
          ) : null}

          <div className="flex w-full flex-col items-center justify-center space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              {digitalMenuLabel}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {restaurantName}
            </h1>
            {location ? <p className="text-sm text-slate-500">{location}</p> : null}
          </div>

          <RestaurantSocialLinks
            facebookUrl={socialLinks.facebookUrl}
            instagramUrl={socialLinks.instagramUrl}
            locationLabel={socialLinks.locationLabel}
            locationUrl={socialLinks.locationUrl}
            tiktokUrl={socialLinks.tiktokUrl}
            whatsappUrl={socialLinks.whatsappUrl}
          />

          <LanguageSwitcher availableLocales={switcherLocales} className="mx-auto" flagOnly />
        </div>
      </header>

      {showLockedBanner ? <WifiLockedBanner onReopen={() => setGateOpen(true)} /> : null}

      {showWifiCard && wifiCredentials ? (
        <div className="border-b border-slate-200 bg-white px-4 py-4">
          <div className="mx-auto max-w-2xl">
            <WifiCredentialsCard
              onDismiss={() => setWifiCardDismissed(true)}
              wifi={wifiCredentials}
            />
          </div>
        </div>
      ) : null}

      <div
        className={`transition-all duration-500 ${
          gateBlockingMenu
            ? "pointer-events-none select-none opacity-60 blur-[2px]"
            : "opacity-100 blur-0"
        }`}
      >
        <MenuList
          currency={currency}
          dockPadding={tableNumber ? "pb-36" : "pb-32"}
          enabledLanguages={enabledLanguages}
          locale={locale}
          menus={menus}
        />
      </div>

      <WifiGateModal
        onSkip={() => setGateOpen(false)}
        onUnlock={handleWifiUnlock}
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
    </div>
  );
}
