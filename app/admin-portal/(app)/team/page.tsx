import { auth } from "@/auth";
import { SUPER_ADMIN } from "@/lib/roles";
import { TeamClient } from "./TeamClient";

export const metadata = {
  title: "Team & roles",
};

export default async function TeamPage() {
  const session = await auth();
  const isSuperAdmin = session?.user?.role === SUPER_ADMIN;

  return <TeamClient isSuperAdmin={isSuperAdmin} />;
}
