import { NextResponse } from "next/server";
import { requireAdminActor } from "@/lib/adminApiGuard";
import { adminAuditQuerySchema, listAdminAuditLog } from "@/lib/adminAudit";
import { db } from "@/lib/db";

/** GET /api/admin/audit — paginated staff action log, newest first. */
export async function GET(req: Request) {
  const guard = await requireAdminActor();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const parsed = adminAuditQuerySchema.safeParse(
    Object.fromEntries(new URL(req.url).searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  return NextResponse.json(await listAdminAuditLog(db, parsed.data));
}
