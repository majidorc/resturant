"use client";

import { useActionState, useState } from "react";
import { MenuQrCode } from "@/components/dashboard/MenuQrCode";
import { updateRestaurantSettings } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-alert";
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
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold text-slate-900">Public Menu Link</h2>
          <p className="mt-1 text-sm text-slate-500">Share this URL on table QR codes and signage.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input readOnly value={publicMenuUrl} />
            <Button
              className={copied ? "bg-emerald-600 hover:bg-emerald-600" : ""}
              onClick={copyMenuLink}
              type="button"
              variant="secondary"
            >
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
          <MenuQrCode publicMenuUrl={publicMenuUrl} restaurantSlug={restaurant.slug} />
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <form action={formAction} className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Restaurant Settings</h2>
              <p className="mt-1 text-sm text-slate-500">Wi-Fi and review routing for customer-facing pages.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="wifiSsid">
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="wifiPassword">
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="googleReviewUrl">
                Google Review URL
              </label>
              <Input
                defaultValue={restaurant.googleReviewUrl ?? ""}
                id="googleReviewUrl"
                name="googleReviewUrl"
                placeholder="https://g.page/r/your-review-link"
                type="url"
              />
              <p className="mt-1 text-xs text-slate-400">
                Satisfied customers are redirected here from the review email.
              </p>
            </div>

            <FormAlert message={state.error} />
            <FormAlert message={state.success ? "Settings saved successfully." : null} variant="success" />

            <Button disabled={pending} type="submit">
              {pending ? "Saving…" : "Save Settings"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
