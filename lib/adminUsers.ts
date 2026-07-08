import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";
import { ANALYTICS_METRIC } from "@/app/constants/analyticsMetrics";
import type {
  AdminUser,
  Plan,
  SortDirection,
  UserFilter,
  UserPage,
  UserSort,
  UserStatus,
} from "@/app/admin-portal/services/types";

/**
 * Server-side users query for the admin portal: search, filter, sort, and
 * pagination all run in Postgres so the endpoint stays fast on a large user
 * table. Pure helpers are exported for unit tests; `listAdminUsers` takes any
 * `$queryRaw`-capable client so tests can inject a stub instead of a database.
 */

const USER_FILTER_VALUES = [
  "all",
  "pro",
  "free",
  "business",
  "suspended",
  "unverified",
] as const satisfies readonly UserFilter[];

const USER_SORT_VALUES = ["name", "links", "views", "joined"] as const satisfies readonly UserSort[];

const SORT_DIRECTION_VALUES = ["asc", "desc"] as const satisfies readonly SortDirection[];

export const ADMIN_USERS_MAX_PAGE_SIZE = 100;

/** Accepts raw URL search params (all strings); coerces and defaults every field. */
export const adminUsersQuerySchema = z.object({
  search: z.string().trim().max(200).default(""),
  filter: z.enum(USER_FILTER_VALUES).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(ADMIN_USERS_MAX_PAGE_SIZE).default(8),
  sort: z.enum(USER_SORT_VALUES).default("joined"),
  dir: z.enum(SORT_DIRECTION_VALUES).default("desc"),
});

export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;

/** Escape LIKE wildcards so a search for "100%" doesn't match everything. */
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, "\\$&");
}

/**
 * WHERE clause for both the count and rows queries. `u`, `p`, and `s` are the
 * User, Profile, and Subscription aliases; all user input is parameterized.
 */
function buildWhere({ search, filter }: AdminUsersQuery): Prisma.Sql {
  const conditions: Prisma.Sql[] = [];

  // Handles are stored without "@" but displayed (and often searched) with it.
  const term = search.replace(/^@/, "");
  if (term) {
    const like = `%${escapeLike(term)}%`;
    conditions.push(
      Prisma.sql`(u."name" ILIKE ${like} OR u."email" ILIKE ${like} OR p."handle" ILIKE ${like})`
    );
  }

  switch (filter) {
    case "pro":
    case "free":
    case "business":
      conditions.push(Prisma.sql`COALESCE(s."planId", 'free') = ${filter}`);
      break;
    case "suspended":
      conditions.push(Prisma.sql`u."suspendedAt" IS NOT NULL`);
      break;
    case "unverified":
      // Mirrors status derivation: suspension outranks a missing verification.
      conditions.push(Prisma.sql`(u."emailVerified" IS NULL AND u."suspendedAt" IS NULL)`);
      break;
    case "all":
      break;
  }

  return conditions.length ? Prisma.join(conditions, " AND ") : Prisma.sql`TRUE`;
}

/** Whitelisted ORDER BY expressions — never interpolate the raw param. */
const SORT_EXPR: Record<UserSort, Prisma.Sql> = {
  name: Prisma.sql`lower(u."name")`,
  links: Prisma.sql`"links"`,
  views: Prisma.sql`"views30d"`,
  joined: Prisma.sql`u."createdAt"`,
};

const DIR_EXPR: Record<SortDirection, Prisma.Sql> = {
  asc: Prisma.sql`ASC`,
  desc: Prisma.sql`DESC`,
};

/** Shape returned by the rows query (dates arrive as Date via the pg driver). */
export interface RawAdminUserRow {
  id: string;
  name: string | null;
  email: string | null;
  country: string | null;
  createdAt: Date;
  lastActiveAt: Date | null;
  suspendedAt: Date | null;
  emailVerified: Date | null;
  handle: string | null;
  plan: string;
  links: number;
  views30d: number;
}

const PLAN_VALUES = ["free", "pro", "business"] as const satisfies readonly Plan[];

/** Subscription.planId is free-form in the DB; anything unrecognised reads as free. */
export function toPlan(value: string): Plan {
  return (PLAN_VALUES as readonly string[]).includes(value) ? (value as Plan) : "free";
}

export function deriveStatus(
  row: Pick<RawAdminUserRow, "suspendedAt" | "emailVerified">
): UserStatus {
  if (row.suspendedAt) return "suspended";
  if (!row.emailVerified) return "pending";
  return "active";
}

export function mapAdminUserRow(row: RawAdminUserRow): AdminUser {
  return {
    id: row.id,
    name: row.name ?? "—",
    email: row.email ?? "—",
    handle: row.handle ? `@${row.handle}` : "—",
    plan: toPlan(row.plan),
    status: deriveStatus(row),
    links: row.links,
    views30d: row.views30d,
    country: row.country ?? "—",
    joinedAt: row.createdAt.toISOString(),
    lastActiveAt: row.lastActiveAt ? row.lastActiveAt.toISOString() : null,
  };
}

export async function listAdminUsers(
  client: Pick<PrismaClient, "$queryRaw">,
  query: AdminUsersQuery
): Promise<UserPage> {
  const where = buildWhere(query);

  const countRows = await client.$queryRaw<{ total: number }[]>(Prisma.sql`
    SELECT COUNT(*)::int AS "total"
    FROM "User" u
    LEFT JOIN "Profile" p ON p."userId" = u."id"
    LEFT JOIN "Subscription" s ON s."userId" = u."id"
    WHERE ${where}
  `);
  const total = countRows[0]?.total ?? 0;

  // Clamp overflowing page requests to the last page instead of returning nothing.
  const lastPage = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, lastPage);
  const offset = (page - 1) * query.pageSize;

  const rows = await client.$queryRaw<RawAdminUserRow[]>(Prisma.sql`
    SELECT
      u."id", u."name", u."email", u."country", u."createdAt",
      u."lastActiveAt", u."suspendedAt", u."emailVerified",
      p."handle",
      COALESCE(s."planId", 'free') AS "plan",
      COALESCE(l."count", 0)::int AS "links",
      COALESCE(v."count", 0)::int AS "views30d"
    FROM "User" u
    LEFT JOIN "Profile" p ON p."userId" = u."id"
    LEFT JOIN "Subscription" s ON s."userId" = u."id"
    LEFT JOIN (
      SELECT "userId", COUNT(*) AS "count"
      FROM "Link"
      GROUP BY "userId"
    ) l ON l."userId" = u."id"
    LEFT JOIN (
      SELECT "userId", SUM("count") AS "count"
      FROM "Analytics"
      WHERE "metric" = ${ANALYTICS_METRIC.PROFILE_VIEW}
        AND "dimension" = 'total'
        AND "date" >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY "userId"
    ) v ON v."userId" = u."id"
    WHERE ${where}
    ORDER BY ${SORT_EXPR[query.sort]} ${DIR_EXPR[query.dir]} NULLS LAST, u."id" ASC
    LIMIT ${query.pageSize} OFFSET ${offset}
  `);

  return { users: rows.map(mapAdminUserRow), total, page, pageSize: query.pageSize };
}
