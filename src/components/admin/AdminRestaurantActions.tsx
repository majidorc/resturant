"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteRestaurant, setRestaurantActive } from "@/lib/actions/admin";

type AdminRestaurantActionsProps = {
  restaurantId: string;
  isActive: boolean;
  slug: string;
  publicMenuUrl: string;
  labels: {
    deactivate: string;
    activate: string;
    delete: string;
    confirmDelete: string;
    openMenu: string;
    active: string;
    inactive: string;
  };
};

export function AdminRestaurantActions({
  restaurantId,
  isActive,
  slug,
  publicMenuUrl,
  labels,
}: AdminRestaurantActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggleActive() {
    setError(null);
    startTransition(async () => {
      const result = await setRestaurantActive(restaurantId, !isActive);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(labels.confirmDelete)) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteRestaurant(restaurantId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button disabled={pending} onClick={toggleActive} size="sm" type="button" variant="secondary">
          {isActive ? labels.deactivate : labels.activate}
        </Button>
        <Button disabled={pending} onClick={handleDelete} size="sm" type="button" variant="secondary">
          {labels.delete}
        </Button>
        {isActive ? (
          <Link href={`/menu/${slug}`} rel="noopener noreferrer" target="_blank">
            <Button size="sm" type="button" variant="primary">
              {labels.openMenu}
            </Button>
          </Link>
        ) : null}
      </div>
      <p className="text-xs text-slate-500">
        {isActive ? labels.active : labels.inactive} · {publicMenuUrl}
      </p>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
