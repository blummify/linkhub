import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps {
  /** Optional heading shown in the card header row. */
  title?: ReactNode;
  /** Optional trailing slot in the header (link, legend, menu). */
  action?: ReactNode;
  className?: string;
  /** Inner padding; disable for cards that manage their own (e.g. tables). */
  padded?: boolean;
  children: ReactNode;
}

export function Card({ title, action, className, padded = true, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[16px] border border-ink-100 bg-white",
        padded && "p-5",
        className
      )}
    >
      {(title || action) && (
        <div className="mb-3.5 flex items-center justify-between">
          {title && <span className="text-[15px] font-semibold text-ink-900">{title}</span>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
