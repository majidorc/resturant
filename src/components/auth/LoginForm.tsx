"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

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
        setError("Invalid email or password.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="email">
          Email
        </label>
        <Input
          autoComplete="email"
          disabled={loading}
          id="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700" htmlFor="password">
          Password
        </label>
        <Input
          autoComplete="current-password"
          disabled={loading}
          id="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button className="w-full" disabled={loading} type="submit">
        {loading ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-zinc-600">
        No account?{" "}
        <Link className="font-medium text-zinc-900 underline" href="/register">
          Register your restaurant
        </Link>
      </p>
    </form>
  );
}
