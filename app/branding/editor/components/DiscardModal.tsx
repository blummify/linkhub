"use client";

interface DiscardModalProps {
  onKeepEditing: () => void;
  onDiscard: () => void;
}

export function DiscardModal({ onKeepEditing, onDiscard }: DiscardModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="discard-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onKeepEditing}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(11,16,32,0.5)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "relative",
          background: "white",
          borderRadius: 18,
          padding: "32px 28px 24px",
          width: 360,
          boxShadow: "0 24px 64px -12px rgba(11,16,32,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h2
          id="discard-title"
          style={{ fontSize: 17, fontWeight: 700, color: "#0b1020", margin: 0 }}
        >
          Discard changes?
        </h2>
        <p style={{ fontSize: 13.5, color: "#6b75a3", margin: 0, lineHeight: 1.55 }}>
          You have unsaved changes. If you leave now, your edits will be lost.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            type="button"
            onClick={onKeepEditing}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "1px solid #eef0f7",
              background: "white",
              color: "#0b1020",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={onDiscard}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              background: "#dc2626",
              color: "white",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
