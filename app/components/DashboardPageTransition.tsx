"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";

/** Quick fade/slide on dashboard main content when the route changes. */
export function DashboardPageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();

  return (
    <div
      key={pathname}
      className="min-h-0"
      style={
        reduced
          ? undefined
          : { animation: "lhPageIn var(--motion-fast) var(--ease-standard) both" }
      }
    >
      {children}
    </div>
  );
}
