import Link from "next/link";

export default function Home() {
  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-nav">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 font-headline tracking-tight"
          >
            LinkHub
          </Link>
          <div className="hidden md:flex items-center gap-8 font-headline font-semibold tracking-tight">
            <Link
              className="text-slate-600 hover:text-indigo-600 transition-colors"
              href="/features"
            >
              Features
            </Link>
            <a
              className="text-slate-600 hover:text-indigo-600 transition-colors"
              href="#"
            >
              Solutions
            </a>
            <Link
              className="text-slate-600 hover:text-indigo-600 transition-colors"
              href="/pricing"
            >
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-5 py-2 text-primary font-semibold hover:bg-indigo-50/50 transition-all scale-95 active:scale-90 duration-200">
              Login
            </button>
            <button className="cta-gradient px-6 py-2.5 text-white rounded-full font-bold shadow-lg hover:opacity-90 transition-all scale-95 active:scale-90 duration-200">
              Sign Up
            </button>
          </div>
        </div>
      </nav>
      <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="animate-fade-in-up font-headline text-5xl md:text-7xl font-extrabold text-on-surface leading-[1.1] tracking-tight mb-8">
              One Link, <br />
              <span className="text-primary">Endless</span> Possibilities
            </h1>
            <p className="animate-fade-in-up delay-100 text-lg md:text-xl text-on-surface-variant max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed">
              Consolidate your digital presence into a single, high-converting
              editorial stage. Designed for the modern curator who demands more
              than just a list of buttons.
            </p>
            <div className="animate-fade-in-up delay-200 flex flex-col sm:flex-row justify-center lg:justify-start gap-5 items-center">
              <button className="pulse-primary cta-gradient px-10 py-5 text-white rounded-full font-bold text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300">
                Get Started for Free
              </button>
              <button className="group flex items-center gap-2 text-primary font-bold text-lg hover:text-primary-container transition-colors">
                View Demo{" "}
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
          <div className="flex-1 w-full relative animate-fade-in-up delay-300">
            <div className="animate-float relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(31,51,170,0.2)] bg-surface-container-lowest p-3 border-[6px] border-surface-container-high transition-transform duration-500 hover:scale-[1.02]">
              <img
                alt="Modern smartphone showing a sleek link-in-bio interface with aesthetic cards and high-end typography layout"
                className="w-full h-auto rounded-[1.8rem]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4yrezrWumgnXKCOC8ysP9z-Qs7AxGL0onf6nmzQTVaKGgdnZWnYmUi5GtdSasE4a1otWIBJM1DgeRFleFI_MDw-ksH2H2E58usfzDvlyn-fUtUIXwp1k19oj5IBhpyzzqB1QpiDlZl6tnMc-dguOQgqbZFZJHGu5r4b4f4c4fn-FAcHAwCcMd0GAAgqBfOJjbKxZMUsVDajbeLTzRTWE2W4TmAdu3lR_EFXCXWsjVKVJrmFDdLGAT2s_AKKZMHQVCn3t6zLRMmC23"
              />
            </div>
            <div className="absolute -top-16 -right-16 w-80 h-80 bg-secondary-container opacity-30 blur-[100px] rounded-full -z-10"></div>
            <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-primary-container opacity-30 blur-[100px] rounded-full -z-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-100/20 blur-[120px] rounded-full -z-20"></div>
          </div>
        </div>
      </section>
      <section className="py-12 bg-surface-container-low border-y border-surface-variant/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-8 opacity-70">
            Trusted by creators across
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-2 font-headline font-bold text-xl">
              <span className="material-symbols-outlined text-2xl">
                photo_camera
              </span>{" "}
              Instagram
            </div>
            <div className="flex items-center gap-2 font-headline font-bold text-xl">
              <span className="material-symbols-outlined text-2xl">
                music_note
              </span>{" "}
              TikTok
            </div>
            <div className="flex items-center gap-2 font-headline font-bold text-xl">
              <span className="material-symbols-outlined text-2xl">
                flutter_dash
              </span>{" "}
              Twitter
            </div>
            <div className="flex items-center gap-2 font-headline font-bold text-xl">
              <span className="material-symbols-outlined text-2xl">movie</span>{" "}
              YouTube
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl font-extrabold mb-4">
            Crafted for the Digital Curator
          </h2>
          <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-container-low p-10 rounded-xl relative group hover:bg-surface-container transition-colors duration-300">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary rounded-l-xl"></div>
            <div className="w-14 h-14 bg-surface-container-lowest rounded-xl flex items-center justify-center mb-8 shadow-sm">
              <span className="material-symbols-outlined text-primary text-3xl">
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
          <div className="bg-surface-container-low p-10 rounded-xl relative group hover:bg-surface-container transition-colors duration-300">
            <div className="w-14 h-14 bg-surface-container-lowest rounded-xl flex items-center justify-center mb-8 shadow-sm">
              <span className="material-symbols-outlined text-primary text-3xl">
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
          <div className="bg-surface-container-low p-10 rounded-xl relative group hover:bg-surface-container transition-colors duration-300">
            <div className="w-14 h-14 bg-surface-container-lowest rounded-xl flex items-center justify-center mb-8 shadow-sm">
              <span className="material-symbols-outlined text-primary text-3xl">
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
          <div className="w-full md:w-1/2">
            <div className="bg-surface-container-low rounded-3xl p-8 relative">
              <img
                alt="Elegant dashboard showing clean data visualization charts with secondary green growth indicators and indigo accents"
                className="rounded-xl shadow-lg w-full h-auto"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCg1jSLuMCVc6TaFQCGlygspePy35lUZtxhyShDJDAav6xALtSK166JAWvEHYvufAHi2SaheMbkXZX1uBv-uIABVqsXTPv6vrvYvBe09hbtJ8tIDgj5mKZNPPBTc7NtXX5TYpc_ntBeeANO0KFcYgK5A7m2wlB6k3ji4eALe4h7ihfUJdNsP7CoYstmMFyvGMtXHaixRr67dS2bUFXAsbjhwutlalFMJemR4s6qT-TLttKzYdU5aY-7S_yQxJju__YWdCYLBmRm6F8G"
              />
              <div className="absolute -bottom-6 -right-6 bg-surface-bright p-6 rounded-2xl shadow-xl max-w-[240px]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-3 h-3 bg-secondary rounded-full"></span>
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
          <div className="w-full md:w-1/2">
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
              <li className="flex items-center gap-3 font-semibold">
                <span className="material-symbols-outlined text-secondary">
                  check_circle
                </span>
                Individual Link Tracking
              </li>
              <li className="flex items-center gap-3 font-semibold">
                <span className="material-symbols-outlined text-secondary">
                  check_circle
                </span>
                Referrer Attribution
              </li>
              <li className="flex items-center gap-3 font-semibold">
                <span className="material-symbols-outlined text-secondary">
                  check_circle
                </span>
                Exportable Weekly Reports
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto cta-gradient rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-mint-500/20 rounded-full blur-3xl"></div>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white mb-6 relative z-10">
            Ready to take center stage?
          </h2>
          <p className="text-primary-container text-on-primary-container text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10 opacity-90">
            Join 50,000+ creators who trust LinkHub to power their digital
            presence. No credit card required.
          </p>
          <div className="relative z-10">
            <button className="bg-white text-primary px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300">
              Sign Up Now — It&apos;s Free
            </button>
          </div>
        </div>
      </section>
      <footer className="w-full border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 max-w-7xl mx-auto gap-6">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="text-xl font-black text-indigo-900 dark:text-indigo-100 font-headline">
              LinkHub
            </div>
            <p className="font-inter text-sm text-slate-500 dark:text-slate-400">
              © 2024 LinkHub Digital. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-inter text-sm text-slate-500">
            <a
              className="hover:text-indigo-600 hover:underline transition-all opacity-80 hover:opacity-100"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="hover:text-indigo-600 hover:underline transition-all opacity-80 hover:opacity-100"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="hover:text-indigo-600 hover:underline transition-all opacity-80 hover:opacity-100"
              href="#"
            >
              Contact Support
            </a>
          </div>
          <div className="flex items-center gap-6">
            <a
              className="text-slate-500 hover:text-indigo-600 opacity-80 hover:opacity-100 transition-all"
              href="#"
            >
              <span className="material-symbols-outlined">public</span>
            </a>
            <a
              className="text-slate-500 hover:text-indigo-600 opacity-80 hover:opacity-100 transition-all"
              href="#"
            >
              <span className="material-symbols-outlined">share</span>
            </a>
            <a
              className="text-slate-500 hover:text-indigo-600 opacity-80 hover:opacity-100 transition-all"
              href="#"
            >
              <span className="material-symbols-outlined">alternate_email</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
