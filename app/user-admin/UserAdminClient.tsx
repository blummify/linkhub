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
    <div className="bg-[#f8f9fc] text-slate-900 min-h-screen antialiased font-sans">
      <CollapsibleSidebar isAdmin={true}>
        <AppHeader isAdmin={true} />
        
        {/* Main Content Canvas */}
        <main 
          id="mainContent" 
          className={`pt-16 min-h-screen transition-all duration-500 ease-in-out ${
            isCollapsed ? 'ml-0' : 'ml-64'
          }`}
        >
          {/* Horizontal Sub-Navigation (Tabs) */}
          <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-10">
            <div className={`max-w-[1280px] mx-auto flex items-center gap-8 ${isCollapsed ? 'justify-center' : ''} transition-all duration-500`}>
              <button className="py-4 text-[13px] font-bold text-primary border-b-2 border-primary -mb-px transition-colors">Links</button>
              <button className="py-4 text-[13px] font-medium text-slate-400 hover:text-slate-600 transition-colors">Appearance</button>
              <button className="py-4 text-[13px] font-medium text-slate-400 hover:text-slate-600 transition-colors">Analytics</button>
              <button className="py-4 text-[13px] font-medium text-slate-400 hover:text-slate-600 transition-colors">Settings</button>
            </div>
          </div>

          <div className={`max-w-[1280px] mx-auto p-6 md:p-10 grid grid-cols-12 gap-12 lg:gap-16 ${isCollapsed ? 'px-12 md:px-20' : ''} transition-all duration-500`}>
            
            {/* Left Column: Link Management */}
            <section className="col-span-12 lg:col-span-7 space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Links</h1>
                  <p className="text-[13px] text-slate-400 font-medium mt-1">Organize and optimize your digital presence.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#006b4d] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-emerald-900/10 hover:bg-[#005a41] transition-all text-[13px] active:scale-95">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Add New Link
                </button>
              </div>
              
              {/* Links Cards Container */}
              <div className="space-y-4">
                {/* Link Card 1: Active */}
                <div className="bg-white rounded-[2rem] p-6 flex items-center gap-6 group relative shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)] border-l-[6px] border-l-emerald-500">
                  <div className="flex flex-col items-center justify-center cursor-grab text-slate-300 hover:text-slate-400 transition-colors">
                    <span className="material-symbols-outlined text-[24px]">drag_indicator</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-4">
                        <h3 className="font-bold text-base text-slate-800 truncate">Official Website</h3>
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-wider">Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary rounded-full transition-all">
                          <span className="material-symbols-outlined text-[20px]">edit_note</span>
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-all">
                          <span className="material-symbols-outlined text-[20px]">delete_outline</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[13px] text-primary font-bold hover:underline cursor-pointer mb-4">https://johndoe.design</p>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">visibility</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-800">1,240 clicks</span>
                          <span className="text-[9px] font-bold text-emerald-500">+12% this week</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                          <span className="material-symbols-outlined text-[18px]">trending_up</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Trend Rate</span>
                          <span className="text-[10px] font-black text-slate-800">High Growth</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Link Card 2 */}
                <div className="bg-white rounded-[2rem] p-6 flex items-center gap-6 group relative shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)] border-l-[6px] border-l-emerald-500">
                  <div className="flex flex-col items-center justify-center cursor-grab text-slate-300 transition-colors">
                    <span className="material-symbols-outlined text-[24px]">drag_indicator</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-bold text-base text-slate-800">Latest Portfolio Drop</h3>
                      <div className="flex items-center gap-2">
                        <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-full">
                          <span className="material-symbols-outlined text-[20px]">edit_note</span>
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:bg-red-50 rounded-full">
                          <span className="material-symbols-outlined text-[20px]">delete_outline</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[13px] text-primary font-bold mb-4">https://behance.net/johndoe/vibe-check</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">visibility</span>
                      </div>
                      <span className="text-[11px] font-black text-slate-800">856 clicks</span>
                    </div>
                  </div>
                </div>

                {/* Link Card 3: Draft */}
                <div className="bg-slate-50/50 rounded-[2rem] p-6 flex items-center gap-6 group relative border border-slate-100/50 transition-all border-l-[6px] border-l-slate-300 opacity-70">
                  <div className="flex flex-col items-center justify-center text-slate-200">
                    <span className="material-symbols-outlined text-[24px]">drag_indicator</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-4">
                        <h3 className="font-bold text-base text-slate-500">Instagram Profile</h3>
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-wider">Draft</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-full">
                          <span className="material-symbols-outlined text-[20px]">edit_note</span>
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:bg-red-50 rounded-full">
                          <span className="material-symbols-outlined text-[20px]">delete_outline</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[13px] text-slate-400 font-medium italic">https://instagram.com/johndoe</p>
                  </div>
                </div>
              </div>

              {/* Redesigned Analytics Section */}
              <div className="grid grid-cols-2 gap-6 pt-10">
                <div className="bg-blue-50/40 rounded-[2.5rem] p-8 border border-blue-100/50 flex flex-col items-start shadow-sm transition-all hover:bg-blue-50">
                  <div className="flex items-center justify-between w-full mb-6">
                    <p className="text-[13px] font-black text-blue-600 uppercase tracking-tight">Total Views</p>
                    <span className="material-symbols-outlined text-blue-600 text-[24px]">bar_chart</span>
                  </div>
                  <div className="text-4xl font-black text-blue-900 tracking-tighter mb-2">12.4K</div>
                  <p className="text-[11px] font-bold text-blue-500/70">+2,340 this month</p>
                </div>
                
                <div className="bg-emerald-50/40 rounded-[2.5rem] p-8 border border-emerald-100/50 flex flex-col items-start shadow-sm transition-all hover:bg-emerald-50">
                  <div className="flex items-center justify-between w-full mb-6">
                    <p className="text-[13px] font-black text-emerald-600 uppercase tracking-tight">Click Rate</p>
                    <span className="material-symbols-outlined text-emerald-600 text-[24px]">trending_up</span>
                  </div>
                  <div className="text-4xl font-black text-emerald-900 tracking-tighter mb-2">68%</div>
                  <p className="text-[11px] font-bold text-emerald-500/70">+5% from last week</p>
                </div>
              </div>
            </section>

            {/* Right Column: Preview Wrapper */}
            <section className="hidden lg:col-span-5 lg:flex flex-col items-center sticky top-40 h-[calc(100vh-12rem)]">
              {/* Share Bar & Controls - Compact Mockup Style */}
              <div className="flex items-center gap-3 w-full max-w-[320px] mb-10">
                <div 
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 bg-white border border-slate-100 rounded-full py-3 px-6 flex items-center justify-between shadow-lg shadow-slate-200/20 cursor-pointer hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="material-symbols-outlined text-[18px] text-slate-300">link</span>
                    <span className="text-[11px] font-bold text-slate-600 truncate">linktr.ee/blummify</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-primary transition-colors">ios_share</span>
                </div>
                <button className="w-11 h-11 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200/20 hover:bg-slate-50 transition-all active:scale-95">
                  <span className="material-symbols-outlined text-[20px] text-slate-600">tune</span>
                </button>
              </div>

              <div className="mb-4 flex flex-col items-center text-center">
                <h2 className="text-base font-black text-slate-800 tracking-tight">Live Preview</h2>
                <p className="text-[11px] text-slate-400 font-medium italic">Real-time profile updates</p>
              </div>
              
              {/* iPhone Mockup Container */}
              <div className="relative w-[300px] h-[600px] bg-slate-950 rounded-[3.5rem] p-2.5 shadow-[0px_60px_100px_-20px_rgba(0,0,0,0.15)] ring-[8px] ring-slate-900 border border-slate-800/50">
                {/* Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-950 rounded-full z-20 border border-slate-800/30"></div>
                
                {/* Screen Content Wrapper */}
                <div className="w-full h-full bg-[#fcfaff] rounded-[3rem] overflow-hidden relative flex flex-col pt-16 px-5 pb-8 shadow-inner overflow-hidden">
                  
                  {/* Internal Scrollable Content */}
                  <div className="flex-1 overflow-y-auto scrollbar-hide space-y-8 pr-1">
                    
                    {/* Branded Profile Header */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-white shadow-xl shadow-slate-200/50 rounded-3xl flex items-center justify-center mb-6 border border-slate-50 ring-4 ring-white/50">
                        <span className="material-symbols-outlined text-emerald-500 text-4xl">eco</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">blummify</h3>
                    </div>

                    {/* Links Section */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between px-2">
                         <div className="w-6"></div>
                         <span className="text-[13px] font-bold text-slate-700">WhatsApp</span>
                         <span className="material-symbols-outlined text-slate-300 text-sm">more_vert</span>
                       </div>
                       
                       <div className="w-full py-3.5 px-6 bg-white border border-slate-50 border-l-[6px] border-l-primary text-primary flex items-center justify-between rounded-2xl shadow-sm hover:translate-x-1 transition-transform cursor-pointer">
                         <div className="w-6"></div>
                         <span className="font-black text-[13px]">Official Website</span>
                         <span className="material-symbols-outlined text-slate-200 text-sm">more_vert</span>
                       </div>

                       <div className="w-full py-3.5 px-6 bg-white border border-slate-50 border-l-[6px] border-l-primary text-primary flex items-center justify-between rounded-2xl shadow-sm hover:translate-x-1 transition-transform cursor-pointer">
                         <div className="flex items-center gap-3">
                           <span className="material-symbols-outlined text-[18px] opacity-70">grid_view</span>
                         </div>
                         <span className="font-black text-[13px]">Portfolio Drop</span>
                         <span className="material-symbols-outlined text-slate-200 text-sm">more_vert</span>
                       </div>
                    </div>
                  </div>

                  {/* Fixed Phone Footer */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                    <button className="bg-white text-slate-900 px-5 py-2 rounded-full font-black text-[11px] border border-slate-200 shadow-sm transition-all hover:scale-105 active:scale-95">
                      Join blummify on Linktree
                    </button>
                    <div className="flex gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      <span>Report</span>
                      <span>Privacy</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Floating Footer bar */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-500">
               <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
               <span className="text-[12px] font-bold tracking-tight">Autosaving changes</span>
            </div>
          </div>
        </main>

        {/* Floating Theme Toggle (Bottom Right) */}
        <div className="fixed bottom-8 right-8 z-50">
          <ThemeToggle />
        </div>

        {/* Share Modal Overlay */}
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setShowShareModal(false)}
            ></div>
            <div className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
               {/* Modal Header */}
               <div className="p-8 flex items-center justify-between">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Share</h3>
                 <button onClick={() => setShowShareModal(false)} className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined">close</span>
                 </button>
               </div>
               
               <div className="px-8 pb-10 space-y-8">
                 {/* URL Field */}
                 <div className="bg-slate-50 border border-slate-100 p-4 rounded-[2rem] flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary font-black">
                      <span className="material-symbols-outlined">hub</span>
                    </div>
                    <span className="flex-1 text-sm font-bold text-slate-600 truncate text-center">linktr.ee/blummify</span>
                    <button 
                      onClick={handleCopy}
                      className={`px-6 py-2.5 rounded-full text-xs font-black transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                 </div>

                 {/* Platforms Grid */}
                 <div className="grid grid-cols-4 gap-4">
                   {[
                     { label: 'Instagram', icon: 'photo_camera', color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' },
                     { label: 'TikTok', icon: 'music_note', color: 'bg-black' },
                     { label: 'X', icon: 'close', color: 'bg-black' },
                     { label: 'QR', icon: 'qr_code', color: 'bg-primary' }
                   ].map((p) => (
                     <div key={p.label} className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div className={`w-12 h-12 ${p.color} rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 active:scale-95`}>
                          <span className="material-symbols-outlined text-[20px]">{p.icon}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.label}</span>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        )}
      </CollapsibleSidebar>
    </div>
  );
}
