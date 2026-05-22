"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorPageLayout } from "./components/errors/ErrorPageLayout";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalAppError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <ErrorPageLayout
      title="500 - Server Error"
      description="Something went wrong on our end. We're working to fix it. Please try again later."
      actions={
        <>
          <Link
            href="/"
            className="w-full bg-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            Back to Home
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>

          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl border border-gray-300 dark:border-outline-variant font-medium text-gray-700 dark:text-on-surface hover:bg-gray-50 dark:hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </>
      }
      rightCode="500"
      rightTagline="Something went wrong. We're on it!"
      rightIllustration={
        <svg
          width="280"
          height="320"
          viewBox="0 0 280 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <ellipse cx="36" cy="42" rx="26" ry="15" fill="white" fillOpacity="0.3" />
          <ellipse cx="60" cy="32" rx="22" ry="14" fill="white" fillOpacity="0.3" />
          <ellipse cx="220" cy="55" rx="24" ry="13" fill="white" fillOpacity="0.3" />
          <ellipse cx="246" cy="46" rx="18" ry="11" fill="white" fillOpacity="0.3" />

          <rect x="70" y="80" width="140" height="50" rx="6" fill="white" fillOpacity="0.92" />
          <circle cx="86" cy="105" r="4" fill="#3730a3" />
          <circle cx="102" cy="105" r="4" fill="#3730a3" />
          <circle cx="118" cy="105" r="4" fill="#3730a3" />
          <rect x="140" y="98" width="60" height="6" rx="3" fill="#3730a3" fillOpacity="0.4" />
          <rect x="140" y="110" width="40" height="6" rx="3" fill="#3730a3" fillOpacity="0.4" />

          <path
            d="M70 138 L90 142 L110 138 L130 144 L150 140 L170 144 L190 138 L210 142"
            stroke="white"
            strokeOpacity="0.6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          <rect x="70" y="156" width="140" height="50" rx="6" fill="white" fillOpacity="0.92" />
          <circle cx="86" cy="181" r="4" fill="#3730a3" />
          <circle cx="102" cy="181" r="4" fill="#3730a3" />
          <circle cx="118" cy="181" r="4" fill="#3730a3" />
          <rect x="140" y="174" width="60" height="6" rx="3" fill="#3730a3" fillOpacity="0.4" />
          <rect x="140" y="186" width="50" height="6" rx="3" fill="#3730a3" fillOpacity="0.4" />

          <rect x="70" y="216" width="140" height="50" rx="6" fill="white" fillOpacity="0.92" />
          <circle cx="86" cy="241" r="4" fill="#3730a3" />
          <circle cx="102" cy="241" r="4" fill="#3730a3" />
          <circle cx="118" cy="241" r="4" fill="#3730a3" />
          <rect x="140" y="234" width="60" height="6" rx="3" fill="#3730a3" fillOpacity="0.4" />
          <rect x="140" y="246" width="45" height="6" rx="3" fill="#3730a3" fillOpacity="0.4" />

          <circle cx="218" cy="252" r="18" fill="white" fillOpacity="0.95" />
          <text
            x="218"
            y="260"
            textAnchor="middle"
            fontSize="22"
            fontWeight="bold"
            fill="#ba1a1a"
          >
            !
          </text>

          <ellipse cx="140" cy="284" rx="60" ry="8" fill="white" fillOpacity="0.18" />

          <ellipse cx="44" cy="288" rx="24" ry="12" fill="white" fillOpacity="0.22" />
          <path d="M44 288 Q30 264 36 248 Q48 264 44 288" fill="white" fillOpacity="0.38" />
          <path d="M44 288 Q58 264 55 248 Q43 264 44 288" fill="white" fillOpacity="0.38" />

          <ellipse cx="244" cy="288" rx="22" ry="12" fill="white" fillOpacity="0.22" />
          <path d="M244 288 Q230 264 236 248 Q248 264 244 288" fill="white" fillOpacity="0.38" />
        </svg>
      }
    />
  );
}
