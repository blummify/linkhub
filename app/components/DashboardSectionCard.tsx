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
      className={`bg-surface-container-lowest/70 backdrop-blur-sm rounded-[2rem] border border-outline-variant/15 shadow-xl shadow-on-surface/[0.02] p-6 sm:p-8 space-y-6 transition-all duration-300 hover:border-primary/20 hover:shadow-2xl hover:shadow-on-surface/[0.05] ${className}`}
    >
      {children}
    </div>
  );
}
