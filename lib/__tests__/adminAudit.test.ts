import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { adminAuditQuerySchema, listAdminAuditLog } from "../adminAudit";

const count = vi.fn();
const findMany = vi.fn();
const client = { adminAuditLog: { count, findMany } } as unknown as Pick<
  PrismaClient,
  "adminAuditLog"
>;

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: "aud_1",
    actorId: "adm_1",
    actorEmail: "staff@linkhub.app",
    action: "user.suspend",
    targetUserId: "usr_1",
    targetEmail: "joel@x.com",
    metadata: null,
    createdAt: new Date("2026-07-08T09:00:00Z"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  count.mockResolvedValue(1);
  findMany.mockResolvedValue([row()]);
});

describe("adminAuditQuerySchema", () => {
  it("defaults and coerces paging params", () => {
    expect(adminAuditQuerySchema.parse({})).toEqual({ page: 1, pageSize: 15 });
    expect(adminAuditQuerySchema.parse({ page: "3", pageSize: "50" })).toEqual({
      page: 3,
      pageSize: 50,
    });
  });

  it("rejects out-of-range paging", () => {
    expect(adminAuditQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(adminAuditQuerySchema.safeParse({ pageSize: "101" }).success).toBe(false);
  });
});

describe("listAdminAuditLog", () => {
  it("returns mapped entries newest first", async () => {
    const page = await listAdminAuditLog(client, adminAuditQuerySchema.parse({}));
    expect(findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      skip: 0,
      take: 15,
    });
    expect(page).toEqual({
      entries: [
        {
          id: "aud_1",
          action: "user.suspend",
          actorEmail: "staff@linkhub.app",
          targetUserId: "usr_1",
          targetEmail: "joel@x.com",
          metadata: null,
          at: "2026-07-08T09:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 15,
    });
  });

  it("passes metadata through", async () => {
    findMany.mockResolvedValue([row({ metadata: { plan: "pro" } })]);
    const page = await listAdminAuditLog(client, adminAuditQuerySchema.parse({}));
    expect(page.entries[0].metadata).toEqual({ plan: "pro" });
  });

  it("clamps an overflowing page to the last page", async () => {
    count.mockResolvedValue(31);
    findMany.mockResolvedValue([]);
    const page = await listAdminAuditLog(
      client,
      adminAuditQuerySchema.parse({ page: "99", pageSize: "15" })
    );
    expect(page.page).toBe(3);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 30, take: 15 }));
  });
});
