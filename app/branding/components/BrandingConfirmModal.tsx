"use client";

import { useState, useEffect, useRef } from "react";
import { BRANDING_FONT_SERIF } from "@/app/constants/brandingFonts";
import { createPortal } from "react-dom";

export type BrandingModalIcon = "warn" | "info";
export type BrandingModalConfirmStyle = "danger" | "primary";

interface BrandingConfirmModalProps {
  open: boolean;
  onClose: () => void;
  icon?: BrandingModalIcon;
  title: string;
  body: string;
  confirmText?: string;
  confirmStyle?: BrandingModalConfirmStyle;
  onConfirm?: () => void;
}

function ModalIcon({ type }: { type: BrandingModalIcon }) {
  if (type === "info") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
        <circle cx="12" cy="12" r="10"/>
        <path strokeLinecap="round" d="M12 16v-4M12 8h.01"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/>
    </svg>
  );
}

export function BrandingConfirmModal({
  open,
  onClose,
  icon = "warn",
  title,
  body,
  confirmText = "Confirm",
  confirmStyle = "danger",
  onConfirm,
}: BrandingConfirmModalProps) {
  const [isMobile] = useState(() =>
    typeof window !== "undefined" && !!window.matchMedia &&
    window.matchMedia("(max-width: 1023px)").matches
  );
  const [isClosing, setIsClosing] = useState(false);
  const pendingConfirmRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) { setPrevOpen(open); if (open) setIsClosing(false); }

  function requestClose() { setIsClosing(true); }

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !isClosing) return;
    const handler = (e: AnimationEvent) => {
      if (e.target !== panel) return;
      if (pendingConfirmRef.current) { pendingConfirmRef.current = false; onConfirm?.(); }
      onClose();
    };
    panel.addEventListener('animationend', handler);
    return () => panel.removeEventListener('animationend', handler);
  }, [isClosing, onClose, onConfirm]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const iconBg = icon === "info" ? "#f0f1ff" : "#fffbeb";
  const iconColor = icon === "info" ? "#3b46e0" : "#d97706";

  const confirmBtnStyle: React.CSSProperties =
    confirmStyle === "primary"
      ? {
          background: "linear-gradient(180deg, #3b46e0, #2a37c0)",
          color: "white",
          boxShadow: "0 6px 16px -6px rgba(59,70,224,0.5)",
        }
      : {
          background: "#e11d48",
          color: "white",
          boxShadow: "0 6px 16px -6px rgba(225,29,72,0.5)",
        };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="branding-modal-title"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(11,16,32,0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: isMobile ? undefined : "center",
        zIndex: 9999,
        padding: isMobile ? 0 : 20,
        boxSizing: "border-box",
        opacity: isClosing ? 0 : 1,
        transition: `opacity ${isClosing ? "var(--motion-sheet-out) var(--ease-in)" : "var(--motion-base) var(--ease-standard)"}`,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        data-testid="modal-panel"
        style={{
          background: "white",
          borderRadius: isMobile ? "24px 24px 0 0" : 18,
          padding: isMobile
            ? "0 28px calc(24px + env(safe-area-inset-bottom,0px))"
            : 28,
          width: isMobile ? "100%" : 420,
          maxWidth: isMobile ? undefined : "calc(100vw - 40px)",
          boxShadow: "0 40px 80px -20px rgba(15,23,42,0.4)",
          animation: isClosing
            ? `${isMobile ? "lhSheetOut" : "lhModalOut"} var(--motion-sheet-out) var(--ease-in) forwards`
            : `${isMobile ? "lhSheetIn" : "lhModalIn"} var(--motion-sheet-in) var(--ease-out) both`,
        }}
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 16 }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "#d6dae9" }} />
          </div>
        )}

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            background: iconBg,
            color: iconColor,
          }}
        >
          <ModalIcon type={icon} />
        </div>

        <h2
          id="branding-modal-title"
          style={{
            fontFamily: BRANDING_FONT_SERIF,
            fontStyle: "italic",
            fontSize: 24,
            letterSpacing: "-0.01em",
            color: "#0b1020",
            marginBottom: 6,
            fontWeight: 400,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: 13.5,
            color: "#6b75a3",
            lineHeight: 1.55,
            marginBottom: 22,
          }}
        >
          {body}
        </p>

        <div style={{ display: "flex", gap: 8, justifyContent: isMobile ? undefined : "flex-end" }}>
          <button
            type="button"
            onClick={requestClose}
            style={{
              flex: isMobile ? 1 : undefined,
              minHeight: isMobile ? 46 : undefined,
              padding: "10px 18px",
              borderRadius: 99,
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              border: 0,
              background: "#eef0f7",
              color: "#1a2244",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              pendingConfirmRef.current = true;
              requestClose();
            }}
            style={{
              flex: isMobile ? 2 : undefined,
              minHeight: isMobile ? 46 : undefined,
              padding: "10px 18px",
              borderRadius: 99,
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              border: 0,
              ...confirmBtnStyle,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
