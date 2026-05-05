"use client";

import type { ReactNode } from "react";

/**
 * Frames the mobile preview on `/links` so the device reads as a clear editor card
 * (max width, elevation, subtle border) inside the wide column.
 */
export function LinksPreviewPanel({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[360px] mx-auto rounded-[3rem] border border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-xl p-4 sm:p-5 lg:p-6 shadow-2xl shadow-on-surface/5 ring-1 ring-white/20">
      {children}
    </div>
  );
}
