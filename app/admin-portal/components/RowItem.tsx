import type { ReactNode } from "react";

export interface RowItemProps {
  /** Leading slot, typically an Avatar. */
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Trailing slot, typically a badge or timestamp. */
  trailing?: ReactNode;
}

/** A single divided list row, shared by the overview feeds and the drawer. */
export function RowItem({ leading, title, subtitle, trailing }: RowItemProps) {
  return (
    <div className="flex items-center gap-3 border-b border-ink-100 py-2.5 last:border-b-0">
      {leading}
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-medium text-ink-900">{title}</div>
        {subtitle && <div className="text-xs text-ink-400">{subtitle}</div>}
      </div>
      {trailing}
    </div>
  );
}
