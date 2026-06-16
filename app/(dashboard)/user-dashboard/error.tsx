"use client";

import { useEffect } from "react";

export default function DashboardError({
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
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="text-center max-w-sm mx-auto">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(59,70,224,0.1)" }}
        >
          <span className="material-symbols-outlined text-primary">warning</span>
        </div>
        <h2 className="font-headline text-xl font-extrabold mb-2">Something went wrong</h2>
        <p className="text-on-surface-variant text-sm mb-6">
          We couldn&apos;t load this section. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-full font-semibold text-white text-sm"
          style={{ background: "linear-gradient(180deg, #3b46e0, #2a37c0)" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
