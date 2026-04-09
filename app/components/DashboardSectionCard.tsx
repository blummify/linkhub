"use client";

import type { ReactNode } from "react";

export interface DashboardSectionCardProps {
  children: ReactNode;
  className?: string;
}

/** Bordered surface card matching user-admin link rows and design panels */
export function DashboardSectionCard({ children, className = "" }: DashboardSectionCardProps) {
  return (
    <div
      className={`bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 shadow-sm p-6 sm:p-8 space-y-6 ${className}`}
    >
      {children}
    </div>
  );
}
