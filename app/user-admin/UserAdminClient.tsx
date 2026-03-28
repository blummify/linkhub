"use client";

import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { ThemeToggle } from "../ThemeToggle";

export default function UserAdminClient() {
  return (
    <div className="bg-surface text-on-surface min-h-screen antialiased">
      <CollapsibleSidebar isAdmin={true}>
        <AppHeader isAdmin={true} />
        {/* Main Content Canvas */}
        <main id="mainContent" className="ml-64 pt-16 min-h-screen bg-surface-container-low transition-all duration-300 ease-in-out">
          <div className="max-w-[1400px] mx-auto p-8 grid grid-cols-12 gap-10">
            {/* Left Column: System Management */}
            <section className="col-span-12 lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-on-surface tracking-tight">System Dashboard</h1>
                  <p className="text-sm text-on-surface-variant mt-1">Monitor and manage system operations.</p>
                </div>
                <button className="flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-full font-bold shadow-lg hover:bg-on-secondary-container transition-all active:scale-95">
                  <span className="material-symbols-outlined">add</span>
                  New Action
                </button>
              </div>
              
              {/* System Cards Container */}
              <div className="space-y-4">
                {/* System Card 1: Active Users */}
                <div className="bg-surface-container-lowest rounded-xl p-6 flex gap-6 group relative overflow-hidden transition-all hover:translate-x-1">
                  <div className="w-1 bg-secondary absolute left-0 top-0 h-full rounded-full"></div>
                  <div className="flex flex-col items-center justify-center cursor-grab text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">drag_indicator</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base text-on-surface">Active Users</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[10px] font-bold uppercase tracking-wider">
                          Healthy
                        </div>
                        <button className="text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-primary font-medium">1,284,592 total users</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">trending_up</span> +12% this week
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">person_add</span> 14k new users
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Card 2: Revenue */}
                <div className="bg-surface-container-lowest rounded-xl p-6 flex gap-6 group relative transition-all hover:translate-x-1">
                  <div className="w-1 bg-secondary absolute left-0 top-0 h-full rounded-full"></div>
                  <div className="flex flex-col items-center justify-center cursor-grab text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">drag_indicator</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base text-on-surface">Revenue Tracking</h3>
                      <div className="flex items-center gap-3">
                        <button className="text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-primary font-medium">$492,104 MTD</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">trending_up</span> +8.4% growth
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Card 3: Support Tickets */}
                <div className="bg-surface-container-lowest/60 rounded-xl p-6 flex gap-6 group relative transition-all opacity-80">
                  <div className="flex flex-col items-center justify-center cursor-grab text-on-surface-variant">
                    <span className="material-symbols-outlined">drag_indicator</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base text-on-surface">Support Tickets</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[10px] font-bold uppercase tracking-wider">
                          2 Critical
                        </div>
                        <button className="text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-on-surface-variant font-medium italic">Requires immediate attention</p>
                  </div>
                </div>
              </div>

              {/* Bento-style System Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-primary font-bold text-sm">System Health</span>
                    <span className="material-symbols-outlined text-primary">health_and_safety</span>
                  </div>
                  <div className="text-3xl font-black text-primary">98.5%</div>
                  <p className="text-xs text-primary/60 mt-1">All systems operational</p>
                </div>
                <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-secondary font-bold text-sm">Response Time</span>
                    <span className="material-symbols-outlined text-secondary">speed</span>
                  </div>
                  <div className="text-3xl font-black text-secondary">124ms</div>
                  <p className="text-xs text-secondary/60 mt-1">Average API response</p>
                </div>
              </div>
            </section>

            {/* Right Column: System Preview */}
            <section className="hidden lg:col-span-5 lg:flex flex-col items-center sticky top-24 h-[calc(100vh-8rem)]">
              <div className="mb-6 flex flex-col items-center text-center">
                <h2 className="text-xl font-bold text-on-surface">System Monitor</h2>
                <p className="text-sm text-on-surface-variant">Real-time platform status</p>
              </div>
              
              {/* System Monitor Container */}
              <div className="relative w-[320px] h-[640px] bg-slate-900 rounded-[3rem] p-3 shadow-[0px_24px_48px_-12px_rgba(31,51,170,0.15)] ring-8 ring-slate-800">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
                {/* Screen Content */}
                <div className="w-full h-full bg-[#fbf8ff] rounded-[2.2rem] overflow-hidden relative flex flex-col items-center pt-12 px-6">
                  {/* Monitor Brand Header */}
                  <div className="flex flex-col items-center mb-8">
                    <img alt="System Avatar" className="w-20 h-20 rounded-full border-4 border-white shadow-md mb-3 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8PV1a5zfbX73bbRqzJypB7HsbOVvoXAlgrivaqEbVw-GSyxTJTPiMcvW_-fiVLOLF82tcrZVICMkoiWVTwDSQ3ueofrcKuCSR00LBPfukudxY3pn5nxuX8taKo-ZygRDzvxHg8TCWhhcuHHvASXIMPfkxI7BuCC9Qe-QVEt4s9xvSBqxuoBConrbFuP3-gX_LuD64zBjFcerDXdTnTDzhyjFdXOQeH3Pl8YKbp4Q89ymvmgYLVWKIlmB6hrkB3cBjMZ9JtJphc1_n"/>
                    <h4 className="font-headline font-extrabold text-xl text-indigo-900">Admin Hub</h4>
                    <p className="text-sm text-indigo-700/60 font-medium">System Control Panel</p>
                  </div>
                  {/* Monitor Stats */}
                  <div className="w-full space-y-3">
                    <div className="w-full py-4 px-4 bg-primary text-white text-center rounded-full font-bold text-sm shadow-sm">
                      Users: 1.28M Active
                    </div>
                    <div className="w-full py-4 px-4 bg-primary text-white text-center rounded-full font-bold text-sm shadow-sm">
                      Revenue: $492K MTD
                    </div>
                    <div className="w-full py-4 px-4 bg-surface-container-high text-on-primary-fixed-variant text-center rounded-full font-bold text-sm">
                      Health: 98.5% Optimal
                    </div>
                  </div>
                  {/* Monitor Footer */}
                  <div className="mt-auto pb-8 flex items-center gap-4">
                    <span className="material-symbols-outlined text-indigo-300">settings</span>
                    <span className="material-symbols-outlined text-indigo-300">notifications</span>
                    <span className="material-symbols-outlined text-indigo-300">security</span>
                  </div>
                  {/* Logo Overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-20 grayscale">
                    <span className="text-[10px] font-black tracking-widest uppercase">Curator Studio</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-full shadow-sm text-sm text-on-surface font-medium">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                Live system monitoring
              </div>
            </section>
          </div>
        </main>
      </CollapsibleSidebar>
      <ThemeToggle />
    </div>
  );
}
