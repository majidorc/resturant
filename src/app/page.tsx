import Link from "next/link";
import { ArrowRight, PlayCircle, BarChart3, Check, Mail, QrCode, ShieldCheck, Sparkles, Star, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardMockup } from "@/components/landing/DashboardMockup";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";

const stepIcons = [QrCode, Wifi, Mail];
const featureIcons = [Sparkles, Wifi, ShieldCheck];

export default async function HomePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.landing;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <LandingNavbar />

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-5 border-amber-200 bg-amber-50 text-amber-800">{t.badge}</Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {t.heroTitle}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {t.heroSubtitle}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button
                  className="w-full min-w-[220px] shadow-md transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
                  size="lg"
                  type="button"
                >
                  {t.createFreeMenu}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  className="w-full min-w-[220px] transition-all duration-200 ease-in-out hover:-translate-y-0.5 sm:w-auto"
                  size="lg"
                  type="button"
                  variant="secondary"
                >
                  <PlayCircle className="h-4 w-4" />
                  {t.watchDemo}
                </Button>
              </a>
            </div>
          </div>

          <DashboardMockup />
        </section>

        <section className="border-y border-slate-200 bg-white py-20" id="how-it-works">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">{t.howItWorksEyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {t.howItWorksTitle}
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {t.steps.map((step, index) => {
                const Icon = stepIcons[index] ?? QrCode;
                return (
                  <article
                    className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-md"
                    key={step.number}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-500">{step.number}</span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-amber-400">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20" id="features">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">{t.featuresEyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {t.featuresTitle}
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {t.features.map((feature, index) => {
                const Icon = featureIcons[index] ?? Sparkles;
                return (
                  <article
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md"
                    key={feature.title}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-amber-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-20" id="pricing">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">{t.pricingEyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {t.pricingTitle}
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-slate-200 bg-slate-50/50 p-8 shadow-sm transition-all duration-200 ease-in-out hover:shadow-md">
                <p className="text-sm font-medium text-slate-500">{t.freeTier.name}</p>
                <p className="mt-3 text-4xl font-semibold text-slate-900">{t.freeTier.price}</p>
                <p className="mt-1 text-sm text-slate-500">{t.freeTier.subtitle}</p>
                <ul className="mt-8 space-y-3">
                  {t.freeTier.features.map((item) => (
                    <li className="flex items-start gap-3 text-sm text-slate-600" key={item}>
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link className="mt-8 block" href="/register">
                  <Button className="w-full" type="button" variant="secondary">
                    {t.freeTier.cta}
                  </Button>
                </Link>
              </article>

              <article className="relative rounded-3xl border border-slate-950 bg-slate-950 p-8 text-white shadow-xl transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute right-6 top-6 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-slate-950">
                  {t.proTier.badge}
                </div>
                <p className="text-sm font-medium text-slate-300">{t.proTier.name}</p>
                <p className="mt-3 text-4xl font-semibold">{t.proTier.price}</p>
                <p className="mt-1 text-sm text-slate-300">{t.proTier.subtitle}</p>
                <ul className="mt-8 space-y-3">
                  {t.proTier.features.map((item) => (
                    <li className="flex items-start gap-3 text-sm text-slate-200" key={item}>
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link className="mt-8 block" href="/register">
                  <Button className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400" type="button">
                    {t.proTier.cta}
                  </Button>
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950">
              <Star className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">{t.ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              {t.ctaSubtitle}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" type="button">
                  {dict.common.getStartedFree}
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" type="button" variant="ghost">
                  {dict.common.signIn}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {t.brand}. {t.footerRights}
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link className="transition-colors duration-200 ease-in-out hover:text-slate-800" href="/restaurants">
              {t.navDirectory}
            </Link>
            <a className="transition-colors duration-200 ease-in-out hover:text-slate-800" href="#">
              {dict.common.terms}
            </a>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>{t.footerBuiltFor}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
