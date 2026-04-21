"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 border border-gray-300 dark:border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface pr-12"
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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

            <div>
              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-outline-variant rounded-lg hover:bg-gray-50 dark:hover:bg-surface-container-low transition-colors group">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-on-surface">Sign up with Google</span>
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

