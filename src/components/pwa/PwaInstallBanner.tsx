"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const INSTALL_BANNER_DISMISSED_KEY = "reviewbite-pwa-install-dismissed";

function isMobileBrowser() {
  if (typeof window === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (isStandaloneDisplay() || !isMobileBrowser()) {
      return;
    }

    if (window.localStorage.getItem(INSTALL_BANNER_DISMISSED_KEY) === "1") {
      return;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      deferredPromptRef.current = event as BeforeInstallPromptEvent;
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstall() {
    const promptEvent = deferredPromptRef.current;
    if (!promptEvent) {
      return;
    }

    setInstalling(true);

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      if (choice.outcome === "accepted") {
        setVisible(false);
      }
    } catch {
      // Browser may block the install prompt outside supported contexts.
    } finally {
      setInstalling(false);
      deferredPromptRef.current = null;
    }
  }

  function handleDismiss() {
    window.localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, "1");
    setVisible(false);
    deferredPromptRef.current = null;
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-slate-900">
            <span aria-hidden className="mr-1">
              📲
            </span>
            Install ReviewBite App for reliable real-time waiter notifications
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button disabled={installing} onClick={handleInstall} size="sm" type="button">
            {installing ? "Installing..." : "Install"}
          </Button>
          <button
            aria-label="Dismiss install banner"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            onClick={handleDismiss}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
