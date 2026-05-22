"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type ErrorPageLayoutProps = {
  title: string;
  description: string;
  actions: ReactNode;
  rightCode: string;
  rightTagline: string;
  rightIllustration: ReactNode;
};

export function ErrorPageLayout({
  title,
  description,
  actions,
  rightCode,
  rightTagline,
  rightIllustration,
}: ErrorPageLayoutProps) {
  return (
    <div className="h-screen bg-white dark:bg-surface flex overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-12 lg:px-16 xl:px-20 py-8 overflow-y-auto">
        <div className="max-w-md mx-auto w-full flex flex-col justify-center h-full">
          <div className="mb-12">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/link_hub_logo.png"
                alt="LinkHub"
                className="h-auto w-32 max-w-full object-contain"
              />
            </Link>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-on-surface">{title}</h1>
            <p className="text-gray-600 dark:text-on-surface-variant text-base leading-relaxed">
              {description}
            </p>

            <div className="space-y-3 pt-2">{actions}</div>

            <p className="text-center text-sm text-gray-500 dark:text-on-surface-variant pt-2">
              Need help?{" "}
              <Link href="/contact" className="text-primary font-medium hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-20 w-48 h-48 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-white rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-row items-center justify-between w-full text-white px-12 py-8">
          <div className="flex flex-col justify-center">
            <p className="text-[8rem] font-bold leading-none mb-4">{rightCode}</p>
            <p className="text-2xl font-medium text-white/90 max-w-[220px]">{rightTagline}</p>
          </div>

          <div className="flex items-center justify-center">{rightIllustration}</div>
        </div>
      </div>
    </div>
  );
}
