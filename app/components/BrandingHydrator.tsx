"use client";

import { useEffect } from "react";
import { useBrandingStore } from "@/store/brandingStore";

export function BrandingHydrator() {
  useEffect(() => {
    useBrandingStore.persist.rehydrate();
    useBrandingStore.getState().setHydrated(true);
  }, []);
  return null;
}
