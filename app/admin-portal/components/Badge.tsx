import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Plan, ReportSeverity, UserStatus, TeamMemberStatus } from "../services/types";
import {ROLE_LABEL} from "@/lib/roles";
import type { AdminRole } from "@/lib/roles";

/** Visual tones map to the admin token pairs (bg tint + foreground hue). */
export type BadgeTone = "neutral" | "indigo" | "purple" | "green" | "amber" | "rose";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-ink-100 text-ink-500",
  indigo: "bg-indigo-50 text-indigo-700",
  purple: "bg-purple-50 text-purple-500",
  green: "bg-success-50 text-green-500",
  amber: "bg-amber-50 text-amber-500",
  rose: "bg-danger-50 text-rose-500",
};

export interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.02em]",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const PLAN_TONE: Record<Plan, BadgeTone> = { free: "neutral", pro: "indigo", business: "purple" };
const PLAN_LABEL: Record<Plan, string> = { free: "Free", pro: "Pro", business: "Business" };

export function PlanBadge({ plan }: { plan: Plan }) {
  return <Badge tone={PLAN_TONE[plan]}>{PLAN_LABEL[plan]}</Badge>;
}

const STATUS_TONE: Record<UserStatus, BadgeTone> = {
  active: "green",
  suspended: "rose",
  pending: "amber",
};
const STATUS_LABEL: Record<UserStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};

export function StatusBadge({ status }: { status: UserStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

const SEVERITY_TONE: Record<ReportSeverity, BadgeTone> = { high: "rose", medium: "amber" };
const SEVERITY_LABEL: Record<ReportSeverity, string> = { high: "High", medium: "Medium" };

export function SeverityBadge({ severity }: { severity: ReportSeverity }) {
  return <Badge tone={SEVERITY_TONE[severity]}>{SEVERITY_LABEL[severity]}</Badge>;
}

const ROLE_TONE: Record<AdminRole, BadgeTone> = {
  SUPER_ADMIN: "indigo",
  SUPPORT: "neutral",
  FINANCE: "purple",
  MODERATOR: "amber",
};

export function RoleBadge({ role }: { role: AdminRole }) {
  return <Badge tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</Badge>;
}

const TEAM_MEMBER_STATUS_TONE: Record<TeamMemberStatus, BadgeTone> = {
  active: "green",
  invited: "amber",
};
const TEAM_MEMBER_STATUS_LABEL: Record<TeamMemberStatus, string> = {
  active: "Active",
  invited: "Invited",
};

export function TeamMemberStatusBadge({ status }: { status: TeamMemberStatus }) {
  return <Badge tone={TEAM_MEMBER_STATUS_TONE[status]}>{TEAM_MEMBER_STATUS_LABEL[status]}</Badge>;
}