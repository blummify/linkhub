"use client";

import type { ReactNode } from "react";

export interface LinksStyleTwoColumnLayoutProps {
  left: ReactNode;
  preview: ReactNode;
  /** Extra classes on the outer grid (e.g. collapsed-sidebar padding) */
  className?: string;
  /** Extra classes on the preview column wrapper (e.g. more padding on `/links`) */
  previewColumnClassName?: string;
}

/**
 * Same grid + preview column as `/links`: max-w 1400px, 7+5 columns, sticky preview at top-16.
 * Use for Appearance (preferences) and Links so the phone preview lines up.
 */
export function LinksStyleTwoColumnLayout({
  left,
  preview,
  className = "",
  previewColumnClassName = "",
}: LinksStyleTwoColumnLayoutProps) {
  return (
    <div
      className={`max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 lg:items-start ${className}`}
    >
      <div className="col-span-12 lg:col-span-7 space-y-8 min-w-0">{left}</div>

      <div
        className={`col-span-12 lg:col-span-5 w-full min-w-0 flex flex-col items-center lg:items-stretch lg:sticky lg:top-8 lg:self-start ${previewColumnClassName}`}
      >
        {preview}
      </div>
    </div>
  );
}
