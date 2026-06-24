"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDictionary } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";

function FieldIcon({ path }: { path: string }) {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  );
}

export function LoginForm() {
  const dict = useDictionary();
  const t = dict.auth;
  const c = dict.common;
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ||
    (searchParams.get("pwa") === "1" ? "/dashboard/waiters" : "/dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t.invalidCredentials);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError(t.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="email">
          {c.email}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <FieldIcon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </span>
          <Input
            autoComplete="email"
            className="pl-10"
            disabled={loading}
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="owner@venue.com"
            required
            type="email"
            value={email}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="password">
          {c.password}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <FieldIcon path="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </span>
          <Input
            autoComplete="current-password"
            className="pl-10"
            disabled={loading}
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </div>
      </div>

      <FormAlert message={error} />

      <Button className="w-full" disabled={loading} size="lg" type="submit">
        {loading ? t.signingIn : c.signIn}
      </Button>

      <p className="text-center text-sm text-slate-500">
        {t.noAccount}{" "}
        <Link className="font-medium text-slate-900 transition-colors duration-200 hover:text-slate-600" href="/register">
          {t.registerLink}
        </Link>
      </p>
    </form>
  );
}
