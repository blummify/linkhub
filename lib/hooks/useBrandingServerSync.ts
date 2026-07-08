"use client";
import { useEffect, useRef } from "react";
import { useBrandingStore } from "@/store/brandingStore";
import type { BrandingAppearanceState } from "@/lib/brandingState";

export function useBrandingServerSync(
  initialState: Partial<BrandingAppearanceState> | null | undefined
) {
  const hydrated = useBrandingStore((s) => s.hydrated);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || syncedRef.current) return;
    syncedRef.current = true;
    if (initialState && Object.keys(initialState).length > 0) {
      useBrandingStore.getState().syncFromDb(initialState);
    }
  }, [hydrated, initialState]);
}
