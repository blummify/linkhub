"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties, type PointerEvent } from "react";
import { SiteFooter } from "./components/SiteFooter";

export default function Home() {
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
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--hx", `${x}%`);
    el.style.setProperty("--hy", `${y}%`);
  };

  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    };

    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          revealObserver.unobserve(entry.target);
        }
      }
    }, observerOptions);

    const elements = document.querySelectorAll<HTMLElement>(".reveal-hidden");
    for (const el of elements) revealObserver.observe(el);

    return () => revealObserver.disconnect();
  }, []);

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden">
      <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
        <div className="bg-orb absolute top-[10%] left-[5%] w-96 h-96 bg-primary/5 blur-[120px] rounded-full"></div>
        <div
          className="bg-orb absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-secondary/5 blur-[150px] rounded-full"
          style={{ animationDelay: "-5s" }}
        ></div>
        <div
          className="bg-orb absolute top-[40%] right-[30%] w-64 h-64 bg-indigo-200/10 blur-[100px] rounded-full"
          style={{ animationDelay: "-10s" }}
        ></div>
      </div>

      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-surface-variant/20">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 font-headline tracking-tight hover:scale-105 transition-transform"
          >
            <span className="flex items-center">
              <span className="sr-only">LinkHub</span>
              <Image
                src="/link_hub_logo.png"
                alt="LinkHub logo"
                width={256}
                height={256}
                priority
                loading="eager"
                className="h-auto w-32 max-w-full object-contain"
              />
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-headline font-semibold tracking-tight">
            <Link
              className="text-slate-600 hover:text-indigo-600 transition-all hover:translate-y-[-1px]"
              href="/features"
            >
              Features
            </Link>
            <Link
              className="text-slate-600 hover:text-indigo-600 transition-all hover:translate-y-[-1px]"
              href="/pricing"
            >
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2 text-primary font-semibold rounded-full hover:bg-surface-container-low/70 dark:hover:bg-white/5 transition-all scale-100 hover:scale-105 active:scale-95 duration-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="cta-gradient px-6 py-2.5 text-white rounded-full font-bold shadow-lg hover:shadow-primary/30 hover:opacity-95 transition-all hover:scale-105 active:scale-95 duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

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
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl"></div>
                  <div className="relative mb-8 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-md mb-3 overflow-hidden bg-indigo-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-4xl">
                        person
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-lg text-on-surface">
                      @alex_creative
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium">
                      Digital Curator &amp; Designer
                    </p>
                  </div>
                  <div className="w-full space-y-3 relative">
                    <div className="shimmer-button phone-link-1 w-full py-4 px-4 rounded-xl text-white text-sm font-bold shadow-md hover:scale-[1.05] transition-transform duration-300 cursor-pointer flex items-center justify-between group">
                      <span>Latest Project</span>
                      <span className="material-symbols-outlined text-lg opacity-70 group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                    <div className="phone-link-2 w-full py-4 px-4 rounded-xl bg-white border border-surface-variant text-on-surface text-sm font-bold shadow-sm hover:shadow-md hover:scale-[1.05] hover:border-primary transition-all duration-300 cursor-pointer flex items-center justify-between group">
                      <span>YouTube Channel</span>
                      <span className="material-symbols-outlined text-lg opacity-40 group-hover:translate-x-1 transition-transform">
                        play_circle
                      </span>
                    </div>
                    <div className="phone-link-3 w-full py-4 px-4 rounded-xl bg-white border border-surface-variant text-on-surface text-sm font-bold shadow-sm hover:shadow-md hover:scale-[1.05] hover:border-primary transition-all duration-300 cursor-pointer flex items-center justify-between group">
                      <span>Merch Store</span>
                      <span className="material-symbols-outlined text-lg opacity-40 group-hover:translate-x-1 transition-transform">
                        shopping_bag
                      </span>
                    </div>
                    <div className="phone-link-4 w-full py-4 px-4 rounded-xl bg-white border border-surface-variant text-on-surface text-sm font-bold shadow-sm hover:shadow-md hover:scale-[1.05] hover:border-primary transition-all duration-300 cursor-pointer flex items-center justify-between group">
                      <span>Portfolio 2024</span>
                      <span className="material-symbols-outlined text-lg opacity-40 group-hover:translate-x-1 transition-transform">
                        link
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto flex gap-4 text-on-surface-variant">
                    <span className="material-symbols-outlined text-xl opacity-60 hover:opacity-100 hover:scale-125 hover:text-primary cursor-pointer transition-all">
                      photo_camera
                    </span>
                    <span className="material-symbols-outlined text-xl opacity-60 hover:opacity-100 hover:scale-125 hover:text-primary cursor-pointer transition-all">
                      movie
                    </span>
                    <span className="material-symbols-outlined text-xl opacity-60 hover:opacity-100 hover:scale-125 hover:text-primary cursor-pointer transition-all">
                      alternate_email
                    </span>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 grayscale opacity-40">
                    <span className="material-symbols-outlined text-xs">hub</span>
                    <span className="text-[10px] font-bold font-headline uppercase tracking-widest">
                      LinkHub
                    </span>
                  </div>
                </div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-slate-900 rounded-full"></div>
              </div>
            </div>
            <div className="absolute -top-16 -right-16 w-80 h-80 bg-secondary-container opacity-30 blur-[100px] rounded-full -z-10"></div>
            <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-primary-container opacity-30 blur-[100px] rounded-full -z-10"></div>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center pt-6 md:pt-10">
          <a
            href="#trusted-creators"
            className="group flex flex-col items-center gap-1.5 text-on-surface-variant/50 hover:text-primary transition-colors"
            aria-label="Scroll to next section"
          >
            <span className="text-[10px] font-label font-bold uppercase tracking-[0.25em]">
              Explore
            </span>
            <span
              className={
                reduceMotion
                  ? "material-symbols-outlined text-2xl"
                  : "material-symbols-outlined text-2xl hero-scroll-hint"
              }
              aria-hidden
            >
              expand_more
            </span>
          </a>
        </div>
      </section>

      <section
        id="trusted-creators"
        className="py-12 bg-surface-container-low border-y border-surface-variant/30 relative overflow-hidden scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-8 opacity-70">
            Trusted by creators across
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-1000">
            <div className="flex items-center gap-2 font-headline font-bold text-xl hover:scale-110 transition-transform cursor-default">
              <span className="material-symbols-outlined text-2xl">
                photo_camera
              </span>{" "}
              Instagram
            </div>
            <div className="flex items-center gap-2 font-headline font-bold text-xl hover:scale-110 transition-transform cursor-default">
              <span className="material-symbols-outlined text-2xl">
                music_note
              </span>{" "}
              TikTok
            </div>
            <div className="flex items-center gap-2 font-headline font-bold text-xl hover:scale-110 transition-transform cursor-default">
              <span className="material-symbols-outlined text-2xl">
                flutter_dash
              </span>{" "}
              Twitter
            </div>
            <div className="flex items-center gap-2 font-headline font-bold text-xl hover:scale-110 transition-transform cursor-default">
              <span className="material-symbols-outlined text-2xl">movie</span>{" "}
              YouTube
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto scroll-reveal-container">
        <div className="text-center mb-16 reveal-hidden">
          <h2 className="font-headline text-4xl font-extrabold mb-4">
            Crafted for the Digital Curator
          </h2>
          <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="reveal-hidden bg-surface-container-low p-10 rounded-xl relative group hover:bg-white hover:shadow-xl hover:translate-y-[-8px] transition-all duration-500 border border-transparent hover:border-surface-variant/50">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary rounded-l-xl"></div>
            <div className="w-14 h-14 bg-surface-container-lowest rounded-xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-secondary group-hover:text-white transition-colors duration-500">
              <span className="material-symbols-outlined text-primary text-3xl group-hover:text-white">
                hub
              </span>
            </div>
            <h3 className="font-headline text-2xl font-bold mb-4">
              Centralized Links
            </h3>
            <p className="text-on-surface-variant leading-relaxed">
              Host all your content, shop links, and social profiles in one
              beautiful, editorial-grade destination.
            </p>
          </div>
          <div
            className="reveal-hidden bg-surface-container-low p-10 rounded-xl relative group hover:bg-white hover:shadow-xl hover:translate-y-[-8px] transition-all duration-500 border border-transparent hover:border-surface-variant/50"
            style={{ transitionDelay: "150ms" }}
          >
            <div className="w-14 h-14 bg-surface-container-lowest rounded-xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-500">
              <span className="material-symbols-outlined text-primary text-3xl group-hover:text-white">
                analytics
              </span>
            </div>
            <h3 className="font-headline text-2xl font-bold mb-4">
              Deep Analytics
            </h3>
            <p className="text-on-surface-variant leading-relaxed">
              Understand your audience with pinpoint precision. Track clicks,
              conversions, and geographical trends in real-time.
            </p>
          </div>
          <div
            className="reveal-hidden bg-surface-container-low p-10 rounded-xl relative group hover:bg-white hover:shadow-xl hover:translate-y-[-8px] transition-all duration-500 border border-transparent hover:border-surface-variant/50"
            style={{ transitionDelay: "300ms" }}
          >
            <div className="w-14 h-14 bg-surface-container-lowest rounded-xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-500">
              <span className="material-symbols-outlined text-primary text-3xl group-hover:text-white">
                palette
              </span>
            </div>
            <h3 className="font-headline text-2xl font-bold mb-4">
              Custom Branding
            </h3>
            <p className="text-on-surface-variant leading-relaxed">
              Your brand is unique. Fully customize every pixel with custom
              fonts, colors, and layout configurations.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-20">
          <div className="w-full md:w-1/2 reveal-hidden">
            <div className="bg-surface-container-low rounded-3xl p-8 relative group">
              <img
                alt="Elegant dashboard showing clean data visualization charts with secondary green growth indicators and indigo accents"
                className="rounded-xl shadow-lg w-full h-auto group-hover:scale-[1.02] transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCg1jSLuMCVc6TaFQCGlygspePy35lUZtxhyShDJDAav6xALtSK166JAWvEHYvufAHi2SaheMbkXZX1uBv-uIABVqsXTPv6vrvYvBe09hbtJ8tIDgj5mKZNPPBTc7NtXX5TYpc_ntBeeANO0KFcYgK5A7m2wlB6k3ji4eALe4h7ihfUJdNsP7CoYstmMFyvGMtXHaixRr67dS2bUFXAsbjhwutlalFMJemR4s6qT-TLttKzYdU5aY-7S_yQxJju__YWdCYLBmRm6F8G"
              />
              <div className="absolute -bottom-6 -right-6 bg-surface-bright p-6 rounded-2xl shadow-2xl max-w-[240px] group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-3 h-3 bg-secondary rounded-full animate-pulse"></span>
                  <span className="font-headline font-bold text-sm">
                    Real-time Growth
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Your audience engagement grew by 24% this week.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 reveal-hidden" style={{ transitionDelay: "200ms" }}>
            <span className="text-secondary font-bold font-label tracking-widest uppercase text-sm mb-4 block">
              Intelligence
            </span>
            <h2 className="font-headline text-4xl font-extrabold mb-6">
              Data that drives <br />
              decisions.
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
              Stop guessing. Our analytics dashboard provides deep insights into
              how your audience interacts with your brand. No more dark
              social—see exactly where your traffic is coming from.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 font-semibold hover:translate-x-2 transition-transform duration-300">
                <span className="material-symbols-outlined text-secondary">
                  check_circle
                </span>
                Individual Link Tracking
              </li>
              <li className="flex items-center gap-3 font-semibold hover:translate-x-2 transition-transform duration-300">
                <span className="material-symbols-outlined text-secondary">
                  check_circle
                </span>
                Referrer Attribution
              </li>
              <li className="flex items-center gap-3 font-semibold hover:translate-x-2 transition-transform duration-300">
                <span className="material-symbols-outlined text-secondary">
                  check_circle
                </span>
                Exportable Weekly Reports
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 reveal-hidden">
        <div className="max-w-5xl mx-auto cta-gradient rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden group">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white mb-6 relative z-10">
            Ready to take center stage?
          </h2>
          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10">
            Join 50,000+ creators who trust LinkHub to power their digital
            presence. No credit card required.
          </p>
          <div className="relative z-10">
            <Link
              href="/signup"
              className="inline-block bg-white text-primary px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:scale-105 hover:shadow-white/20 active:scale-95 transition-all duration-300"
            >
              Sign Up Now — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
