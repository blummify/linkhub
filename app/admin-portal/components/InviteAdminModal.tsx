"use client";

import { useState } from "react";
import { adminService } from "../services/adminService";
import type { AdminRole } from "@/lib/roles";
import { ADMIN_ROLES, ROLE_LABEL } from "@/lib/roles";
import { Button } from "./Button";
import { DialogShell } from "./DialogShell";

export interface InviteAdminModalProps {
  onClose: () => void;
  onInvited: () => void;
}

export function InviteAdminModal({ onClose, onInvited }: InviteAdminModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("SUPPORT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = /\S+@\S+\.\S+/.test(email.trim()) && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const result = await adminService.inviteTeamMember(email.trim(), role);
    setSubmitting(false);
    if (result.ok) {
      onInvited();
      onClose();
    } else {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <DialogShell
      open={true}
      ariaLabel="Invite admin"
      role="dialog"
      locked={submitting}
      onClose={onClose}
      widthClassName="w-[440px]"
    >
      <h2 className="text-[16px] font-semibold text-ink-900">Invite admin</h2>
      <p className="mt-1 text-[13px] text-ink-500">
        We&apos;ll send an email with a sign-in link. This action is logged.
      </p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-[12px] font-medium text-ink-600">Email</span>
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@linkhub.app"
            disabled={submitting}
            className="mt-1 h-10 w-full rounded-[10px] border border-ink-100 bg-white px-3 text-[13.5px] text-ink-900 outline-none placeholder:text-ink-300 focus:border-indigo-500 disabled:bg-ink-100/40"
          />
        </label>

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

        {error && <p className="text-[12.5px] text-rose-500">{error}</p>}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="default" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? "Sending…" : "Send invite"}
        </Button>
      </div>
    </DialogShell>
  );
}