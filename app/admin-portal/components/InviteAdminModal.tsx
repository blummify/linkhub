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
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-[22px] italic leading-none tracking-[-0.01em] text-ink-900">
            Invite admin
          </h2>
          <p className="mt-1.5 text-[13px] text-ink-500">
            We&apos;ll send an email with a sign-in link. This action is logged.
          </p>
        </div>
        <button
          type="button"
          onClick={submitting ? undefined : onClose}
          disabled={submitting}
          aria-label="Close"
          className="grid h-8 w-8 flex-none place-items-center rounded-full bg-ink-100 text-ink-500 transition-colors hover:bg-ink-200 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-indigo-500">
            Email
          </span>
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@linkhub.app"
            disabled={submitting}
            className="mt-1.5 h-11 w-full rounded-[10px] border-0 bg-ink-100/60 px-3.5 text-[13.5px] text-ink-900 outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-indigo-500">
            Role
          </span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as AdminRole)}
            disabled={submitting}
            className="mt-1.5 h-11 w-full rounded-[10px] border-0 bg-ink-100/60 px-3.5 text-[13.5px] text-ink-900 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
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
        <Button variant="default" className="cursor-pointer" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" className="cursor-pointer" onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? "Sending…" : "Send invite"}
        </Button>
      </div>
    </DialogShell>
  );
}