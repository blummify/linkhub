"use client";

export interface DirtyStateSaveToolbarProps {
  dirty: boolean;
  onReset: () => void;
  onSave: () => void;
  saving?: boolean;
}

export function DirtyStateSaveToolbar({
  dirty,
  onReset,
  onSave,
  saving = false,
}: DirtyStateSaveToolbarProps) {
  return (
    <div
      className="hidden lg:flex items-center"
      data-testid="dirty-save-toolbar"
      style={{ gap: 10, flexShrink: 0 }}
    >
      {dirty && (
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 500,
            color: "#6b75a3",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              background: "#f59e0b",
              borderRadius: "50%",
              flexShrink: 0,
              animation: "dot-blink 1.2s ease-in-out infinite",
            }}
          />
          Unsaved changes
        </span>
      )}
      <button
        type="button"
        onClick={onReset}
        disabled={!dirty || saving}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: "white",
          border: "1px solid #eef0f7",
          color: dirty ? "#1a2244" : "#9aa3c2",
          padding: "10px 14px",
          borderRadius: 99,
          minHeight: 44,
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 500,
          cursor: dirty && !saving ? "pointer" : "not-allowed",
          opacity: dirty ? 1 : 0.65,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 0115-6.7l3-3v9h-9l3.7-3.7M21 12a9 9 0 01-15 6.7l-3 3v-9h9l-3.7 3.7"/>
        </svg>
        Reset
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || saving}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: dirty
            ? "linear-gradient(180deg, #3b46e0, #2a37c0)"
            : "#eef0f7",
          color: dirty ? "white" : "#9aa3c2",
          border: 0,
          padding: "11px 18px",
          borderRadius: 99,
          minHeight: 44,
          fontFamily: "inherit",
          fontSize: 13.5,
          fontWeight: 600,
          cursor: dirty && !saving ? "pointer" : "not-allowed",
          boxShadow: dirty
            ? "0 6px 18px -6px rgba(59,70,224,0.55), inset 0 1px 0 rgba(255,255,255,0.15)"
            : "none",
          opacity: dirty ? 1 : 0.85,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
