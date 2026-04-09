"use client";

import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { ThemeToggle } from "../ThemeToggle";
import { useSidebar } from "../components/SidebarContext";
import { MobilePreview, DEFAULT_APPEARANCE } from "../components/MobilePreview";

export default function AppearanceClient() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="bg-surface text-on-surface min-h-screen antialiased">
      <CollapsibleSidebar isAdmin={false}>
        <AppHeader isAdmin={false} />
        {/* Main Content Canvas — full width on small screens (sidebar overlays); offset on lg+ when expanded */}
        <main
          id="mainContent"
          className={`pt-16 min-h-screen bg-surface-container-low transition-all duration-300 ease-in-out ${
            isCollapsed ? "ml-0" : "ml-0 lg:ml-64"
          }`}
        >
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 lg:items-start">
            {/* Left Customization Panel */}
            <div className="lg:col-span-7 w-full min-w-0 max-w-2xl lg:max-w-none py-2 sm:py-4 lg:py-6">
              <header className="mb-12">
                <h1 className="text-2xl font-semibold text-on-surface tracking-tight mb-2">Appearance</h1>
                <p className="text-sm text-on-surface-variant">Customize your public profile to reflect your brand's unique style.</p>
              </header>
              
              <div className="space-y-12">
                {/* Profile Settings */}
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Profile Settings</h2>
                  <div className="bg-surface-container-low p-8 rounded-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8">
                      <div className="relative group shrink-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center ring-4 ring-white shadow-md">
                          <img 
                            alt="Profile Avatar" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4CPgv-mQOEFNUQ75XgMO_x5olid0O0RwPWxjsoFa8ql_jecZ5HMhnxmXvVLs9egGsMOfONs6iY53A-i0iAizWATMmXA2VReS1U_efUICX_LKBqNs6mLtA_rzS0YzTxf_CJf8InO_RxeEAey6igSpMw1a9M55wvmfAMao66kUgMIH8KmsA3AmyhKXIe6HVdN8yzNybEZpSiuol_kqj7y5OjKTqrWylfMVNpz-UNumvF4yDh9Il2DlCS-SdWagl7oeVGphxCrdD0r70"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface mb-1">Profile Picture</p>
                        <p className="text-xs text-on-surface-variant">JPG, PNG or SVG. Max size of 2MB.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-on-surface-variant">Profile Name</label>
                        <input 
                          className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                          type="text" 
                          defaultValue="Alex Rivers"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-on-surface-variant">Short Bio</label>
                        <textarea 
                          className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none text-sm" 
                          rows={3}
                          defaultValue="Professional Photographer & Creative Director based in Seattle. Capturing the essence of modern living."
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Theme Presets */}
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Theme Presets</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="flex flex-col gap-3 group">
                      <div className="w-full aspect-[4/3] bg-surface-container-low rounded-xl ring-2 ring-primary p-2 flex items-center justify-center transition-all group-hover:shadow-lg">
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-surface to-surface-container-low border border-primary/20 flex flex-col items-center justify-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-4 h-4 rounded-full bg-primary"></div>
                            <div className="w-4 h-4 rounded-full bg-secondary"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-on-surface text-center">Indigo Mint</span>
                    </button>
                    
                    <button className="flex flex-col gap-3 group opacity-70 hover:opacity-100">
                      <div className="w-full aspect-[4/3] bg-surface-container-low rounded-xl p-2 flex items-center justify-center transition-all group-hover:shadow-lg">
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-outline-variant flex flex-col items-center justify-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant text-center">Sunset Glow</span>
                    </button>
                    
                    <button className="flex flex-col gap-3 group opacity-70 hover:opacity-100">
                      <div className="w-full aspect-[4/3] bg-surface-container-low rounded-xl p-2 flex items-center justify-center transition-all group-hover:shadow-lg">
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-surface-dim to-surface-container-highest border border-outline-variant flex flex-col items-center justify-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-4 h-4 rounded-full bg-primary-container"></div>
                            <div className="w-4 h-4 rounded-full bg-white"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant text-center">Midnight Oasis</span>
                    </button>
                    
                    <button className="flex flex-col gap-3 group opacity-70 hover:opacity-100">
                      <div className="w-full aspect-[4/3] bg-surface-container-low rounded-xl p-2 flex items-center justify-center transition-all group-hover:shadow-lg">
                        <div className="w-full h-full rounded-lg bg-white border border-outline-variant flex flex-col items-center justify-center gap-2 shadow-sm">
                          <div className="flex gap-1">
                            <div className="w-4 h-4 rounded-full bg-surface-dim"></div>
                            <div className="w-4 h-4 rounded-full bg-outline"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant text-center">Cloud White</span>
                    </button>
                  </div>
                </section>

                {/* Custom Colors */}
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Custom Colors</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4">
                      <span className="text-xs font-bold text-on-surface-variant">Background Color</span>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-lg bg-gradient-to-br from-surface to-surface-container-low border border-outline-variant shadow-inner"></div>
                        <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
                          <p className="text-sm font-medium text-on-surface">Linear Gradient</p>
                          <p className="text-xs text-outline">#FBF8FF to #F4F2FC</p>
                        </div>
                        <button type="button" className="material-symbols-outlined text-outline shrink-0 ml-auto sm:ml-0">colorize</button>
                      </div>
                    </div>
                    <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4">
                      <span className="text-xs font-bold text-on-surface-variant">Button Color</span>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-lg bg-primary border border-outline-variant shadow-inner"></div>
                        <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
                          <p className="text-sm font-medium text-on-surface">Solid Indigo</p>
                          <p className="text-xs text-outline">#1F33AA</p>
                        </div>
                        <button type="button" className="material-symbols-outlined text-outline shrink-0 ml-auto sm:ml-0">colorize</button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Button Styles */}
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Button Styles</h2>
                  <div className="bg-surface-container-low p-2 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button className="min-w-0 py-3 px-3 sm:px-4 rounded-xl bg-surface-container-highest shadow-sm font-bold text-sm text-primary transition-all">Flat</button>
                    <button className="min-w-0 py-3 px-3 sm:px-4 rounded-xl hover:bg-surface-container-highest font-medium text-sm text-on-surface-variant transition-all">Rounded</button>
                    <button className="min-w-0 py-3 px-3 sm:px-4 rounded-xl hover:bg-surface-container-highest font-medium text-sm text-on-surface-variant transition-all">Outline</button>
                    <button className="min-w-0 py-3 px-3 sm:px-4 rounded-xl hover:bg-surface-container-highest font-medium text-sm text-on-surface-variant transition-all">Shadow</button>
                  </div>
                </section>

                {/* Typography */}
                <section className="pb-20">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Typography</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-on-surface-variant">Headline Font</label>
                      <div className="relative">
                        <select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-primary/20 font-bold">
                          <option>Inter</option>
                          <option>Manrope</option>
                          <option>Playfair Display</option>
                          <option>Outfit</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-on-surface-variant">Body Font</label>
                      <div className="relative">
                        <select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-primary/20">
                          <option>Inter</option>
                          <option>Roboto</option>
                          <option>Open Sans</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Right Live Preview Panel */}
            <div className="lg:col-span-5 w-full min-w-0 flex flex-col items-center justify-center lg:justify-start bg-surface-container rounded-2xl lg:rounded-none px-4 py-8 sm:px-6 lg:px-8 lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
              <MobilePreview
                appearance={DEFAULT_APPEARANCE}
                showHeaderChrome={false}
                syncLabel="Syncing changes..."
              />
            </div>
          </div>
        </main>
      </CollapsibleSidebar>
      <ThemeToggle />
    </div>
  );
}
