"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProFeatureLockProps = {
  title: string;
  description: string;
  upgradeCta: string;
};

export function ProFeatureLock({ title, description, upgradeCta }: ProFeatureLockProps) {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Lock className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-zinc-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
      <Link className="mt-6 inline-block" href="/dashboard/settings#billing">
        <Button type="button">{upgradeCta}</Button>
      </Link>
    </div>
  );
}
