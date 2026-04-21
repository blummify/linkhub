"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"email" | "password" | "signup">("email");
  const [isValidating, setIsValidating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsValidating(true);
    // Mock validation logic
    setTimeout(() => {
      if (email === "joel@example.com") {
        setStage("password");
      } else {
        setStage("signup");
      }
      setIsValidating(false);
    }, 800);
  };

  const handleEditEmail = () => {
    setStage("email");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-surface flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-12">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/link_hub_logo.png" 
              alt="LinkHub" 
              className="w-32 h-auto"
            />
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
              <form className="space-y-6">
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
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  type="submit"
                >
                  Log In
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
                <span className="px-2 bg-white dark:bg-surface text-gray-500 dark:text-on-surface-variant">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-outline-variant rounded-lg hover:bg-gray-50 dark:hover:bg-surface-container-low transition-colors">
                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaqDTci7JWWwRcxklan86rx2FiMF6bDQ9MyCC7r9z-CWrtZDLPDyNZbcfJUKDWF06ds-Z5eK_hwmuUr-qt1e8ozh0CpS33Yzdtwy5Bj8cxS0oJo9M9eFjCWGpZyLLgwES1oLv6Z3cdHke_u-jW-oluuEQNSrra_DdzOuXG7G63J7OpaKLHFHFHC4TTgccC02L0bPtRDHlos68Rjq1AU3JL2_Lao5_pqv22GXQZSgp_WEXapCiUSWqVu8xc3SqnozWoqOLNOK6C1Duo6B" />
                <span className="text-sm font-medium text-gray-700 dark:text-on-surface">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-outline-variant rounded-lg hover:bg-gray-50 dark:hover:bg-surface-container-low transition-colors">
                <img alt="Apple" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXu4bBgOMabyzo2odYRQRVOq75bYU5AJdEf1nT0smNt27MhZ7Xmy8L-YXPkM8w6npyVHub3B331bbg-w9kvjt7Ff3j6U8WEkqOAZy2va06LGP0vgqio5yC07DYJXD2vrzOziFBb6DpYTYkZTRnwmAOJuJRWf4p2engmyltCkhkfy55R0gLn5AaUwxm0IvTpSzPZz8Wl1WkyvKOTz4xl0bYlPn7AMfPWamrwcwnhCkzrz-cgacYXzq0lI2pK0vw4PgzA1ctkRij-znczX" />
                <span className="text-sm font-medium text-gray-700 dark:text-on-surface">Apple</span>
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
