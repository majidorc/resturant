import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6">
      <div className="w-full max-w-md animate-fade-in-up rounded-3xl border border-slate-100/80 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-500">
          You do not have permission to view this page. Super admin access is required.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/dashboard">
            <Button className="w-full" type="button">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/login">
            <Button className="w-full" type="button" variant="secondary">
              Sign in with another account
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
