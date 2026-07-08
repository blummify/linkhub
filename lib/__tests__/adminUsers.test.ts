import { describe, expect, it, vi } from "vitest";
import type { Prisma, PrismaClient } from "@prisma/client";
import { ANALYTICS_METRIC } from "@/app/constants/analyticsMetrics";
import {
  adminUsersQuerySchema,
  escapeLike,
  listAdminUsers,
  mapAdminUserRow,
  type AdminUsersQuery,
  type RawAdminUserRow,
} from "../adminUsers";

function rawRow(overrides: Partial<RawAdminUserRow> = {}): RawAdminUserRow {
  return {
    id: "usr_1",
    name: "Joel Osei",
    email: "joel@example.com",
    country: "GH",
    createdAt: new Date("2026-01-12T00:00:00Z"),
    lastActiveAt: new Date("2026-07-01T00:00:00Z"),
    suspendedAt: null,
    emailVerified: new Date("2026-01-12T00:00:00Z"),
    handle: "joel",
    plan: "pro",
    links: 4,
    views30d: 812,
    ...overrides,
  };
}

interface CapturedQuery {
  text: string;
  values: unknown[];
}

/** Stub `$queryRaw` returning the count then the rows, capturing each query. */
function stubClient(total: number, rows: RawAdminUserRow[]) {
  const calls: CapturedQuery[] = [];
  const $queryRaw = vi.fn(async (query: Prisma.Sql) => {
    calls.push({ text: query.text, values: query.values });
    return calls.length === 1 ? [{ total }] : rows;
  });
  return {
    client: { $queryRaw } as unknown as Pick<PrismaClient, "$queryRaw">,
    calls,
  };
}

function parse(input: Record<string, string> = {}): AdminUsersQuery {
  const parsed = adminUsersQuerySchema.safeParse(input);
  if (!parsed.success) throw new Error(`expected valid query: ${parsed.error.message}`);
  return parsed.data;
}

describe("adminUsersQuerySchema", () => {
  it("applies defaults for an empty query", () => {
    expect(parse()).toEqual({
      search: "",
      filter: "all",
      page: 1,
      pageSize: 8,
      sort: "joined",
      dir: "desc",
    });
  });

  it("coerces numeric strings from URL params", () => {
    const query = parse({ page: "3", pageSize: "50" });
    expect(query.page).toBe(3);
    expect(query.pageSize).toBe(50);
  });

  it("rejects unknown filters, sorts, and out-of-range paging", () => {
    expect(adminUsersQuerySchema.safeParse({ filter: "bogus" }).success).toBe(false);
    expect(adminUsersQuerySchema.safeParse({ sort: "email" }).success).toBe(false);
    expect(adminUsersQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(adminUsersQuerySchema.safeParse({ pageSize: "101" }).success).toBe(false);
  });
});

describe("escapeLike", () => {
  it("escapes LIKE wildcards and backslashes", () => {
    expect(escapeLike("100%_a\\b")).toBe("100\\%\\_a\\\\b");
  });
});

describe("mapAdminUserRow", () => {
  it("maps a complete row to the list shape", () => {
    expect(mapAdminUserRow(rawRow())).toEqual({
      id: "usr_1",
      name: "Joel Osei",
      email: "joel@example.com",
      handle: "@joel",
      plan: "pro",
      status: "active",
      links: 4,
      views30d: 812,
      country: "GH",
      joinedAt: "2026-01-12T00:00:00.000Z",
      lastActiveAt: "2026-07-01T00:00:00.000Z",
    });
  });

  it("derives pending status from a missing email verification", () => {
    expect(mapAdminUserRow(rawRow({ emailVerified: null })).status).toBe("pending");
  });

  it("lets suspension outrank a missing verification", () => {
    const row = rawRow({ suspendedAt: new Date(), emailVerified: null });
    expect(mapAdminUserRow(row).status).toBe("suspended");
  });

  it("falls back to placeholders for missing optional fields", () => {
    const user = mapAdminUserRow(
      rawRow({ name: null, email: null, handle: null, country: null, lastActiveAt: null })
    );
    expect(user.name).toBe("—");
    expect(user.email).toBe("—");
    expect(user.handle).toBe("—");
    expect(user.country).toBe("—");
    expect(user.lastActiveAt).toBeNull();
  });

  it("reads unrecognised plan ids as free", () => {
    expect(mapAdminUserRow(rawRow({ plan: "legacy-tier" })).plan).toBe("free");
  });
});

describe("listAdminUsers", () => {
  it("returns the mapped page with the total", async () => {
    const { client } = stubClient(1, [rawRow()]);
    const page = await listAdminUsers(client, parse());
    expect(page).toMatchObject({ total: 1, page: 1, pageSize: 8 });
    expect(page.users[0].handle).toBe("@joel");
  });

  it("clamps an overflowing page to the last page", async () => {
    const { client, calls } = stubClient(10, []);
    const page = await listAdminUsers(client, parse({ page: "999", pageSize: "4" }));
    expect(page.page).toBe(3);
    // LIMIT and OFFSET are the final two parameters of the rows query.
    expect(calls[1].values.slice(-2)).toEqual([4, 8]);
  });

  it("parameterizes the search term, stripping a leading @ and escaping wildcards", async () => {
    const { client, calls } = stubClient(0, []);
    await listAdminUsers(client, parse({ search: "@jo%el" }));
    expect(calls[0].text).toContain("ILIKE");
    expect(calls[0].values[0]).toBe("%jo\\%el%");
  });

  it("filters plan tabs against the subscription plan", async () => {
    const { client, calls } = stubClient(0, []);
    await listAdminUsers(client, parse({ filter: "pro" }));
    expect(calls[0].text).toContain(`COALESCE(s."planId", 'free') =`);
    expect(calls[0].values).toContain("pro");
  });

  it("filters suspended and unverified on user columns", async () => {
    const suspended = stubClient(0, []);
    await listAdminUsers(suspended.client, parse({ filter: "suspended" }));
    expect(suspended.calls[0].text).toContain(`u."suspendedAt" IS NOT NULL`);

    const unverified = stubClient(0, []);
    await listAdminUsers(unverified.client, parse({ filter: "unverified" }));
    expect(unverified.calls[0].text).toContain(`u."emailVerified" IS NULL`);
  });

  it("orders by the whitelisted sort expression", async () => {
    const { client, calls } = stubClient(0, []);
    await listAdminUsers(client, parse({ sort: "views", dir: "asc" }));
    expect(calls[1].text).toContain(`ORDER BY "views30d" ASC NULLS LAST`);
  });

  it("defaults to newest joined first", async () => {
    const { client, calls } = stubClient(0, []);
    await listAdminUsers(client, parse());
    expect(calls[1].text).toContain(`ORDER BY u."createdAt" DESC NULLS LAST`);
  });

  it("windows views to the profile_view metric of the last 30 days", async () => {
    const { client, calls } = stubClient(0, []);
    await listAdminUsers(client, parse());
    expect(calls[1].values).toContain(ANALYTICS_METRIC.PROFILE_VIEW);
    expect(calls[1].text).toContain("INTERVAL '30 days'");
  });
});
