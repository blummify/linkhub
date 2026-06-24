/**
 * The set of values accepted by `User.role` (see prisma/schema.prisma).
 * Enforced at the DB level by a CHECK constraint and used app-wide for
 * role comparisons so the literals never drift.
 */
export type Role = "USER" | "PRO" | "SUPER_ADMIN";

export const SUPER_ADMIN: Role = "SUPER_ADMIN";
