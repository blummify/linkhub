"use client";

import { useEffect, useMemo, useRef } from "react";

interface UseShortKeyOptions {
  modifier?: "ctrl" | "cmd";
  key?: string;
  enabled?: boolean;
}

function labelForModifier(m: "ctrl" | "cmd" | undefined, usesMetaKey: boolean): string {
  if (m === "cmd") return "⌘";
  if (m === "ctrl") return "Ctrl";
  return usesMetaKey ? "⌘" : "Ctrl";
}

function modifierLabelFromEnvironment(manualModifier?: "ctrl" | "cmd"): string {
  if (typeof navigator === "undefined") {
    return labelForModifier(manualModifier, false);
  }
  const usesMetaKey = /mac|ipad|iphone/i.test(navigator.userAgent);
  return labelForModifier(manualModifier, usesMetaKey);
}

export function useShortKey(onTrigger: () => void, options: UseShortKeyOptions = {}) {
  const { modifier: manualModifier, key = "k", enabled = true } = options;
  const onTriggerRef = useRef(onTrigger);

  /** Derived from env; consumers should render with suppressHydrationWarning (see AppHeader). */
  const modifier = useMemo(
    () => modifierLabelFromEnvironment(manualModifier),
    [manualModifier]
  );

  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    if (!enabled) return;

    const usesMetaKey = /mac|ipad|iphone/i.test(navigator.userAgent);
    const effectiveModifier = manualModifier ?? (usesMetaKey ? "cmd" : "ctrl");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;

      const isModifierPressed =
        effectiveModifier === "cmd" ? event.metaKey : event.ctrlKey;

      if (isModifierPressed) {
        event.preventDefault();
        onTriggerRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, key, manualModifier]);

  return { modifier };
}
