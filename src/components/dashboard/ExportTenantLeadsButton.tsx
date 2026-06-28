"use client";

type ExportTenantLeadsButtonProps = {
  label: string;
};

export function ExportTenantLeadsButton({ label }: ExportTenantLeadsButtonProps) {
  return (
    <a
      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
      href="/api/export-leads"
    >
      {label}
    </a>
  );
}
