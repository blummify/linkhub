import type { ReactNode } from "react";
import { auth } from "@/auth";
import { AdminShell } from "../shell/AdminShell";

/**
 * Shell for the authenticated admin views. Access is already enforced by the
 * middleware (admin subdomain + SUPER_ADMIN), so this layout only resolves the
 * current user for display.
 */
export default async function AdminAppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = {
    name: session?.user?.name ?? "Admin",
    email: session?.user?.email ?? "",
    role: session?.user?.role ?? "SUPER_ADMIN",
  };

  return <AdminShell user={user}>{children}</AdminShell>;
}
