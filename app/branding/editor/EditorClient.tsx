"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBrandingStore } from "@/store/brandingStore";
import { saveEditorTheme } from "@/app/actions/profile";
import { getDefaultBrandingState } from "@/lib/brandingState";
import { EntryScreen } from "./components/EntryScreen";
import { EditorShell } from "./components/EditorShell";
import { EditorUpgradeModal } from "./components/EditorUpgradeModal";

type Step = "entry" | "editing";
type StartMode = "template" | "scratch";

export function EditorClient() {
  const router = useRouter();
  const store = useBrandingStore();

  const [step, setStep] = useState<Step>("entry");
  const [startMode, setStartMode] = useState<StartMode>("template");
  const [isSaving, setIsSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleOpen = useCallback(() => {
    if (startMode === "scratch") {
      const defaults = getDefaultBrandingState();
      store.syncFromDb({
        themeId: defaults.themeId,
        accentColor: defaults.accentColor,
        buttonStyle: defaults.buttonStyle,
        fontFamily: defaults.fontFamily,
        backgroundType: defaults.backgroundType,
        backgroundValue: defaults.backgroundValue,
        backgroundKey: defaults.backgroundKey,
        effects: defaults.effects,
        textColor: defaults.textColor,
        cardStyle: defaults.cardStyle,
        bodyFont: defaults.bodyFont,
        overlayColor: defaults.overlayColor,
        overlayOpacity: defaults.overlayOpacity,
        profileLayout: defaults.profileLayout,
        linkDensity: defaults.linkDensity,
      });
    }
    setStep("editing");
  }, [startMode, store]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await saveEditorTheme({
        themeId: store.themeId,
        accentColor: store.accentColor,
        buttonStyle: store.buttonStyle,
        fontFamily: store.fontFamily,
        backgroundType: store.backgroundType,
        backgroundValue: store.backgroundValue,
        backgroundKey: store.backgroundKey,
        effects: store.effects.join(","),
        textColor: store.textColor,
        cardStyle: store.cardStyle,
        bodyFont: store.bodyFont,
        overlayColor: store.overlayColor,
        overlayOpacity: store.overlayOpacity,
        profileLayout: store.profileLayout,
        linkDensity: store.linkDensity,
      });

      if ("requiresUpgrade" in result) {
        setShowUpgradeModal(true);
      } else if ("success" in result) {
        store.markSaved();
        router.push("/branding");
      }
    } finally {
      setIsSaving(false);
    }
  }, [store, router]);

  return (
    <>
      {step === "entry" ? (
        <EntryScreen
          selected={startMode}
          onSelect={setStartMode}
          onOpen={handleOpen}
        />
      ) : (
        <EditorShell onSave={handleSave} isSaving={isSaving} />
      )}

      {showUpgradeModal && (
        <EditorUpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </>
  );
}
