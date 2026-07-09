"use client";

import { Button, type ButtonVariant } from "./Button";
import { DialogShell } from "./DialogShell";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation gate for destructive/irreversible actions. Rendered as an
 * alertdialog through DialogShell so it composes cleanly with any parent
 * dialog (e.g. a drawer). While `loading` is true the backdrop and Escape are
 * inert — a mutation in flight cannot be dismissed halfway.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <DialogShell
      open={open}
      ariaLabel={title}
      role="alertdialog"
      locked={loading}
      onClose={onCancel}
    >
      <div className="grid h-11 w-11 place-items-center rounded-full bg-rose-50 text-rose-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[22px] w-[22px]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z" />
        </svg>
      </div>
      <h2 className="mt-3.5 text-[17px] font-semibold text-ink-900">{title}</h2>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">{description}</p>
      <div className="mt-5 flex justify-end gap-2.5">
        <Button variant="default" className="px-4 py-2.5" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant={confirmVariant} className="px-4 py-2.5" onClick={onConfirm} disabled={loading}>
          {confirmLabel}
        </Button>
      </div>
    </DialogShell>
  );
}