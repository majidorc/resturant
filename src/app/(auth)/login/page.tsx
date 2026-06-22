import { Suspense } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LoginForm } from "@/components/auth/LoginForm";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";

export default async function LoginPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.auth;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6">
      <div className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.05),transparent_45%)]" />
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm0 2c-3.314 0-6 1.79-6 4v1h12v-1c0-2.21-2.686-4-6-4z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{t.loginTitle}</h1>
            <p className="mt-1 text-sm text-slate-500">{t.loginSubtitle}</p>
          </div>
          <Suspense fallback={<p className="text-sm text-slate-500">{dict.common.loading}</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
