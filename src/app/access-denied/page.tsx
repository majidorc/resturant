import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Access Denied</h1>
          <p className="mt-2 text-sm text-zinc-600">
            You do not have permission to view this page. Super admin access is required.
          </p>
        </div>
        <div className="flex flex-col gap-3">
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
