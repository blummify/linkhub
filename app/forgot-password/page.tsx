"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { validateEmail } from "@/lib/validation/auth.schema";


export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      // Replace with real API call
      // Simulating async work for now
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const panelFeatures = [
    { icon: "link", title: "Unlimited Links", description: "Add as many links as you need" },
    { icon: "analytics", title: "Real-time Analytics", description: "Track your link performance" },
    { icon: "palette", title: "Customizable Design", description: "Make it uniquely yours" },
  ];

  return (
    <AuthShell
      heading="Forgotten Password?"
      subheading="Enter your email address to receive a password reset link."
      error={error}
      panelTitle="Connect Your World"
      panelDescription="Share all your important links in one beautiful place. Build your online presence and connect with your audience effortlessly."
      panelFeatures={panelFeatures}
    >
      <div className="space-y-6">
        {success ? (
          <div className="text-center space-y-4">
            <p className="text-gray-700 dark:text-on-surface">
              Check your inbox for a password reset link.
            </p>
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2"
                htmlFor="reset-email"
              >
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                onBlur={() => setError(validateEmail(email))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface ${
                  error
                    ? "border-red-400 dark:border-red-400"
                    : "border-gray-300 dark:border-outline-variant"
                }`}
              />
              {error && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {error}
                </p>
              )}
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              type="submit"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-on-surface-variant">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        )}
      </div>
    </AuthShell>
  );
}