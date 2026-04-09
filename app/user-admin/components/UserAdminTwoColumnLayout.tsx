"use client";

import type { ReactNode } from "react";

export interface UserAdminTwoColumnLayoutProps {
  left: ReactNode;
  preview: ReactNode;
  className?: string;
}

/**
 * 12-column grid: main (7) + vertical rule (1) + sticky preview (4) on large screens.
 */
export function UserAdminTwoColumnLayout({ left, preview, className = "" }: UserAdminTwoColumnLayoutProps) {
  return (
    <div
      className={`max-w-[1280px] mx-auto p-6 md:p-10 grid grid-cols-12 gap-12 lg:gap-16 transition-all duration-500 relative ${className}`}
    >
      <div className="col-span-12 lg:col-span-7 space-y-10 animate-fade-in-up">{left}</div>

      <div className="hidden lg:col-span-1 border-r border-outline-variant/60 h-auto self-stretch mx-auto my-4 opacity-40" aria-hidden />

      <section className="hidden lg:col-span-4 lg:flex flex-col items-center sticky top-40 h-[calc(100vh-12rem)] animate-fade-in overflow-y-auto pb-8">
        {preview}
      </section>
    </div>
  );
}
