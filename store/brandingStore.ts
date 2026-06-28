"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
  setBackground: (type: "gradient" | "image" | "video", value: string, key?: string | null) => void;
  toggleEffect: (id: string) => void;
  setTextColor: (v: string | null) => void;
  setCardStyle: (v: string) => void;
  setBodyFont: (v: string) => void;
  setOverlay: (color: string, opacity: number) => void;
  setProfileLayout: (v: string) => void;
  setLinkDensity: (v: string) => void;
  setCustomThemeName: (v: string) => void;
  selectTheme: (theme: ReturnType<typeof getBrandingThemeById>) => void;
  randomTheme: () => void;
  patchState: (patch: Partial<BrandingAppearanceState>) => void;
  syncFromDb: (data: Partial<BrandingAppearanceState>) => void;
  reset: () => void;
  markSaved: () => void;
  setHydrated: (v: boolean) => void;
}

const defaults = getDefaultBrandingState();

const migratingStorage = {
  getItem: (name: string): string | null => {
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && "state" in parsed) return raw;
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

      setBackground: (type, value, key = null) =>
        set({ backgroundType: type, backgroundValue: value, backgroundKey: key ?? null, isDirty: true }),

      toggleEffect: (id) =>
        set((s) => ({
          effects: s.effects.includes(id)
            ? s.effects.filter((e) => e !== id)
            : [...s.effects, id],
          isDirty: true,
        })),

      setTextColor: (v) => set({ textColor: v, isDirty: true }),
      setCardStyle: (v) => set({ cardStyle: v, isDirty: true }),
      setBodyFont: (v) => set({ bodyFont: v, isDirty: true }),
      setOverlay: (color, opacity) => set({ overlayColor: color, overlayOpacity: opacity, isDirty: true }),
      setProfileLayout: (v) => set({ profileLayout: v, isDirty: true }),
      setLinkDensity: (v) => set({ linkDensity: v, isDirty: true }),
      setCustomThemeName: (v) => set({ customThemeName: v }),

      selectTheme: (theme) =>
        set({
          themeId: theme.id,
          accentColor: theme.screen.titleColor,
          backgroundType: "gradient",
          backgroundValue: "",
          backgroundKey: null,
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

      syncFromDb: (data) => set((s) => ({
        ...data,
        _baseline: { ...s._baseline, ...data },
      })),

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
          backgroundType: s.backgroundType,
          backgroundValue: s.backgroundValue,
          backgroundKey: s.backgroundKey,
          effects: s.effects,
          textColor: s.textColor,
          cardStyle: s.cardStyle,
          bodyFont: s.bodyFont,
          overlayColor: s.overlayColor,
          overlayOpacity: s.overlayOpacity,
          profileLayout: s.profileLayout,
          linkDensity: s.linkDensity,
          customThemeName: s.customThemeName,
        };
        set({ _baseline: baseline, isDirty: false });
      },

      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: BRANDING_STORAGE_KEY,
      storage: migratingStorage as unknown as ReturnType<typeof createJSONStorage>,
      skipHydration: true,
      partialize: (s): Partial<BrandingStore> => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isDirty, hydrated, _baseline, ...rest } = s;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.backgroundType) state.backgroundType = "gradient";
          if (state.backgroundValue == null) state.backgroundValue = "midnight";
          if (state.backgroundKey === undefined) state.backgroundKey = null;
          if (!Array.isArray(state.effects)) state.effects = [];
          if (state.textColor === undefined) state.textColor = null;
          if (!state.cardStyle) state.cardStyle = "filled";
          if (!state.bodyFont) state.bodyFont = "Geist";
          if (!state.overlayColor) state.overlayColor = "#000000";
          if (typeof state.overlayOpacity !== "number") state.overlayOpacity = 0;
          if (!state.profileLayout) state.profileLayout = "classic";
          if (!state.linkDensity) state.linkDensity = "default";
          if (!state.customThemeName) state.customThemeName = "My Theme";
          const baseline: BrandingAppearanceState = {
            themeId: state.themeId,
            displayName: state.displayName,
            handle: state.handle,
            bio: state.bio,
            accentColor: state.accentColor,
            buttonStyle: state.buttonStyle,
            fontFamily: state.fontFamily,
            userPickedTheme: state.userPickedTheme,
            backgroundType: state.backgroundType,
            backgroundValue: state.backgroundValue,
            backgroundKey: state.backgroundKey,
            effects: state.effects,
            textColor: state.textColor,
            cardStyle: state.cardStyle,
            bodyFont: state.bodyFont,
            overlayColor: state.overlayColor,
            overlayOpacity: state.overlayOpacity,
            profileLayout: state.profileLayout,
            linkDensity: state.linkDensity,
            customThemeName: state.customThemeName,
          };
          state._baseline = baseline;
        }
      },
    }
  )
);
