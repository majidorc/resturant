"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type RestaurantMenuActionsProps = {
  slug: string;
  publicMenuUrl: string;
};

export function RestaurantMenuActions({ slug, publicMenuUrl }: RestaurantMenuActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyMenuLink() {
    await navigator.clipboard.writeText(publicMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        className={copied ? "bg-emerald-600 hover:bg-emerald-600" : ""}
        onClick={copyMenuLink}
        size="sm"
        type="button"
        variant="secondary"
      >
        {copied ? "Copied!" : "Copy Link"}
      </Button>
      <Link href={`/menu/${slug}`} rel="noopener noreferrer" target="_blank">
        <Button size="sm" variant="primary">
          Open Menu
        </Button>
      </Link>
    </div>
  );
}
