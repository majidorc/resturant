import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-600">Access your restaurant dashboard.</p>
        </div>
        <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
