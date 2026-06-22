"use client";

import { useActionState, useState } from "react";
import { updateRestaurantSettings } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SettingsFormProps = {
  restaurant: {
    wifiSsid: string | null;
    wifiPassword: string | null;
    googleReviewUrl: string | null;
    slug: string;
  };
  publicMenuUrl: string;
};

const initialState: ActionState = {};

export function SettingsForm({ restaurant, publicMenuUrl }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateRestaurantSettings, initialState);
  const [copied, setCopied] = useState(false);

  async function copyMenuLink() {
    await navigator.clipboard.writeText(publicMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Public Menu Link</h2>
        <p className="mt-1 text-sm text-zinc-600">Share this URL on table QR codes.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input readOnly value={publicMenuUrl} />
          <Button onClick={copyMenuLink} type="button" variant="secondary">
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </section>

      <form
        action={formAction}
        className="space-y-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Restaurant Settings</h2>
          <p className="mt-1 text-sm text-zinc-600">Wi-Fi and review routing for customer-facing pages.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="wifiSsid">
            Wi-Fi SSID
          </label>
          <Input
            defaultValue={restaurant.wifiSsid ?? ""}
            id="wifiSsid"
            name="wifiSsid"
            placeholder="GreenBistro-Guest"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="wifiPassword">
            Wi-Fi Password
          </label>
          <Input
            defaultValue={restaurant.wifiPassword ?? ""}
            id="wifiPassword"
            name="wifiPassword"
            placeholder="guest-wifi-password"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="googleReviewUrl">
            Google Review URL
          </label>
          <Input
            defaultValue={restaurant.googleReviewUrl ?? ""}
            id="googleReviewUrl"
            name="googleReviewUrl"
            placeholder="https://g.page/r/your-review-link"
            type="url"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Satisfied customers are redirected here from the review email.
          </p>
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.success && <p className="text-sm text-green-700">Settings saved successfully.</p>}

        <Button disabled={pending} type="submit">
          {pending ? "Saving…" : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
