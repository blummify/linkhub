"use client";

import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { ThemeToggle } from "../ThemeToggle";

export default function UserAnalyticsClient() {
  return (
    <div className="bg-surface text-on-surface min-h-screen antialiased">
      <CollapsibleSidebar isAdmin={false}>
        <AppHeader isAdmin={false} />
        {/* Main Content Canvas */}
        <main id="mainContent" className="ml-64 pt-16 min-h-screen bg-surface-container-low transition-all duration-300 ease-in-out">
          <div className="max-w-[1400px] mx-auto p-8 grid grid-cols-12 gap-10">
            {/* Left Column: Link Management */}
            <section className="col-span-12 lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Your Links</h1>
                  <p className="text-sm text-on-surface-variant mt-1">Manage and organize your digital presence.</p>
                </div>
                <button className="flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-full font-bold shadow-lg hover:bg-on-secondary-container transition-all active:scale-95">
                  <span className="material-symbols-outlined">add</span>
                  Add New Link
                </button>
              </div>
              
              {/* Link Cards Container */}
              <div className="space-y-4">
                {/* Link Card 1: Active */}
                <div className="bg-surface-container-lowest rounded-xl p-6 flex gap-6 group relative overflow-hidden transition-all hover:translate-x-1">
                  <div className="w-1 bg-secondary absolute left-0 top-0 h-full rounded-full"></div>
                  <div className="flex flex-col items-center justify-center cursor-grab text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">drag_indicator</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base text-on-surface">Official Website</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[10px] font-bold uppercase tracking-wider">
                          Active
                        </div>
                        <button className="text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-primary font-medium">https://johndoe.design</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">visibility</span> 1,240 clicks
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">trending_up</span> +12% this week
                      </span>
                    </div>
                  </div>
                </div>

                {/* Link Card 2 */}
                <div className="bg-surface-container-lowest rounded-xl p-6 flex gap-6 group relative transition-all hover:translate-x-1">
                  <div className="w-1 bg-secondary absolute left-0 top-0 h-full rounded-full"></div>
                  <div className="flex flex-col items-center justify-center cursor-grab text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">drag_indicator</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-on-surface">Latest Portfolio Drop</h3>
                      <div className="flex items-center gap-3">
                        <button className="text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-primary font-medium">https://behance.net/johndoe/vibe-check</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">visibility</span> 856 clicks
                      </span>
                    </div>
                  </div>
                </div>

                {/* Link Card 3: Draft */}
                <div className="bg-surface-container-lowest/60 rounded-xl p-6 flex gap-6 group relative transition-all opacity-80">
                  <div className="flex flex-col items-center justify-center cursor-grab text-on-surface-variant">
                    <span className="material-symbols-outlined">drag_indicator</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-on-surface">Instagram Profile</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[10px] font-bold uppercase tracking-wider">
                          Draft
                        </div>
                        <button className="text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-on-surface-variant font-medium italic">https://instagram.com/johndoe</p>
                  </div>
                </div>
              </div>

              {/* Bento-style Analytics Quick View */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-primary font-bold text-sm">Total Views</span>
                    <span className="material-symbols-outlined text-primary">bar_chart</span>
                  </div>
                  <div className="text-3xl font-black text-primary">24.8K</div>
                  <p className="text-xs text-primary/60 mt-1">Across all active links</p>
                </div>
                <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-secondary font-bold text-sm">Click-thru Rate</span>
                    <span className="material-symbols-outlined text-secondary">ads_click</span>
                  </div>
                  <div className="text-3xl font-black text-secondary">6.4%</div>
                  <p className="text-xs text-secondary/60 mt-1">+2.1% from last month</p>
                </div>
              </div>
            </section>

            {/* Right Column: Live Preview */}
            <section className="hidden lg:col-span-5 lg:flex flex-col items-center sticky top-24 h-[calc(100vh-8rem)]">
              <div className="mb-6 flex flex-col items-center text-center">
                <h2 className="text-xl font-bold text-on-surface">Live Preview</h2>
                <p className="text-sm text-on-surface-variant">Changes update in real-time</p>
              </div>
              
              {/* Smartphone Container */}
              <div className="relative w-[320px] h-[640px] bg-slate-900 rounded-[3rem] p-3 shadow-[0px_24px_48px_-12px_rgba(31,51,170,0.15)] ring-8 ring-slate-800">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
                {/* Screen Content */}
                <div className="w-full h-full bg-[#fbf8ff] rounded-[2.2rem] overflow-hidden relative flex flex-col items-center pt-12 px-6">
                  {/* Preview Brand Header */}
                  <div className="flex flex-col items-center mb-8">
                    <img alt="Preview Avatar" className="w-20 h-20 rounded-full border-4 border-white shadow-md mb-3 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATuI7dHSheXcXpjptSvTlMhGMS8m6NVlM7E87d75L4uCg3L28S2GqK1oK0g18TEXpnsIg4vJhxL2XwUux6eif4jqyXuX0TNk597tJynNXypGyrAPKpllYQ4HNoOXD16bdVTzhiTp_wWsV8fZfJ2T9wMqsOgVMjSAcGEkI80Ru7y8Pt-FDD87fFqidmLv-2rAb_om2tOV8m3FQE46fuFYv3CAhqJmGoWkhp9Sl_d2kgMAfMgbYHbBgip9ZcwjSQXfKGekhC_k3_CE6d"/>
                    <h4 className="font-headline font-extrabold text-xl text-indigo-900">John Doe</h4>
                    <p className="text-sm text-indigo-700/60 font-medium">Digital Architect & Curator</p>
                  </div>
                  {/* Preview Links */}
                  <div className="w-full space-y-3">
                    <div className="w-full py-4 px-4 bg-primary text-white text-center rounded-full font-bold text-sm shadow-sm">
                      Official Website
                    </div>
                    <div className="w-full py-4 px-4 bg-primary text-white text-center rounded-full font-bold text-sm shadow-sm">
                      Latest Portfolio Drop
                    </div>
                    <div className="w-full py-4 px-4 bg-surface-container-high text-on-primary-fixed-variant text-center rounded-full font-bold text-sm">
                      Newsletter Signup
                    </div>
                  </div>
                  {/* Preview Footer */}
                  <div className="mt-auto pb-8 flex items-center gap-4">
                    <span className="material-symbols-outlined text-indigo-300">share</span>
                    <span className="material-symbols-outlined text-indigo-300">mail</span>
                    <span className="material-symbols-outlined text-indigo-300">language</span>
                  </div>
                  {/* Logo Overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-20 grayscale">
                    <span className="text-[10px] font-black tracking-widest uppercase">Curator Studio</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-full shadow-sm text-sm text-on-surface font-medium">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                Syncing with live profile
              </div>
            </section>
          </div>
        </main>
      </CollapsibleSidebar>
      <ThemeToggle />
    </div>
  );
}
