import type { Metadata } from "next";
import type { ReactNode } from "react";

// The admin portal must never be indexed or discoverable from the public app.
export const metadata: Metadata = {
  title: "Super Admin",
  robots: { index: false, follow: false },
};

export default function AdminPortalLayout({ children }: { children: ReactNode }) {
  return children;
}
