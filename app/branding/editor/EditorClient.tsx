"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBrandingStore } from "@/store/brandingStore";
import { saveEditorTheme } from "@/app/actions/profile";
import { getDefaultBrandingState } from "@/lib/brandingState";
import { EntryScreen } from "./components/EntryScreen";
import { EditorShell } from "./components/EditorShell";
import { EditorUpgradeModal } from "./components/EditorUpgradeModal";
import { DiscardModal } from "./components/DiscardModal";
import { SaveThemeModal } from "./components/SaveThemeModal";

type Step = "entry" | "editing";
type StartMode = "template" | "scratch";

export function EditorClient() {
  const router = useRouter();
  const store = useBrandingStore();

  const [step, setStep] = useState<Step>("entry");
  const [startMode, setStartMode] = useState<StartMode>("template");
  const [isSaving, setIsSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
        customThemeName: defaults.customThemeName,
      });
    }
    setStep("editing");
  }, [startMode, store]);

  // Cancel: navigate away, prompting if dirty
  const handleCancel = useCallback(() => {
    if (store.isDirty) {
      setShowDiscardModal(true);
    } else {
      router.push("/branding");
    }
  }, [store.isDirty, router]);

  // "Save" button click → open name modal
  const handleSaveClick = useCallback(() => {
    setShowSaveModal(true);
  }, []);

  // Confirmed save from modal with chosen theme name
  const handleSaveConfirm = useCallback(async (themeName: string) => {
    store.setCustomThemeName(themeName);
    setIsSaving(true);
    setSaveError(null);
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
        customThemeName: themeName,
      });

      if ("requiresUpgrade" in result) {
        setShowSaveModal(false);
        setShowUpgradeModal(true);
      } else if ("success" in result) {
        store.markSaved();
        router.push("/branding");
      } else if ("error" in result) {
        setShowSaveModal(false);
        setSaveError(result.error);
      }
    } catch {
      setShowSaveModal(false);
      setSaveError("Something went wrong. Please try again.");
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
        <EditorShell
          isDirty={store.isDirty}
          isSaving={isSaving}
          onSave={handleSaveClick}
          onCancel={handleCancel}
        />
      )}

      {/* Discard confirmation */}
      {showDiscardModal && (
        <DiscardModal
          onKeepEditing={() => setShowDiscardModal(false)}
          onDiscard={() => router.push("/branding")}
        />
      )}

      {/* Save with name */}
      {showSaveModal && (
        <SaveThemeModal
          initialName={store.customThemeName}
          isSaving={isSaving}
          onCancel={() => setShowSaveModal(false)}
          onSave={handleSaveConfirm}
        />
      )}

      {/* Upgrade gate */}
      {showUpgradeModal && (
        <EditorUpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}

      {/* Save error toast */}
      {saveError && (
        <div
          role="alert"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            borderRadius: 10,
            padding: "12px 20px",
            fontSize: 13.5,
            fontWeight: 500,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            maxWidth: 420,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {saveError}
          <button
            type="button"
            onClick={() => setSaveError(null)}
            aria-label="Dismiss error"
            style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 0, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
