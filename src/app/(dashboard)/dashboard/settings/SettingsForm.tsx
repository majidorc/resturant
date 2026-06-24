"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { MenuQrCode } from "@/components/dashboard/MenuQrCode";
import { GooglePlaceIdField } from "@/components/settings/GooglePlaceIdField";
import { ImageDropzone } from "@/components/upload/ImageDropzone";
import { updateRestaurantSettings } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  MENU_LANGUAGE_OPTIONS,
} from "@/lib/locale";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/LocaleProvider";

type SettingsFormProps = {
  restaurant: {
    wifiSsid: string | null;
    wifiPassword: string | null;
    googleReviewUrl: string | null;
    slug: string;
    currency: string;
    uiLanguage: string;
    languages: string[];
    logoUrl: string | null;
    city: string | null;
    country: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
    tiktokUrl: string | null;
    whatsappUrl: string | null;
    tablesCount: number;
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
  const dict = useDictionary();
  const s = dict.settings;
  const c = dict.common;
  const [state, formAction, pending] = useActionState(updateRestaurantSettings, initialState);
  const [copied, setCopied] = useState(false);
  const [logoUrl, setLogoUrl] = useState(restaurant.logoUrl);
  const enabledLanguages = new Set(restaurant.languages);

  async function copyMenuLink() {
    await navigator.clipboard.writeText(publicMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <SectionCard description={s.profileSubtitle} title={s.profileTitle}>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-zinc-900">{s.menuSlug}</p>
            <p className="mt-0.5 text-xs text-slate-500">{s.menuSlugHint}</p>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
              /{restaurant.slug}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-900">{s.publicMenuLink}</p>
            <p className="mt-0.5 text-xs text-slate-500">{s.publicMenuLinkHint}</p>
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
                    {c.copied}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 shrink-0" />
                    {c.copyLink}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>

      <MenuQrCode
        publicMenuUrl={publicMenuUrl}
        restaurantSlug={restaurant.slug}
        tablesCount={restaurant.tablesCount}
      />

      <form action={formAction} className="space-y-6">
        <SectionCard description={s.tablesSubtitle} title={s.tablesTitle}>
          <FieldLabel hint={s.tablesCountHint} htmlFor="tablesCount" label={s.tablesCount} />
          <Input
            className={fieldInputClass}
            defaultValue={restaurant.tablesCount}
            id="tablesCount"
            min={0}
            name="tablesCount"
            placeholder="0"
            type="number"
          />
        </SectionCard>

        <SectionCard description={s.logoSubtitle} title={s.logoTitle}>
          <ImageDropzone
            dragLabel={s.logoUpload}
            hint={s.logoHint}
            label={s.logoTitle}
            onChange={setLogoUrl}
            replaceLabel={s.logoReplace}
            uploadingLabel={s.logoUploading}
            value={logoUrl}
          />
          <input name="logoUrl" type="hidden" value={logoUrl ?? ""} />
        </SectionCard>

        <SectionCard description={s.locationSubtitle} title={s.locationTitle}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel hint={s.cityHint} htmlFor="city" label={s.city} />
              <Input
                className={fieldInputClass}
                defaultValue={restaurant.city ?? ""}
                id="city"
                name="city"
                placeholder="Phuket"
              />
            </div>
            <div>
              <FieldLabel hint={s.countryHint} htmlFor="country" label={s.country} />
              <Input
                className={fieldInputClass}
                defaultValue={restaurant.country ?? ""}
                id="country"
                name="country"
                placeholder="Thailand"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard description={s.socialSubtitle} title={s.socialTitle}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel hint={s.instagramUrlHint} htmlFor="instagramUrl" label={s.instagramUrl} />
              <Input
                className={fieldInputClass}
                defaultValue={restaurant.instagramUrl ?? ""}
                id="instagramUrl"
                name="instagramUrl"
                placeholder={s.instagramPlaceholder}
                type="url"
              />
            </div>
            <div>
              <FieldLabel hint={s.facebookUrlHint} htmlFor="facebookUrl" label={s.facebookUrl} />
              <Input
                className={fieldInputClass}
                defaultValue={restaurant.facebookUrl ?? ""}
                id="facebookUrl"
                name="facebookUrl"
                placeholder={s.facebookPlaceholder}
                type="url"
              />
            </div>
            <div>
              <FieldLabel hint={s.tiktokUrlHint} htmlFor="tiktokUrl" label={s.tiktokUrl} />
              <Input
                className={fieldInputClass}
                defaultValue={restaurant.tiktokUrl ?? ""}
                id="tiktokUrl"
                name="tiktokUrl"
                placeholder={s.tiktokPlaceholder}
                type="url"
              />
            </div>
            <div>
              <FieldLabel hint={s.whatsappUrlHint} htmlFor="whatsappUrl" label={s.whatsappUrl} />
              <Input
                className={fieldInputClass}
                defaultValue={restaurant.whatsappUrl ?? ""}
                id="whatsappUrl"
                name="whatsappUrl"
                placeholder={s.whatsappPlaceholder}
                type="url"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard description={s.wifiSubtitle} title={s.wifiTitle}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <FieldLabel hint={s.wifiSsidHint} htmlFor="wifiSsid" label={s.wifiSsid} />
              <Input
                className={fieldInputClass}
                defaultValue={restaurant.wifiSsid ?? ""}
                id="wifiSsid"
                name="wifiSsid"
                placeholder="GreenBistro-Guest"
              />
            </div>

            <div>
              <FieldLabel hint={s.wifiPasswordHint} htmlFor="wifiPassword" label={s.wifiPassword} />
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

        <SectionCard description={s.reviewSubtitle} title={s.reviewTitle}>
          <div className="space-y-3">
            <GooglePlaceIdField
              initialReviewUrl={restaurant.googleReviewUrl}
              inputClassName={fieldInputClass}
              labels={{
                placeId: s.reviewPlaceId,
                placeIdHint: s.reviewPlaceIdHint,
                placeIdPlaceholder: s.reviewPlaceIdPlaceholder,
                reviewPreview: s.reviewPreview,
                resolving: s.reviewResolving,
                invalidPlaceId: s.reviewInvalidPlaceId,
                resolveFailed: s.reviewResolveFailed,
              }}
            />

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
              <span aria-hidden className="mr-1">
                💡
              </span>
              {s.reviewProTip}
            </div>
          </div>
        </SectionCard>

        <SectionCard description={s.localeSubtitle} title={s.localeTitle}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <FieldLabel hint={s.currencyHint} htmlFor="currency" label={s.currency} />
                <Select
                  className={fieldInputClass}
                  defaultValue={restaurant.currency}
                  id="currency"
                  name="currency"
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <FieldLabel hint={s.uiLanguageHint} htmlFor="uiLanguage" label={s.uiLanguage} />
                <Select
                  className={fieldInputClass}
                  defaultValue={restaurant.uiLanguage}
                  id="uiLanguage"
                  name="uiLanguage"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <FieldLabel
                hint={s.supportedMenuLanguagesHint}
                htmlFor="languages-en"
                label={s.supportedMenuLanguages}
              />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {MENU_LANGUAGE_OPTIONS.map((option) => (
                  <label
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 transition-colors hover:border-slate-300"
                    key={option.value}
                  >
                    <input
                      className="h-4 w-4 rounded border-slate-300"
                      defaultChecked={enabledLanguages.has(option.value)}
                      name="languages"
                      type="checkbox"
                      value={option.value}
                    />
                    <span>
                      {option.label}{" "}
                      <span className="text-slate-500">({option.nativeLabel})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <FormAlert message={state.error} />
        <FormAlert message={state.success ? s.savedSuccess : null} variant="success" />

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <Button
            className={cn("min-w-[140px]", pending && "opacity-75")}
            disabled={pending}
            type="submit"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                {c.saving}
              </>
            ) : (
              c.saveChanges
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}