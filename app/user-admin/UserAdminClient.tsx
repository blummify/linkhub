"use client";

import { useState } from "react";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { ThemeToggle } from "../ThemeToggle";
import { useSidebar } from "../components/SidebarContext";
import { MobilePreview, type AppearanceState } from "../components/MobilePreview";

type Tab = 'links' | 'appearance' | 'analytics' | 'settings';
type AppearanceCategory = 'header' | 'themes' | 'wallpaper' | 'text' | 'buttons' | 'colors' | 'footer';

export default function UserAdminClient() {
  const { isCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState<Tab>('links'); // Start with links as default to verify component reuse
  const [activeCategory, setActiveCategory] = useState<AppearanceCategory>('header');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [appearance, setAppearance] = useState<AppearanceState>({
    profileTitle: '@oseijoel6111',
    profileBio: 'Connecting with your community.',
    profileLayout: 'classic',
    themeId: 'custom',
    wallpaperStyle: 'fill',
    bgColor: '#ffffff',
    textColor: '#1a1a1a',
    buttonStyle: 'solid',
    buttonShadow: 'none',
    buttonRoundness: 'full',
    fontFamily: 'Inter',
    titleSize: 'small',
    titleColor: '#000000',
    footerStyle: 'minimal'
  });

  const handleCopy = () => {
    navigator.clipboard.writeText("linktr.ee/blummify");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="bg-background text-on-surface min-h-screen antialiased font-sans">
      <CollapsibleSidebar isAdmin={true}>
        <AppHeader isAdmin={true} />
        
        <main 
          id="mainContent" 
          className={`pt-16 min-h-screen transition-all duration-500 ease-in-out ${
            isCollapsed ? 'ml-0' : 'ml-64'
          }`}
        >
          {/* Horizontal Sub-Navigation (Tabs) */}
          <div className="sticky top-16 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant/60 px-6 md:px-10">
            <div className={`max-w-[1280px] mx-auto flex items-center gap-8 ${isCollapsed ? 'justify-center' : ''} transition-all duration-500`}>
              {(['links', 'appearance', 'analytics', 'settings'] as const).map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-[13px] font-bold capitalize transition-all border-b-2 -mb-px ${
                    activeTab === tab 
                      ? 'text-primary border-primary' 
                      : 'text-on-surface-variant border-transparent hover:text-on-surface'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className={`max-w-[1280px] mx-auto p-6 md:p-10 grid grid-cols-12 gap-12 lg:gap-16 ${isCollapsed ? 'px-12 md:px-20' : ''} transition-all duration-500 relative`}>
            
            {/* Left Column Content */}
            <div className="col-span-12 lg:col-span-7 space-y-10 animate-fade-in-up">
              
              {activeTab === 'links' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-black text-on-surface tracking-tight">Manage Links</h1>
                      <p className="text-[13px] text-on-surface-variant font-medium mt-1">Organize and optimize your digital presence.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2 rounded-full font-bold shadow-lg shadow-secondary/20 hover:scale-105 transition-all text-[11px] active:scale-95 group">
                      <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">add</span>
                      Add New Link
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { title: 'Official Website', url: 'https://johndoe.design', clicks: '1.2K', active: true },
                      { title: 'Latest Portfolio Drop', url: 'https://behance.net/johndoe', clicks: '856', active: true },
                      { title: 'Instagram Profile', url: 'https://instagram.com/johndoe', clicks: '0', draft: true }
                    ].map((link, idx) => (
                      <div key={idx} className={`bg-surface-container-lowest rounded-[2rem] p-5 flex items-center gap-5 border border-outline-variant/40 shadow-sm transition-all hover:border-secondary/20 border-l-[6px] ${link.draft ? 'border-l-outline-variant/50 border-dashed opacity-70' : 'border-l-secondary'}`}>
                        <span className="material-symbols-outlined text-on-surface-variant/30">drag_indicator</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-[14px] text-on-surface">{link.title}</h3>
                            {link.draft && <span className="px-2 py-0.5 bg-surface-container-high text-[8px] font-black uppercase rounded-full">Draft</span>}
                          </div>
                          <p className="text-[11px] text-primary font-bold">{link.url}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter">{link.clicks} CLICKS</span>
                           <button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-all"><span className="material-symbols-outlined text-[18px]">edit_note</span></button>
                           <button className="p-2 hover:bg-error/10 hover:text-error rounded-full text-on-surface-variant transition-all"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="animate-fade-in-up space-y-8">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black text-on-surface tracking-tight">Design Studio</h1>
                    <div className="flex items-center gap-3">
                       <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-[10px] font-black group hover:bg-surface transition-all">
                          <span className="material-symbols-outlined text-[14px]">auto_fix</span>
                          Enhance
                       </button>
                       <button className="bg-primary text-on-primary px-5 py-1.5 rounded-full font-black text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                          Save Changes
                       </button>
                    </div>
                  </div>

                  <div className="flex gap-8">
                    <nav className="flex flex-col gap-1 w-32 shrink-0">
                      {[
                        { id: 'header', icon: 'person', label: 'Header' },
                        { id: 'themes', icon: 'palette', label: 'Themes' },
                        { id: 'wallpaper', icon: 'wallpaper', label: 'Wallpapers' },
                        { id: 'buttons', icon: 'mouse', label: 'Buttons' },
                        { id: 'text', icon: 'font_download', label: 'Fonts' },
                        { id: 'footer', icon: 'dock', label: 'Footer' },
                      ].map((cat) => (
                        <button 
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id as AppearanceCategory)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[11px] font-bold ${
                            activeCategory === cat.id 
                              ? 'bg-on-surface text-surface shadow-md' 
                              : 'text-on-surface-variant hover:bg-surface-container'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                          {cat.label}
                        </button>
                      ))}
                    </nav>

                    <div className="flex-1 space-y-8 max-w-xl">
                      {activeCategory === 'header' && (
                        <div className="space-y-6 animate-fade-in">
                          <div className="space-y-3">
                             <h2 className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Profile title</h2>
                             <input 
                               value={appearance.profileTitle} 
                               onChange={(e) => setAppearance({...appearance, profileTitle: e.target.value})}
                               className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2.5 text-[13px] font-bold outline-none"
                             />
                          </div>
                          <div className="space-y-3">
                             <h2 className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Bio</h2>
                             <textarea 
                               value={appearance.profileBio} 
                               onChange={(e) => setAppearance({...appearance, profileBio: e.target.value})}
                               className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 text-[13px] font-medium outline-none h-24 resize-none"
                             />
                          </div>
                        </div>
                      )}

                      {activeCategory === 'themes' && (
                        <div className="grid grid-cols-3 gap-4 animate-fade-in">
                          {['agate', 'air', 'astrid', 'bliss', 'carbon'].map((theme) => (
                            <button 
                              key={theme}
                              onClick={() => setAppearance({...appearance, themeId: theme})}
                              className={`aspect-[3/4] rounded-2xl border-2 transition-all p-1.5 capitalize text-[10px] font-black ${
                                appearance.themeId === theme ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-primary/20'
                              }`}
                            >
                              <div className={`w-full h-full rounded-xl flex items-center justify-center ${theme === 'carbon' ? 'bg-black text-white' : 'bg-surface-container'}`}>
                                {theme}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics and Settings fallbacks */}
              {(activeTab === 'analytics' || activeTab === 'settings') && (
                <div className="py-20 flex flex-col items-center justify-center opacity-40">
                  <span className="material-symbols-outlined text-[48px] mb-4">{activeTab === 'analytics' ? 'insights' : 'settings'}</span>
                  <h2 className="text-xl font-black">Tab in Development</h2>
                  <button onClick={() => setActiveTab('appearance')} className="mt-4 text-[12px] font-black underline">Back to Design</button>
                </div>
              )}
            </div>

            {/* Right Column: Persistent Reusable Mobile Preview */}
            <div className="hidden lg:col-span-1 border-r border-outline-variant/60 h-auto self-stretch mx-auto my-4 opacity-40"></div>
            
            <section className="hidden lg:col-span-4 lg:flex flex-col items-center sticky top-40 h-[calc(100vh-12rem)] animate-fade-in overflow-y-auto pb-8">
              <MobilePreview appearance={appearance} onShareBarClick={() => setShowShareModal(true)} />
            </section>
          </div>
        </main>

        <div className="fixed bottom-8 right-8 z-50">
          <ThemeToggle />
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowShareModal(false)}></div>
            <div className="relative w-full max-w-md bg-surface rounded-[2.5rem] p-10 shadow-2xl border border-outline-variant/40 animate-in zoom-in-95 duration-300">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black">Share Profile</h3>
                 <button onClick={() => setShowShareModal(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">close</span></button>
               </div>
               <div className="bg-surface-container-low p-4 rounded-3xl flex items-center justify-between">
                  <span className="text-sm font-bold opacity-60">linktr.ee/blummify</span>
                  <button onClick={handleCopy} className="px-8 py-2 bg-on-surface text-surface rounded-full text-[11px] font-black">{copied ? 'Copied!' : 'Copy'}</button>
               </div>
            </div>
          </div>
        )}
      </CollapsibleSidebar>
    </div>
  );
}
