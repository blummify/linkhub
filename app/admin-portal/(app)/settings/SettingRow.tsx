import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SettingRowProps {
  title: ReactNode;
  description: ReactNode;
  /** Trailing control (toggle, button). */
  control: ReactNode;
  className?: string;
}

/** Label + description on the left, a control on the right, divided by a hairline. */
export function SettingRow({ title, description, control, className }: SettingRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 border-b border-ink-100 py-3.5 last:border-b-0",
        className
      )}
    >
      <div className="flex-1">
        <div className="text-sm font-medium text-ink-900">{title}</div>
        <div className="mt-0.5 text-[12.5px] text-ink-400">{description}</div>
      </div>
      {control}
    </div>
  );
}
