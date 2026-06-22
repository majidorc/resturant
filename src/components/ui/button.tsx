import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-400",
    secondary: "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 disabled:opacity-50",
    ghost: "text-zinc-700 hover:bg-zinc-100 disabled:opacity-50",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
