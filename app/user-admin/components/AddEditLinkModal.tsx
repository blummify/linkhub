"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ManagedLink } from "./types";
import { LinkStatus, type LinkStatusValue } from "@/app/constants/linkStatus";
import { useFileUpload } from "@/lib/hooks/useFileUpload";

interface AddEditLinkModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (link: ManagedLink) => void;
  initialLink?: ManagedLink;
}

// ── Preset icons ────────────────────────────────────────────────────────────

const PRESET_ICONS = [
  {
    id: "globe",
    label: "Website",
    gradient: "linear-gradient(135deg,#eef1ff,#dbe2ff)",
    color: "#2a37c0",
    svg: (size: number) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
        <circle cx="12" cy="12" r="10"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
      </svg>
    ),
  },
  {
    id: "instagram",
    label: "Instagram",
    gradient: "linear-gradient(135deg,#ffe9f1,#ffd9e6)",
    color: "#d6336c",
    svg: (size: number) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01"/>
      </svg>
    ),
  },
  {
    id: "twitter",
    label: "Twitter / X",
    gradient: "linear-gradient(135deg,#e9f3ff,#d2e6ff)",
    color: "#1565d8",
    svg: (size: number) => (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
        <path d="M22.46 6c-.85.38-1.78.64-2.75.76 1-.6 1.76-1.55 2.12-2.68-.93.55-1.96.95-3.06 1.17C17.9 4.31 16.7 3.8 15.4 3.8c-2.66 0-4.79 2.16-4.79 4.79 0 .38.04.74.13 1.09C6.7 9.5 3.1 7.6.66 4.7c-.41.7-.65 1.5-.65 2.4 0 1.66.85 3.12 2.13 3.98-.78 0-1.5-.22-2.13-.55v.06c0 2.33 1.64 4.26 3.83 4.7-.4.1-.82.16-1.25.16-.3 0-.6-.03-.9-.08.6 1.9 2.37 3.27 4.47 3.31-1.64 1.28-3.7 2.04-5.93 2.04-.39 0-.77-.02-1.14-.07 2.1 1.35 4.6 2.13 7.28 2.13 8.74 0 13.51-7.24 13.51-13.5 0-.2 0-.41-.02-.6.93-.67 1.73-1.5 2.36-2.45z"/>
      </svg>
    ),
  },
  {
    id: "youtube",
    label: "YouTube",
    gradient: "linear-gradient(135deg,#ffe4e4,#ffcccc)",
    color: "#cc0000",
    svg: (size: number) => (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
        <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/>
      </svg>
    ),
  },
  {
    id: "spotify",
    label: "Spotify",
    gradient: "linear-gradient(135deg,#e3f7e8,#ccf0d6)",
    color: "#1db954",
    svg: (size: number) => (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.5 17.3c-.2.4-.7.5-1 .3-2.8-1.7-6.3-2.1-10.5-1.1-.4.1-.8-.2-.9-.6-.1-.4.2-.8.6-.9 4.5-1 8.4-.6 11.5 1.3.4.2.5.7.3 1zm1.5-3.3c-.3.4-.8.6-1.2.3-3.2-2-8.1-2.5-11.9-1.4-.5.1-1-.2-1.1-.6-.1-.5.2-1 .6-1.1 4.4-1.3 9.8-.7 13.5 1.5.4.3.6.8.3 1.3zm.1-3.4C15.3 8.4 8.5 8.2 4.9 9.3c-.5.2-1.1-.1-1.3-.7-.2-.5.1-1.1.7-1.3 4.2-1.3 11.7-1.1 16.3 1.7.5.3.7 1 .4 1.5-.3.4-.9.6-1.4.3z"/>
      </svg>
    ),
  },
  {
    id: "behance",
    label: "Behance",
    gradient: "linear-gradient(135deg,#e9f3ff,#d2e6ff)",
    color: "#1565d8",
    svg: (size: number) => (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
        <path d="M6.94 4.5c.7 0 1.34.06 1.92.19.58.13 1.07.33 1.49.61.4.28.73.65.95 1.12.23.47.34 1.05.34 1.73 0 .74-.17 1.36-.5 1.86-.34.49-.84.9-1.5 1.22.9.26 1.57.72 2.02 1.37.44.66.66 1.45.66 2.36 0 .75-.13 1.39-.4 1.93-.28.55-.67 1-1.16 1.35-.49.35-1.05.6-1.7.76-.62.16-1.3.24-2 .24H0V4.5h6.94zM18 6h-4v1.5h4V6zm2 5h-8c0 1.4.6 2.5 2 2.5 1 0 1.6-.5 1.8-1h2.1c-.4 1.7-1.8 2.7-4 2.7-2.7 0-4.4-1.8-4.4-4.4 0-2.5 1.8-4.4 4.3-4.4 2.8 0 4.3 2 4.2 4.6zM3 7v3h3.4c.7 0 1.3-.4 1.3-1.5S7.2 7 6.4 7H3zm0 5v3.5h3.6c.9 0 1.5-.6 1.5-1.7S7.5 12 6.6 12H3zm10.4-2h3.4c-.1-1-.7-1.6-1.6-1.6S13.5 9 13.4 10z"/>
      </svg>
    ),
  },
  {
    id: "mail",
    label: "Email",
    gradient: "linear-gradient(135deg,#fff4dc,#ffe9b8)",
    color: "#d97706",
    svg: (size: number) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 6l-10 7L2 6"/>
      </svg>
    ),
  },
  {
    id: "shop",
    label: "Shop",
    gradient: "linear-gradient(135deg,#f3e9ff,#e6d2ff)",
    color: "#7c3aed",
    svg: (size: number) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 11-8 0"/>
      </svg>
    ),
  },
];

type PresetId = (typeof PRESET_ICONS)[number]["id"];

// ── Domain → title/icon map ──────────────────────────────────────────────────

const DOMAIN_MAP: Record<string, { title: string; icon: PresetId }> = {
  "instagram.com": { title: "Instagram Profile", icon: "instagram" },
  "twitter.com":   { title: "Twitter Profile",   icon: "twitter"   },
  "x.com":         { title: "X Profile",         icon: "twitter"   },
  "youtube.com":   { title: "YouTube Channel",   icon: "youtube"   },
  "youtu.be":      { title: "YouTube Video",     icon: "youtube"   },
  "spotify.com":   { title: "Spotify",           icon: "spotify"   },
  "open.spotify.com": { title: "Spotify",        icon: "spotify"   },
  "behance.net":   { title: "Behance Portfolio", icon: "behance"   },
  "dribbble.com":  { title: "Dribbble Portfolio",icon: "globe"     },
  "linkedin.com":  { title: "LinkedIn Profile",  icon: "globe"     },
  "github.com":    { title: "GitHub Profile",    icon: "globe"     },
};

function isValidURL(str: string) {
  try {
    const u = new URL(str);
    if (u.protocol === "mailto:") return u.pathname.length > 0;
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ── Preset icon auto-fill defaults ───────────────────────────────────────────

const PRESET_DEFAULTS: Record<PresetId, { url: string; title: string }> = {
  globe:     { url: "",                             title: "My Website"        },
  instagram: { url: "https://www.instagram.com/",  title: "Instagram Profile" },
  twitter:   { url: "https://twitter.com/",         title: "Twitter Profile"   },
  youtube:   { url: "https://www.youtube.com/",     title: "YouTube Channel"   },
  spotify:   { url: "https://open.spotify.com/",    title: "Spotify"           },
  behance:   { url: "https://www.behance.net/",     title: "Behance Portfolio" },
  mail:      { url: "mailto:",                      title: "Email Me"          },
  shop:      { url: "",                             title: "My Shop"           },
};

function detectFromURL(url: string): { title: string; icon: PresetId } | null {
  try {
    const host = new URL(url).hostname.replace("www.", "");
    if (DOMAIN_MAP[host]) return DOMAIN_MAP[host];
    const clean = host.split(".")[0];
    return { title: clean.charAt(0).toUpperCase() + clean.slice(1), icon: "globe" };
  } catch {
    return null;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function AddEditLinkModal({ open, onClose, onSave, initialLink }: AddEditLinkModalProps) {
  const [title, setTitle]               = useState(() => initialLink?.title ?? "");
  const [url, setUrl]                   = useState(() => initialLink?.url ?? "");
  const [status, setStatus]             = useState<LinkStatusValue>( () => initialLink?.status ?? LinkStatus.PUBLISHED);
  const initialStatusRef                = useRef<LinkStatusValue>(initialLink?.status ?? LinkStatus.PUBLISHED);
  const [titleLen, setTitleLen]         = useState(() => (initialLink?.title ?? "").length);
  const [urlValidState, setUrlValidState] = useState<"none" | "valid" | "invalid">("none");
  const [urlError, setUrlError]         = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<{ title: string; icon: PresetId } | null>(null);
  // thumbImage: blob URL (local preview) or R2 URL (existing link)
  const [thumbImage, setThumbImage]     = useState<string | null>(() => initialLink?.thumbnailUrl ?? null);
  const [thumbKey, setThumbKey]         = useState<string | null>(() => initialLink?.thumbnailKey ?? null);
  const [pendingFile, setPendingFile]   = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetId>(() => (initialLink?.icon as PresetId | undefined) ?? "globe");
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const blobUrlRef    = useRef<string | null>(null);
  const uploadKeyRef  = useRef<string | null>(null);

  const [uploadError, setUploadError]   = useState<string | null>(null);
  const [isSaving, setIsSaving]         = useState(false);

  // Revoke any blob URL when the modal unmounts
  useEffect(() => () => { if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current); }, []);

  const { upload: uploadThumb, isUploading: isUploadingThumb } = useFileUpload({
    folder: "link-thumbnails",
    maxSizeMB: 2,
    onSuccess: (_, key) => { uploadKeyRef.current = key; },
    onError: (msg) => setUploadError(msg),
  });

  const isEdit  = !!initialLink;
  const canSave = title.trim().length > 0 && isValidURL(url.trim()) && !isSaving && !isUploadingThumb;

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setIsSaving(true);

    let finalThumbnailUrl: string | undefined = thumbImage ?? undefined;
    let finalThumbnailKey: string | undefined = thumbKey ?? undefined;

    if (pendingFile) {
      const publicUrl = await uploadThumb(pendingFile);
      if (!publicUrl) { setIsSaving(false); return; } // upload failed — error shown
      finalThumbnailUrl = publicUrl;
      finalThumbnailKey = uploadKeyRef.current ?? undefined;
    }

    onSave({
      title: title.trim(),
      url: url.trim(),
      icon: selectedPreset,
      thumbnailUrl: finalThumbnailUrl,
      thumbnailKey: finalThumbnailKey,
      clicks: initialLink?.clicks ?? "0",
      status,
    });
    onClose();
  }, [canSave, pendingFile, thumbImage, thumbKey, title, url, selectedPreset, status, initialLink, onSave, onClose, uploadThumb]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey || (document.activeElement as HTMLElement)?.tagName !== "TEXTAREA")) {
        if (canSave) handleSave();
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, canSave, handleSave, onClose]);

  // Debounced URL validation
  function handleUrlChange(val: string) {
    setUrl(val);
    setUrlError(false);
    setUrlValidState("none");
    setDetectedInfo(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) return;
    debounceRef.current = setTimeout(() => {
      if (isValidURL(val.trim())) {
        setUrlValidState("valid");
        setUrlError(false);
        if (!title.trim()) {
          setDetectedInfo(detectFromURL(val.trim()));
        }
      } else if (val.trim().length > 4) {
        setUrlValidState("invalid");
        setUrlError(true);
      }
    }, 350);
  }

  function handleUseDetected() {
    if (!detectedInfo) return;
    setTitle(detectedInfo.title);
    setTitleLen(detectedInfo.title.length);
    setSelectedPreset(detectedInfo.icon);
    setDetectedInfo(null);
  }

  function handlePresetSelect(presetId: PresetId) {
    const defaults = PRESET_DEFAULTS[presetId];
    setSelectedPreset(presetId);
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    setPendingFile(null);
    setThumbImage(null);
    setUrl(defaults.url);
    setTitle(defaults.title);
    setTitleLen(defaults.title.length);
    setDetectedInfo(null);
    setUrlError(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setUrlValidState(defaults.url && isValidURL(defaults.url) ? "valid" : "none");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const blobUrl = URL.createObjectURL(file);
    blobUrlRef.current = blobUrl;
    setPendingFile(file);
    setThumbImage(blobUrl);
    setThumbKey(null);
    setUploadError(null);
  }

  function handleRemoveThumb() {
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    setPendingFile(null);
    setThumbImage(null);
    setThumbKey(null);
    setUploadError(null);
  }

  const activePreset = PRESET_ICONS.find(p => p.id === selectedPreset) ?? PRESET_ICONS[0];

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(11,16,32,0.55)", backdropFilter: "blur(8px)", animation: "fadeIn 0.25s ease" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 540,
          maxHeight: "calc(100vh - 48px)",
          background: "white",
          borderRadius: 22,
          boxShadow: "0 40px 80px -20px rgba(15,23,42,0.4), 0 16px 32px -16px rgba(15,23,42,0.2)",
          animation: "lhModalIn 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4" style={{ padding: "24px 28px 0" }}>
          <div className="flex-1">
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
              {isEdit ? <>Edit <em style={{ color: "#3b46e0" }}>link</em></> : <>Add a <em style={{ color: "#3b46e0" }}>new link</em></>}
            </h2>
            <p style={{ fontSize: 13, color: "#6b75a3", marginTop: 4 }}>
              {isEdit
                ? "Update the URL, title, or status."
                : <>Paste a URL and we&apos;ll handle the rest. You can fine-tune the details<br />anytime.</>}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center transition-all shrink-0"
            style={{ width: 34, height: 34, borderRadius: "50%", border: 0, background: "#eef0f7", color: "#3a4474", cursor: "pointer" }}
            onMouseEnter={e => {
              const b = e.currentTarget;
              b.style.background = "#d6dae9";
              b.style.color = "#0b1020";
              b.style.transform = "rotate(90deg)";
            }}
            onMouseLeave={e => {
              const b = e.currentTarget;
              b.style.background = "#eef0f7";
              b.style.color = "#3a4474";
              b.style.transform = "rotate(0deg)";
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex flex-col" style={{ padding: "22px 28px 0", gap: 18 }}>

          {/* URL field */}
          <div className="flex flex-col" style={{ gap: 7 }}>
            <div className="flex items-center justify-between">
              <label
                htmlFor="m-url"
                className="uppercase inline-flex items-center"
                style={{ fontSize: 12, fontWeight: 500, color: "#3a4474", letterSpacing: "0.07em", gap: 5 }}
              >
                URL <span style={{ color: "#3b46e0" }}>*</span>
              </label>
            </div>

            {/* Input + inline validation icon */}
            <div style={{ position: "relative" }}>
              <input
                id="m-url"
                type="url"
                value={url}
                onChange={e => handleUrlChange(e.target.value)}
                placeholder="https://example.com"
                autoComplete="off"
                className="w-full outline-none transition-all"
                style={{
                  background: urlError ? "#fef2f4" : "#f7f8fc",
                  border: `1.5px solid ${urlError ? "#e11d48" : "#eef0f7"}`,
                  borderRadius: 12,
                  padding: "12px 38px 12px 14px",
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "#0b1020",
                }}
                onFocus={e => {
                  if (!urlError) {
                    e.currentTarget.style.borderColor = "#6873ff";
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(104,115,255,0.12)";
                  }
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = urlError ? "#e11d48" : "#eef0f7";
                  e.currentTarget.style.background = urlError ? "#fef2f4" : "#f7f8fc";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              {/* Validation icon */}
              {urlValidState !== "none" && (
                <div
                  className="flex items-center justify-center"
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 20,
                    height: 20,
                    color: urlValidState === "valid" ? "#16a34a" : "#e11d48",
                  }}
                >
                  {urlValidState === "valid" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                      <circle cx="12" cy="12" r="10"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                      <circle cx="12" cy="12" r="10"/>
                      <path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6"/>
                    </svg>
                  )}
                </div>
              )}
            </div>

            {/* Error message */}
            {urlError && (
              <div className="flex items-center" style={{ fontSize: 11.5, color: "#e11d48", gap: 5 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <circle cx="12" cy="12" r="10"/>
                  <path strokeLinecap="round" d="M12 8v4M12 16h.01"/>
                </svg>
                <span>Please enter a valid URL starting with http:// or https://</span>
              </div>
            )}

            {/* Hint text */}
            {!urlError && (
              <div className="flex items-center" style={{ fontSize: 11.5, color: "#6b75a3", gap: 5 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <circle cx="12" cy="12" r="10"/>
                  <path strokeLinecap="round" d="M12 16v-4M12 8h.01"/>
                </svg>
                <span>Paste any URL — Instagram, YouTube, your portfolio, etc.</span>
              </div>
            )}

            {/* Detected title banner */}
            {detectedInfo && (
              <div
                className="flex items-center"
                style={{
                  marginTop: 8,
                  padding: "10px 12px",
                  background: "#f1f3ff",
                  border: "1px solid #e6e9ff",
                  borderRadius: 8,
                  fontSize: 12.5,
                  color: "#1e2a8a",
                  gap: 10,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                <span>Detected: <strong>{detectedInfo.title}</strong></span>
                <button
                  type="button"
                  onClick={handleUseDetected}
                  style={{
                    marginLeft: "auto",
                    background: "white",
                    border: "1px solid #e6e9ff",
                    color: "#2a37c0",
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Use this
                </button>
              </div>
            )}
          </div>

          {/* Title field */}
          <div className="flex flex-col" style={{ gap: 7 }}>
            <div className="flex items-center justify-between">
              <label
                htmlFor="m-title"
                className="uppercase inline-flex items-center"
                style={{ fontSize: 12, fontWeight: 500, color: "#3a4474", letterSpacing: "0.07em", gap: 5 }}
              >
                Title <span style={{ color: "#3b46e0" }}>*</span>
              </label>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: titleLen > 40 ? "#d97706" : "#6b75a3",
                }}
              >
                {titleLen} / 50
              </span>
            </div>
            <input
              id="m-title"
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleLen(e.target.value.length); }}
              placeholder="e.g. Latest Portfolio Drop"
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
            />
          </div>

          {/* Thumbnail / icon picker */}
          <div className="flex flex-col" style={{ gap: 7 }}>
            <div className="flex items-center justify-between">
              <span
                className="uppercase"
                style={{ fontSize: 12, fontWeight: 500, color: "#3a4474", letterSpacing: "0.07em" }}
              >
                Thumbnail
              </span>
              <span style={{ fontSize: 11.5, color: "#6b75a3" }}>Optional</span>
            </div>

            {/* Preview + buttons row */}
            <div className="flex items-center" style={{ gap: 12 }}>
              {/* 64×64 preview */}
              <div
                onClick={() => { if (!isUploadingThumb) fileInputRef.current?.click(); }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  backgroundImage: thumbImage ? `url(${thumbImage})` : activePreset.gradient,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: activePreset.color,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  border: "1.5px solid #eef0f7",
                  overflow: "hidden",
                  cursor: isUploadingThumb ? "not-allowed" : "pointer",
                  position: "relative",
                }}
              >
                {!thumbImage && !isUploadingThumb && activePreset.svg(24)}
                {isUploadingThumb && (
                  <svg
                    width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke={thumbImage ? "white" : activePreset.color}
                    strokeWidth="2.5"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <path strokeLinecap="round" d="M12 2a10 10 0 010 20"/>
                  </svg>
                )}
              </div>

              {/* Upload / remove buttons */}
              <div className="flex flex-col flex-1" style={{ gap: 6 }}>
                <div className="flex" style={{ gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingThumb}
                    className="inline-flex items-center transition-all"
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#1a2244",
                      background: "white",
                      border: "1px solid #eef0f7",
                      padding: "7px 11px",
                      borderRadius: 8,
                      cursor: isUploadingThumb ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      gap: 6,
                      opacity: isUploadingThumb ? 0.6 : 1,
                    }}
                    onMouseEnter={e => { if (!isUploadingThumb) { e.currentTarget.style.borderColor = "#d6dae9"; e.currentTarget.style.background = "#f7f8fc"; } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#eef0f7"; e.currentTarget.style.background = "white"; }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                    Upload image
                  </button>
                  {thumbImage && (
                    <button
                      type="button"
                      onClick={handleRemoveThumb}
                      className="inline-flex items-center transition-all"
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#e11d48",
                        background: "white",
                        border: "1px solid #eef0f7",
                        padding: "7px 11px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        gap: 6,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#fde8ec"; e.currentTarget.style.borderColor = "#fbcad3"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#eef0f7"; }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
                {uploadError ? (
                  <span style={{ fontSize: 11, color: "#e11d48" }}>{uploadError}</span>
                ) : (
                  <span style={{ fontSize: 11, color: "#6b75a3" }}>PNG, JPG up to 2MB · or pick a preset icon below</span>
                )}
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {/* Preset icons row */}
            <div className="flex flex-wrap" style={{ marginTop: 10, gap: 6 }}>
              {PRESET_ICONS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={p.label}
                  title={p.label}
                  onClick={() => handlePresetSelect(p.id as PresetId)}
                  className="flex items-center justify-center transition-all"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: p.gradient,
                    color: p.color,
                    border: selectedPreset === p.id && !thumbImage ? "2px solid #0b1020" : "2px solid transparent",
                    boxShadow: selectedPreset === p.id && !thumbImage ? "0 0 0 2px white inset" : "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {p.svg(15)}
                </button>
              ))}
            </div>
          </div>

          {/* Status row */}
          <div
            className="flex items-center"
            style={{
              background: "#f7f8fc",
              border: "1px solid #eef0f7",
              borderRadius: 12,
              padding: "14px 16px",
              gap: 14,
            }}
          >
            {/* Status icon */}
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: status === LinkStatus.DRAFT ? "#eef0f7"
                          : status === LinkStatus.PUBLISHED ? "#e8f6ee"
                          : "#fff4dc",
                color:      status === LinkStatus.DRAFT ? "#a8aecb"
                          : status === LinkStatus.PUBLISHED ? "#16a34a"
                          : "#d97706",
                transition: "all 0.2s ease",
              }}
            >
              {status === LinkStatus.DRAFT ? (
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
                {status === LinkStatus.DRAFT ? "Save as draft"
                : status === LinkStatus.PUBLISHED ? "Publish immediately"
                : "Unpublished"}
              </p>
              <p style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 1 }}>
                {status === LinkStatus.DRAFT ? "Link stays hidden until you publish it"
                : status === LinkStatus.PUBLISHED ? "This link will be visible on your public page"
                : "This link is hidden from your public page"}
              </p>
            </div>

            {/* Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={status === LinkStatus.PUBLISHED}
              onClick={() => setStatus(current => {
                  if (!isEdit) {
                    return current === LinkStatus.DRAFT ? LinkStatus.PUBLISHED : LinkStatus.DRAFT;
                  }
                  if (initialStatusRef.current === LinkStatus.DRAFT) {
                    return current === LinkStatus.DRAFT ? LinkStatus.PUBLISHED : LinkStatus.DRAFT;
                  }
                  return current === LinkStatus.PUBLISHED ? LinkStatus.UNPUBLISHED : LinkStatus.PUBLISHED;
                      })}
              className="relative shrink-0 outline-none"
              style={{
                width: 42,
                height: 24,
                borderRadius: 99,
                background: status === LinkStatus.PUBLISHED ? "#3b46e0" : "#d6dae9",
                border: 0,
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
            >
              <span
                className="absolute rounded-full bg-white"
                style={{
                  width: 20,
                  height: 20,
                  top: 2,
                  left: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                  transition: "transform 0.2s ease",
                  transform: status === LinkStatus.PUBLISHED ? "translateX(18px)" : "translateX(0)",
                }}
              />
            </button>
          </div>

        </div>{/* end body */}

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between gap-3 shrink-0"
          style={{
            padding: "20px 28px 22px",
            marginTop: 22,
            borderTop: "1px solid #eef0f7",
            background: "linear-gradient(180deg, transparent, rgba(241,243,255,0.4))",
          }}
        >
          {/* Keyboard hint */}
          <div className="flex items-center" style={{ fontSize: 11.5, color: "#6b75a3", gap: 6 }}>
            <kbd style={{
              fontFamily: "monospace",
              fontSize: 10.5,
              padding: "2px 6px",
              background: "white",
              border: "1px solid #d6dae9",
              borderBottomWidth: 2,
              borderRadius: 5,
              color: "#1a2244",
            }}>↵</kbd>
            to save,{" "}
            <kbd style={{
              fontFamily: "monospace",
              fontSize: 10.5,
              padding: "2px 6px",
              background: "white",
              border: "1px solid #d6dae9",
              borderBottomWidth: 2,
              borderRadius: 5,
              color: "#1a2244",
            }}>esc</kbd>
            to close
          </div>

          <div className="flex" style={{ gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              className="transition-all"
              style={{
                padding: "10px 18px",
                borderRadius: 99,
                border: 0,
                background: "transparent",
                color: "#3a4474",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#eef0f7"; e.currentTarget.style.color = "#0b1020"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#3a4474"; }}
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
                background: canSave ? "linear-gradient(180deg,#3b46e0,#2a37c0)" : "#d6dae9",
                color: canSave ? "white" : "#a8aecb",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: canSave ? "pointer" : "not-allowed",
                boxShadow: canSave
                  ? "0 6px 18px -6px rgba(59,70,224,0.55), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "none",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => { if (canSave) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {isSaving || isUploadingThumb ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                  <path strokeLinecap="round" d="M12 2a10 10 0 010 20"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
                </svg>
              )}
              {isSaving || isUploadingThumb ? "Uploading…" : isEdit ? "Save changes" : "Add link"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
