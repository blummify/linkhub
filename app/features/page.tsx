import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features",
};

export default function FeaturesPage() {
  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-surface-variant/20">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 font-headline tracking-tight hover:scale-105 transition-transform"
          >
            LinkHub
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
            <button className="px-5 py-2 text-primary font-semibold hover:bg-indigo-50/50 transition-all scale-100 hover:scale-105 active:scale-95 duration-200">
              Login
            </button>
            <button className="cta-gradient px-6 py-2.5 text-white rounded-full font-bold shadow-lg hover:shadow-primary/30 hover:opacity-95 transition-all hover:scale-105 active:scale-95 duration-200">
              Sign Up
            </button>
          </div>
        </div>
      </nav>
      <main className="pt-32 pb-24">
        <header className="max-w-7xl mx-auto px-6 mb-24 text-center">
          <h1 className="font-headline font-extrabold text-5xl md:text-7xl text-on-surface tracking-tight leading-tight mb-6">
            The Stage for Your <br /> <span className="text-primary">Digital</span>{" "}
            Presence
          </h1>
          <p className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto">
            Move beyond the grid. Experience an editorial-grade link management
            system designed for visionaries who treat their online identity as a
            gallery.
          </p>
        </header>
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-surface-container-low rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-between min-h-[500px]">
            <div className="z-10 max-w-md">
              <span className="font-label text-xs uppercase tracking-widest text-primary font-bold mb-4 block">
                Centralized Control
              </span>
              <h2 className="font-headline font-bold text-3xl mb-4">
                Sleek Link Management
              </h2>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                Drag, drop, and curate your links with precision. Our editor
                feels like a high-end CMS, not just a list of buttons.
              </p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-6 ml-auto w-full md:w-3/4 transform translate-y-4 md:translate-y-8 translate-x-4">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-surface-container-low rounded-xl border-l-4 border-secondary">
                  <span className="material-symbols-outlined mr-3 text-primary">
                    drag_indicator
                  </span>
                  <div className="flex-grow">
                    <div className="font-headline font-bold text-sm">
                      Latest Portfolio 2024
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      behance.net/curator
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline">
                    toggle_on
                  </span>
                </div>
                <div className="flex items-center p-4 bg-surface rounded-xl">
                  <span className="material-symbols-outlined mr-3 text-outline">
                    drag_indicator
                  </span>
                  <div className="flex-grow">
                    <div className="font-headline font-bold text-sm">
                      Monthly Newsletter
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      substack.com/the-vision
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline">
                    toggle_on
                  </span>
                </div>
                <div className="flex items-center p-4 bg-surface rounded-xl opacity-60">
                  <span className="material-symbols-outlined mr-3 text-outline">
                    drag_indicator
                  </span>
                  <div className="flex-grow">
                    <div className="font-headline font-bold text-sm">
                      Merch Store
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      shop.curator.com
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline">
                    toggle_off
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 bg-surface-container-high rounded-3xl p-8 flex flex-col">
            <span className="font-label text-xs uppercase tracking-widest text-primary font-bold mb-4 block">
              Visual Identity
            </span>
            <h2 className="font-headline font-bold text-2xl mb-4">
              Custom Branding
            </h2>
            <p className="text-on-surface-variant text-sm mb-8">
              Define your palette. Choose fonts that speak your language. No
              more generic templates.
            </p>
            <div className="mt-auto space-y-6 bg-surface-container-lowest p-6 rounded-2xl">
              <div className="space-y-2">
                <label className="font-label text-xs font-semibold text-on-surface-variant">
                  Primary Accent
                </label>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary ring-2 ring-offset-2 ring-primary"></div>
                  <div className="w-8 h-8 rounded-full bg-secondary"></div>
                  <div className="w-8 h-8 rounded-full bg-tertiary"></div>
                  <div className="w-8 h-8 rounded-full bg-slate-900"></div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label text-xs font-semibold text-on-surface-variant">
                  Typography
                </label>
                <div className="p-3 bg-surface-container-low rounded-lg font-headline font-bold text-sm flex justify-between items-center">
                  Manrope Bold
                  <span className="material-symbols-outlined text-xs">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-5 bg-surface-container-low rounded-3xl p-8 flex flex-col">
            <span className="font-label text-xs uppercase tracking-widest text-primary font-bold mb-4 block">
              Intelligence
            </span>
            <h2 className="font-headline font-bold text-2xl mb-4">
              Real-time Insights
            </h2>
            <div className="flex-grow flex items-end space-x-2 mt-8 h-40">
              <div className="flex-1 bg-secondary opacity-20 rounded-t-lg h-[40%]"></div>
              <div className="flex-1 bg-secondary opacity-40 rounded-t-lg h-[60%]"></div>
              <div className="flex-1 bg-secondary opacity-60 rounded-t-lg h-[80%]"></div>
              <div className="flex-1 bg-secondary rounded-t-lg h-[50%]"></div>
              <div className="flex-1 bg-secondary opacity-30 rounded-t-lg h-[90%]"></div>
              <div className="flex-1 bg-secondary opacity-50 rounded-t-lg h-[70%]"></div>
              <div className="flex-1 bg-secondary opacity-80 rounded-t-lg h-[100%]"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-surface-container-lowest p-4 rounded-xl">
                <div className="text-xs text-on-surface-variant mb-1">
                  Total Clicks
                </div>
                <div className="font-headline font-bold text-xl">12.4k</div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl">
                <div className="text-xs text-on-surface-variant mb-1">
                  Growth
                </div>
                <div className="font-headline font-bold text-xl text-secondary">
                  +24%
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-7 bg-surface-container-highest rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row">
            <div className="flex-1 z-10">
              <span className="font-label text-xs uppercase tracking-widest text-primary font-bold mb-4 block">
                Omnichannel
              </span>
              <h2 className="font-headline font-bold text-2xl mb-4">
                Bio-Link Previews
              </h2>
              <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">
                What your fans see is as important as what you link. Perfectly
                responsive, lightning fast, and stunningly modern.
              </p>
            </div>
            <div className="flex-1 mt-8 md:mt-0 flex justify-center md:justify-end gap-4 relative">
              <div className="w-48 h-80 bg-surface rounded-[2rem] border-[6px] border-on-background shadow-2xl p-4 overflow-hidden transform rotate-2">
                <div
                  className="w-12 h-12 rounded-full bg-slate-200 mx-auto mb-4"
                  data-alt="portrait of a creative professional woman with soft lighting and neutral studio background"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA3MGL4QJYKY1nIZJoMgBY2mlexODKotCBzJb-RsnJnMPLklWjPtKAh21TAMHNZFj7xX22ypEYlwn8EoOd6fd7a3rLg_sZcNBXLg-bXYLVIzvyFC-Tgnr46xfaaDbv3fLLyF2O9HHXMRRs7or5Dq6qCRs3FziWUCJa_9x6k3tdKBGbs8jmubRWwsM_fO2_50JTBOk5HvUEYNywnJ_YX3IJbSLuhRW31HcimdQ7CI_0O026pPgaOXHdOv-zzqapp0uvSdX6tko7b2cfU')",
                    backgroundSize: "cover",
                  }}
                ></div>
                <div className="h-2 w-20 bg-slate-200 mx-auto mb-1 rounded-full"></div>
                <div className="h-1 w-12 bg-slate-100 mx-auto mb-6 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 w-full bg-primary-container/10 rounded-lg"></div>
                  <div className="h-6 w-full bg-primary-container/10 rounded-lg"></div>
                  <div className="h-6 w-full bg-primary-container/10 rounded-lg"></div>
                </div>
              </div>
              <div className="hidden lg:block w-48 h-80 bg-surface rounded-[2rem] border-[6px] border-on-background/10 shadow-xl p-4 overflow-hidden transform translate-y-12 -rotate-3 opacity-50">
                <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto mb-4"></div>
                <div className="space-y-2">
                  <div className="h-6 w-full bg-slate-50 rounded-lg"></div>
                  <div className="h-6 w-full bg-slate-50 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-6 mt-32">
          <div className="bg-inverse-surface rounded-[3rem] p-12 md:p-24 text-center text-inverse-on-surface overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <h2 className="font-headline font-extrabold text-4xl md:text-5xl mb-8 leading-tight">
                Ready to elevate <br />
                your digital stage?
              </h2>
              <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                <button className="w-full md:w-auto bg-primary text-on-primary px-10 py-4 rounded-full font-headline font-bold text-lg hover:bg-primary-container transition-all active:scale-95">
                  Get Started Free
                </button>
                <button className="w-full md:w-auto bg-surface/10 backdrop-blur-md text-white px-10 py-4 rounded-full font-headline font-bold text-lg hover:bg-white/20 transition-all active:scale-95">
                  Book a Demo
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-slate-50 border-t border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto px-6 py-12">
          <div>
            <div className="text-lg font-bold text-slate-900 mb-4">
              LinkHub
            </div>
            <p className="font-inter text-sm text-slate-500">
              © 2024 LinkHub. The Digital Curator.
            </p>
          </div>
          <div>
            <h4 className="font-inter text-xs uppercase tracking-widest text-slate-900 font-bold mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  className="font-inter text-sm text-slate-500 hover:text-indigo-500 transition-opacity"
                  href="#"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  className="font-inter text-sm text-slate-500 hover:text-indigo-500 transition-opacity"
                  href="#"
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-inter text-xs uppercase tracking-widest text-slate-900 font-bold mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  className="font-inter text-sm text-slate-500 hover:text-indigo-500 transition-opacity"
                  href="#"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  className="font-inter text-sm text-slate-500 hover:text-indigo-500 transition-opacity"
                  href="#"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-inter text-xs uppercase tracking-widest text-slate-900 font-bold mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  className="font-inter text-sm text-slate-500 hover:text-indigo-500 transition-opacity"
                  href="#"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
