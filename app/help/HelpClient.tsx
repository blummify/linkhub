"use client";

import { useState } from "react";
import Link from "next/link";
import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { useSidebarStore } from "@/store/sidebarStore";
import { DashboardTopBar } from "../user-admin/components/DashboardTopBar";
import { HELP_COLORS } from "./components/helpTheme";
import { SectionLabel } from "./components/SectionLabel";
import { HelpHero } from "./components/HelpHero";
import { OnboardingChecklist } from "./components/OnboardingChecklist";
import { FaqSection } from "./components/FaqSection";
import { GoDeeper } from "./components/GoDeeper";
import { ChevronRightIcon } from "./components/helpIcons";

export default function HelpClient() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const [query, setQuery] = useState("");

  return (
    <div className="bg-[#f7f8fc] min-h-screen antialiased flex overflow-hidden">
      <CollapsibleSidebar>
        <main
          className={`flex-1 transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0 overflow-y-auto bg-[#f7f8fc] h-screen`}
        >
          <div className="w-full px-4 pt-[22px] pb-20 sm:px-6 lg:px-8">
            <DashboardTopBar
              searchPlaceholder="Search help articles…"
              searchValue={query}
              onSearchChange={setQuery}
            />

            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13.5,
                color: HELP_COLORS.text3,
                marginBottom: 18,
              }}
            >
              <Link href="/user-dashboard" style={{ color: HELP_COLORS.text3, textDecoration: "none" }}>
                Dashboard
              </Link>
              <ChevronRightIcon size={14} />
              <span style={{ color: HELP_COLORS.text, fontWeight: 600 }}>Help</span>
            </nav>

            <HelpHero onPickTerm={setQuery} />

            <SectionLabel>Get started</SectionLabel>
            <OnboardingChecklist />

            <FaqSection query={query} />

            <SectionLabel>Go deeper</SectionLabel>
            <GoDeeper />
          </div>
        </main>
      </CollapsibleSidebar>
    </div>
  );
}
