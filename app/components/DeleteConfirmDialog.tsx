"use client";

import { useState, useRef, useEffect } from "react";
import FocusTrap from "focus-trap-react";
import type { ManagedLink } from "../(dashboard)/user-admin/components/types";
import { LinkStatus } from "@/app/constants/linkStatus";

interface DeleteConfirmDialogProps {
  open: boolean;
  link?: ManagedLink;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({ open, link, onClose, onConfirm, isLoading = false }: DeleteConfirmDialogProps) {
  const [isMobile] = useState(() =>
    typeof window !== "undefined" && !!window.matchMedia &&
    window.matchMedia("(max-width: 1023px)").matches
  );
  const [isClosing, setIsClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) { setPrevOpen(open); if (open) setIsClosing(false); }

  function requestClose() { if (!isLoading) setIsClosing(true); }

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !isClosing) return;
    const handler = (e: AnimationEvent) => { if (e.target === panel) onClose(); };
    panel.addEventListener('animationend', handler);
    return () => panel.removeEventListener('animationend', handler);
  }, [isClosing, onClose]);

  if (!open || !link) return null;

  const isDraft = link.status === LinkStatus.DRAFT;
  const hasClicks = Number(String(link.clicks).replace(/,/g, "")) > 0;

  const message = isDraft
    ? "This link is a draft and hasn't been seen by visitors. It will be permanently removed."
    : hasClicks
    ? `This link has received ${link.clicks} click${link.clicks === "1" ? "" : "s"} and will be permanently removed from your public page.`
    : "This link will be permanently removed from your public page.";

  return (
    <FocusTrap active={!isClosing} focusTrapOptions={{ allowOutsideClick: true, returnFocusOnDeactivate: true }}>
    <div
      className={`fixed inset-0 z-[150] flex ${isMobile ? "items-end" : "items-center justify-center p-6"}`}
      style={{
        background: "rgba(11,16,32,0.55)",
        backdropFilter: "blur(8px)",
        opacity: isClosing ? 0 : 1,
        transition: `opacity ${isClosing ? "var(--motion-sheet-out) var(--ease-in)" : "var(--motion-base) var(--ease-standard)"}`,
      }}
      onClick={e => { if (e.target === e.currentTarget) requestClose(); }}
    >
      <div
        data-testid="modal-panel"
        className="relative w-full flex flex-col"
        style={{
          maxWidth:     isMobile ? undefined : 420,
          background:   "white",
          borderRadius: isMobile ? "24px 24px 0 0" : 20,
          boxShadow: "0 40px 80px -20px rgba(15,23,42,0.4), 0 16px 32px -16px rgba(15,23,42,0.2)",
          animation: isClosing
            ? `${isMobile ? "lhSheetOut" : "lhModalOut"} var(--motion-sheet-out) var(--ease-in) forwards`
            : `${isMobile ? "lhSheetIn" : "lhModalIn"} var(--motion-sheet-in) var(--ease-out) both`,
          padding: isMobile ? "0 28px calc(24px + env(safe-area-inset-bottom,0px))" : "28px 28px 24px",
        }}
        ref={panelRef}
      >
        {isMobile && (
          <div className="flex justify-center pt-3 pb-4 shrink-0">
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "#d6dae9" }} />
          </div>
        )}

        <div
          className="flex items-center justify-center mb-5 shrink-0"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#fde8ec",
            color: "#e11d48",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0b1020", marginBottom: 8, letterSpacing: "-0.01em" }}>
          Delete &ldquo;{link.title}&rdquo;?
        </h2>
        <p style={{ fontSize: 14, color: "#6b75a3", lineHeight: 1.55 }}>
          {message}
        </p>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={requestClose}
            disabled={isLoading}
            className="flex-1 transition-all"
            style={{
              minHeight: isMobile ? 46 : undefined,
              padding: "10px 0",
              borderRadius: 99,
              border: 0,
              background: "#eef0f7",
              color: "#1a2244",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.5 : 1,
              fontFamily: "inherit",
            }}
            onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = "#d6dae9"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#eef0f7"; }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 transition-all"
            style={{
              minHeight: isMobile ? 46 : undefined,
              padding: "10px 0",
              borderRadius: 99,
              border: 0,
              background: "linear-gradient(180deg, #e11d48, #be123c)",
              color: "white",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.8 : 1,
              boxShadow: "0 4px 14px -4px rgba(225,29,72,0.5)",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Deleting…
              </span>
            ) : "Delete"}
          </button>
        </div>
      </div>
    </div>
    </FocusTrap>
  );
}
