import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  accent?: "default" | "admin";
  trend?: string;
};

export function MetricCard({
  label,
  value,
  hint,
  icon,
  accent = "default",
  trend,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[140px] flex-col rounded-2xl border border-slate-100/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-200 hover:shadow-md",
        accent === "admin" && "border-indigo-100/80 bg-gradient-to-br from-white to-indigo-50/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600",
              accent === "admin" && "bg-indigo-100 text-indigo-600",
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {(hint || trend) && (
        <p className="mt-auto pt-3 text-xs text-slate-500">
          {trend && <span className="font-medium text-emerald-600">{trend} </span>}
          {hint}
        </p>
      )}
    </div>
  );
}
