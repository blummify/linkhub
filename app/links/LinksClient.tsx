"use client";

import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { ThemeToggle } from "../ThemeToggle";
import { useSidebarStore } from "@/store/sidebarStore";
import { MobilePreview } from "../components/MobilePreview";
import { LinksPreviewPanel } from "../components/LinksPreviewPanel";
import { LinksStyleTwoColumnLayout } from "../components/LinksStyleTwoColumnLayout";
import { EDITOR_PREVIEW_COLUMN_CLASS } from "../constants/editorMobilePreview";
import { useEditorMobilePreview } from "../hooks/useEditorMobilePreview";

export default function LinksClient() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const mobilePreviewProps = useEditorMobilePreview({ linkDensity: "relaxed" });

  return (
    <div className="bg-surface text-on-surface min-h-screen antialiased flex overflow-hidden">
      <CollapsibleSidebar isAdmin={false}>
        <AppHeader isAdmin={false} />
        <main
          id="mainContent"
          className={`flex-1 h-full lg:pt-16 transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0 overflow-y-auto bg-surface`}
        >
          <LinksStyleTwoColumnLayout
            previewColumnClassName={EDITOR_PREVIEW_COLUMN_CLASS}
            left={
            <section className="space-y-6 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Your Links</h1>
                  <p className="text-sm text-on-surface-variant mt-1">Manage and organize your digital presence.</p>
                </div>
                <button className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Add New Link
                </button>
              </div>
              
              {/* Link Cards Container */}
              <div className="space-y-4">
                {/* Link Card 1: Active */}
                <div className="group relative flex overflow-hidden rounded-xl border border-outline-variant/40 bg-white shadow-sm transition-all hover:shadow-md dark:border-outline-variant/30 dark:bg-surface-container-lowest">
                  <div className="w-1 shrink-0 self-stretch bg-primary" aria-hidden />
                  <div className="flex min-w-0 flex-1 gap-4 p-5 sm:gap-5 sm:p-6">
                    <div className="mt-0.5 flex shrink-0 cursor-grab text-on-surface-variant/35">
                      <span className="material-symbols-outlined text-[20px] select-none">drag_indicator</span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-1">
                          <h3 className="text-base font-semibold tracking-tight text-on-surface">Official Website</h3>
                          <p className="text-sm font-medium text-primary">https://johndoe.design</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Active</span>
                          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary" aria-label="Edit">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error" aria-label="Delete">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant/70">visibility</span>
                          1,240 clicks
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400">
                          <span className="material-symbols-outlined text-[18px]">trending_up</span>
                          +12% this week
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Link Card 2 */}
                <div className="group relative flex overflow-hidden rounded-xl border border-outline-variant/40 bg-white shadow-sm transition-all hover:shadow-md dark:border-outline-variant/30 dark:bg-surface-container-lowest">
                  <div className="w-1 shrink-0 self-stretch bg-primary" aria-hidden />
                  <div className="flex min-w-0 flex-1 gap-4 p-5 sm:gap-5 sm:p-6">
                    <div className="mt-0.5 flex shrink-0 cursor-grab text-on-surface-variant/35">
                      <span className="material-symbols-outlined text-[20px] select-none">drag_indicator</span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-1">
                          <h3 className="text-base font-semibold tracking-tight text-on-surface">Latest Portfolio Drop</h3>
                          <p className="text-sm font-medium text-primary">https://behance.net/johndoe/vibe-check</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Active</span>
                          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary" aria-label="Edit">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error" aria-label="Delete">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant/70">visibility</span>
                          856 clicks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Link Card 3: Draft */}
                <div className="group relative flex overflow-hidden rounded-xl border border-outline-variant/40 bg-white opacity-[0.92] shadow-sm transition-all hover:shadow-md dark:border-outline-variant/30 dark:bg-surface-container-lowest">
                  <div className="flex min-w-0 flex-1 gap-4 p-5 sm:gap-5 sm:p-6">
                    <div className="mt-0.5 flex shrink-0 cursor-grab text-on-surface-variant/35">
                      <span className="material-symbols-outlined text-[20px] select-none">drag_indicator</span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-1">
                          <h3 className="text-base font-semibold tracking-tight text-on-surface">Instagram Profile</h3>
                          <p className="text-sm font-medium italic text-on-surface-variant">https://instagram.com/johndoe</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
                          <span className="inline-flex rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                            Draft
                          </span>
                          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary" aria-label="Edit">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error" aria-label="Delete">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
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
              
            </section>
            }
            preview={
              <LinksPreviewPanel>
                <MobilePreview {...mobilePreviewProps} />
              </LinksPreviewPanel>
            }
          />
        </main>
      </CollapsibleSidebar>
      <ThemeToggle />
    </div>
  );
}
