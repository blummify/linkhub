import { auth } from "@/auth";
import { SUPER_ADMIN } from "@/lib/roles";
import { TeamClient } from "./TeamClient";

export const metadata = {
  title: "Team & roles",
};

export default async function TeamPage() {
  const session = await auth();
  // Mirror the same dev-convenience fallback used in (app)/layout.tsx: treat the user as a SUPER_ADMIN so the Team page can be used.
  const role = session?.user?.role ?? SUPER_ADMIN;
  const isSuperAdmin = role === SUPER_ADMIN;

  return <TeamClient isSuperAdmin={isSuperAdmin} />;
}
