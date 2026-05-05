"use client";

import CollapsibleSidebar from "../components/CollapsibleSidebar";
import AppHeader from "../components/AppHeader";
import { ThemeToggle } from "../ThemeToggle";
import { useSidebar } from "../components/SidebarContext";
import { MobilePreview } from "../components/MobilePreview";
import { LinksPreviewPanel } from "../components/LinksPreviewPanel";
import { LinksStyleTwoColumnLayout } from "../components/LinksStyleTwoColumnLayout";
import { EDITOR_MOBILE_PREVIEW_SHARED, EDITOR_PREVIEW_COLUMN_CLASS } from "../constants/editorMobilePreview";

export default function UserAnalyticsClient() {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="bg-surface text-on-surface min-h-screen antialiased font-sans">
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
              <section className="space-y-6 min-w-0 pb-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Analytics</h1>
                    <p className="text-sm text-on-surface-variant mt-1">Track your performance and audience growth.</p>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-primary font-bold text-sm uppercase tracking-wider">Total Views</span>
                      <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">bar_chart</span>
                    </div>
                    <div className="text-4xl font-black text-on-surface">24,812</div>
                    <p className="text-xs text-on-surface-variant mt-2 font-medium flex items-center gap-1">
                      <span className="text-primary font-bold">+12%</span> from last period
                    </p>
                  </div>
                  <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-secondary font-bold text-sm uppercase tracking-wider">Click-Thru Rate</span>
                      <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-xl">ads_click</span>
                    </div>
                    <div className="text-4xl font-black text-on-surface">6.4%</div>
                    <p className="text-xs text-on-surface-variant mt-2 font-medium flex items-center gap-1">
                      <span className="text-secondary font-bold">+2.4%</span> since yesterday
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
                   <h3 className="text-base font-bold mb-6 flex items-center gap-2">
                     <span className="material-symbols-outlined text-on-surface-variant">trending_up</span>
                     Daily Engagement
                   </h3>
                   <div className="aspect-[16/9] w-full bg-surface-container rounded-xl flex items-center justify-center border border-dashed border-outline-variant">
                     <p className="text-on-surface-variant text-sm font-medium">Chart Visualization Placeholder</p>
                   </div>
                </div>
              </section>
            }
            preview={
              <LinksPreviewPanel>
                <MobilePreview {...EDITOR_MOBILE_PREVIEW_SHARED} linkDensity="relaxed" />
              </LinksPreviewPanel>
            }
          />
        </main>
      </CollapsibleSidebar>
    </div>
  );
}
