"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  checkUserExists,
  loginWithCredentials,
  registerUser,
  resendVerificationEmail,
} from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { GoogleAuthButton } from "@/app/components/auth/GoogleAuthButton";
import { PasswordField } from "@/app/components/auth/PasswordField";
import { validateEmail, validatePassword } from "@/lib/validation/auth.schema";

type SignupErrors = { name: string; password: string; confirmPassword: string };

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
  const [success, setSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // ✅ Modal states
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
  const [showNoAccountModal, setShowNoAccountModal] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [signupErrors, setSignupErrors] = useState<SignupErrors>({
    name: "",
    password: "",
    confirmPassword: "",
  });

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError("");
    setIsValidating(true);

    try {
      const exists = await checkUserExists(email);
      if (exists) {
        setStage("password");
      } else {
        // ✅ Fix 2: show modal instead of toast + inline signup
        setShowNoAccountModal(true);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    setPasswordError("");
    setIsValidating(true);

    try {
      const result = await loginWithCredentials({ email, password });

      if (result?.error === "email_not_verified") {
        // ✅ Show unverified modal
        setShowUnverifiedModal(true);
        return;
      }

      if (result?.error) {
        // ✅ Fix 1: show error below password field instead of toast
        setPasswordError("Incorrect password. Please try again.");
      } else {
        router.push("/user-dashboard");
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        return;
      }
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleEditEmail = () => {
    setStage("email");
    setPasswordError("");
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const result = await resendVerificationEmail(email);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Verification email sent! Please check your inbox.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getSignupFieldError = (
    field: keyof SignupErrors,
    value: string
  ): string => {
    switch (field) {
      case "name":
        return value.trim() ? "" : "Full name is required";
      case "password":
        return validatePassword(value);
      case "confirmPassword":
        return value === password ? "" : "Passwords do not match";
      default:
        return "";
    }
  };

  const handleSignupBlur = (field: keyof SignupErrors, value: string) => {
    setSignupErrors((prev) => ({
      ...prev,
      [field]: getSignupFieldError(field, value),
    }));
  };

  const validateSignupAll = (): boolean => {
    const errors: SignupErrors = {
      name: getSignupFieldError("name", signupName),
      password: getSignupFieldError("password", password),
      confirmPassword: getSignupFieldError("confirmPassword", confirmPassword),
    };
    setSignupErrors(errors);
    return Object.values(errors).every((e) => !e);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignupAll()) return;

    setIsValidating(true);
    try {
      const result = await registerUser({ name: signupName, email, password });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        toast.error("Account created. Please sign in with your password.");
        return;
      }
      setSuccess(true);
      toast.success("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/user-dashboard");
        router.refresh();
      }, 1500);
    } catch {
      toast.error("An unexpected error occurred.");
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
      heading={
        stage === "email"
          ? "Welcome to LinkHub"
          : stage === "password"
          ? "Welcome Back"
          : "Join LinkHub"
      }
      subheading={
        stage === "email"
          ? "Enter your email to get started."
          : stage === "password"
          ? "Please enter your password to continue."
          : "Start your creative journey with LinkHub."
      }
      panelTitle="Connect Your World"
      panelDescription="Share all your important links in one beautiful place. Build your online presence and connect with your audience effortlessly."
      panelFeatures={panelFeatures}
    >
      <div className="space-y-6">

        {/* ✅ Unverified Email Modal */}
        {showUnverifiedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-surface rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-yellow-500 text-3xl">
                  mark_email_unread
                </span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-on-surface">
                  Verify Your Email
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-on-surface-variant">
                Your account hasn&apos;t been verified yet. Please check your
                inbox and click the verification link we sent to{" "}
                <span className="font-medium text-gray-900 dark:text-on-surface">
                  {email}
                </span>.
              </p>
              <p className="text-sm text-gray-600 dark:text-on-surface-variant">
                Didn&apos;t receive it?{" "}
                <button
                  className="text-primary font-medium hover:underline cursor-pointer disabled:opacity-50"
                  onClick={handleResendVerification}
                  disabled={isResending}
                >
                  {isResending ? "Sending..." : "Resend verification email"}
                </button>
              </p>
              <button
                onClick={() => setShowUnverifiedModal(false)}
                className="w-full mt-2 py-2 px-4 rounded-lg border border-gray-300 dark:border-outline-variant text-sm font-medium text-gray-700 dark:text-on-surface hover:bg-gray-50 dark:hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ✅ No Account Found Modal */}
        {showNoAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-surface rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-500 text-3xl">
                  person_search
                </span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-on-surface">
                  No Account Found
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-on-surface-variant">
                We couldn&apos;t find an account linked to{" "}
                <span className="font-medium text-gray-900 dark:text-on-surface">
                  {email}
                </span>.
                Would you like to create one?
              </p>
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                onClick={() => setShowNoAccountModal(false)}
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Sign up
              </Link>
              <button
                onClick={() => setShowNoAccountModal(false)}
                className="w-full py-2 px-4 rounded-lg border border-gray-300 dark:border-outline-variant text-sm font-medium text-gray-700 dark:text-on-surface hover:bg-gray-50 dark:hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Try a different email
              </button>
            </div>
          </div>
        )}

        {stage === "email" && (
          <form onSubmit={handleContinue} className="space-y-6" noValidate>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface ${
                  emailError
                    ? "border-red-400 dark:border-red-400"
                    : "border-gray-300 dark:border-outline-variant"
                }`}
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onBlur={() => setEmailError(validateEmail(email))}
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {emailError}
                </p>
              )}
            </div>
            <button
              disabled={isValidating}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
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
          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2">
                Email Address
              </label>
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-surface-container-low border border-gray-300 dark:border-outline-variant rounded-lg">
                <span className="text-gray-900 dark:text-on-surface">{email}</span>
                <button
                  type="button"
                  onClick={handleEditEmail}
                  className="text-primary hover:text-primary/80 cursor-pointer"
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
                onChange={(value) => {
                  setPassword(value);
                  if (passwordError) setPasswordError("");
                }}
                onBlur={() => setPasswordError(password ? "" : "Password is required")}
                show={showPassword}
                onToggleShow={() => setShowPassword(!showPassword)}
                error={passwordError}
              />
              <div className="flex justify-end mt-2">
               feat/login-auth-workflow
                <button
                  type="button"
                <Link
                  href="/forgot-password"
                   className="text-sm text-primary hover:underline cursor-pointer"
                
                  Forgot password?
                </Link>
              </div>
            </div>
            <button
              disabled={isValidating}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              type="submit"
            >
              {isValidating ? "Logging in..." : "Log In"}
            </button>
          </form>
        )}

        {stage === "signup" && (
          <form onSubmit={handleSignup} className="space-y-5" noValidate>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2"
                htmlFor="signup-name"
              >
                Full Name
              </label>
              <input
                id="signup-name"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface ${
                  signupErrors.name
                    ? "border-red-400 dark:border-red-400"
                    : "border-gray-300 dark:border-outline-variant"
                }`}
                placeholder="Alex Rivers"
                type="text"
                value={signupName}
                onChange={(e) => {
                  setSignupName(e.target.value);
                  if (signupErrors.name)
                    setSignupErrors((prev) => ({ ...prev, name: "" }));
                }}
                onBlur={() => handleSignupBlur("name", signupName)}
              />
              {signupErrors.name && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {signupErrors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2">
                Email Address
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg dark:bg-surface-container-low dark:text-on-surface opacity-75 cursor-default"
                type="email"
                value={email}
                readOnly
              />
            </div>
            <PasswordField
              id="signup-password"
              label="Password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                if (signupErrors.password)
                  setSignupErrors((prev) => ({ ...prev, password: "" }));
              }}
              onBlur={() => handleSignupBlur("password", password)}
              show={showPassword}
              onToggleShow={() => setShowPassword(!showPassword)}
              showStrength
              error={signupErrors.password}
            />
            <PasswordField
              id="signup-confirm"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);
                if (signupErrors.confirmPassword)
                  setSignupErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              onBlur={() => handleSignupBlur("confirmPassword", confirmPassword)}
              show={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              error={signupErrors.confirmPassword}
            />
            <button
              disabled={isValidating || success}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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