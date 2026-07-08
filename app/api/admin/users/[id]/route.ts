import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminActor } from "@/lib/adminApiGuard";
import { getAdminUserDetail } from "@/lib/adminUserDetail";
import {
  changeAdminUserPlan,
  deleteAdminUser,
  sendAdminPasswordReset,
  suspendAdminUser,
  unsuspendAdminUser,
  type ActionOutcome,
} from "@/lib/adminUserActions";
import { db } from "@/lib/db";

/**
 * /api/admin/users/:id
 *   GET    — full user detail for the admin drawer.
 *   PATCH  — suspend / unsuspend / changePlan / sendReset (audited).
 *   DELETE — permanently remove the account (audited).
 */

type RouteContext = { params: Promise<{ id: string }> };

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("suspend") }),
  z.object({ action: z.literal("unsuspend") }),
  z.object({ action: z.literal("changePlan"), plan: z.enum(["free", "pro", "business"]) }),
  z.object({ action: z.literal("sendReset") }),
]);

function outcomeResponse(outcome: ActionOutcome) {
  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: outcome.status });
  }
  return NextResponse.json({ ok: true });
}

export async function GET(_req: Request, ctx: RouteContext) {
  const guard = await requireAdminActor();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await ctx.params;
  const detail = await getAdminUserDetail(db, id);
  if (!detail) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}

export async function PATCH(req: Request, ctx: RouteContext) {
  const guard = await requireAdminActor();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { id } = await ctx.params;
  const input = parsed.data;
  const outcome =
    input.action === "suspend"
      ? await suspendAdminUser(db, guard.actor, id)
      : input.action === "unsuspend"
        ? await unsuspendAdminUser(db, guard.actor, id)
        : input.action === "changePlan"
          ? await changeAdminUserPlan(db, guard.actor, id, input.plan)
          : await sendAdminPasswordReset(db, guard.actor, id);

  return outcomeResponse(outcome);
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  const guard = await requireAdminActor();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await ctx.params;
  return outcomeResponse(await deleteAdminUser(db, guard.actor, id));
}
