import { ReactNode } from "react";
import { clsx } from "clsx";

export function Badge({
  children,
  variant = "neutral"
}: {
  children: ReactNode;
  variant?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        variant === "neutral" && "bg-white/[0.04] text-slate-300 ring-white/10",
        variant === "success" && "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
        variant === "warning" && "bg-amber-500/10 text-amber-300 ring-amber-400/20",
        variant === "danger" && "bg-rose-500/10 text-rose-300 ring-rose-400/20",
        variant === "info" && "bg-sky-500/10 text-sky-300 ring-sky-400/20"
      )}
    >
      {children}
    </span>
  );
}
