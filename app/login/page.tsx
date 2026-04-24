"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { checkUserExists, loginWithCredentials } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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
    } catch (err) {
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
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleEditEmail = () => {
    setStage("email");
  };

  return (
    <div className="h-screen bg-white dark:bg-surface flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-12 lg:px-16 xl:px-20 py-8 overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          {/* Back to Home */}
          <Link href="/" className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-8">
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to home
          </Link>

          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <img 
                src="/link_hub_logo.png" 
                alt="LinkHub" 
                className="w-32 h-auto"
              />
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-on-surface mb-2">
              {stage === "email" ? "Welcome to LinkHub" : stage === "password" ? "Welcome Back" : "Join LinkHub"}
            </h1>
            <p className="text-gray-600 dark:text-on-surface-variant">
              {stage === "email" 
                ? "Enter your email to get started." 
                : stage === "password" 
                ? "Please enter your password to continue." 
                : "Start your creative journey with LinkHub."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          {/* Form */}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface pr-12"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
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
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2">
                    Full Name
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface"
                    placeholder="Alex Rivers"
                    type="text"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface pr-12"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface pr-12"
                      placeholder="••••••••"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined">
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
                <button
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  type="submit"
                >
                  Create Account
                  <span className="material-symbols-outlined">arrow_forward</span>
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

            <div>
              <button 
                onClick={() => signIn("google", { callbackUrl: "/user-dashboard" })}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-outline-variant rounded-lg hover:bg-gray-50 dark:hover:bg-surface-container-low transition-colors group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-on-surface">Continue with Google</span>
              </button>
            </div>

            {/* Sign up link */}
            {stage !== "signup" && (
              <p className="text-center text-sm text-gray-600 dark:text-on-surface-variant">
                Don't have an account?{" "}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Preview/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-20 w-48 h-48 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-white rounded-full blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-lg text-center">
            <h2 className="text-4xl font-bold mb-6">
              Connect Your World
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Share all your important links in one beautiful place. Build your online presence and connect with your audience effortlessly.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">link</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Unlimited Links</h3>
                  <p className="text-white/80 text-sm">Add as many links as you need</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">analytics</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Real-time Analytics</h3>
                  <p className="text-white/80 text-sm">Track your link performance</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">palette</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Customizable Design</h3>
                  <p className="text-white/80 text-sm">Make it uniquely yours</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <img alt="" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=32&h=32" />
                <img alt="" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32&h=32" />
                <img alt="" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=32&h=32" />
                <img alt="" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=32&h=32" />
              </div>
              <span className="text-sm text-white/90">
                Join 10,000+ creators
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
