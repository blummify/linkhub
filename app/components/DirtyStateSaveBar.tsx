"use client";

import type { CSSProperties } from "react";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";

export interface DirtyStateSaveBarProps {
  visible: boolean;
  onReset: () => void;
  onSave: () => void;
  saveLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export function DirtyStateSaveBar({
  visible,
  onReset,
  onSave,
  saveLabel = "Save changes",
  className = "",
  style,
}: DirtyStateSaveBarProps) {
  const reduced = usePrefersReducedMotion();
  const { transition: layoutTransition, ...restStyle } = style ?? {};

  const slideTransition = reduced
    ? "none"
    : visible
      ? "transform var(--motion-base) var(--ease-out)"
      : "transform var(--motion-base) var(--ease-in)";

  const transition = layoutTransition
    ? `${layoutTransition}, ${slideTransition}`
    : slideTransition;

  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      aria-hidden={!visible}
      data-testid="dirty-save-bar"
      className={`flex items-center gap-2 ${className}`.trim()}
      style={{
        zIndex: 84,
        transform: visible ? "translateY(0)" : "translateY(110%)",
        pointerEvents: visible ? "auto" : "none",
        background: "white",
        borderTop: "1px solid #eef0f7",
        boxShadow: "0 -4px 20px rgba(11,16,32,0.08)",
        padding: "10px 16px",
        ...restStyle,
        transition,
      }}
    >
      <span
        style={{
          flex: 1,
          fontSize: 12.5,
          fontWeight: 500,
          color: "#6b75a3",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        Unsaved changes
      </span>
      <button
        type="button"
        onClick={onReset}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "white",
          border: "1px solid #d6dae9",
          color: "#1a2244",
          padding: "0 14px",
          borderRadius: 99,
          minHeight: 40,
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        Reset
      </button>
      <button
        type="button"
        onClick={onSave}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: "linear-gradient(180deg, #3b46e0, #2a37c0)",
          color: "white",
          border: 0,
          padding: "0 16px",
          borderRadius: 99,
          minHeight: 40,
          fontFamily: "inherit",
          fontSize: 13.5,
          fontWeight: 600,
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: "0 4px 14px -4px rgba(59,70,224,0.5)",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        {saveLabel}
      </button>
    </div>
  );
}
