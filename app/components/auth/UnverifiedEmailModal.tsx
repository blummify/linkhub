"use client";

import { LoginModal } from "./LoginModal";

interface UnverifiedEmailModalProps {
  email: string;
  isResending: boolean;
  onClose: () => void;
  onVerify: () => void;
}

export function UnverifiedEmailModal({
  email,
  isResending,
  onClose,
  onVerify,
}: UnverifiedEmailModalProps) {
  return (
    <LoginModal onClose={onClose}>
      <h2 className="text-lg font-bold text-on-surface mb-3">Verify your email</h2>
      <p className="text-sm text-primary mb-7 leading-relaxed">
        Your account{" "}
        <strong className="text-on-surface">{email}</strong>{" "}
        hasn&apos;t been verified yet.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onVerify}
          disabled={isResending}
          className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {isResending ? "Sending…" : "Verify"}
        </button>
      </div>
    </LoginModal>
  );
}
