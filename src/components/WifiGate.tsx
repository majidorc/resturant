"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/components/LocaleProvider";
import { interpolate } from "@/lib/get-dictionary";

export type WifiCredentials = {
  wifiSsid: string;
  wifiPassword: string;
};

type WifiGateModalProps = {
  restaurantId: string;
  restaurantName: string;
  visible: boolean;
  onUnlock: (credentials: WifiCredentials) => void;
  onSkip: () => void;
};

type WifiCredentialsCardProps = {
  wifi: WifiCredentials;
  onDismiss: () => void;
};

export function WifiCredentialsCard({ wifi, onDismiss }: WifiCredentialsCardProps) {
  const dict = useDictionary();
  const t = dict.wifi;
  const [copied, setCopied] = useState(false);

  async function copyPassword() {
    if (!wifi.wifiPassword) return;
    await navigator.clipboard.writeText(wifi.wifiPassword);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
      <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M6.343 6.343a8 8 0 0111.314 0"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900">{t.connectedTitle}</h2>
            <p className="text-xs text-slate-500">{t.connectedSubtitle}</p>
          </div>
        </div>
      </div>

      <dl className="space-y-3 px-4 py-4 text-sm sm:space-y-4 sm:px-5">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.network}</dt>
          <dd className="mt-1 font-medium text-slate-900">{wifi.wifiSsid}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.password}</dt>
          <dd className="mt-1 break-all font-mono text-base font-medium text-slate-900">
            {wifi.wifiPassword || "—"}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2 border-t border-slate-200 p-4 sm:flex-row">
        <Button
          className={`flex-1 transition-all duration-200 ${copied ? "bg-emerald-600 hover:bg-emerald-600" : ""}`}
          onClick={copyPassword}
          type="button"
        >
          {copied ? dict.common.copied : t.copyPassword}
        </Button>
        <Button className="flex-1" onClick={onDismiss} type="button" variant="secondary">
          {t.viewMenu}
        </Button>
      </div>
    </div>
  );
}

export function WifiGateModal({
  restaurantId,
  restaurantName,
  visible,
  onUnlock,
  onSkip,
}: WifiGateModalProps) {
  const dict = useDictionary();
  const t = dict.wifi;

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/lead/unlock-wifi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? t.unlockError);
        return;
      }

      if (data.success) {
        onUnlock({
          wifiSsid: data.ssid,
          wifiPassword: data.password ?? "",
        });
        setEmail("");
      }
    } catch {
      setError(t.networkError);
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    setError(null);
    onSkip();
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-md sm:items-center">
      <div className="w-full max-w-md animate-fade-in-up overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl">
        <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 px-6 py-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M6.343 6.343a8 8 0 0111.314 0"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">{t.connectTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {interpolate(t.connectSubtitle, { restaurantName })}
          </p>
        </div>

        <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="wifi-email">
              {t.emailLabel}
            </label>
            <div className="relative">
              <svg
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <Input
                autoComplete="email"
                className="pl-10"
                disabled={loading}
                id="wifi-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.emailPlaceholder}
                required
                type="email"
                value={email}
              />
            </div>
          </div>

          <FormAlert message={error} />

          <Button className="w-full" disabled={loading} size="lg" type="submit">
            {loading ? t.unlocking : t.unlockWifi}
          </Button>

          <div className="pt-1 text-center">
            <button
              className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
              disabled={loading}
              onClick={handleSkip}
              type="button"
            >
              {t.skipViewMenu}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** @deprecated Use WifiGateModal and WifiCredentialsCard directly in PublicMenuExperience. */
export function WifiGate({
  restaurantId,
  restaurantName,
  visible,
  onUnlock,
  onSkip,
}: {
  restaurantId: string;
  restaurantName: string;
  visible: boolean;
  onUnlock: () => void;
  onSkip: () => void;
}) {
  return (
    <WifiGateModal
      onSkip={onSkip}
      onUnlock={() => onUnlock()}
      restaurantId={restaurantId}
      restaurantName={restaurantName}
      visible={visible}
    />
  );
}
