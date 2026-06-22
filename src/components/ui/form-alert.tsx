import { cn } from "@/lib/utils";

type FormAlertProps = {
  message?: string | null;
  variant?: "error" | "success";
};

export function FormAlert({ message, variant = "error" }: FormAlertProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "min-h-10 overflow-hidden transition-all duration-200",
        message ? "opacity-100" : "opacity-0",
      )}
    >
      {message && (
        <p
          className={cn(
            "rounded-xl px-3 py-2 text-sm transition-all duration-200",
            variant === "error"
              ? "bg-red-50 text-red-700 ring-1 ring-red-100"
              : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
