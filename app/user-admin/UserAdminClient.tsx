"use client";

import { useState } from "react";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { ThemeToggle } from "../ThemeToggle";
import { useSidebar } from "../components/SidebarContext";

export default function UserAdminClient() {
  const { isCollapsed } = useSidebar();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("linktr.ee/blummify");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
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
              {/* Top URL Bar & Controls - Now positioned above mobile preview */}
              <div className="flex items-center gap-3 w-full mb-8 animate-fade-in-up">
                <div 
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 bg-white border border-slate-200 rounded-full py-2.5 px-6 flex items-center justify-between shadow-sm cursor-pointer hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">link</span>
                    <span className="text-[11px] font-semibold text-slate-600 truncate">linktr.ee/blummify</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-primary transition-colors">ios_share</span>
                </div>
                <button className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-slate-600">tune</span>
                </button>
              </div>

              <div className="mb-4 flex flex-col items-center text-center">
                <h2 className="text-base font-bold text-on-surface">Live Preview</h2>
                <p className="text-[11px] text-on-surface-variant">Real-time profile updates</p>
              </div>
              
              {/* Profile Preview Container */}
              <div className="relative w-[260px] h-[540px] bg-slate-950 rounded-[3rem] p-2 shadow-[0px_32px_64px_-16px_rgba(31,51,170,0.2)] ring-4 ring-slate-800">
                {/* Modern Pill Notch (Dynamic Island style) */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-slate-950 rounded-full z-20 border border-slate-800/50"></div>
                {/* Screen Content */}
                {/* Screen Content Container */}
                <div className="w-full h-full bg-[#fbf8ff] rounded-[2.8rem] overflow-hidden relative flex flex-col pt-14 px-4 pb-6">
                  {/* Scrollable List Area */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-1 scrollbar-hide">
                    {/* Refined Branded Header (Clean Logo Card) */}
                    <div className="w-full bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 flex flex-col items-center mb-6">
                      <div className="w-20 h-20 bg-secondary/5 rounded-2xl flex items-center justify-center mb-4 border border-secondary/10">
                        <span className="material-symbols-outlined text-secondary text-4xl font-light">eco</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold tracking-tight text-slate-800">blummify</span>
                      </div>
                    </div>
                    
                    {/* WhatsApp Text Link */}
                    <div className="w-full mb-6 px-2 flex items-center justify-between">
                      <div className="w-6"></div>
                      <p className="text-[13px] text-slate-700 font-semibold">WhatsApp</p>
                      <span className="material-symbols-outlined text-sm text-slate-300">more_vert</span>
                    </div>

                    {/* Refined Rectangular Link Cards with Blue Accents (Smaller Size) */}
                    <div className="w-full space-y-3">
                      <div className="w-full py-2.5 px-4 bg-white border border-slate-100 border-l-4 border-l-primary text-primary flex items-center justify-between rounded-xl shadow-sm group cursor-pointer hover:bg-slate-50 transition-all">
                        <div className="w-6"></div> 
                        <span className="font-bold text-[13px] tracking-tight">Official Website</span>
                        <span className="material-symbols-outlined text-sm text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">more_vert</span>
                      </div>
                      
                      <div className="w-full py-2.5 px-4 bg-white border border-slate-100 border-l-4 border-l-primary text-primary flex items-center justify-between rounded-xl shadow-sm group cursor-pointer hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary/5 rounded flex items-center justify-center">
                            <span className="material-symbols-outlined text-xs">grid_view</span>
                          </div>
                        </div>
                        <span className="font-bold text-[13px] tracking-tight">Portfolio Drop</span>
                        <span className="material-symbols-outlined text-sm text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">more_vert</span>
                      </div>

                      <div className="w-full py-2.5 px-4 bg-white border border-slate-100 border-l-4 border-l-slate-200 text-slate-600 flex items-center justify-between rounded-xl shadow-sm group cursor-pointer hover:bg-slate-50 transition-all">
                        <div className="w-6"></div>
                        <span className="font-bold text-[13px] tracking-tight opacity-70">Instagram Profile</span>
                        <span className="material-symbols-outlined text-sm text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">more_vert</span>
                      </div>

                      {/* Mock additional links for scroll testing */}
                      <div className="w-full py-2.5 px-4 bg-white border border-slate-100 border-l-4 border-l-slate-200 text-slate-600 flex items-center justify-between rounded-xl shadow-sm group cursor-pointer hover:bg-slate-50 transition-all">
                        <div className="w-6"></div>
                        <span className="font-bold text-[13px] tracking-tight opacity-70">Coming Soon</span>
                        <span className="material-symbols-outlined text-sm text-slate-200">more_vert</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fixed Footer at the bottom */}
                  <div className="pt-4 flex flex-col items-center gap-4 bg-[#fbf8ff] border-t border-slate-100/50">
                    <button className="w-auto bg-white text-slate-900 py-1.5 px-3 rounded-full font-bold text-[10px] shadow-sm hover:scale-[1.02] transition-transform active:scale-95 border border-slate-200/50">
                      Join blummify on Linktree
                    </button>
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 font-medium">
                      <span>Report</span>
                      <span className="opacity-50">·</span>
                      <span>Privacy</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-full shadow-sm text-sm text-on-surface font-medium">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                Autosaving changes
              </div>
            </section>
          </div> {/* End of grid */}
        </main>

        {/* Share Modal Overlay */}
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowShareModal(false)}
            ></div>
            
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Share</h3>
                <div className="flex items-center gap-3">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined text-[22px]">settings</span>
                  </button>
                  <button 
                    onClick={() => setShowShareModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[22px]">close</span>
                  </button>
                </div>
              </div>

              {/* URL Section */}
              <div className="px-8 mb-6">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-3">
                  <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
                  </div>
                  <span className="flex-1 text-sm font-semibold text-slate-600 truncate">linktr.ee/blummify</span>
                  <button 
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-secondary text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* QR Code Card */}
              <div className="px-8 mb-8">
                <div className="relative bg-slate-50 border border-slate-100 rounded-3xl p-8 flex flex-col items-center">
                  <button className="absolute top-4 right-4 text-slate-300 hover:text-slate-500">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                  <div className="w-32 h-32 bg-white p-3 rounded-2xl shadow-sm mb-6 border border-purple-100">
                    <img alt="QR Code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://blummify.com" className="w-full h-full" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 text-center mb-1">Add link to Instagram bio</p>
                  <p className="text-[11px] text-slate-400 font-medium text-center">Scan with your phone</p>
                </div>
              </div>

              {/* Social Platforms */}
              <div className="px-8 mb-8">
                <p className="text-[13px] font-bold text-slate-900 mb-4 px-1">My platforms</p>
                <div className="flex items-center gap-6 px-1">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-lg">photo_camera</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Instagram</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-lg">music_note</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">TikTok</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white">
                      <span className="font-bold text-lg italic">X</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">X</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="px-6 py-6 bg-slate-50 border-t border-slate-100 flex items-center gap-4 overflow-x-auto scrollbar-hide">
                <div className="flex flex-col items-center gap-2 min-w-[60px]">
                  <div className="w-11 h-11 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">hub</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">My Linktree</span>
                </div>
                <div className="flex flex-col items-center gap-2 min-w-[60px]">
                  <div className="w-11 h-11 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">qr_code</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500">QR Code</span>
                </div>
                <div className="flex flex-col items-center gap-2 min-w-[60px] relative">
                  <div className="w-11 h-11 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">style</span>
                  </div>
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full ring-2 ring-white">New</span>
                  <span className="text-[9px] font-bold text-slate-500">Digital card</span>
                </div>
                <div className="flex flex-col items-center gap-2 min-w-[60px]">
                  <div className="w-11 h-11 bg-red-600 rounded-full flex items-center justify-center text-white shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500">YouTube</span>
                </div>
                <div className="flex flex-col items-center gap-2 min-w-[60px]">
                  <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm">
                    <span className="font-bold text-lg">f</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500">Facebook</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CollapsibleSidebar>
      <ThemeToggle />
    </div>
  );
}
