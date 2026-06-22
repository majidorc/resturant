"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WifiGateProps = {
  restaurantId: string;
  restaurantName: string;
};

type WifiCredentials = {
  wifiSsid: string;
  wifiPassword: string;
};

export function WifiGate({ restaurantId, restaurantName }: WifiGateProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [wifi, setWifi] = useState<WifiCredentials | null>(null);
  const [copied, setCopied] = useState(false);

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

  if (wifi) {
    return (
      <div className="fixed inset-x-4 bottom-6 z-20 mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Wi-Fi connected</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-zinc-500">Network</dt>
            <dd className="font-medium">{wifi.wifiSsid}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Password</dt>
            <dd className="font-mono font-medium">{wifi.wifiPassword}</dd>
          </div>
        </dl>
        <Button className="mt-4 w-full" onClick={copyPassword} type="button">
          {copied ? "Copied!" : "Copy Password"}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Need Wi-Fi at {restaurantName}?</h2>
        <p className="mt-1 text-sm text-zinc-600">Enter your email to unlock the network.</p>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <Input
            autoComplete="email"
            disabled={loading}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Unlocking…" : "Unlock Wi-Fi"}
          </Button>
        </form>

        <Button className="mt-3 w-full" disabled={loading} type="button" variant="secondary">
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
