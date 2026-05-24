"use client";

import type { ReactNode } from "react";

/**
 * Frames the mobile preview on `/links` so the device reads as a clear editor card
 * (max width, elevation, subtle border) inside the wide column.
 */
export function LinksPreviewPanel({ children }: { children: ReactNode }) {
  return (
    <div className="w-full flex flex-col items-center">
      {children}
    </div>
  );
}
