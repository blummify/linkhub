"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StorageValue } from "zustand/middleware";
import {
  getDefaultBrandingState,
  type BrandingAppearanceState,
  getBrandingThemeById,
  BRANDING_STORAGE_KEY,
} from "@/lib/brandingState";
import { BRANDING_THEMES } from "@/app/constants/brandingThemes";

export interface BrandingStore extends BrandingAppearanceState {
  isDirty: boolean;
  hydrated: boolean;
  _baseline: BrandingAppearanceState;

  setDisplayName: (v: string) => void;
  setHandle: (v: string) => void;
  setBio: (v: string) => void;
  setAccentColor: (v: string) => void;
  setButtonStyle: (v: string) => void;
  setFontFamily: (v: string) => void;
  selectTheme: (theme: ReturnType<typeof getBrandingThemeById>) => void;
  randomTheme: () => void;
  patchState: (patch: Partial<BrandingAppearanceState>) => void;
  reset: () => void;
  markSaved: () => void;
  setHydrated: (v: boolean) => void;
}

const defaults = getDefaultBrandingState();

// Reads the existing raw-JSON format written by the old BrandingAppearanceContext
// and wraps it into Zustand's { state, version } envelope so persist can parse it.
const migratingStorage = {
  getItem: (name: string): string | null => {
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Already in Zustand format
      if (parsed && typeof parsed === "object" && "state" in parsed) return raw;
      // Old raw format — wrap it
      return JSON.stringify({ state: parsed, version: 0 });
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => localStorage.setItem(name, value),
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useBrandingStore = create<BrandingStore>()(
  persist(
    (set, get) => ({
      ...defaults,
      isDirty: false,
      hydrated: false,
      _baseline: defaults,

      setDisplayName: (v) => set({ displayName: v, isDirty: true }),
      setHandle: (v) => set({ handle: v, isDirty: true }),
      setBio: (v) => set({ bio: v, isDirty: true }),
      setAccentColor: (v) => set({ accentColor: v, isDirty: true }),
      setButtonStyle: (v) => set({ buttonStyle: v, isDirty: true }),
      setFontFamily: (v) => set({ fontFamily: v, isDirty: true }),

      selectTheme: (theme) =>
        set({
          themeId: theme.id,
          accentColor: theme.screen.titleColor,
          userPickedTheme: true,
          isDirty: true,
        }),

      randomTheme: () => {
        const pool = BRANDING_THEMES.filter(
          (t) => !t.isPro && t.id !== get().themeId
        );
        if (!pool.length) return;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        set({
          themeId: pick.id,
          accentColor: pick.screen.titleColor,
          userPickedTheme: true,
          isDirty: true,
        });
      },

      patchState: (patch) => set({ ...patch, isDirty: true }),

      reset: () => {
        const { _baseline } = get();
        set({ ..._baseline, isDirty: false });
      },

      markSaved: () => {
        const s = get();
        const baseline: BrandingAppearanceState = {
          themeId: s.themeId,
          displayName: s.displayName,
          handle: s.handle,
          bio: s.bio,
          accentColor: s.accentColor,
          buttonStyle: s.buttonStyle,
          fontFamily: s.fontFamily,
          userPickedTheme: s.userPickedTheme,
        };
        set({ _baseline: baseline, isDirty: false });
      },

      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: BRANDING_STORAGE_KEY,
      storage: migratingStorage as unknown as ReturnType<typeof createJSONStorage>,
      skipHydration: true, // client rehydrates via BrandingHydrator to avoid SSR mismatch
      partialize: (s): Partial<BrandingStore> => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isDirty, hydrated, _baseline, ...rest } = s;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        // After loading from localStorage, set baseline = loaded state so reset() works correctly
        if (state) {
          const baseline: BrandingAppearanceState = {
            themeId: state.themeId,
            displayName: state.displayName,
            handle: state.handle,
            bio: state.bio,
            accentColor: state.accentColor,
            buttonStyle: state.buttonStyle,
            fontFamily: state.fontFamily,
            userPickedTheme: state.userPickedTheme,
          };
          state._baseline = baseline;
        }
      },
    }
  )
);
