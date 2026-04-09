"use client";

import type { ReactNode } from "react";

/**
 * Frames the mobile preview on `/links` so the device reads as a clear editor card
 * (max width, elevation, subtle border) inside the wide column.
 */
export function LinksPreviewPanel({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[380px] mx-auto rounded-[2rem] border border-outline-variant/50 bg-gradient-to-b from-surface-container-highest/90 to-surface-container-low/70 p-5 sm:p-6 lg:p-7 shadow-[0_24px_60px_-16px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_60px_-16px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
      {children}
    </div>
  );
}
