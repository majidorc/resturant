"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import {
  canNativeInstall,
  isAndroidDevice,
  isIosDevice,
  isStandaloneDisplay,
  subscribeInstallPrompt,
  triggerNativeInstall,
} from "@/lib/pwa-install";
import { Button } from "@/components/ui/button";

type PwaInstallPromptProps = {
  labels: {
    installDescription: string;
    installApp: string;
    iosInstallTitle: string;
    iosInstallSteps: string;
    androidInstallTitle: string;
    androidInstallSteps: string;
    installPreparing: string;
    close: string;
  };
};

export function PwaInstallPrompt({ labels }: PwaInstallPromptProps) {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [nativeInstallReady, setNativeInstallReady] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showManualHelp, setShowManualHelp] = useState(false);
  const [manualMode, setManualMode] = useState<"ios" | "android" | null>(null);

  useEffect(() => {
    function syncState() {
      setIsInstalled(isStandaloneDisplay());
      setNativeInstallReady(canNativeInstall());
    }

    syncState();

    const unsubscribe = subscribeInstallPrompt(syncState);
    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    displayModeQuery.addEventListener("change", syncState);
    window.addEventListener("appinstalled", syncState);

    return () => {
      unsubscribe();
      displayModeQuery.removeEventListener("change", syncState);
      window.removeEventListener("appinstalled", syncState);
    };
  }, []);

  async function handleInstall() {
    if (isIosDevice()) {
      setManualMode("ios");
      setShowManualHelp(true);
      return;
    }

    setInstalling(true);
    setShowManualHelp(false);

    const result = await triggerNativeInstall();

    setInstalling(false);

    if (result.ok) {
      setIsInstalled(true);
      setShowManualHelp(false);
      return;
    }

    if (isAndroidDevice()) {
      setManualMode("android");
      setShowManualHelp(true);
      return;
    }

    setManualMode("android");
    setShowManualHelp(true);
  }

  if (isInstalled !== false) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug text-slate-900">
              <span aria-hidden className="mr-1">
                📲
              </span>
              {labels.installDescription}
            </p>
            {nativeInstallReady && !isIosDevice() ? (
              <p className="mt-1 text-xs text-emerald-700">One-tap install is ready.</p>
            ) : null}
          </div>
          <Button disabled={installing} onClick={handleInstall} size="sm" type="button">
            <Download className="h-4 w-4" />
            {installing ? labels.installPreparing : labels.installApp}
          </Button>
        </div>
      </div>

      {showManualHelp ? (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 px-4 py-4 shadow-sm sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-indigo-950">
                {manualMode === "ios" ? labels.iosInstallTitle : labels.androidInstallTitle}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-indigo-900">
                {manualMode === "ios" ? labels.iosInstallSteps : labels.androidInstallSteps}
              </p>
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
