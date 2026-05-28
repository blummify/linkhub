"use client";

import type { ManagedLink } from "../user-admin/components/types";
import { LinkStatus } from "@/app/constants/linkStatus";

interface DeleteConfirmDialogProps {
  open: boolean;
  link?: ManagedLink;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({ open, link, onClose, onConfirm, isLoading = false }: DeleteConfirmDialogProps) {
  if (!open || !link) return null;

  const isDraft = link.status === LinkStatus.DRAFT;
  const hasClicks = Number(String(link.clicks).replace(/,/g, "")) > 0;

  const message = isDraft
    ? "This link is a draft and hasn't been seen by visitors. It will be permanently removed."
    : hasClicks
    ? `This link has received ${link.clicks} click${link.clicks === "1" ? "" : "s"} and will be permanently removed from your public page.`
    : "This link will be permanently removed from your public page.";

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-6"
      style={{ background: "rgba(11,16,32,0.55)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
    >
      <div
        className="relative w-full flex flex-col"
        style={{
          maxWidth: 420,
          background: "white",
          borderRadius: 20,
          boxShadow: "0 40px 80px -20px rgba(15,23,42,0.4), 0 16px 32px -16px rgba(15,23,42,0.2)",
          animation: "dlgIn 0.25s cubic-bezier(0.16,1,0.3,1)",
          padding: "28px 28px 24px",
        }}
      >
        {/* Icon */}
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
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 transition-all"
            style={{
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
  );
}
