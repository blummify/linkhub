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
      <h2 className="text-[16px] font-semibold text-ink-900">{title}</h2>
      <p className="mt-1.5 text-[13.5px] text-ink-500">{description}</p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="default" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
          {confirmLabel}
        </Button>
      </div>
    </DialogShell>
  );
}