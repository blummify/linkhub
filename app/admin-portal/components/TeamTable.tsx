"use client";

import { Avatar } from "./Avatar";
import { RoleBadge, TeamMemberStatusBadge } from "./Badge";
import { Button } from "./Button";
import { formatDate } from "../format";
import type { TeamMember } from "../services/types";

export interface TeamTableProps {
    members: TeamMember[];
    canManage: boolean;
    onChangeRole: (member: TeamMember) => void;
    onRemove: (member: TeamMember) => void;
}

export function TeamTable({ members, canManage, onChangeRole, onRemove }: TeamTableProps) {
    return (
        <div className="overflow-hidden rounded-[16px] border border-ink-100 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                    <thead>
                    <tr className="bg-paper">
                        <Th>Member</Th>
                        <Th>Role</Th>
                        <Th>Last active</Th>
                        <Th>Status</Th>
                        <Th align="right">Actions</Th>
                    </tr>
                    </thead>
                    <tbody>
                    {members.map((member) => (
                        <tr key={member.id} className="border-t border-ink-100">
                        <Td>
                            <div className="flex items-center gap-3">
                            <Avatar name={member.name} size="md" tone="indigo" />
                            <div className="min-w-0">
                                <div className="truncate text-[13.5px] font-medium text-ink-900">
                                {member.name}
                                </div>
                                <div className="truncate text-[12px] text-ink-400">{member.email}</div>
                            </div>
                            </div>
                        </Td>
                        <Td>
                            <RoleBadge role={member.role} />
                        </Td>
                        <Td className="text-ink-400">
                            {member.lastActiveAt ? formatDate(member.lastActiveAt) : "—"}
                        </Td>
                        <Td>
                            <TeamMemberStatusBadge status={member.status} />
                        </Td>
                        <Td align="right">
                            <div className="flex justify-end gap-2">
                            <Button
                                variant="default"
                                className="px-2.5 py-1.5 text-[12.5px]"
                                onClick={() => onChangeRole(member)}
                                disabled={!canManage}
                              // Base on the Ticket: "Change role (Super-admin only)".
                                title={canManage ? undefined : "Super admin only"}
                            >
                                Change role
                            </Button>
                            <Button
                                variant="danger"
                                className="px-2.5 py-1.5 text-[12.5px]"
                                onClick={() => onRemove(member)}
                                disabled={!canManage}
                                title={canManage ? undefined : "Super admin only"}
                            >
                                Remove
                            </Button>
                            </div>
                        </Td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );    
}   

function Th({
    children,
    align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={
        "border-b border-ink-100 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400" +
        (align === "right" ? " text-right" : " text-left")
      }
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  className,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={
        "px-4 py-3 text-[13.5px]" +
        (align === "right" ? " text-right" : "") +
        (className ? " " + className : "")
      }
    >
      {children}
    </td>
  );
}