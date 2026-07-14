import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/adminApiGuard";
import { adminUsersQuerySchema, listAdminUsers } from "@/lib/adminUsers";
import { db } from "@/lib/db";

/**
 * GET /api/admin/users — paginated platform users for the admin portal.
 * Search, filter, sort, and pagination all run server-side (see lib/adminUsers).
 */
export async function GET(req: Request) {
  const guard = await requireAdminActor();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const parsed = adminUsersQuerySchema.safeParse(
    Object.fromEntries(new URL(req.url).searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const page = await listAdminUsers(db, parsed.data);
  return NextResponse.json(page);
}
