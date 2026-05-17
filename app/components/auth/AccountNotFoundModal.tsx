"use client";

import Link from "next/link";
import { LoginModal } from "./LoginModal";

interface AccountNotFoundModalProps {
  email: string;
  onClose: () => void;
}

export function AccountNotFoundModal({ email, onClose }: AccountNotFoundModalProps) {
  const signupHref = `/signup?email=${encodeURIComponent(email)}`;

  return (
    <LoginModal onClose={onClose}>
      <h2 className="text-lg font-bold text-on-surface mb-3">Account not found</h2>
      <p className="text-sm text-primary mb-7 leading-relaxed">
        We couldn&apos;t find an account for{" "}
        <strong className="text-on-surface">{email}</strong>.{" "}
        <Link
          href={signupHref}
          className="underline underline-offset-2 hover:text-primary/70 transition-colors"
          onClick={onClose}
        >
          Want to create one?
        </Link>
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
        >
          Try another email
        </button>
        <Link
          href={signupHref}
          onClick={onClose}
          className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors text-center"
        >
          Sign up
        </Link>
      </div>
    </LoginModal>
  );
}
