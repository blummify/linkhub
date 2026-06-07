"use client";

import { useSession } from "next-auth/react";
import UserAvatar from "@/app/components/UserAvatar";
import { EditorLeftPanel } from "./EditorLeftPanel";
import { EditorPreviewCenter } from "./EditorPreviewCenter";
import { EditorRightPanel } from "./EditorRightPanel";

interface EditorShellProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function EditorShell({ isDirty, isSaving, onSave, onCancel }: EditorShellProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div
        style={{
          height: 56,
          borderBottom: "1px solid #eef0f7",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          flexShrink: 0,
          zIndex: 20,
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <UserAvatar
            src={user?.image}
            name={user?.name}
            email={user?.email}
            className="w-8 h-8 rounded-full border border-[#eef0f7] object-cover shrink-0"
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0b1020", lineHeight: 1.2 }}>
              Open Editor
            </div>
            {user?.name && (
              <div
                style={{
                  fontSize: 11,
                  color: "#6b75a3",
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 160,
                }}
              >
                {user.name}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {isDirty && (
            <div
              aria-label="Unsaved changes"
              title="Unsaved changes"
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#f59e0b",
                flexShrink: 0,
              }}
            />
          )}

          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              background: "white",
              color: "#6b75a3",
              border: "1px solid #eef0f7",
              borderRadius: 9,
              fontSize: 13.5,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#d6dae9";
              e.currentTarget.style.color = "#0b1020";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#eef0f7";
              e.currentTarget.style.color = "#6b75a3";
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            style={{
              padding: "8px 20px",
              background: isSaving ? "#8b95f0" : "#3b46e0",
              color: "white",
              border: "none",
              borderRadius: 9,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: isSaving ? "default" : "pointer",
              transition: "background 0.15s",
              boxShadow: isSaving ? "none" : "0 3px 10px -3px rgba(59,70,224,0.45)",
              fontFamily: "inherit",
            }}
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <EditorLeftPanel />
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
          <EditorPreviewCenter />
        </div>
        <EditorRightPanel />
      </div>
    </div>
  );
}
