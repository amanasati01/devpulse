import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { asChild, className, variant = "primary", ...props },
  ref
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-gradient-to-r from-indigo-500 to-sky-400 text-white shadow-[0_12px_30px_rgba(79,70,229,0.35)] hover:scale-[1.01] hover:shadow-[0_16px_40px_rgba(56,189,248,0.24)]",
        variant === "secondary" &&
          "glass-panel text-slate-100 hover:bg-white/[0.08]",
        variant === "ghost" &&
          "bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white",
        className
      )}
      {...props}
    />
  );
});
