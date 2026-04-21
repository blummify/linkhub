"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log("Signup data:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="h-screen bg-white dark:bg-surface flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-12 lg:px-16 xl:px-20 py-12 overflow-y-auto">
        <div className="max-w-md mx-auto w-full my-auto">
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
              Join LinkHub
            </h1>
            <p className="text-gray-600 dark:text-on-surface-variant">
              Start your creative journey. Connect your world.
            </p>
          </div>

          {/* Form */}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface pr-12"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

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
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                type="submit"
              >
                Create Account
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            {/* Social Signup */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-surface text-gray-500 dark:text-on-surface-variant">
                  Or sign up with
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

            {/* Login link */}
            <p className="text-center text-sm text-gray-600 dark:text-on-surface-variant">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </p>
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
              Build Your Digital Stage
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Create a beautiful landing page that showcases all your important links. Perfect for creators, businesses, and professionals.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Quick Setup</h3>
                  <p className="text-white/80 text-sm">Get started in minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">dashboard_customize</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Beautiful Templates</h3>
                  <p className="text-white/80 text-sm">Professional designs ready to use</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">trending_up</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Grow Your Audience</h3>
                  <p className="text-white/80 text-sm">Connect with more people</p>
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

