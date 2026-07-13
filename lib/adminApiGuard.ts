import { auth } from "@/auth";
import { SUPER_ADMIN } from "./roles";

/**
 * Session guard shared by the /api/admin/* route handlers. API routes bypass
 * the proxy matcher, so this check is each endpoint's own guard.
 *
 * TODO: restore before production — mirrors the proxy.ts UI-dev auth bypass so
 * the admin portal works without a session locally. Production always guards.
 */

export interface AdminActor {
  id: string | null;
  email: string | null;
}

export type AdminGuardResult =
  | { ok: true; actor: AdminActor }
  | { ok: false; status: 401 | 403; error: string };

export async function requireAdminActor(): Promise<AdminGuardResult> {
  if (process.env.NODE_ENV !== "production") {
    return { ok: true, actor: { id: null, email: null } };
  }

  const session = await auth();
  if (!session?.user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  if (session.user.role !== SUPER_ADMIN) {
    return { ok: false, status: 403, error: "Forbidden" };
  }
  return {
    ok: true,
    actor: { id: session.user.id ?? null, email: session.user.email ?? null },
  };
}
