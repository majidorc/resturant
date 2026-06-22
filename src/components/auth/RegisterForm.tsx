"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerTenant, type RegisterState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";

const initialState: RegisterState = {};

function FieldIcon({ path }: { path: string }) {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerTenant, initialState);

  useEffect(() => {
    if (!state.success) return;

    async function autoSignIn() {
      const form = document.getElementById("register-form") as HTMLFormElement | null;
      const email = (form?.elements.namedItem("email") as HTMLInputElement)?.value;
      const password = (form?.elements.namedItem("password") as HTMLInputElement)?.value;

      if (email && password) {
        await signIn("credentials", { email, password, redirect: false });
      }

      router.push("/dashboard");
      router.refresh();
    }

    void autoSignIn();
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-4" id="register-form">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="name">
          Your name
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <FieldIcon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </span>
          <Input className="pl-10" disabled={pending} id="name" name="name" placeholder="John Doe" required />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <FieldIcon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </span>
          <Input
            autoComplete="email"
            className="pl-10"
            disabled={pending}
            id="email"
            name="email"
            placeholder="owner@greenbistro.com"
            required
            type="email"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <FieldIcon path="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </span>
          <Input
            autoComplete="new-password"
            className="pl-10"
            disabled={pending}
            id="password"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="restaurantName">
          Restaurant name
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <FieldIcon path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </span>
          <Input
            className="pl-10"
            disabled={pending}
            id="restaurantName"
            name="restaurantName"
            placeholder="Green Bistro Coffee"
            required
          />
        </div>
      </div>

      <FormAlert message={state.error} />
      <FormAlert message={state.success ? "Account created. Signing you in…" : null} variant="success" />

      <Button className="w-full" disabled={pending} size="lg" type="submit">
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link className="font-medium text-slate-900 transition-colors duration-200 hover:text-slate-600" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
