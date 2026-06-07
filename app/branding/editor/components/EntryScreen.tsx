"use client";

import { BRANDING_FONT_SERIF } from "@/app/constants/brandingFonts";

type StartMode = "template" | "scratch";

interface EntryScreenProps {
  selected: StartMode;
  onSelect: (mode: StartMode) => void;
  onOpen: () => void;
}

const cardBase: React.CSSProperties = {
  flex: 1,
  borderRadius: 20,
  padding: "28px 24px",
  cursor: "pointer",
  transition: "border-color 0.15s, box-shadow 0.15s",
  position: "relative",
  background: "white",
};

export function EntryScreen({ selected, onSelect, onOpen }: EntryScreenProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 40, display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontFamily: BRANDING_FONT_SERIF,
            fontStyle: "italic",
            fontSize: 28,
            color: "#0b1020",
            letterSpacing: "-0.02em",
          }}
        >
          linkhub
        </span>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b46e0, #6873ff)",
            display: "inline-block",
          }}
        />
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: BRANDING_FONT_SERIF,
          fontStyle: "italic",
          fontSize: 36,
          color: "#0b1020",
          letterSpacing: "-0.02em",
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        How would you like to start?
      </h1>
      <p style={{ fontSize: 14.5, color: "#6b75a3", textAlign: "center", marginBottom: 40 }}>
        Pick a starting point — you can always change everything later.
      </p>

      {/* Cards */}
      <div style={{ display: "flex", gap: 16, width: "100%", maxWidth: 700, flexWrap: "wrap" }}>
        {/* Start from a template */}
        <button
          type="button"
          onClick={() => onSelect("template")}
          style={{
            ...cardBase,
            border: `1.5px solid ${selected === "template" ? "#3b46e0" : "#eef0f7"}`,
            boxShadow: selected === "template" ? "0 0 0 3px rgba(59,70,224,0.12)" : "0 1px 3px rgba(15,23,42,0.06)",
          }}
        >
          {selected === "template" && (
            <span
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#3b46e0",
                display: "grid",
                placeItems: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "#eef0f7",
              display: "grid",
              placeItems: "center",
              marginBottom: 18,
              color: "#3b46e0",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="8" height="5" rx="1" />
              <rect x="13" y="3" width="8" height="5" rx="1" />
              <rect x="3" y="11" width="8" height="10" rx="1" />
              <rect x="13" y="11" width="8" height="10" rx="1" />
            </svg>
          </div>
          <div style={{ fontWeight: 600, fontSize: 15.5, color: "#0b1020", marginBottom: 6, textAlign: "left" }}>
            Start from a template
          </div>
          <div style={{ fontSize: 13.5, color: "#6b75a3", lineHeight: 1.5, textAlign: "left" }}>
            Choose from 21 professionally crafted themes and make it your own.
          </div>
        </button>

        {/* Start from scratch */}
        <button
          type="button"
          onClick={() => onSelect("scratch")}
          style={{
            ...cardBase,
            border: `1.5px solid ${selected === "scratch" ? "#3b46e0" : "#eef0f7"}`,
            boxShadow: selected === "scratch" ? "0 0 0 3px rgba(59,70,224,0.12)" : "0 1px 3px rgba(15,23,42,0.06)",
          }}
        >
          {selected === "scratch" && (
            <span
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#3b46e0",
                display: "grid",
                placeItems: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "#eef0f7",
              display: "grid",
              placeItems: "center",
              marginBottom: 18,
              color: "#3b46e0",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4z" />
              <path strokeLinecap="round" d="M15 6l3 3" />
            </svg>
          </div>
          <div style={{ fontWeight: 600, fontSize: 15.5, color: "#0b1020", marginBottom: 6, textAlign: "left" }}>
            Start from scratch
          </div>
          <div style={{ fontSize: 13.5, color: "#6b75a3", lineHeight: 1.5, textAlign: "left" }}>
            Open the editor with a blank canvas and build exactly what you envision.
          </div>
        </button>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onOpen}
        style={{
          marginTop: 36,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: "#3b46e0",
          color: "white",
          border: "none",
          borderRadius: 14,
          padding: "14px 28px",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 16px -4px rgba(59,70,224,0.45)",
          letterSpacing: "-0.01em",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.88 5.78L20 10.5l-5.06 4.12 1.88 5.78L12 17.27l-4.82 3.13 1.88-5.78L4 10.5l6.12-1.72L12 3z" />
        </svg>
        Open the Editor
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
