"use client";

import { useState } from "react";
import type { ManagedLink } from "./types";
import { SiInstagram, SiYoutube, SiSpotify, SiX } from "react-icons/si";
import { TbWorld } from "react-icons/tb";

interface AddEditLinkModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (link: ManagedLink) => void;
  initialLink?: ManagedLink;
}

const PRESETS = [
  { id: "website",   label: "Website",   urlPrefix: "https://",               Icon: TbWorld      },
  { id: "instagram", label: "Instagram", urlPrefix: "https://instagram.com/", Icon: SiInstagram  },
  { id: "youtube",   label: "YouTube",   urlPrefix: "https://youtube.com/",   Icon: SiYoutube    },
  { id: "twitter",   label: "Twitter",   urlPrefix: "https://x.com/",         Icon: SiX          },
  { id: "spotify",   label: "Spotify",   urlPrefix: "https://open.spotify.com/", Icon: SiSpotify },
];

function isValidURL(str: string) {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function AddEditLinkModal({
  open,
  onClose,
  onSave,
  initialLink,
}: AddEditLinkModalProps) {
  const [title, setTitle] = useState(() => initialLink?.title ?? "");
  const [url, setUrl] = useState(() => initialLink?.url ?? "");
  const [icon, setIcon] = useState<string | undefined>(() => initialLink?.icon);
  const [draft, setDraft] = useState(() => initialLink?.draft ?? false);

  if (!open) return null;

  const isEdit = !!initialLink;
  const canSave = title.trim().length > 0 && isValidURL(url.trim());

  const handleSelectPreset = (preset: (typeof PRESETS)[0]) => {
    setTitle(preset.label);
    setUrl(preset.urlPrefix);
    setIcon(preset.id);
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      title: title.trim() || "Untitled",
      url: url.trim(),
      icon,
      clicks: initialLink?.clicks || "0",
      draft,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(11,16,32,0.55)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full overflow-hidden flex flex-col"
        style={{
          maxWidth: 540,
          maxHeight: "calc(100vh - 48px)",
          background: "white",
          borderRadius: 22,
          boxShadow:
            "0 40px 80px -20px rgba(15,23,42,0.4), 0 16px 32px -16px rgba(15,23,42,0.2)",
          animation: "lhModalIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <style>{`
          @keyframes lhModalIn {
            from { opacity: 0; transform: translateY(16px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-start justify-between gap-4" style={{ padding: "24px 28px 0" }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontStyle: "italic",
                fontSize: 28,
                letterSpacing: "-0.02em",
                color: "#0b1020",
                lineHeight: 1.1,
              }}
            >
              {isEdit ? (
                <>Edit <em style={{ color: "#3b46e0" }}>link</em></>
              ) : (
                <>Add a <em style={{ color: "#3b46e0" }}>new</em> link</>
              )}
            </h2>
            <p style={{ fontSize: 13, color: "#6b75a3", marginTop: 4 }}>
              {isEdit
                ? "Update the URL, title, or status."
                : "Paste a URL and we'll do the rest."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center transition-all shrink-0"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: 0,
              background: "#eef0f7",
              color: "#3a4474",
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "#d6dae9";
              (e.currentTarget as HTMLButtonElement).style.color = "#0b1020";
              (e.currentTarget as HTMLButtonElement).style.transform = "rotate(90deg)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "#eef0f7";
              (e.currentTarget as HTMLButtonElement).style.color = "#3a4474";
              (e.currentTarget as HTMLButtonElement).style.transform = "rotate(0deg)";
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          className="overflow-y-auto flex flex-col gap-[18px]"
          style={{ padding: "22px 28px 0" }}
        >
          {/* Platform presets (add mode only) */}
          {!isEdit && (
            <div>
              <p
                className="uppercase mb-2"
                style={{ fontSize: 12, fontWeight: 500, color: "#3a4474", letterSpacing: "0.07em" }}
              >
                Quick pick
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {PRESETS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="flex flex-col items-center gap-1.5 shrink-0 transition-all"
                    style={{
                      minWidth: 68,
                      padding: "10px 10px 8px",
                      borderRadius: 12,
                      border: `1.5px solid ${icon === p.id ? "#6873ff" : "#eef0f7"}`,
                      background: icon === p.id ? "#f1f3ff" : "white",
                      color: icon === p.id ? "#3b46e0" : "#3a4474",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    <p.Icon size={18} />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* URL field */}
          <div className="flex flex-col gap-[7px]">
            <div className="flex items-center justify-between">
              <label
                htmlFor="m-url"
                className="uppercase"
                style={{ fontSize: 12, fontWeight: 500, color: "#3a4474", letterSpacing: "0.07em" }}
              >
                URL <span style={{ color: "#3b46e0" }}>*</span>
              </label>
            </div>
            <input
              id="m-url"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              autoComplete="off"
              className="w-full outline-none transition-all"
              style={{
                background: "#f7f8fc",
                border: "1.5px solid #eef0f7",
                borderRadius: 12,
                padding: "12px 14px",
                fontFamily: "inherit",
                fontSize: 14,
                color: "#0b1020",
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = "#6873ff";
                e.currentTarget.style.background = "white";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(104,115,255,0.12)";
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = "#eef0f7";
                e.currentTarget.style.background = "#f7f8fc";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Title field */}
          <div className="flex flex-col gap-[7px]">
            <label
              htmlFor="m-title"
              className="uppercase"
              style={{ fontSize: 12, fontWeight: 500, color: "#3a4474", letterSpacing: "0.07em" }}
            >
              Title <span style={{ color: "#3b46e0" }}>*</span>
            </label>
            <input
              id="m-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. My Portfolio"
              maxLength={50}
              className="w-full outline-none transition-all"
              style={{
                background: "#f7f8fc",
                border: "1.5px solid #eef0f7",
                borderRadius: 12,
                padding: "12px 14px",
                fontFamily: "inherit",
                fontSize: 14,
                color: "#0b1020",
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = "#6873ff";
                e.currentTarget.style.background = "white";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(104,115,255,0.12)";
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = "#eef0f7";
                e.currentTarget.style.background = "#f7f8fc";
                e.currentTarget.style.boxShadow = "none";
              }}
              onKeyDown={e => { if (e.key === "Enter" && canSave) handleSave(); }}
            />
          </div>

          {/* Status row */}
          <div>
            <p
              className="uppercase mb-2"
              style={{ fontSize: 12, fontWeight: 500, color: "#3a4474", letterSpacing: "0.07em" }}
            >
              Status
            </p>
            <div
              className="flex items-center gap-3"
              style={{
                background: "#f7f8fc",
                border: "1.5px solid #eef0f7",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              {/* Status icon */}
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: draft ? "#fdf3e3" : "#e8f6ee",
                  color: draft ? "#d97706" : "#16a34a",
                }}
              >
                {draft ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"/>
                  </svg>
                )}
              </div>

              {/* Status text */}
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "#0b1020" }}>
                  {draft ? "Save as draft" : "Publish immediately"}
                </p>
                <p style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 2 }}>
                  {draft
                    ? "Link stays hidden until you publish it"
                    : "This link will be visible on your public page"}
                </p>
              </div>

              {/* Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={!draft}
                onClick={() => setDraft(d => !d)}
                className="relative shrink-0 outline-none transition-colors duration-200"
                style={{
                  width: 38,
                  height: 22,
                  borderRadius: 99,
                  background: draft ? "#d6dae9" : "#3b46e0",
                  border: 0,
                  cursor: "pointer",
                }}
              >
                <span
                  className="absolute rounded-full bg-white transition-transform duration-200"
                  style={{
                    width: 18,
                    height: 18,
                    top: 2,
                    left: 2,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                    transform: draft ? "translateX(0)" : "translateX(16px)",
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-3 shrink-0"
          style={{
            padding: "20px 28px 24px",
            marginTop: 8,
            borderTop: "1px solid #eef0f7",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="transition-all"
            style={{
              padding: "10px 16px",
              borderRadius: 99,
              border: 0,
              background: "#eef0f7",
              color: "#1a2244",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#d6dae9"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#eef0f7"; }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-1.5 transition-all"
            style={{
              padding: "10px 18px",
              borderRadius: 99,
              border: 0,
              background: canSave
                ? "linear-gradient(180deg,#3b46e0,#2a37c0)"
                : "linear-gradient(180deg,#3b46e0,#2a37c0)",
              opacity: canSave ? 1 : 0.5,
              color: "white",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: canSave ? "pointer" : "not-allowed",
              boxShadow: canSave
                ? "0 4px 14px -4px rgba(59,70,224,0.5)"
                : "none",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => {
              if (canSave)
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            {isEdit ? "Save changes" : "Add link"}
          </button>
        </div>
      </div>
    </div>
  );
}
