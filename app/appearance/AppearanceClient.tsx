"use client";

import { useState, type ReactNode } from "react";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { useSidebar } from "../components/SidebarContext";
import { MobilePreview, type AppearanceState, normalizePreviewButtonStyle } from "../components/MobilePreview";
import { LinksStyleTwoColumnLayout } from "../components/LinksStyleTwoColumnLayout";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { DashboardSectionCard } from "../components/DashboardSectionCard";
import { LinksPreviewPanel } from "../components/LinksPreviewPanel";
import { EDITOR_MOBILE_PREVIEW_SHARED, EDITOR_PREVIEW_COLUMN_CLASS } from "../constants/editorMobilePreview";
import { THEME_PRESETS } from "../constants/themePresets";
import { BODY_FONT_OPTIONS, HEADLINE_FONT_OPTIONS } from "../constants/previewFonts";

const PREVIEW_BUTTON_STYLES = [
  { id: "flat", label: "Flat" },
  { id: "rounded", label: "Rounded" },
  { id: "outline", label: "Outline" },
  { id: "shadow", label: "Shadow" },
] as const;

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[9px] font-black uppercase tracking-widest text-primary mb-4 pl-0.5">{children}</h2>
  );
}

const fieldLabel = "text-[9px] font-black uppercase tracking-widest text-on-surface-variant pl-1";
const colorFieldLabel = "text-[9px] font-black uppercase tracking-widest text-on-surface-variant";
const inputClass =
  "w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-[13px] font-medium outline-none transition-all focus:ring-2 focus:ring-primary/20";

export default function AppearanceClient() {
  const { isCollapsed } = useSidebar();
  const [previewAppearance, setPreviewAppearance] = useState<AppearanceState>(THEME_PRESETS[0].appearance);

  return (
    <div className="bg-background text-on-surface min-h-screen antialiased font-sans">
      <CollapsibleSidebar isAdmin={false}>
        <AppHeader isAdmin={false} />

        <main
          id="mainContent"
          className={`pt-16 min-h-screen bg-surface-container-low transition-all duration-300 ease-in-out ${
            isCollapsed ? "ml-0" : "ml-0 lg:ml-64"
          }`}
        >
          <LinksStyleTwoColumnLayout
            previewColumnClassName={EDITOR_PREVIEW_COLUMN_CLASS}
            left={
              <div className="space-y-10 pb-12">
                <DashboardPageHeader
                  title="Appearance"
                  description="Customize your public profile to match your brand. Changes sync to your live preview."
                  actions={
                    <>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/40 text-[11px] font-black hover:bg-surface transition-all"
                        onClick={() => setPreviewAppearance(THEME_PRESETS[0].appearance)}
                      >
                        <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                        Reset
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2 rounded-full font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all text-[11px] active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[16px]">save</span>
                        Save changes
                      </button>
                    </>
                  }
                />

                {/* Profile */}
                <section>
                  <SectionLabel>Profile</SectionLabel>
                  <DashboardSectionCard className="!space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
                      <div className="relative group shrink-0">
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center ring-4 ring-white dark:ring-surface-container-highest shadow-lg">
                          <img
                            alt="Profile Avatar"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4CPgv-mQOEFNUQ75XgMO_x5olid0O0RwPWxjsoFa8ql_jecZ5HMhnxmXvVLs9egGsMOfONs6iY53A-i0iAizWATMmXA2VReS1U_efUICX_LKBqNs6mLtA_rzS0YzTxf_CJf8InO_RxeEAey6igSpMw1a9M55wvmfAMao66kUgMIH8KmsA3AmyhKXIe6HVdN8yzNybEZpSiuol_kqj7y5OjKTqrWylfMVNpz-UNumvF4yDh9Il2DlCS-SdWagl7oeVGphxCrdD0r70"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          className="absolute bottom-1 right-1 bg-primary text-on-primary p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                          aria-label="Edit profile picture"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-on-surface mb-1">Profile picture</p>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          JPG, PNG or SVG. Max 2MB. Shown on your page and in previews.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5 pt-2 border-t border-outline-variant/30">
                      <div className="flex flex-col gap-2">
                        <label className={fieldLabel}>Profile name</label>
                        <input className={inputClass} type="text" defaultValue="Alex Rivers" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className={fieldLabel}>Short bio</label>
                        <textarea
                          className={`${inputClass} resize-none text-sm min-h-[88px]`}
                          rows={3}
                          defaultValue="Professional Photographer & Creative Director based in Seattle. Capturing the essence of modern living."
                        />
                      </div>
                    </div>
                  </DashboardSectionCard>
                </section>

                {/* Theme presets */}
                <section>
                  <SectionLabel>Theme presets</SectionLabel>
                  <DashboardSectionCard className="!space-y-0 !p-6 sm:!p-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {THEME_PRESETS.map((preset) => {
                        const selected = previewAppearance.themeId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              setPreviewAppearance((prev) => ({
                                ...preset.appearance,
                                fontFamily: prev.fontFamily,
                                bodyFontFamily: prev.bodyFontFamily,
                                buttonStyle: prev.buttonStyle,
                              }))
                            }
                            className={`flex flex-col gap-3 group text-left transition-opacity ${
                              selected ? "opacity-100" : "opacity-80 hover:opacity-100"
                            }`}
                          >
                            <div
                              className={`w-full aspect-[4/3] bg-surface-container rounded-2xl p-2 flex items-center justify-center transition-all ${
                                selected
                                  ? "ring-2 ring-primary shadow-lg group-hover:shadow-lg"
                                  : "group-hover:shadow-md"
                              }`}
                            >
                              {preset.id === "indigo-mint" && (
                                <div className="w-full h-full rounded-xl bg-gradient-to-br from-surface to-surface-container-low border border-primary/20 flex flex-col items-center justify-center gap-2">
                                  <div className="flex gap-1">
                                    <div className="w-4 h-4 rounded-full bg-primary" />
                                    <div className="w-4 h-4 rounded-full bg-secondary" />
                                  </div>
                                </div>
                              )}
                              {preset.id === "sunset-glow" && (
                                <div className="w-full h-full rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-amber-950/30 border border-outline-variant/50 flex flex-col items-center justify-center gap-2">
                                  <div className="flex gap-1">
                                    <div className="w-4 h-4 rounded-full bg-orange-500" />
                                    <div className="w-4 h-4 rounded-full bg-yellow-400" />
                                  </div>
                                </div>
                              )}
                              {preset.id === "midnight-oasis" && (
                                <div className="w-full h-full rounded-xl bg-gradient-to-br from-surface-dim to-surface-container-highest border border-outline-variant/50 flex flex-col items-center justify-center gap-2">
                                  <div className="flex gap-1">
                                    <div className="w-4 h-4 rounded-full bg-primary-container" />
                                    <div className="w-4 h-4 rounded-full bg-white" />
                                  </div>
                                </div>
                              )}
                              {preset.id === "cloud-white" && (
                                <div className="w-full h-full rounded-xl bg-white dark:bg-surface-container-highest border border-outline-variant/50 shadow-sm flex flex-col items-center justify-center gap-2">
                                  <div className="flex gap-1">
                                    <div className="w-4 h-4 rounded-full bg-surface-dim" />
                                    <div className="w-4 h-4 rounded-full bg-outline" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <span
                              className={`text-xs text-center font-black ${
                                selected ? "text-on-surface" : "text-on-surface-variant font-bold"
                              }`}
                            >
                              {preset.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </DashboardSectionCard>
                </section>

                {/* Colors */}
                <section>
                  <SectionLabel>Custom colors</SectionLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DashboardSectionCard className="!space-y-4">
                      <span className={colorFieldLabel}>Background</span>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-surface to-surface-container-low border border-outline-variant shadow-inner" />
                        <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
                          <p className="text-sm font-bold text-on-surface">Linear gradient</p>
                          <p className="text-xs text-on-surface-variant font-mono">#FBF8FF → #F4F2FC</p>
                        </div>
                        <button type="button" className="material-symbols-outlined text-on-surface-variant hover:text-primary shrink-0 ml-auto sm:ml-0 p-2 rounded-full hover:bg-surface-container transition-colors">
                          colorize
                        </button>
                      </div>
                    </DashboardSectionCard>
                    <DashboardSectionCard className="!space-y-4">
                      <span className={colorFieldLabel}>Button</span>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="w-14 h-14 shrink-0 rounded-xl bg-primary border border-outline-variant shadow-inner" />
                        <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
                          <p className="text-sm font-bold text-on-surface">Solid indigo</p>
                          <p className="text-xs text-on-surface-variant font-mono">#1F33AA</p>
                        </div>
                        <button type="button" className="material-symbols-outlined text-on-surface-variant hover:text-primary shrink-0 ml-auto sm:ml-0 p-2 rounded-full hover:bg-surface-container transition-colors">
                          colorize
                        </button>
                      </div>
                    </DashboardSectionCard>
                  </div>
                </section>

                {/* Button styles */}
                <section>
                  <SectionLabel>Button styles</SectionLabel>
                  <DashboardSectionCard className="!p-2 !space-y-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PREVIEW_BUTTON_STYLES.map(({ id, label }) => {
                        const active = normalizePreviewButtonStyle(previewAppearance.buttonStyle) === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setPreviewAppearance((prev) => ({ ...prev, buttonStyle: id }))}
                            className={`min-w-0 py-3 px-3 sm:px-4 rounded-xl text-sm transition-all ${
                              active
                                ? "bg-surface-container-highest shadow-sm font-black text-primary"
                                : "hover:bg-surface-container-highest font-medium text-on-surface-variant"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </DashboardSectionCard>
                </section>

                {/* Typography */}
                <section>
                  <SectionLabel>Typography</SectionLabel>
                  <DashboardSectionCard>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className={fieldLabel}>Headline font</label>
                        <div className="relative">
                          <select
                            className={`${inputClass} font-bold appearance-none pr-10`}
                            value={previewAppearance.fontFamily}
                            onChange={(e) =>
                              setPreviewAppearance((prev) => ({ ...prev, fontFamily: e.target.value }))
                            }
                          >
                            {HEADLINE_FONT_OPTIONS.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-sm">
                            expand_more
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className={fieldLabel}>Body font</label>
                        <div className="relative">
                          <select
                            className={`${inputClass} appearance-none pr-10`}
                            value={previewAppearance.bodyFontFamily}
                            onChange={(e) =>
                              setPreviewAppearance((prev) => ({ ...prev, bodyFontFamily: e.target.value }))
                            }
                          >
                            {BODY_FONT_OPTIONS.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-sm">
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>
                  </DashboardSectionCard>
                </section>
              </div>
            }
            preview={
              <LinksPreviewPanel>
                <MobilePreview
                  {...EDITOR_MOBILE_PREVIEW_SHARED}
                  appearance={previewAppearance}
                  linkDensity="relaxed"
                  showPublicUrlBar={false}
                />
              </LinksPreviewPanel>
            }
          />
        </main>
      </CollapsibleSidebar>
    </div>
  );
}
