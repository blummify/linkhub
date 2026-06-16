import { create } from "zustand";
import type { ManagedLink } from "@/app/(dashboard)/user-admin/components/types";

interface UIStore {
  showLinkModal: boolean;
  editingLink: { link: ManagedLink; index: number } | null;
  pendingDelete: { link: ManagedLink; index: number } | null;
  showPalette: boolean;
  openAddLink: () => void;
  openEditLink: (link: ManagedLink, index: number) => void;
  closeLinkModal: () => void;
  setPendingDelete: (v: { link: ManagedLink; index: number } | null) => void;
  openPalette: () => void;
  closePalette: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  showLinkModal: false,
  editingLink: null,
  pendingDelete: null,
  showPalette: false,

  openAddLink: () => set({ showLinkModal: true, editingLink: null }),
  openEditLink: (link, index) => set({ showLinkModal: true, editingLink: { link, index } }),
  closeLinkModal: () => set({ showLinkModal: false }),
  setPendingDelete: (pendingDelete) => set({ pendingDelete }),
  openPalette: () => set({ showPalette: true }),
  closePalette: () => set({ showPalette: false }),
}));
