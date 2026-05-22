"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorPageLayout } from "./components/errors/ErrorPageLayout";

export default function NotFound() {
  const router = useRouter();

  return (
    <ErrorPageLayout
      title="404 - Page Not Found"
      description="Oops! The page you're looking for doesn't exist or has been moved."
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
            onClick={() => router.back()}
            className="w-full py-3 px-4 rounded-xl border border-gray-300 dark:border-outline-variant font-medium text-gray-700 dark:text-on-surface hover:bg-gray-50 dark:hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Go Back
          </button>
        </>
      }
      rightCode="404"
      rightTagline="Looks like you've taken a wrong turn."
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

          <rect x="132" y="60" width="14" height="200" rx="7" fill="white" fillOpacity="0.85" />

          <rect x="80" y="62" width="130" height="52" rx="8" fill="white" fillOpacity="0.92" />
          <polygon points="210,62 228,88 210,114" fill="white" fillOpacity="0.92" />
          <text
            x="148"
            y="100"
            textAnchor="middle"
            fontSize="32"
            fontWeight="bold"
            fill="#3730a3"
          >
            ?
          </text>

          <rect x="68" y="128" width="130" height="52" rx="8" fill="white" fillOpacity="0.92" />
          <polygon points="68,128 50,154 68,180" fill="white" fillOpacity="0.92" />

          <ellipse cx="122" cy="154" rx="16" ry="10" stroke="#3730a3" strokeWidth="3.5" fill="none" />
          <ellipse cx="156" cy="154" rx="16" ry="10" stroke="#3730a3" strokeWidth="3.5" fill="none" />

          <ellipse cx="139" cy="268" rx="42" ry="10" fill="white" fillOpacity="0.18" />

          <ellipse cx="44" cy="272" rx="28" ry="14" fill="white" fillOpacity="0.22" />
          <path d="M44 272 Q30 244 36 228 Q48 244 44 272" fill="white" fillOpacity="0.38" />
          <path d="M44 272 Q58 244 55 228 Q43 244 44 272" fill="white" fillOpacity="0.38" />

          <ellipse cx="228" cy="272" rx="30" ry="14" fill="white" fillOpacity="0.22" />
          <path d="M228 272 Q214 244 220 228 Q232 244 228 272" fill="white" fillOpacity="0.38" />
          <path d="M228 272 Q242 244 240 228 Q228 244 228 272" fill="white" fillOpacity="0.38" />
        </svg>
      }
    />
  );
}
