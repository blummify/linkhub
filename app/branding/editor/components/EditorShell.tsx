"use client";

import { EditorLeftPanel } from "./EditorLeftPanel";
import { EditorPreviewCenter } from "./EditorPreviewCenter";
import { EditorRightPanel } from "./EditorRightPanel";

interface EditorShellProps {
  onSave: () => void;
  isSaving: boolean;
}

export function EditorShell({ onSave, isSaving }: EditorShellProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Top bar */}
      <div
        style={{
          height: 56,
          borderBottom: "1px solid #eef0f7",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "#0b1020" }}>Open Editor</span>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          style={{
            padding: "8px 22px",
            background: isSaving ? "#8b95f0" : "#3b46e0",
            color: "white",
            border: "none",
            borderRadius: 9,
            fontSize: 13.5,
            fontWeight: 600,
            cursor: isSaving ? "default" : "pointer",
            transition: "background 0.15s",
            boxShadow: "0 3px 10px -3px rgba(59,70,224,0.45)",
          }}
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* 3-column body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <EditorLeftPanel />

        {/* Center: fills remaining space, preview component owns its own background */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
          <EditorPreviewCenter />
        </div>

        <EditorRightPanel />
      </div>
    </div>
  );
}
