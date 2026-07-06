"use client";

import { useEffect } from "react";
import FocusTrap from "focus-trap-react";
import { Button, type ButtonVariant } from "./Button";

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
 * alertdialog; the caller owns Escape handling so it composes with a parent
 * dialog (the user drawer).
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
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-ink-900/50"
        aria-hidden="true"
        onClick={loading ? undefined : onCancel}
      />
      <FocusTrap>
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label={title}
          className="fixed left-1/2 top-1/2 z-[101] w-[360px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-[16px] bg-white p-5 shadow-2xl"
        >
          <h2 className="text-[16px] font-semibold text-ink-900">{title}</h2>
          <p className="mt-1.5 text-[13.5px] text-ink-500">{description}</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="default" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
              {loading ? "Working…" : confirmLabel}
            </Button>
          </div>
        </div>
      </FocusTrap>
    </>
  );
}
