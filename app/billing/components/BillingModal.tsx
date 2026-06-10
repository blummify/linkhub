"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface BillingModalProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
}

export function BillingModal({ title, subtitle, children, footer, onClose }: BillingModalProps) {
  const [isMobile] = useState(() =>
    typeof window !== "undefined" && !!window.matchMedia &&
    window.matchMedia("(max-width: 1023px)").matches
  );
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const modal = overlayRef.current?.querySelector<HTMLElement>("dialog, [role='dialog']");
    const firstFocusable = modal?.querySelector<HTMLElement>(
      "button, input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    firstFocusable?.focus();
  }, []);

  const content = (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(11,16,32,0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: isMobile ? undefined : "center",
        padding: isMobile ? 0 : 20,
        animation: "fadeIn 0.18s ease",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-modal-title"
        style={{
          background: "white",
          borderRadius: isMobile ? "24px 24px 0 0" : 16,
          boxShadow: "0 24px 48px -16px rgba(30,42,138,0.18), 0 8px 16px -8px rgba(15,23,42,0.06)",
          width: "100%",
          maxWidth: isMobile ? undefined : 460,
          maxHeight: isMobile ? "min(90dvh, 90vh)" : "calc(100vh - 40px)",
          overflow: "auto",
          animation: isMobile
            ? "lhSheetIn 0.35s cubic-bezier(0.32,0.72,0,1)"
            : "modalIn 0.22s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 8 }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "#d6dae9" }} />
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "22px 24px 0" }}>
          <div>
            <h2 id="billing-modal-title" style={{ fontSize: 17, fontWeight: 600, color: "#0b1020" }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: 12.5, color: "#6b75a3", marginTop: 4, lineHeight: 1.45 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: "transparent", border: "1px solid #eef0f7",
              color: "#6b75a3", display: "grid", placeItems: "center", cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 24px" }}>{children}</div>

        {/* Footer */}
        <div
          style={{
            padding: isMobile
              ? `16px 24px calc(16px + env(safe-area-inset-bottom,0px))`
              : "16px 24px 22px",
            display: "flex", justifyContent: "flex-end", gap: 10,
            borderTop: "1px solid #eef0f7", marginTop: 4,
          }}
        >
          {footer}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn { from { opacity: 0; transform: translateY(10px) scale(.99) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

/* ── Reusable styled button helpers for modal footers ── */
export function ModalBtn({
  children, onClick, variant = "secondary", disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: "#3b46e0", color: "white", border: "none", boxShadow: "0 4px 12px -4px rgba(59,70,224,0.4)" },
    secondary: { background: "white", color: "#1a2244", border: "1px solid #d6dae9" },
    danger:    { background: "#e11d48", color: "white", border: "none" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        borderRadius: 8, padding: "8px 14px",
        fontSize: 13, fontWeight: 500,
        minHeight: 46,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}
