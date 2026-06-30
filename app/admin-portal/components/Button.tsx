import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "default" | "primary" | "danger" | "amber" | "ghost";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  default: "border border-ink-100 bg-white text-ink-700 hover:bg-paper",
  primary: "border border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600",
  danger: "border border-rose-500/30 bg-danger-50 text-rose-500 hover:bg-danger-50/70",
  amber: "border border-amber-500/30 bg-amber-50 text-amber-500 hover:bg-amber-50/70",
  ghost: "text-ink-500 hover:text-ink-700",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "default", className, type = "button", children, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-[12px] px-3.5 py-2.5 text-[13.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none",
        VARIANT_CLASSES[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
