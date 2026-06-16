import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ManagedLink } from "@/app/(dashboard)/user-admin/components/types";

interface LinksStore {
  links: ManagedLink[];
  isLoading: boolean;
  setLinks: (links: ManagedLink[]) => void;
  setLoading: (v: boolean) => void;
  optimisticAdd: (entry: ManagedLink) => void;
  confirmAdd: (tempId: string, real: ManagedLink) => void;
  revertAdd: (tempId: string) => void;
  optimisticUpdate: (id: string, updates: Partial<ManagedLink>) => ManagedLink | undefined;
  revertUpdate: (id: string, previous: ManagedLink) => void;
  removeLink: (id: string) => void;
  reorderLinks: (links: ManagedLink[]) => void;
}

export const useLinksStore = create<LinksStore>()(
  persist(
    (set, get) => ({
      links: [],
      isLoading: true,

      setLinks: (links) => set({ links }),
      setLoading: (isLoading) => set({ isLoading }),

      optimisticAdd: (entry) =>
        set((s) => ({ links: [entry, ...s.links] })),

      confirmAdd: (tempId, real) =>
        set((s) => ({ links: s.links.map((l) => (l.id === tempId ? real : l)) })),

      revertAdd: (tempId) =>
        set((s) => ({ links: s.links.filter((l) => l.id !== tempId) })),

      optimisticUpdate: (id, updates) => {
        const previous = get().links.find((l) => l.id === id);
        set((s) => ({
          links: s.links.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }));
        return previous;
      },

      revertUpdate: (id, previous) =>
        set((s) => ({
          links: s.links.map((l) => (l.id === id ? previous : l)),
        })),

      removeLink: (id) =>
        set((s) => ({ links: s.links.filter((l) => l.id !== id) })),

      reorderLinks: (links) => set({ links }),
    }),
    {
      name: "linkhub-links-v1",
      storage: createJSONStorage(() => sessionStorage),
      // Only persist the links array — isLoading always starts fresh so revalidation runs
      partialize: (s) => ({ links: s.links }),
    }
  )
);
