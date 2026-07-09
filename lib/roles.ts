
export type Role =
    | "USER"
    | "PRO"
    | "SUPER_ADMIN"
    | "SUPPORT"
    | "FINANCE"
    | "MODERATOR";

export const SUPER_ADMIN: Role = "SUPER_ADMIN";

/** Roles that grant access to the admin portal (used by the Team page). */
export type AdminRole = "SUPER_ADMIN" | "SUPPORT" | "FINANCE" | "MODERATOR";

export const ADMIN_ROLES: readonly AdminRole[] = [
    "SUPER_ADMIN",
    "SUPPORT",
    "FINANCE",
    "MODERATOR",
] as const;

/** Display label for each admin role — used by badges and the role select. */
export const ROLE_LABEL: Record<AdminRole, string> = {
    SUPER_ADMIN: "Super admin",
    SUPPORT: "Support",
    FINANCE: "Finance",
    MODERATOR: "Moderator",
};