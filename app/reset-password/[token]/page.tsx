
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { PasswordField } from "@/app/components/auth/PasswordField";
import { validatePassword } from "@/lib/validation/auth.schema";
import { resetPassword } from "@/app/actions/auth";

export default function NewPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

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
    if (!validateAll()) return;

    setIsLoading(true);
    try {
      const result = await resetPassword(token, { password: newPassword, confirmPassword });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const panelFeatures = [
    { icon: "link", title: "Unlimited Links", description: "Add as many links as you want to your profile without any restrictions." },
    { icon: "analytics", title: "Real-time Analytics", description: "Track clicks, views, and audience growth with detailed performance insights." },
    { icon: "palette", title: "Customizable Design", description: "Make your page truly yours with custom themes, fonts, and colors." },
  ];

  return (
    <AuthShell
      heading="Set New Password"
      subheading="Create a strong password to secure your account and regain access to your dashboard."
      error={error}
      panelTitle="Connect Your World"
      panelDescription="Share all your important links in one beautiful place. Build your online presence and connect with your audience effortlessly."
      panelFeatures={panelFeatures}
    >
      <div className="space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Login
        </Link>

        {!success ? (
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

            <button
              disabled={isLoading}
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
        ) : (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-on-surface">Password Reset Successfully!</h3>
            <p className="text-sm text-gray-600 dark:text-on-surface-variant">
              Your password has been reset. Redirecting to login...
            </p>
            <Link
              href="/login"
              className="inline-block w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors text-center"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </AuthShell>
  );
}