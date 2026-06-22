import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "admin" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] disabled:bg-slate-300",
    secondary:
      "border border-slate-200/80 bg-white text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50",
    ghost: "text-slate-600 hover:bg-slate-100 active:scale-[0.98] disabled:opacity-50",
    admin:
      "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:scale-[0.98] disabled:bg-indigo-300",
    danger:
      "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 active:scale-[0.98] disabled:opacity-50",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
