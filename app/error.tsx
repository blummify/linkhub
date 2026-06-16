"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-surface font-body text-on-surface antialiased flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-md mx-auto">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #3b46e0, #2a37c0)" }}
          >
            <span className="material-symbols-outlined text-white text-3xl">warning</span>
          </div>
          <h1 className="font-headline text-2xl font-extrabold mb-3">Something went wrong</h1>
          <p className="text-on-surface-variant mb-8">
            An unexpected error occurred. Our team has been notified.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 rounded-full font-semibold text-white text-sm"
              style={{ background: "linear-gradient(180deg, #3b46e0, #2a37c0)" }}
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-full font-semibold text-sm border"
              style={{ borderColor: "#d6dae9", color: "#1a2244" }}
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
