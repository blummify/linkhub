import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import type { AuditPage } from "@/app/admin-portal/services/types";

/**
 * Paginated, newest-first view of the AdminAuditLog for the admin portal's
 * Audit page. Takes any Prisma-shaped client so tests can inject a stub.
 */

export const adminAuditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(15),
});

export type AdminAuditQuery = z.infer<typeof adminAuditQuerySchema>;

export async function listAdminAuditLog(
  client: Pick<PrismaClient, "adminAuditLog">,
  query: AdminAuditQuery
): Promise<AuditPage> {
  const total = await client.adminAuditLog.count();

  // Clamp overflowing page requests to the last page instead of returning nothing.
  const lastPage = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, lastPage);

  const rows = await client.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * query.pageSize,
    take: query.pageSize,
  });

  return {
    entries: rows.map((row) => ({
      id: row.id,
      action: row.action,
      actorEmail: row.actorEmail,
      targetUserId: row.targetUserId,
      targetEmail: row.targetEmail,
      metadata: (row.metadata as Record<string, string> | null) ?? null,
      at: row.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize: query.pageSize,
  };
}
