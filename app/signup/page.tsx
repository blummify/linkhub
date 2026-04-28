"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/app/components/auth/AuthShell";
import { GoogleAuthButton } from "@/app/components/auth/GoogleAuthButton";
import { PasswordField } from "@/app/components/auth/PasswordField";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (result?.error) {
        setError(result.error);
      } else {
        const signInRes = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        if (signInRes?.error) {
          setError("Account created. Please sign in with your email and password.");
          return;
        }
        router.push("/user-dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <PasswordField
                id="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={(value) => setFormData((prev) => ({ ...prev, password: value }))}
                show={showPassword}
                onToggleShow={() => setShowPassword(!showPassword)}
              />
              
              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(value) => setFormData((prev) => ({ ...prev, confirmPassword: value }))}
                show={showConfirmPassword}
                onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              <div className="flex items-center">
                <input
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  id="terms"
                  type="checkbox"
                  required
                />
                <label className="ml-2 text-sm text-gray-600 dark:text-on-surface-variant" htmlFor="terms">
                  I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <button
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                type="submit"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
                {!isLoading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </form>

            {/* Social Signup */}
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

            {/* Login link */}
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

