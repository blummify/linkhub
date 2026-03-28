"use client";

import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { ThemeToggle } from "../ThemeToggle";

export default function LinksClient() {
  return (
    <div className="bg-surface text-on-surface min-h-screen antialiased">
      <CollapsibleSidebar isAdmin={false}>
        <AppHeader isAdmin={false} />
        {/* Main Content Canvas */}
        <main id="mainContent" className="ml-64 pt-16 min-h-screen bg-surface-container-low transition-all duration-300 ease-in-out">
          <div className="max-w-[1400px] mx-auto p-8 grid grid-cols-12 gap-10">
            {/* Links Management Section */}
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
                      <h3 className="font-semibold text-base text-on-surface">Latest Portfolio Drop</h3>
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
                      <h3 className="font-semibold text-base text-on-surface">Instagram Profile</h3>
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

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-primary font-bold text-sm">Total Views</span>
                    <span className="material-symbols-outlined text-primary">bar_chart</span>
                  </div>
                  <p className="text-2xl font-black text-on-surface">12.4K</p>
                  <p className="text-xs text-on-surface-variant mt-1">+2,340 this month</p>
                </div>
                <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-secondary font-bold text-sm">Click Rate</span>
                    <span className="material-symbols-outlined text-secondary">trending_up</span>
                  </div>
                  <p className="text-2xl font-black text-on-surface">68%</p>
                  <p className="text-xs text-on-surface-variant mt-1">+5% from last week</p>
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
