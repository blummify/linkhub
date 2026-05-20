"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BRANDING_THEMES,
  type BrandingTheme,
} from "@/app/constants/brandingThemes";
import {
  type BrandingAppearanceState,
  brandingPublicUrl,
  brandingStateToPreviewAppearance,
  getBrandingThemeById,
  BRANDING_STORAGE_KEY,
  getDefaultBrandingState,
  loadBrandingState,
  saveBrandingState,
  type PreviewAppearance,
} from "@/lib/brandingState";

type BrandingAppearanceContextValue = {
  state: BrandingAppearanceState;
  theme: BrandingTheme;
  previewAppearance: PreviewAppearance;
  publicUrl: string;
  isDirty: boolean;
  hydrated: boolean;
  setDisplayName: (v: string) => void;
  setHandle: (v: string) => void;
  setBio: (v: string) => void;
  setAccentColor: (v: string) => void;
  setButtonStyle: (v: string) => void;
  setFontFamily: (v: string) => void;
  selectTheme: (theme: BrandingTheme) => void;
  randomTheme: () => void;
  reset: () => void;
  markSaved: () => void;
  patchState: (patch: Partial<BrandingAppearanceState>) => void;
};

const BrandingAppearanceContext =
  createContext<BrandingAppearanceContextValue | undefined>(undefined);

export function BrandingAppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const baselineRef = useRef<BrandingAppearanceState>(getDefaultBrandingState());
  const [state, setState] = useState<BrandingAppearanceState>(getDefaultBrandingState);
  const [isDirty, setIsDirty] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [needsStorageSync, setNeedsStorageSync] = useState(true);

  if (needsStorageSync && typeof window !== "undefined") {
    setNeedsStorageSync(false);
    setState(loadBrandingState());
    setHydrated(true);
  }

  const baselineInitialized = useRef(false);
  useEffect(() => {
    if (hydrated && !baselineInitialized.current) {
      baselineInitialized.current = true;
      baselineRef.current = state;
    }
  }, [hydrated, state]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveBrandingState(state), 400);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state, hydrated]);

  useEffect(() => {
    const sync = (e: Event) => {
      const detail = (e as CustomEvent<BrandingAppearanceState>).detail;
      if (detail) setState(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === BRANDING_STORAGE_KEY) {
        setState(loadBrandingState());
      }
    };
    window.addEventListener("linkhub-branding-change", sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("linkhub-branding-change", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const commit = useCallback(
    (updater: (prev: BrandingAppearanceState) => BrandingAppearanceState) => {
      setState((prev) => updater(prev));
      setIsDirty(true);
    },
    []
  );

  const theme = useMemo(() => getBrandingThemeById(state.themeId), [state.themeId]);

  const previewAppearance = useMemo(
    () => brandingStateToPreviewAppearance(state),
    [state]
  );

  const publicUrl = useMemo(
    () => brandingPublicUrl(state.handle),
    [state.handle]
  );

  const value = useMemo<BrandingAppearanceContextValue>(
    () => ({
      state,
      theme,
      previewAppearance,
      publicUrl,
      isDirty,
      hydrated,
      setDisplayName: (v) => commit((s) => ({ ...s, displayName: v })),
      setHandle: (v) => commit((s) => ({ ...s, handle: v })),
      setBio: (v) => commit((s) => ({ ...s, bio: v })),
      setAccentColor: (v) => commit((s) => ({ ...s, accentColor: v })),
      setButtonStyle: (v) => commit((s) => ({ ...s, buttonStyle: v })),
      setFontFamily: (v) => commit((s) => ({ ...s, fontFamily: v })),
      selectTheme: (next) =>
        commit((s) => ({
          ...s,
          themeId: next.id,
          accentColor: next.screen.titleColor,
          userPickedTheme: true,
        })),
      randomTheme: () => {
        const pool = BRANDING_THEMES.filter(
          (t) => !t.isPro && t.id !== state.themeId
        );
        if (pool.length === 0) return;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        commit((s) => ({
          ...s,
          themeId: pick.id,
          accentColor: pick.screen.titleColor,
          userPickedTheme: true,
        }));
      },
      reset: () => {
        setState(baselineRef.current);
        setIsDirty(false);
      },
      markSaved: () => {
        baselineRef.current = state;
        setIsDirty(false);
      },
      patchState: (patch) => commit((s) => ({ ...s, ...patch })),
    }),
    [state, theme, previewAppearance, publicUrl, isDirty, hydrated, commit]
  );

  return (
    <BrandingAppearanceContext.Provider value={value}>
      {children}
    </BrandingAppearanceContext.Provider>
  );
}

export function useBrandingAppearance() {
  const ctx = useContext(BrandingAppearanceContext);
  if (!ctx) {
    throw new Error(
      "useBrandingAppearance must be used within BrandingAppearanceProvider"
    );
  }
  return ctx;
}
