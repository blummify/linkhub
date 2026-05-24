import { create } from "zustand";

interface ProfileStore {
  avatarUrl: string | null;
  hasClaimedHandle: boolean;
  fetched: boolean;
  setAvatarUrl: (url: string | null) => void;
  setHasClaimedHandle: (v: boolean) => void;
  markFetched: (data: { avatarUrl?: string | null; hasClaimedHandle?: boolean }) => void;
}

export const useProfileStore = create<ProfileStore>()((set) => ({
  avatarUrl: null,
  hasClaimedHandle: true,
  fetched: false,

  setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
  setHasClaimedHandle: (v) => set({ hasClaimedHandle: v }),
  markFetched: (data) =>
    set({
      avatarUrl: data.avatarUrl ?? null,
      hasClaimedHandle: data.hasClaimedHandle ?? true,
      fetched: true,
    }),
}));
