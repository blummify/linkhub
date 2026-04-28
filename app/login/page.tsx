"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { checkUserExists, loginWithCredentials, registerUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { GoogleAuthButton } from "@/app/components/auth/GoogleAuthButton";
import { PasswordField } from "@/app/components/auth/PasswordField";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stage, setStage] = useState<"email" | "password" | "signup">("email");
  const [isValidating, setIsValidating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsValidating(true);
    setError("");
    
    try {
      const exists = await checkUserExists(email);
      if (exists) {
        setStage("password");
      } else {
        setStage("signup");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsValidating(true);

    try {
      const result = await loginWithCredentials({ email, password });
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/user-dashboard");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleEditEmail = () => {
    setStage("email");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setIsValidating(true);
    try {
      const result = await registerUser({
        name: signupName,
        email,
        password,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        setError("Account created. Please sign in with your password.");
        return;
      }
      router.push("/user-dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsValidating(false);
    }
  };

  const panelFeatures = [
    { icon: "link", title: "Unlimited Links", description: "Add as many links as you need" },
    { icon: "analytics", title: "Real-time Analytics", description: "Track your link performance" },
    { icon: "palette", title: "Customizable Design", description: "Make it uniquely yours" },
  ];

  return (
    <AuthShell
      heading={stage === "email" ? "Welcome to LinkHub" : stage === "password" ? "Welcome Back" : "Join LinkHub"}
      subheading={
        stage === "email"
          ? "Enter your email to get started."
          : stage === "password"
            ? "Please enter your password to continue."
            : "Start your creative journey with LinkHub."
      }
      error={error}
      panelTitle="Connect Your World"
      panelDescription="Share all your important links in one beautiful place. Build your online presence and connect with your audience effortlessly."
      panelFeatures={panelFeatures}
    >
      <div className="space-y-6">
            {stage === "email" && (
              <form onSubmit={handleContinue} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface"
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  disabled={isValidating}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  type="submit"
                >
                  {isValidating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Continue
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {stage === "password" && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-surface-container-low border border-gray-300 dark:border-outline-variant rounded-lg">
                    <span className="text-gray-900 dark:text-on-surface">{email || "alex@example.com"}</span>
                    <button 
                      type="button" 
                      onClick={handleEditEmail}
                      className="text-primary hover:text-primary/80"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                </div>
                <div>
                  <PasswordField
                    id="password"
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    show={showPassword}
                    onToggleShow={() => setShowPassword(!showPassword)}
                  />
                  <div className="flex justify-end mt-2">
                    <button type="button" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>
                </div>
                <button
                  disabled={isValidating}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  type="submit"
                >
                  {isValidating ? "Logging in..." : "Log In"}
                </button>
              </form>
            )}

            {stage === "signup" && (
              <form onSubmit={handleSignup} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2" htmlFor="signup-name">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface"
                    placeholder="Alex Rivers"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2">
                    Email Address
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface"
                    placeholder={email || "alex@example.com"}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <PasswordField
                    id="signup-password"
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    show={showPassword}
                    onToggleShow={() => setShowPassword(!showPassword)}
                  />
                </div>
                <div>
                  <PasswordField
                    id="signup-confirm"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirmPassword}
                    onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </div>
                <button
                  disabled={isValidating}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  type="submit"
                >
                  {isValidating ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Social Login */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-surface text-gray-500 dark:text-on-surface-variant font-semibold tracking-wide">
                  OR
                </span>
              </div>
            </div>

            <GoogleAuthButton
              onClick={() => signIn("google", { callbackUrl: "/user-dashboard" })}
              label="Continue with Google"
            />

            {/* Sign up link */}
            {stage !== "signup" && (
              <p className="text-center text-sm text-gray-600 dark:text-on-surface-variant">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            )}
      </div>
    </AuthShell>
  );
}
