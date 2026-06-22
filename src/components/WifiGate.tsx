"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";

type WifiGateProps = {
  restaurantId: string;
  restaurantName: string;
  visible: boolean;
  onUnlock: () => void;
  onSkip: () => void;
};

type WifiCredentials = {
  wifiSsid: string;
  wifiPassword: string;
};

export function WifiGate({
  restaurantId,
  restaurantName,
  visible,
  onUnlock,
  onSkip,
}: WifiGateProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [wifi, setWifi] = useState<WifiCredentials | null>(null);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/lead/unlock-wifi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, email, source: "WIFI_UNLOCK" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not unlock Wi-Fi.");
        return;
      }

      if (data.success) {
        setWifi({
          wifiSsid: data.ssid,
          wifiPassword: data.password ?? "",
        });
        onUnlock();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyPassword() {
    if (!wifi?.wifiPassword) return;
    await navigator.clipboard.writeText(wifi.wifiPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSkip() {
    setError(null);
    onSkip();
  }

  if (wifi && !dismissed) {
    return (
      <div className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-md animate-fade-in-up">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition-all duration-200">
                {copied ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M6.343 6.343a8 8 0 0111.314 0"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">You are connected</h2>
                <p className="text-xs text-slate-500">Wi-Fi credentials ready</p>
              </div>
            </div>
          </div>

          <dl className="space-y-4 px-5 py-4 text-sm">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Network</dt>
              <dd className="mt-1 font-medium text-slate-900">{wifi.wifiSsid}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Password</dt>
              <dd className="mt-1 font-mono text-base font-medium text-slate-900">
                {wifi.wifiPassword || "—"}
              </dd>
            </div>
          </dl>

          <div className="flex gap-2 border-t border-slate-200 p-4">
            <Button
              className={`flex-1 transition-all duration-200 ${copied ? "bg-emerald-600 hover:bg-emerald-600" : ""}`}
              onClick={copyPassword}
              type="button"
            >
              {copied ? "Copied!" : "Copy Password"}
            </Button>
            <Button className="flex-1" onClick={() => setDismissed(true)} type="button" variant="secondary">
              View Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-md sm:items-center">
      <div className="w-full max-w-md animate-fade-in-up overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl">
        <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 px-6 py-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M6.343 6.343a8 8 0 0111.314 0"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Connect to Wi-Fi</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter your email to unlock the guest network at {restaurantName}.
          </p>
        </div>

        <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="wifi-email">
              Email address
            </label>
            <div className="relative">
              <svg
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
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </div>
          </div>

          <FormAlert message={error} />

          <Button className="w-full" disabled={loading} size="lg" type="submit">
            {loading ? "Unlocking…" : "Unlock Wi-Fi"}
          </Button>

          <div className="pt-1 text-center">
            <button
              className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
              disabled={loading}
              onClick={handleSkip}
              type="button"
            >
              Skip &amp; View Menu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
