"use client";

import Link from "next/link";
import { BRANDING_FONT_SERIF } from "@/app/constants/brandingFonts";

interface EditorUpgradeModalProps {
  onClose: () => void;
}

export function EditorUpgradeModal({ onClose }: EditorUpgradeModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade required"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11,16,32,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: "36px 32px",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 24px 64px -12px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "linear-gradient(135deg, #3b46e0, #6873ff)",
            display: "grid",
            placeItems: "center",
            marginBottom: 20,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.88 5.78L20 10.5l-5.06 4.12 1.88 5.78L12 17.27l-4.82 3.13 1.88-5.78L4 10.5l6.12-1.72L12 3z" />
          </svg>
        </div>

        <h2
          style={{
            fontFamily: BRANDING_FONT_SERIF,
            fontStyle: "italic",
            fontSize: 26,
            color: "#0b1020",
            letterSpacing: "-0.02em",
            marginBottom: 10,
          }}
        >
          Upgrade to save your theme
        </h2>
        <p style={{ fontSize: 14, color: "#6b75a3", lineHeight: 1.55, marginBottom: 24 }}>
          Custom themes are available on the <strong style={{ color: "#0b1020" }}>Hub</strong> and{" "}
          <strong style={{ color: "#0b1020" }}>Studio</strong> plans. Upgrade to apply your design
          and unlock all premium templates, effects, and backgrounds.
        </p>

        {/* Plan highlights */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {[
            { plan: "Hub", price: "₵10/mo", features: ["Custom themes", "All templates", "Effects"] },
            { plan: "Studio", price: "₵20/mo", features: ["Everything in Hub", "Unlimited domains", "Priority support"] },
          ].map(({ plan, price, features }) => (
            <div
              key={plan}
              style={{
                border: "1px solid #eef0f7",
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, color: "#0b1020", marginBottom: 2 }}>{plan}</div>
              <div style={{ fontSize: 12, color: "#3b46e0", fontWeight: 600, marginBottom: 10 }}>{price}</div>
              {features.map((f) => (
                <div key={f} style={{ fontSize: 12, color: "#6b75a3", marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b46e0" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px 0",
              border: "1px solid #eef0f7",
              borderRadius: 10,
              background: "white",
              color: "#6b75a3",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Keep editing
          </button>
          <Link
            href="/billing"
            style={{
              flex: 1,
              padding: "11px 0",
              background: "#3b46e0",
              borderRadius: 10,
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 4px 12px -4px rgba(59,70,224,0.45)",
            }}
          >
            Upgrade now
          </Link>
        </div>
      </div>
    </div>
  );
}
