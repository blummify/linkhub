"use client";

import { useRef } from "react";
import {
  BRANDING_FONT_MONO,
  BRANDING_FONT_SERIF,
} from "@/app/constants/brandingFonts";
import { APP_DOMAIN } from "@/lib/appConfig";

interface ProfileSectionProps {
  displayName: string;
  handle: string;
  bio: string;
  onDisplayNameChange: (v: string) => void;
  onHandleChange: (v: string) => void;
  onBioChange: (v: string) => void;
  // Avatar upload — all optional so existing tests remain unchanged
  avatarUrl?: string | null;
  isUploadingAvatar?: boolean;
  onFileSelected?: (file: File) => void;
  onRemoveAvatar?: () => void;
}

const MAX_BIO = 140;

const fieldLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "#6b75a3",
  letterSpacing: "0.07em",
  textTransform: "uppercase",
};

const baseInput: React.CSSProperties = {
  width: "100%",
  background: "#f7f8fc",
  border: "1px solid #eef0f7",
  borderRadius: 12,
  padding: "11px 14px",
  fontSize: 14,
  color: "#0b1020",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#3b46e0";
  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(59,70,224,0.12)";
  e.currentTarget.style.background = "white";
}

function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#eef0f7";
  e.currentTarget.style.boxShadow = "none";
  e.currentTarget.style.background = "#f7f8fc";
}

export function ProfileSection({
  displayName,
  handle,
  bio,
  onDisplayNameChange,
  onHandleChange,
  onBioChange,
  avatarUrl,
  isUploadingAvatar = false,
  onFileSelected,
  onRemoveAvatar,
}: ProfileSectionProps) {
  const initial = displayName.charAt(0).toUpperCase() || "?";
  const publicSlug = handle.trim();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so re-selecting same file triggers onChange
    onFileSelected?.(file);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #eef0f7",
        borderRadius: 18,
        padding: "24px 26px",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 28,
        alignItems: "start",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            suppressHydrationWarning
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: avatarUrl
                ? "transparent"
                : "linear-gradient(135deg, #3b46e0, #7a85ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 44,
              fontStyle: "italic",
              fontFamily: BRANDING_FONT_SERIF,
              border: "4px solid white",
              outline: "1px solid #eef0f7",
              boxShadow: "0 12px 28px -8px rgba(59,70,224,0.4)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {avatarUrl ? (
              // Plain <img> — avoids next/image remotePatterns requirement here
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Profile photo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              initial
            )}

            {isUploadingAvatar && (
              <div
                aria-label="Uploading…"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(11,16,32,0.55)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  style={{ animation: "spin 0.8s linear infinite" }}
                >
                  <path strokeLinecap="round" d="M12 2a10 10 0 010 20"/>
                </svg>
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Upload new photo"
            onClick={openFilePicker}
            disabled={isUploadingAvatar}
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#0b1020",
              color: "white",
              border: "3px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isUploadingAvatar ? "not-allowed" : "pointer",
              opacity: isUploadingAvatar ? 0.5 : 1,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isUploadingAvatar}
            style={{
              fontSize: 11.5,
              fontWeight: 500,
              color: "#6b75a3",
              background: "transparent",
              border: 0,
              padding: "4px 8px",
              borderRadius: 6,
              cursor: isUploadingAvatar ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "inherit",
              opacity: isUploadingAvatar ? 0.5 : 1,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            Upload
          </button>
          <div style={{ width: 1, height: 12, background: "#d6dae9" }} />
          <button
            type="button"
            onClick={onRemoveAvatar}
            disabled={isUploadingAvatar || !avatarUrl}
            style={{
              fontSize: 11.5,
              fontWeight: 500,
              color: "#6b75a3",
              background: "transparent",
              border: 0,
              padding: "4px 8px",
              borderRadius: 6,
              cursor: isUploadingAvatar || !avatarUrl ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "inherit",
              opacity: isUploadingAvatar || !avatarUrl ? 0.4 : 1,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            Remove
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleFileInput}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label style={fieldLabel}>Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              placeholder="Your name"
              maxLength={40}
              style={baseInput}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label style={fieldLabel}>Handle</label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontFamily: BRANDING_FONT_MONO,
                  fontSize: 13,
                  color: "#6b75a3",
                  pointerEvents: "none",
                }}
              >
                @
              </span>
              <input
                type="text"
                value={handle}
                onChange={(e) =>
                  onHandleChange(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                  )
                }
                placeholder="e.g. alexsmith"
                maxLength={24}
                style={{ ...baseInput, paddingLeft: 30 }}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
            <p style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 1 }}>
              {publicSlug ? (
                <>
                  Your public URL:{" "}
                  <span style={{ color: "#3b46e0", fontWeight: 500 }}>
                    {APP_DOMAIN}/{publicSlug}
                  </span>
                </>
              ) : (
                "Set a handle to claim your public URL"
              )}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <label style={fieldLabel}>Short bio</label>
            <span
              style={{
                fontFamily: BRANDING_FONT_MONO,
                fontSize: 11,
                color: bio.length > MAX_BIO * 0.85 ? "#d97706" : "#6b75a3",
              }}
            >
              {bio.length}/{MAX_BIO}
            </span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => onBioChange(e.target.value.slice(0, MAX_BIO))}
            placeholder="Tell visitors what you're about…"
            rows={3}
            style={{ ...baseInput, resize: "none", lineHeight: 1.5, fontSize: 13.5 }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
          <p style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 1 }}>
            A single line works best. Emojis are welcome.
          </p>
        </div>
      </div>
    </div>
  );
}
