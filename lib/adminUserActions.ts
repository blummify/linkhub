import type { PrismaClient } from "@prisma/client";
import type { Plan } from "@/app/admin-portal/services/types";
import type { AdminActor } from "./adminApiGuard";
import { invalidatePublicProfileCache } from "./publicProfile";
import { issuePasswordReset } from "./passwordReset";
import { SUPER_ADMIN } from "./roles";

/**
 * Staff mutations against user accounts. Every action writes an AdminAuditLog
 * entry in the same transaction as its mutation, so "this action is logged" is
 * guaranteed, and every action refuses SUPER_ADMIN targets — staff accounts
 * are managed elsewhere. Takes a Prisma-shaped client so tests can inject a stub.
 */

export type AdminActionClient = Pick<
  PrismaClient,
  "user" | "subscription" | "passwordResetToken" | "adminAuditLog" | "$transaction"
>;

export type ActionOutcome =
  | { ok: true }
  | { ok: false; status: 400 | 403 | 404; error: string };

const NOT_FOUND: ActionOutcome = { ok: false, status: 404, error: "User not found" };
const STAFF_PROTECTED: ActionOutcome = {
  ok: false,
  status: 403,
  error: "Staff accounts cannot be managed here",
};

interface Target {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  suspendedAt: Date | null;
  profile: { handle: string | null } | null;
}

function loadTarget(client: AdminActionClient, userId: string): Promise<Target | null> {
  return client.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      suspendedAt: true,
      profile: { select: { handle: true } },
    },
  });
}

/** Builds the (lazy) audit insert so it can join the mutation's transaction. */
function auditEntry(
  client: AdminActionClient,
  actor: AdminActor,
  action: string,
  target: Target,
  metadata?: Record<string, string>
) {
  return client.adminAuditLog.create({
    data: {
      actorId: actor.id,
      actorEmail: actor.email,
      action,
      targetUserId: target.id,
      targetEmail: target.email,
      ...(metadata ? { metadata } : {}),
    },
  });
}

export async function suspendAdminUser(
  client: AdminActionClient,
  actor: AdminActor,
  userId: string
): Promise<ActionOutcome> {
  const target = await loadTarget(client, userId);
  if (!target) return NOT_FOUND;
  if (target.role === SUPER_ADMIN) return STAFF_PROTECTED;

  await client.$transaction([
    // Guarded update keeps the original suspension time on repeat calls.
    client.user.updateMany({
      where: { id: userId, suspendedAt: null },
      data: { suspendedAt: new Date() },
    }),
    auditEntry(client, actor, "user.suspend", target),
  ]);
  // Their public page must go offline immediately, not after the cache TTL.
  await invalidatePublicProfileCache(target.profile?.handle);
  return { ok: true };
}

export async function unsuspendAdminUser(
  client: AdminActionClient,
  actor: AdminActor,
  userId: string
): Promise<ActionOutcome> {
  const target = await loadTarget(client, userId);
  if (!target) return NOT_FOUND;
  if (target.role === SUPER_ADMIN) return STAFF_PROTECTED;

  await client.$transaction([
    client.user.updateMany({ where: { id: userId }, data: { suspendedAt: null } }),
    auditEntry(client, actor, "user.unsuspend", target),
  ]);
  await invalidatePublicProfileCache(target.profile?.handle);
  return { ok: true };
}

export async function deleteAdminUser(
  client: AdminActionClient,
  actor: AdminActor,
  userId: string
): Promise<ActionOutcome> {
  const target = await loadTarget(client, userId);
  if (!target) return NOT_FOUND;
  if (target.role === SUPER_ADMIN) return STAFF_PROTECTED;

  await client.$transaction([
    // The audit row has no FK to User, so it survives the cascade delete.
    auditEntry(client, actor, "user.delete", target, { name: target.name ?? "" }),
    client.user.delete({ where: { id: userId } }),
  ]);
  await invalidatePublicProfileCache(target.profile?.handle);
  return { ok: true };
}

export async function changeAdminUserPlan(
  client: AdminActionClient,
  actor: AdminActor,
  userId: string,
  plan: Plan
): Promise<ActionOutcome> {
  const target = await loadTarget(client, userId);
  if (!target) return NOT_FOUND;
  if (target.role === SUPER_ADMIN) return STAFF_PROTECTED;

  await client.$transaction([
    client.subscription.upsert({
      where: { userId },
      create: { userId, planId: plan },
      update: { planId: plan },
    }),
    auditEntry(client, actor, "user.changePlan", target, { plan }),
  ]);
  return { ok: true };
}

export async function sendAdminPasswordReset(
  client: AdminActionClient,
  actor: AdminActor,
  userId: string
): Promise<ActionOutcome> {
  const target = await loadTarget(client, userId);
  if (!target) return NOT_FOUND;
  if (target.role === SUPER_ADMIN) return STAFF_PROTECTED;
  if (!target.email) {
    return { ok: false, status: 400, error: "User has no email address" };
  }

  await issuePasswordReset(client, { id: target.id, email: target.email, name: target.name });
  await auditEntry(client, actor, "user.sendReset", target);
  return { ok: true };
}
