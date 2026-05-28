"use client";

import CollapsibleSidebar from "../components/CollapsibleSidebar";
import { useSidebarStore } from "@/store/sidebarStore";

export default function BillingClient() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <div className="bg-[#f7f8fc] min-h-screen antialiased flex overflow-hidden">
      <CollapsibleSidebar>
        <main
          className={`flex-1 transition-all duration-500 ease-in-out ${
            isCollapsed ? "lg:ml-[80px]" : "lg:ml-[256px]"
          } ml-0 overflow-y-auto bg-[#f7f8fc] h-screen`}
        />
      </CollapsibleSidebar>
    </div>
  );
}
