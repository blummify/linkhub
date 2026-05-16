"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties, type PointerEvent } from "react";
import { SiInstagram, SiSpotify, SiTiktok, SiYoutube } from "react-icons/si";

export function HomeHeroSection() {
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
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
                  <h3 className="font-headline font-bold text-lg text-on-surface">@alex_creative</h3>
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
                  <SiInstagram aria-label="Instagram" className="text-xl opacity-60 hover:opacity-100 hover:scale-125 hover:text-primary cursor-pointer transition-all" />
                  <SiTiktok aria-label="TikTok" className="text-xl opacity-60 hover:opacity-100 hover:scale-125 hover:text-primary cursor-pointer transition-all" />
                  <SiYoutube aria-label="YouTube" className="text-xl opacity-60 hover:opacity-100 hover:scale-125 hover:text-primary cursor-pointer transition-all" />
                  <SiSpotify aria-label="Spotify" className="text-xl opacity-60 hover:opacity-100 hover:scale-125 hover:text-primary cursor-pointer transition-all" />
                </div>
                <div className="mt-6 opacity-50 dark:opacity-70">
                  <Image
                    src="/link_hub_logo.png"
                    alt="LinkHub"
                    width={256}
                    height={256}
                    className="h-auto w-20 max-w-full object-contain"
                  />
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
          aria-label="Scroll to next section"
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
