"use client";

import { useRouter } from "next/navigation";
import { LinkhubLogo } from "@/app/components/icons/LinkhubLogo";

export default function AdminLoginPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <LinkhubLogo size="md" />
          <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-on-surface">
            Super admin
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-on-surface-variant">
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-outline bg-white dark:bg-surface-container text-gray-900 dark:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-outline bg-white dark:bg-surface-container text-gray-900 dark:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
