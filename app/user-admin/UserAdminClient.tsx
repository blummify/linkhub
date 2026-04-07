"use client";

import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { ThemeToggle } from "../ThemeToggle";
import { useSidebar } from "../components/SidebarContext";

export default function UserAdminClient() {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="bg-surface text-on-surface min-h-screen antialiased">
      <CollapsibleSidebar isAdmin={true}>
        <AppHeader isAdmin={true} />
        {/* Main Content Canvas */}
        <main 
          id="mainContent" 
          className={`pt-16 min-h-screen bg-surface-container-low transition-all duration-300 ease-in-out ${
            isCollapsed ? 'ml-0' : 'ml-64'
          }`}
        >
          <div className="max-w-[1280px] mx-auto p-6 md:p-10 grid grid-cols-12 gap-12 lg:gap-20">
            {/* Left Column: System Management */}
            <section className="col-span-12 lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-on-surface tracking-tight">Manage Links</h1>
                  <p className="text-[11px] text-on-surface-variant mt-1">Organize and optimize your digital presence.</p>
                </div>
                <button className="flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2.5 rounded-full font-bold shadow-lg hover:bg-on-secondary-container transition-all text-xs active:scale-95">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add New Link
                </button>
              </div>
              
              {/* Links Cards Container */}
              <div className="space-y-4">
                {/* Link Card 1: Active */}
                <div className="bg-surface-container-lowest rounded-xl p-6 flex gap-6 group relative overflow-hidden transition-all hover:translate-x-1">
                  <div className="w-1 bg-secondary absolute left-0 top-0 h-full rounded-full"></div>
                  <div className="flex flex-col items-center justify-center cursor-grab text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">drag_indicator</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-sm text-on-surface">Official Website</h3>
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
                    <p className="text-xs text-primary font-medium">https://johndoe.design</p>
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
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-sm text-on-surface">Latest Portfolio Drop</h3>
                      <div className="flex items-center gap-3">
                        <button className="text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-primary font-medium">https://behance.net/johndoe/vibe-check</p>
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
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-sm text-on-surface">Instagram Profile</h3>
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
                    <p className="text-xs text-on-surface-variant font-medium italic">https://instagram.com/johndoe</p>
                  </div>
                </div>
              </div>

              {/* Quick Analytics Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-primary font-bold text-xs">Total Views</span>
                    <span className="material-symbols-outlined text-primary text-sm">bar_chart</span>
                  </div>
                  <div className="text-2xl font-black text-primary">12.4K</div>
                  <p className="text-[11px] text-primary/60 mt-1">+2,340 this month</p>
                </div>
                <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-secondary font-bold text-xs">Click Rate</span>
                    <span className="material-symbols-outlined text-secondary text-sm">trending_up</span>
                  </div>
                  <div className="text-2xl font-black text-secondary">68%</div>
                  <p className="text-[11px] text-secondary/60 mt-1">+5% from last week</p>
                </div>
              </div>
            </section>

            {/* Right Column: System Preview */}
            <section className="hidden lg:col-span-5 lg:flex flex-col items-center sticky top-24 h-[calc(100vh-8rem)]">
              <div className="mb-4 flex flex-col items-center text-center">
                <h2 className="text-base font-bold text-on-surface">Live Preview</h2>
                <p className="text-[11px] text-on-surface-variant">Real-time profile updates</p>
              </div>
              
              {/* Profile Preview Container */}
              <div className="relative w-[260px] h-[540px] bg-slate-950 rounded-[3rem] p-2 shadow-[0px_32px_64px_-16px_rgba(31,51,170,0.2)] ring-4 ring-slate-800">
                {/* Modern Pill Notch (Dynamic Island style) */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-slate-950 rounded-full z-20 border border-slate-800/50"></div>
                {/* Screen Content */}
                <div className="w-full h-full bg-[#fbf8ff] rounded-[2.8rem] overflow-hidden relative flex flex-col items-center pt-14 px-5">
                  {/* Profile Header */}
                  <div className="flex flex-col items-center mb-6">
                    <img alt="User Avatar" className="w-16 h-16 rounded-full border-4 border-white shadow-md mb-2 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI57sppD_FLi9ouIh-nc1Tcj4PF6vKEAcZmAdyk0FM0P-SgHL4GDKTwJojpoC4Zdgclz61XTPE4THKrbPyXX4zalYeXTqHkAbKlA85wWL3zAe8gityPPdlDtwuDU0upwunIQPs0M13K-oQ1Tq0ZgfR8cdmGtB_k1Vc8Hdb1TRCamkkRf4oYpPXWTH73M_JuKxNU08-S8VdQevKwYgDZtbUJPtCSxb09pJUEGDjVyW1zafOoKx6JbW26p684_qC_-pO6N_XlrhrrH10"/>
                    <h4 className="font-headline font-extrabold text-base text-indigo-900">Alex Rivers</h4>
                    <p className="text-[11px] text-indigo-700/60 font-medium">@alex_rivers</p>
                  </div>
                  {/* Link Buttons */}
                  <div className="w-full space-y-3">
                    <div className="w-full py-4 px-4 bg-primary text-white text-center rounded-full font-bold text-sm shadow-sm">
                      Official Website
                    </div>
                    <div className="w-full py-4 px-4 bg-primary text-white text-center rounded-full font-bold text-sm shadow-sm">
                      Portfolio Drop
                    </div>
                    <div className="w-full py-4 px-4 bg-surface-container-high text-on-primary-fixed-variant text-center rounded-full font-bold text-sm opacity-60">
                      Instagram Profile
                    </div>
                  </div>
                  {/* Refined Footer: Icons and Logo combined to prevent overlap */}
                  <div className="mt-auto pb-4 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-6">
                      <span className="material-symbols-outlined text-indigo-300">mood</span>
                      <span className="material-symbols-outlined text-indigo-300">share</span>
                      <span className="material-symbols-outlined text-indigo-300">favorite</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-20 grayscale">
                      <span className="text-[9px] font-black tracking-widest uppercase">CreatorHub Profile</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-full shadow-sm text-sm text-on-surface font-medium">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                Autosaving changes
              </div>
            </section>
          </div>
        </main>
      </CollapsibleSidebar>
      <ThemeToggle />
    </div>
  );
}
