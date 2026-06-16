"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, type ReactNode } from "react";
import { LinkhubLogo } from "@/app/components/icons/LinkhubLogo";

type AuthFeature = {
  icon: string;
  title: string;
  description: string;
};

type AuthShellProps = {
  heading: string;
  subheading: ReactNode;
  error?: string;
  children: ReactNode;
  panelTitle: string;
  panelDescription: string;
  panelFeatures: AuthFeature[];
  onBackClick?: () => void;
};

export function AuthShell({
  heading,
  subheading,
  error,
  children,
  panelTitle,
  panelDescription,
  panelFeatures,
  onBackClick,
}: AuthShellProps) {
  const backClass = "group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-8";

  // The reCAPTCHA script injects a floating `.grecaptcha-badge` directly into
  // document.body, outside React's tree, and next/script never removes
  // afterInteractive scripts on unmount — so without this, the badge stays
  // visible after navigating away from auth pages until a full page reload.
  useEffect(() => {
    const badge = document.querySelector<HTMLElement>(".grecaptcha-badge");
    if (badge) badge.style.display = "";

    return () => {
      const badge = document.querySelector<HTMLElement>(".grecaptcha-badge");
      if (badge) badge.style.display = "none";
    };
  }, []);

  return (
    <div className="min-h-screen lg:h-screen bg-white dark:bg-surface flex overflow-x-hidden">
      {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      ) : null}
      <div className="w-full lg:w-1/2 flex flex-col px-5 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          {onBackClick ? (
            <button onClick={onBackClick} className={backClass}>
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Back to home
            </button>
          ) : (
            <Link href="/" className={backClass}>
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Back to home
            </Link>
          )}

          <div className="mb-8">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <LinkhubLogo size="md" />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-on-surface mb-2">
              {heading}
            </h1>
            <p className="text-gray-600 dark:text-on-surface-variant">{subheading}</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          {children}
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-20 w-48 h-48 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-white rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-lg text-center">
            <h2 className="text-4xl font-bold mb-6">{panelTitle}</h2>
            <p className="text-xl mb-8 text-white/90">{panelDescription}</p>

            <div className="grid grid-cols-1 gap-6 mb-12">
              {panelFeatures.map((feature) => (
                <div className="flex items-center gap-4" key={feature.title}>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-white/80 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <Image alt="" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=32&h=32" width={32} height={32} sizes="32px" />
                <Image alt="" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32&h=32" width={32} height={32} sizes="32px" />
                <Image alt="" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=32&h=32" width={32} height={32} sizes="32px" />
                <Image alt="" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=32&h=32" width={32} height={32} sizes="32px" />
              </div>
              <span className="text-sm text-white/90">Join 10,000+ creators</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
