import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarStore {
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      setCollapsed: (isCollapsed) => set({ isCollapsed }),
    }),
    {
      name: "linkhub-sidebar-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
