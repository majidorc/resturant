import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardMockup } from "@/components/landing/DashboardMockup";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Check,
  Mail,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Wifi,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Scan & Unlock",
    description:
      "Customers scan a table QR code or tap an NFC tag. They enter their email or connect via social login to instantly view the menu and copy your guest Wi-Fi password.",
    icon: QrCode,
  },
  {
    number: "02",
    title: "Delight & Serve",
    description:
      "Guests enjoy their meal while your system stores their verified contact information safely in your secure dashboard.",
    icon: Wifi,
  },
  {
    number: "03",
    title: "Smart Automated Follow-Up",
    description:
      "Exactly 24 hours later, our background engine sends a friendly review checkup email. Satisfied guests are redirected to Google Reviews, while unhappy guests are routed to a private feedback form.",
    icon: Mail,
  },
];

const features = [
  {
    title: "Interactive QR Menus",
    description:
      "Super-fast mobile catalogs with horizontal category swiping, rich pricing tags, and real-time availability controls.",
    icon: Sparkles,
  },
  {
    title: "Zero-Hardware Lead Gen",
    description:
      "Capture real guest emails without modifying routers or purchasing expensive captive portal hardware solutions.",
    icon: Wifi,
  },
  {
    title: "Google Rank Protection",
    description:
      "Buffer against public 1-star ratings by catching internal negative complaints privately before they harm your online brand.",
    icon: ShieldCheck,
  },
];

const freeTierFeatures = [
  "1 venue included",
  "Basic QR menu builder",
  "Up to 50 leads per month",
  "Wi-Fi unlock gate",
  "Email support",
];

const proTierFeatures = [
  "Unlimited menus and categories",
  "Automated review routing",
  "Advanced analytics dashboard",
  "Custom lead exporting",
  "Priority support",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <LandingNavbar />

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-5">Built for modern restaurants</Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Transform Your Restaurant Menu Into A Review-Generating Engine
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Give customers instant access to your digital menu and high-speed Wi-Fi in exchange for
              their email. Automatically follow up 24 hours later to skyrocket your positive Google
              Reviews while filtering out the negatives.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button
                  className="w-full min-w-[220px] shadow-md transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
                  size="lg"
                  type="button"
                >
                  Create Your Free Menu
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
                  Watch Demo
                </Button>
              </a>
            </div>
          </div>

          <DashboardMockup />
        </section>

        <section className="border-y border-slate-100/80 bg-white py-20" id="how-it-works">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">How It Works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Three steps from scan to five-star review
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {steps.map((step) => (
                <article
                  className="rounded-3xl border border-slate-100/80 bg-slate-50/60 p-6 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:border-slate-200 hover:bg-white hover:shadow-md"
                  key={step.number}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-400">{step.number}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <step.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20" id="features">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">Features</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need to grow repeat visits and reputation
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {features.map((feature) => (
                <article
                  className="rounded-3xl border border-slate-100/80 bg-white p-6 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md"
                  key={feature.title}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-100/80 bg-white py-20" id="pricing">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">Pricing</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Transparent plans that scale with your venue
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-slate-100/80 bg-slate-50/50 p-8 shadow-sm transition-all duration-200 ease-in-out hover:shadow-md">
                <p className="text-sm font-medium text-slate-500">Free Tier</p>
                <p className="mt-3 text-4xl font-semibold text-slate-900">$0</p>
                <p className="mt-1 text-sm text-slate-500">Perfect for launching your first digital menu.</p>
                <ul className="mt-8 space-y-3">
                  {freeTierFeatures.map((item) => (
                    <li className="flex items-start gap-3 text-sm text-slate-600" key={item}>
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link className="mt-8 block" href="/register">
                  <Button className="w-full" type="button" variant="secondary">
                    Start Free
                  </Button>
                </Link>
              </article>

              <article className="relative rounded-3xl border border-slate-900 bg-slate-900 p-8 text-white shadow-xl transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute right-6 top-6 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                  Most Popular
                </div>
                <p className="text-sm font-medium text-slate-300">Pro Growth Tier</p>
                <p className="mt-3 text-4xl font-semibold">$49</p>
                <p className="mt-1 text-sm text-slate-300">Per venue, billed monthly.</p>
                <ul className="mt-8 space-y-3">
                  {proTierFeatures.map((item) => (
                    <li className="flex items-start gap-3 text-sm text-slate-200" key={item}>
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link className="mt-8 block" href="/register">
                  <Button className="w-full bg-white text-slate-900 hover:bg-slate-100" type="button">
                    Upgrade to Pro
                  </Button>
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-100/80 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Star className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
              Ready to turn every table into a growth channel?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Launch your branded QR menu, capture verified guest emails, and automate review follow-ups
              in minutes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" type="button">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" type="button" variant="ghost">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100/80 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} MenuHub. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a className="transition-colors duration-200 ease-in-out hover:text-slate-800" href="#">
              Privacy
            </a>
            <a className="transition-colors duration-200 ease-in-out hover:text-slate-800" href="#">
              Terms
            </a>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Built for hospitality operators</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
