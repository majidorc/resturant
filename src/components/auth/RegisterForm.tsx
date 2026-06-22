"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerTenant, type RegisterState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: RegisterState = {};

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
        <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="name">
          Your name
        </label>
        <Input disabled={pending} id="name" name="name" placeholder="John Doe" required />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="email">
          Email
        </label>
        <Input
          autoComplete="email"
          disabled={pending}
          id="email"
          name="email"
          placeholder="owner@greenbistro.com"
          required
          type="email"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="password">
          Password
        </label>
        <Input
          autoComplete="new-password"
          disabled={pending}
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-medium text-zinc-700"
          htmlFor="restaurantName"
        >
          Restaurant name
        </label>
        <Input
          disabled={pending}
          id="restaurantName"
          name="restaurantName"
          placeholder="Green Bistro Coffee"
          required
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link className="font-medium text-zinc-900 underline" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
