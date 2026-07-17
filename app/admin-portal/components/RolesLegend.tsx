"use client";

import type { AdminRole } from "@/lib/roles";
import { RoleBadge } from "./Badge";
import { Card } from "./Card";

interface RoleEntry {
    role: AdminRole;
    scope: string;
}

const ROLE_ENTRIES: readonly RoleEntry[] = [
    {
    role: "SUPER_ADMIN",
    scope:
        "Full access — users, billing, moderation, team, settings, delete & impersonate.",
    },
    {
        role: "SUPPORT",
        scope: "View users, send resets, suspend; no delete, no billing.",
    },
    {
        role: "FINANCE",
        scope: "Revenue, plans, invoices, refunds; no user or moderation actions.",
    },
    {
        role: "MODERATOR",
        scope: "Moderation queue, take downs, page suspensions only.",
    },
];

export function RolesLegend() {
    return (
        <Card title="Roles & permissions">
            <ul className="divide-y divide-ink-100">
                {ROLE_ENTRIES.map(({ role, scope }) => (
                    <li key={role} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="w-[120px] shrink-0">
                            <RoleBadge role={role} />
                        </div>
                        <p className="flex-1 text-[13px] text-ink-500">{scope}</p>
                    </li>
                ))}
            </ul>
        </Card>
    );
}