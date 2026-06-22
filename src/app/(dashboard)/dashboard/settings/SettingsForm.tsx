"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { MenuQrCode } from "@/components/dashboard/MenuQrCode";
import { updateRestaurantSettings } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

const fieldInputClass =
  "border-slate-200 focus-visible:border-slate-400 focus-visible:ring-slate-900/10";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function FieldLabel({
  htmlFor,
  label,
  hint,
}: {
  htmlFor: string;
  label: string;
  hint: string;
}) {
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-zinc-900" htmlFor={htmlFor}>
        {label}
      </label>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export function SettingsForm({ restaurant, publicMenuUrl }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateRestaurantSettings, initialState);
  const [copied, setCopied] = useState(false);

  async function copyMenuLink() {
    await navigator.clipboard.writeText(publicMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <SectionCard
        description="Your public menu identity and shareable guest link."
        title="Restaurant Profile"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-zinc-900">Menu Slug</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Unique path segment used in your public menu URL.
            </p>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
              /{restaurant.slug}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-900">Public Menu Link</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Share this URL on table QR codes, social posts, and signage.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
                <span className="block truncate">{publicMenuUrl}</span>
              </div>
              <Button
                className={cn(
                  "shrink-0 whitespace-nowrap",
                  copied && "bg-emerald-600 hover:bg-emerald-600",
                )}
                onClick={copyMenuLink}
                type="button"
                variant="secondary"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 shrink-0" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 shrink-0" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>

      <MenuQrCode publicMenuUrl={publicMenuUrl} restaurantSlug={restaurant.slug} />

      <form action={formAction} className="space-y-6">
        <SectionCard
          description="Credentials shown to guests after they unlock Wi-Fi on your menu page."
          title="Wi-Fi Access Credentials"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <FieldLabel
                hint="Network name guests will connect to."
                htmlFor="wifiSsid"
                label="Wi-Fi SSID"
              />
              <Input
                className={fieldInputClass}
                defaultValue={restaurant.wifiSsid ?? ""}
                id="wifiSsid"
                name="wifiSsid"
                placeholder="GreenBistro-Guest"
              />
            </div>

            <div>
              <FieldLabel
                hint="Password revealed after email capture."
                htmlFor="wifiPassword"
                label="Wi-Fi Password"
              />
              <Input
                className={fieldInputClass}
                defaultValue={restaurant.wifiPassword ?? ""}
                id="wifiPassword"
                name="wifiPassword"
                placeholder="guest-wifi-password"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          description="Satisfied customers are redirected here from the review follow-up email."
          title="Google Review Link"
        >
          <div>
            <FieldLabel
              hint="Must be a full URL starting with http:// or https://."
              htmlFor="googleReviewUrl"
              label="Google Review URL"
            />
            <Input
              className={fieldInputClass}
              defaultValue={restaurant.googleReviewUrl ?? ""}
              id="googleReviewUrl"
              name="googleReviewUrl"
              placeholder="https://g.page/r/your-review-link"
              type="url"
            />
          </div>
        </SectionCard>

        <FormAlert message={state.error} />
        <FormAlert message={state.success ? "Settings saved successfully." : null} variant="success" />

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <Button
            className={cn("min-w-[140px]", pending && "opacity-75")}
            disabled={pending}
            type="submit"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
