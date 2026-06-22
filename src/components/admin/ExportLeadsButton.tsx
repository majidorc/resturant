"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type ExportLeadsButtonProps = {
  label: string;
  restaurantId?: string;
};

export function ExportLeadsButton({ label, restaurantId }: ExportLeadsButtonProps) {
  const params = new URLSearchParams();
  if (restaurantId) {
    params.set("restaurantId", restaurantId);
  }

  const href = `/api/admin/export-leads${params.size > 0 ? `?${params.toString()}` : ""}`;

  return (
    <a download href={href}>
      <Button size="sm" type="button" variant="primary">
        <Download className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </a>
  );
}
