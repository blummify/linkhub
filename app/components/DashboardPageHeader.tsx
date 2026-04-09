"use client";

import type { ReactNode } from "react";

export interface DashboardPageHeaderProps {
  title: string;
  description: string;
  /** Primary actions (e.g. Save, Add link) — aligned with user-admin / Manage Links */
  actions?: ReactNode;
}

export function DashboardPageHeader({ title, description, actions }: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-black text-on-surface tracking-tight">{title}</h1>
        <p className="text-[13px] text-on-surface-variant font-medium mt-1">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">{actions}</div> : null}
    </div>
  );
}
