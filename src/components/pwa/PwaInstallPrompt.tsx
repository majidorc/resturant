"use client";

import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import {
  type BeforeInstallPromptEvent,
  isIosDevice,
  isStandaloneDisplay,
} from "@/lib/pwa-install";
import { Button } from "@/components/ui/button";

type PwaInstallPromptProps = {
  labels: {
    installDescription: string;
    installApp: string;
    iosInstallTitle: string;
    iosInstallSteps: string;
    installMenuHint: string;
    close: string;
  };
};

export function PwaInstallPrompt({ labels }: PwaInstallPromptProps) {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [installing, setInstalling] = useState(false);
  const [showManualHelp, setShowManualHelp] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function syncInstalledState() {
      setIsInstalled(isStandaloneDisplay());
    }

    syncInstalledState();

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      deferredPromptRef.current = event as BeforeInstallPromptEvent;
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setShowManualHelp(false);
      deferredPromptRef.current = null;
    }

    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    displayModeQuery.addEventListener("change", syncInstalledState);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      displayModeQuery.removeEventListener("change", syncInstalledState);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    const promptEvent = deferredPromptRef.current;

    if (promptEvent) {
      setInstalling(true);

      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;

        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setShowManualHelp(false);
        }
      } catch {
        setShowManualHelp(true);
      } finally {
        setInstalling(false);
        deferredPromptRef.current = null;
      }

      return;
    }

    setShowManualHelp(true);
  }

  if (isInstalled !== false) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium leading-snug text-slate-900">
            <span aria-hidden className="mr-1">
              📲
            </span>
            {labels.installDescription}
          </p>
          <Button disabled={installing} onClick={handleInstall} size="sm" type="button">
            <Download className="h-4 w-4" />
            {installing ? "Installing..." : labels.installApp}
          </Button>
        </div>
      </div>

      {showManualHelp ? (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 px-4 py-4 shadow-sm sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-indigo-950">
                {isIosDevice() ? labels.iosInstallTitle : labels.installMenuHint}
              </p>
              {isIosDevice() ? (
                <p className="mt-1 text-sm leading-relaxed text-indigo-900">
                  {labels.iosInstallSteps}
                </p>
              ) : null}
            </div>
            <button
              aria-label={labels.close}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-indigo-700 transition-colors hover:bg-indigo-100"
              onClick={() => setShowManualHelp(false)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
