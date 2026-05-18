"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/app/components/auth/PasswordField";
import { validatePassword } from "@/lib/validation/auth.schema";
import { resetPassword } from "@/app/actions/auth";

type TokenState = "valid" | "invalid" | "used" | "expired";

interface Props {
  token: string | null;
  initialState: TokenState;
  tokenError: string;
}

export function ResetPasswordClient({ token, initialState, tokenError }: Props) {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleNewPasswordBlur = () => {
    setNewPasswordError(validatePassword(newPassword));
  };

  const handleConfirmBlur = () => {
    if (confirmPassword && confirmPassword !== newPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const validateAll = (): boolean => {
    const passwordErr = validatePassword(newPassword);
    const confirmErr = confirmPassword !== newPassword ? "Passwords do not match" : "";
    setNewPasswordError(passwordErr);
    setConfirmPasswordError(confirmErr);
    return !passwordErr && !confirmErr && newPassword !== "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateAll() || !token) return;

    setIsLoading(true);
    try {
      const result = await resetPassword(token, newPassword);
      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (initialState === "used") {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <span className="material-symbols-outlined text-amber-500 text-5xl">lock_reset</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-on-surface">Link Already Used</h3>
        <p className="text-sm text-gray-600 dark:text-on-surface-variant">
          This password reset link has already been used. For security, each link can only be used once.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors text-center"
        >
          Request a New Link
        </Link>
        <Link href="/login" className="block text-sm text-primary hover:underline">
          Back to Login
        </Link>
      </div>
    );
  }

  if (initialState === "expired" || initialState === "invalid") {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <span className="material-symbols-outlined text-red-500 text-5xl">
            {initialState === "expired" ? "timer_off" : "link_off"}
          </span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-on-surface">
          {initialState === "expired" ? "Link Expired" : "Invalid Link"}
        </h3>
        <p className="text-sm text-gray-600 dark:text-on-surface-variant">{tokenError}</p>
        <Link
          href="/forgot-password"
          className="inline-block w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors text-center"
        >
          Request a New Link
        </Link>
        <Link href="/login" className="block text-sm text-primary hover:underline">
          Back to Login
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-on-surface">Password Reset Successfully!</h3>
        <p className="text-sm text-gray-600 dark:text-on-surface-variant">
          Your password has been reset. Redirecting to login…
        </p>
        <Link
          href="/login"
          className="inline-block w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors text-center"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <PasswordField
        id="new-password"
        label="New Password"
        value={newPassword}
        onChange={(value) => {
          setNewPassword(value);
          if (newPasswordError) setNewPasswordError("");
        }}
        onBlur={handleNewPasswordBlur}
        show={showNewPassword}
        onToggleShow={() => setShowNewPassword(!showNewPassword)}
        showStrength
        error={newPasswordError}
      />

      <PasswordField
        id="confirm-password"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(value) => {
          setConfirmPassword(value);
          if (confirmPasswordError) setConfirmPasswordError("");
        }}
        onBlur={handleConfirmBlur}
        show={showConfirmPassword}
        onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
        error={confirmPasswordError}
      />

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}

      <button
        disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
        className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        type="submit"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          "Reset Password"
        )}
      </button>
    </form>
  );
}
