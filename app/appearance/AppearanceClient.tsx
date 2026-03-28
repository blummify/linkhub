"use client";

import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { ThemeToggle } from "../ThemeToggle";

export default function AppearanceClient() {
  return (
    <div className="bg-surface text-on-surface min-h-screen antialiased">
      <CollapsibleSidebar isAdmin={false}>
        <AppHeader isAdmin={false} />
        {/* Main Content Canvas */}
        <main id="mainContent" className="ml-64 pt-16 min-h-screen bg-surface-container-low transition-all duration-300 ease-in-out">
          <div className="max-w-[1400px] mx-auto p-8">
            {/* Left Customization Panel */}
            <div className="flex-1 max-w-2xl px-4 py-6">
              <header className="mb-12">
                <h1 className="text-2xl font-semibold text-on-surface tracking-tight mb-2">Appearance</h1>
                <p className="text-sm text-on-surface-variant">Customize your public profile to reflect your brand's unique style.</p>
              </header>
              
              <div className="space-y-12">
                {/* Profile Settings */}
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Profile Settings</h2>
                  <div className="bg-surface-container-low p-8 rounded-xl space-y-6">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative group">
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
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-surface to-surface-container-low border border-outline-variant shadow-inner"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-on-surface">Linear Gradient</p>
                          <p className="text-xs text-outline">#FBF8FF to #F4F2FC</p>
                        </div>
                        <button className="material-symbols-outlined text-outline">colorize</button>
                      </div>
                    </div>
                    <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4">
                      <span className="text-xs font-bold text-on-surface-variant">Button Color</span>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary border border-outline-variant shadow-inner"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-on-surface">Solid Indigo</p>
                          <p className="text-xs text-outline">#1F33AA</p>
                        </div>
                        <button className="material-symbols-outlined text-outline">colorize</button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Button Styles */}
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Button Styles</h2>
                  <div className="bg-surface-container-low p-2 rounded-2xl flex gap-2">
                    <button className="flex-1 py-3 px-4 rounded-xl bg-surface-container-highest shadow-sm font-bold text-sm text-primary transition-all">Flat</button>
                    <button className="flex-1 py-3 px-4 rounded-xl hover:bg-surface-container-highest font-medium text-sm text-on-surface-variant transition-all">Rounded</button>
                    <button className="flex-1 py-3 px-4 rounded-xl hover:bg-surface-container-highest font-medium text-sm text-on-surface-variant transition-all">Outline</button>
                    <button className="flex-1 py-3 px-4 rounded-xl hover:bg-surface-container-highest font-medium text-sm text-on-surface-variant transition-all">Shadow</button>
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
            <div className="flex-1 bg-surface-container px-8 flex flex-col items-center justify-center sticky top-16 h-[calc(100vh-64px)] overflow-hidden">
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-[320px] h-[640px] bg-surface-dim rounded-[3rem] p-3 shadow-2xl relative z-10 border-[6px] border-outline">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-surface-dim rounded-b-2xl z-20"></div>
                  {/* Internal Screen Content */}
                  <div className="w-full h-full bg-surface rounded-[2.2rem] overflow-hidden flex flex-col items-center relative">
                    {/* Live Preview Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-container-low opacity-50"></div>
                    <div className="relative z-10 w-full flex flex-col items-center px-6 pt-16">
                      <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-2 border-white mb-4">
                        <img 
                          alt="Avatar Preview" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4PxtiCvvdChx5rltV1QWgJOqNq6piD1-6Ei7usvNa6vEqtcJS14LJjz75FSALFuRLCOo0PeWiYTCWQG62g3U-sBgKkkTS8YLKuLQ5VXhayVh9HApiK6p0t3dHTTdwJ7qIltKK80bBabeACJ56gyTzodT-BxvGcpFh7nbolhTp9SrlFS4DSC2EcM-M062HDKFztAej-R7GT47dJReQ0J2iH6aWyNKUSJEss688VsS89wBvuGXxVJrQT0Sf7ComxHaSCEFSk4u1SlQa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-on-surface mb-1">Alex Rivers</h3>
                      <p className="text-[10px] text-on-surface-variant text-center leading-relaxed mb-8 px-4 opacity-80">Professional Photographer & Creative Director based in Seattle. Capturing the essence of modern living.</p>
                      <div className="w-full space-y-3">
                        <div className="w-full bg-primary text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm">
                          <span className="material-symbols-outlined text-sm">photo_camera</span>
                          <span className="text-xs font-bold">Latest Portfolio</span>
                        </div>
                        <div className="w-full bg-primary text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm">
                          <span className="material-symbols-outlined text-sm">shopping_bag</span>
                          <span className="text-xs font-bold">Print Shop</span>
                        </div>
                        <div className="w-full bg-primary text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm">
                          <span className="material-symbols-outlined text-sm">mail</span>
                          <span className="text-xs font-bold">Inquiries</span>
                        </div>
                      </div>
                      <div className="mt-12 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm text-on-surface-variant">share</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm text-on-surface-variant">public</span>
                        </div>
                      </div>
                    </div>
                    {/* Logo Watermark */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-20">
                      <span className="text-[10px] font-bold">CreatorHub</span>
                    </div>
                  </div>
                </div>
                {/* Ambient Glow */}
                <div className="absolute -inset-10 bg-primary/10 blur-3xl rounded-full z-0 opacity-50"></div>
              </div>
              <div className="mt-10 flex items-center gap-3 bg-surface-container-highest/60 backdrop-blur-md px-6 py-2 rounded-full shadow-sm border border-surface-container-highest/40">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
                </div>
                <span className="text-xs font-bold text-on-surface-variant tracking-wide">Syncing changes...</span>
              </div>
            </div>
          </div>
        </main>
      </CollapsibleSidebar>
      <ThemeToggle />
    </div>
  );
}
