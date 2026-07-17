"use client";

import { useState } from "react";
import { adminService } from "../services/adminService";
import type { AdminRole } from "@/lib/roles";
import { ADMIN_ROLES, ROLE_LABEL } from "@/lib/roles";
import type { TeamMember } from "../services/types";
import { Button } from "./Button";
import { DialogShell } from "./DialogShell";

export interface ChangeRoleDialogProps {
    member: TeamMember | null;
    onClose: () => void;
    onChanged: () => void;
}

export function ChangeRoleDialog({ member, onClose, onChanged }: ChangeRoleDialogProps) {
    const [role, setRole] = useState<AdminRole>(member?.role ?? "SUPPORT");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dirty = member != null && role !== member.role;

    const handleSubmit = async () => {
        if (!member || !dirty || submitting) return;
        setSubmitting(true);
        setError(null);
        const result = await adminService.changeTeamMemberRole(member.id, role);
        setSubmitting(false);
        if (result.ok) {
            onChanged();
            onClose();
        } else {
            setError("Something went wrong. Please try again.");
        }
    };

    return (
    <DialogShell
        open={member != null}
        ariaLabel="Change role"
        role="dialog"
        locked={submitting}
        onClose={onClose}
        widthClassName="w-[400px]"
    >
        <h2 className="text-[16px] font-semibold text-ink-900">Change role</h2>
        {member && (
        <p className="mt-1 text-[13px] text-ink-500">
            Update {member.name}&apos;s role. This action is logged.
        </p>
        )}

        <div className="mt-4">
        <label className="block">
            <span className="text-[12px] font-medium text-ink-600">Role</span>
            <select
            value={role}
            onChange={(event) => setRole(event.target.value as AdminRole)}
            disabled={submitting}
            className="mt-1 h-10 w-full rounded-[10px] border border-ink-100 bg-white px-3 text-[13.5px] text-ink-900 outline-none focus:border-indigo-500 disabled:bg-ink-100/40"
            >
            {ADMIN_ROLES.map((value) => (
                <option key={value} value={value}>
                {ROLE_LABEL[value]}
                </option>
            ))}
            </select>
        </label>

        {error && <p className="mt-2 text-[12.5px] text-rose-500">{error}</p>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
        <Button variant="default" onClick={onClose} disabled={submitting}>
            Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!dirty || submitting}>
            {submitting ? "Updating…" : "Update role"}
        </Button>
        </div>
    </DialogShell>
    );
}