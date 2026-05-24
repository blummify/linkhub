"use client";

import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: 260,
        height: 530,
        background: "#0b1020",
        borderRadius: 42,
        padding: 8,
        flexShrink: 0,
        boxShadow:
          "0 40px 80px -20px rgba(30,42,138,0.25), 0 16px 32px -16px rgba(15,23,42,0.12)",
      }}
    >
      {/* Notch */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          width: 90,
          height: 22,
          background: "#0b1020",
          borderRadius: 12,
          zIndex: 20,
        }}
      />
      {/* Screen */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 34,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          background: "linear-gradient(180deg, #fafbff 0%, #f0f2fb 100%)",
          padding: "44px 22px 22px",
        }}
      >
        {/* Radial glow overlay */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 0%, rgba(104,115,255,0.18), transparent 55%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
