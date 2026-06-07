"use client";

import { useEffect, useRef, useState } from "react";

interface SaveThemeModalProps {
  initialName: string;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (name: string) => void;
}

export function SaveThemeModal({
  initialName,
  isSaving,
  onCancel,
  onSave,
}: SaveThemeModalProps) {
  const [name, setName] = useState(initialName || "My Theme");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isSaving) return;
    onSave(trimmed);
  };

  const tooLong = name.length > 60;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-theme-title"
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
        onClick={onCancel}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(11,16,32,0.5)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Panel */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: "relative",
          background: "white",
          borderRadius: 18,
          padding: "32px 28px 24px",
          width: 400,
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
            background: "#f0f1ff",
            border: "1px solid #c7d0ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b46e0" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v5m0 0l-2-2m2 2l2-2" />
          </svg>
        </div>

        <h2
          id="save-theme-title"
          style={{ fontSize: 17, fontWeight: 700, color: "#0b1020", margin: 0 }}
        >
          Save your theme
        </h2>
        <p style={{ fontSize: 13.5, color: "#6b75a3", margin: 0, lineHeight: 1.55 }}>
          Give this theme a name so you can recognize it later.
        </p>

        {/* Name input */}
        <div style={{ marginTop: 12 }}>
          <label
            htmlFor="theme-name-input"
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              color: "#6b75a3",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 7,
            }}
          >
            Theme name
          </label>
          <input
            id="theme-name-input"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Midnight Glow, Summer Vibes…"
            maxLength={70}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: `1.5px solid ${tooLong ? "#fca5a5" : "#eef0f7"}`,
              fontSize: 14,
              color: "#0b1020",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => {
              if (!tooLong) {
                e.currentTarget.style.borderColor = "#6873ff";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(104,115,255,0.12)";
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = tooLong ? "#fca5a5" : "#eef0f7";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 5,
              fontSize: 11,
              color: tooLong ? "#dc2626" : "#a8aecb",
            }}
          >
            {name.length}/60
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "1px solid #eef0f7",
              background: "white",
              color: "#0b1020",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: isSaving ? "default" : "pointer",
              fontFamily: "inherit",
              opacity: isSaving ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || tooLong || !name.trim()}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              background: isSaving || tooLong || !name.trim() ? "#8b95f0" : "#3b46e0",
              color: "white",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: isSaving || tooLong || !name.trim() ? "default" : "pointer",
              fontFamily: "inherit",
              boxShadow: isSaving || tooLong || !name.trim() ? "none" : "0 3px 10px -3px rgba(59,70,224,0.45)",
              transition: "background 0.15s, box-shadow 0.15s",
            }}
          >
            {isSaving ? "Saving…" : "Save theme"}
          </button>
        </div>
      </form>
    </div>
  );
}
