"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { registerUser, checkUserExists, sendVerificationCode } from "@/app/actions/auth";
import { executeRecaptcha, RecaptchaError } from "@/lib/recaptcha.client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { GoogleAuthButton } from "@/app/components/auth/GoogleAuthButton";
import { PasswordField } from "@/app/components/auth/PasswordField";
import { validateEmail, validatePassword } from "@/lib/validation/auth.schema";

type FieldErrors = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: searchParams.get("email") ?? "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const getFieldError = (field: keyof FieldErrors, value: string): string => {
    switch (field) {
      case "name":
        return value.trim() ? "" : "Full name is required. ";
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "confirmPassword":
        return value === formData.password ? "" : "Passwords do not match";
    }
  };

  const handleBlur = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: getFieldError(field, formData[field]),
    }));
  };

  const handleEmailBlur = async () => {
    const formatError = validateEmail(formData.email);
    if (formatError) {
      setFieldErrors((prev) => ({ ...prev, email: formatError }));
      return;
    }
    setIsCheckingEmail(true);
    try {
      const exists = await checkUserExists(formData.email);
      setFieldErrors((prev) => ({
        ...prev,
        email: exists ? "An account with this email already exists." : "",
      }));
    } catch {
      // silently ignore — full validation still runs on submit
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateAll = (): boolean => {
    const errors: FieldErrors = {
      name: getFieldError("name", formData.name),
      email: getFieldError("email", formData.email),
      password: getFieldError("password", formData.password),
      confirmPassword: getFieldError("confirmPassword", formData.confirmPassword),
    };
    setFieldErrors(errors);
    return Object.values(errors).every((e) => !e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateAll()) return;

    setIsLoading(true);

    try {
      const recaptchaToken = await executeRecaptcha("signup");
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        recaptchaToken,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        const verifyUrl = `/verify-email?email=${encodeURIComponent(formData.email)}`;
        // Fire email in background — user goes to verify page immediately
        // If delivery fails they can resend from that page
        sendVerificationCode(formData.email).catch(() => {});
        router.push(verifyUrl);
      }
    } catch (error: unknown) {
      if (error instanceof RecaptchaError) {
        setError("Security check couldn't complete. Please refresh the page and try again.");
        return;
      }
      setError("Something went wrong while creating your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormFilled =
    formData.name.trim() !== "" &&
    formData.email !== "" &&
    formData.password !== "" &&
    formData.confirmPassword !== "" &&
    formData.confirmPassword === formData.password &&
    termsAccepted;

  const panelFeatures = [
    { icon: "rocket_launch", title: "Quick Setup", description: "Get started in minutes" },
    { icon: "dashboard_customize", title: "Beautiful Templates", description: "Professional designs ready to use" },
    { icon: "trending_up", title: "Grow Your Audience", description: "Connect with more people" },
  ];

  return (
    <AuthShell
      heading="Join LinkHub"
      subheading="Start your creative journey. Connect your world."
      error={error}
      panelTitle="Build Your Digital Stage"
      panelDescription="Create a beautiful landing page that showcases all your important links. Perfect for creators, businesses, and professionals."
      panelFeatures={panelFeatures}
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface"
              id="name"
              name="name"
              type="text"
              placeholder="Alex Rivers"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur("name")}
              
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface"
                id="email"
                name="email"
                type="email"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                
              />
              {isCheckingEmail && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              )}
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1 flex-wrap">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {fieldErrors.email}
                {fieldErrors.email.includes("already exists") && (
                  <Link href="/login" className="underline font-semibold">Log in instead</Link>
                )}
              </p>
            )}
          </div>

          <PasswordField
            id="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, password: value }));
              setFieldErrors((prev) => ({
                ...prev,
                password: prev.password ? "" : prev.password,
                confirmPassword: prev.confirmPassword
                  ? (formData.confirmPassword === value ? "" : "Passwords do not match")
                  : "",
              }));
            }}
            onBlur={() => handleBlur("password")}
            show={showPassword}
            onToggleShow={() => setShowPassword(!showPassword)}
            showStrength
            error={fieldErrors.password}
          />

          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, confirmPassword: value }));
              if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            onBlur={() => handleBlur("confirmPassword")}
            show={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            error={fieldErrors.confirmPassword}
          />

          <div className="flex items-center">
            <input
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}

            />
            <label className="ml-2 text-sm text-gray-600 dark:text-on-surface-variant" htmlFor="terms">
              I agree to the{" "}
              <Link href="#" className="text-primary hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <button
            disabled={isLoading || !isFormFilled}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            type="submit"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
            {!isLoading && <span className="material-symbols-outlined">arrow_forward</span>}
          </button>
        </form>

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
          label="Sign up with Google"
        />

        <p className="text-center text-sm text-gray-600 dark:text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageContent />
    </Suspense>
  );
}
