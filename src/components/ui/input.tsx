import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none ring-zinc-900 placeholder:text-zinc-400 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
