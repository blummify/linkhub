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
    <div className="bg-background text-on-surface min-h-screen antialiased font-sans flex overflow-hidden">
      <CollapsibleSidebar isAdmin={false}>
        <AppHeader isAdmin={false} />

        <main
          id="mainContent"
          className={`flex-1 h-full pt-16 transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0 overflow-y-auto bg-surface`}
        >
          <LinksStyleTwoColumnLayout
            previewColumnClassName={EDITOR_PREVIEW_COLUMN_CLASS}
            left={
              <div className="space-y-6 pb-12">
                <DashboardPageHeader
                  title="Appearance"
                  description="Customize your public profile to match your brand. Changes sync to your live preview."
                />

                {/* Profile */}
                <section>
                  <SectionLabel>Profile</SectionLabel>
                  <DashboardSectionCard className="!space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
                      <div className="relative group shrink-0">
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center ring-4 ring-white dark:ring-surface-container-highest shadow-lg">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">person</span>
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
                        <input 
                          className={inputClass} 
                          type="text" 
                          placeholder="@yourname" 
                          value={previewAppearance.profileTitle}
                          onChange={(e) => setPreviewAppearance(prev => ({ ...prev, profileTitle: e.target.value }))}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className={fieldLabel}>Short bio</label>
                        <textarea
                          className={`${inputClass} resize-none text-[13px] min-h-[88px]`}
                          rows={3}
                          placeholder="Tell your story..."
                          value={previewAppearance.profileBio}
                          onChange={(e) => setPreviewAppearance(prev => ({ ...prev, profileBio: e.target.value }))}
                        />
                      </div>
                    </div>
                  </DashboardSectionCard>
                </section>

                {/* Theme presets */}
                {/* Theme presets */}
                <section>
                  <SectionLabel>Theme presets</SectionLabel>
                  <DashboardSectionCard className="!p-4 sm:!p-6">
                    <div className="flex flex-wrap gap-3">
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
                                profileTitle: prev.profileTitle,
                                profileBio: prev.profileBio,
                                fontFamily: prev.fontFamily,
                                bodyFontFamily: prev.bodyFontFamily,
                                buttonStyle: prev.buttonStyle,
                              }))
                            }
                            className={`group flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${
                              selected
                                ? "bg-primary/5 border-primary shadow-sm"
                                : "bg-surface-container-low border-outline-variant/30 hover:bg-surface-container"
                            }`}
                          >
                            <div
                              className="w-8 h-8 rounded-full border border-outline-variant/10 shadow-inner"
                              style={{ backgroundColor: preset.appearance.bgColor }}
                            />
                            <span
                              className={`text-[13px] font-bold tracking-tight ${
                                selected ? "text-primary" : "text-on-surface-variant"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DashboardSectionCard className="!p-4 group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-surface to-surface-container-low border border-outline-variant shadow-inner" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Canvas</p>
                          <code className="text-[11px] font-bold text-primary">#FBF8FF → #F4F2FC</code>
                        </div>
                        <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[18px]">colorize</span>
                        </button>
                      </div>
                    </DashboardSectionCard>
                    <DashboardSectionCard className="!p-4 group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary border border-primary/20 shadow-inner" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Accent</p>
                          <code className="text-[11px] font-bold text-primary">#1F33AA</code>
                        </div>
                        <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[18px]">colorize</span>
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
