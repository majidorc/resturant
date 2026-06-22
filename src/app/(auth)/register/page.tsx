import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Create account</h1>
          <p className="mt-1 text-sm text-zinc-600">Set up your digital menu and Wi-Fi gate.</p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
