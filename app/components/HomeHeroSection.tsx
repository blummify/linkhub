"use client";

import Link from "next/link";
import { LinkhubLogo } from "./icons/LinkhubLogo";
import { useEffect, useState, type CSSProperties, type PointerEvent } from "react";

export function HomeHeroSection() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const onHeroPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--hx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--hy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <section
      className="hero-spotlight pt-32 pb-8 md:pb-12 px-6 max-w-7xl mx-auto relative"
      onPointerMove={onHeroPointerMove}
    >
      {!reduceMotion && (
        <div className="hero-aurora pointer-events-none" aria-hidden />
      )}
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8">
            <span
              className="headline-pop block"
              style={{ ["--d"]: "0ms" } as CSSProperties}
            >
              <span className="headline-hero-sweep block">
                One Link,
                <br />
                Endless Possibilities
              </span>
            </span>
          </h1>
          <p
            className="reveal-up text-lg md:text-xl text-on-surface-variant max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed"
            style={{ animationDelay: "0.55s" }}
          >
            Consolidate your digital presence into a single, high-converting
            editorial stage. Designed for the modern curator who demands more
            than just a list of buttons.
          </p>
          <div
            className="reveal-up flex flex-col sm:flex-row justify-center lg:justify-start gap-6 items-center"
            style={{ animationDelay: "0.72s" }}
          >
            <Link
              href="/signup"
              className="pulse-primary cta-gradient px-10 py-5 text-white rounded-full font-bold text-xl shadow-2xl hover:scale-105 hover:shadow-indigo-500/40 active:scale-95 transition-all duration-300"
            >
              Get Started for Free
            </Link>
            <button className="group flex items-center gap-2 text-primary font-bold text-lg hover:text-primary-container transition-all hover:translate-x-1">
              View Demo{" "}
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
        <div
          className="flex-1 w-full relative reveal-up"
          style={{ animationDelay: "0.9s" }}
        >
          <div className="animate-float relative z-10 mx-auto max-w-[320px]">
            <div className="relative rounded-[3rem] border-[12px] border-slate-900 bg-slate-900 shadow-[0_50px_100px_-20px_rgba(31,51,170,0.3)] p-4 aspect-[9/18.5] overflow-hidden">
              <div className="h-full w-full bg-surface rounded-[2rem] flex flex-col items-center pt-10 pb-6 px-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl" />
                <div className="relative mb-8 text-center flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-md mb-3 overflow-hidden bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-4xl">person</span>
                  </div>
                  <p className="font-headline font-bold text-lg text-on-surface">@alex_creative</p>
                  <p className="text-xs text-on-surface-variant font-medium">Digital Curator &amp; Designer</p>
                </div>
                <div className="w-full space-y-3 relative">
                  {[
                    { label: "Latest Project", icon: "arrow_forward", shimmer: true },
                    { label: "YouTube Channel", icon: "play_circle", shimmer: false },
                    { label: "Merch Store", icon: "shopping_bag", shimmer: false },
                    { label: "My Portfolio", icon: "link", shimmer: false },
                  ].map(({ label, icon, shimmer }, i) => (
                    <div
                      key={label}
                      className={`w-full py-4 px-4 rounded-xl text-sm font-bold shadow-sm hover:scale-[1.05] transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                        shimmer
                          ? "shimmer-button text-white shadow-md"
                          : `phone-link-${i + 1} bg-white dark:bg-slate-800 border border-surface-variant text-slate-900 dark:text-slate-100 hover:shadow-md hover:border-primary`
                      }`}
                    >
                      <span>{label}</span>
                      <span className="material-symbols-outlined text-lg opacity-40 group-hover:translate-x-1 transition-transform">
                        {icon}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-auto flex gap-3 text-on-surface-variant">
                  <svg role="img" aria-label="Instagram" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60 hover:opacity-100 hover:scale-125 hover:text-primary cursor-pointer transition-all">
                    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
                  </svg>
                  <svg role="img" aria-label="TikTok" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="opacity-60 hover:opacity-100 hover:scale-125 hover:text-primary cursor-pointer transition-all">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.19a8.16 8.16 0 004.84 1.56V6.32a4.85 4.85 0 01-1.07-.37v.74z"/>
                  </svg>
                  <svg role="img" aria-label="YouTube" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="opacity-60 hover:opacity-100 hover:scale-125 hover:text-primary cursor-pointer transition-all">
                    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12z"/>
                  </svg>
                  <svg role="img" aria-label="Spotify" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="opacity-60 hover:opacity-100 hover:scale-125 hover:text-primary cursor-pointer transition-all">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </div>
                <div className="mt-6 opacity-50 dark:opacity-70">
                  <LinkhubLogo size="sm" />
                </div>
              </div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-slate-900 rounded-full" />
            </div>
          </div>
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-secondary-container opacity-30 blur-[100px] rounded-full -z-10" />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-primary-container opacity-30 blur-[100px] rounded-full -z-10" />
        </div>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center pt-6 md:pt-10">
        <a
          href="#trusted-creators"
          className="group flex flex-col items-center gap-1.5 text-on-surface-variant/50 hover:text-primary transition-colors"
        >
          <span className="text-[10px] font-label font-bold uppercase tracking-[0.25em]">Explore</span>
          <span
            className={reduceMotion ? "material-symbols-outlined text-2xl" : "material-symbols-outlined text-2xl hero-scroll-hint"}
            aria-hidden
          >
            expand_more
          </span>
        </a>
      </div>
    </section>
  );
}
