import type { ReactNode } from "react";

export interface AdminPageHeaderProps {
  crumb: string;
  title: string;
  /** Optional highlighted tail of the title, rendered in the accent colour. */
  accent?: string;
  subtitle?: string;
  /** Optional trailing controls (range picker, export button). */
  action?: ReactNode;
}

export function AdminPageHeader({ crumb, title, accent, subtitle, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-1.5 text-[12.5px] text-ink-400">{crumb}</div>
        <h1 className="font-[family-name:var(--font-instrument-serif)] text-[40px] italic leading-none tracking-[-0.02em] text-ink-900 max-[860px]:text-[32px]">
          {title}
          {accent && <span className="text-indigo-500">{accent}</span>}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-ink-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
