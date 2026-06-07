"use client";

import { useRef, useState } from "react";
import { BACKGROUND_GRADIENTS } from "@/app/constants/editorBackgroundGradients";
import { TEMPLATE_IMAGES } from "@/app/constants/editorTemplateImages";
import { TEMPLATE_VIDEOS } from "@/app/constants/editorTemplateVideos";
import { TemplateMediaGrid } from "./TemplateMediaGrid";
import { useFileUpload } from "@/lib/hooks/useFileUpload";

type BgType = "gradient" | "image" | "video";
type ImageMode = "upload" | "templates";
type VideoMode = "upload" | "templates";

interface BackgroundSectionProps {
  backgroundType: BgType;
  backgroundValue: string;
  onGradientSelect: (id: string) => void;
  onSolidSelect: (color: string) => void;
  onImageUpload: (url: string, key: string) => void;
  onVideoUpload: (url: string, key: string) => void;
  onTemplateImage: (url: string) => void;
  onTemplateVideo: (url: string) => void;
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6b75a3",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  marginBottom: 12,
};

const subModePill = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: "6px 0",
  border: "none",
  borderRadius: 7,
  background: active ? "white" : "transparent",
  boxShadow: active ? "0 1px 3px rgba(15,23,42,0.08)" : "none",
  color: active ? "#0b1020" : "#6b75a3",
  fontSize: 12.5,
  fontWeight: active ? 600 : 400,
  cursor: "pointer",
  transition: "all 0.15s",
});

export function BackgroundSection({
  backgroundType,
  backgroundValue,
  onGradientSelect,
  onSolidSelect,
  onImageUpload,
  onVideoUpload,
  onTemplateImage,
  onTemplateVideo,
}: BackgroundSectionProps) {
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const [imageMode, setImageMode] = useState<ImageMode>("upload");
  const [videoMode, setVideoMode] = useState<VideoMode>("upload");
  const [solidColor, setSolidColor] = useState("#1e1e2e");

  const imgUpload = useFileUpload({
    folder: "backgrounds",
    maxSizeMB: 10,
    onSuccess: (url, key) => onImageUpload(url, key),
  });

  const vidUpload = useFileUpload({
    folder: "backgrounds",
    maxSizeMB: 50,
    onSuccess: (url, key) => onVideoUpload(url, key),
  });

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) imgUpload.upload(file);
    e.target.value = "";
  };

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) vidUpload.upload(file);
    e.target.value = "";
  };

  const isUploading = imgUpload.isUploading || vidUpload.isUploading;
  const uploadProgress = imgUpload.isUploading ? imgUpload.progress : vidUpload.progress;
  const uploadError = imgUpload.error ?? vidUpload.error;

  return (
    <div>
      <p style={sectionLabel}>Background</p>

      {/* Primary tab switcher */}
      <div
        style={{
          display: "flex",
          background: "#f0f1f7",
          borderRadius: 10,
          padding: 3,
          marginBottom: 16,
          gap: 2,
        }}
      >
        {(["gradient", "image", "video"] as BgType[]).map((tab) => {
          const active = backgroundType === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                if (tab === "image" && backgroundType !== "image") {
                  setImageMode("upload");
                }
                if (tab === "video" && backgroundType !== "video") {
                  setVideoMode("upload");
                }
                // For image/video tabs just switching activates — actual upload/template handles file
                if (tab === "gradient" && backgroundType !== "gradient") {
                  onGradientSelect("midnight");
                }
              }}
              style={{
                flex: 1,
                padding: "6px 0",
                border: "none",
                borderRadius: 7,
                background: active ? "white" : "transparent",
                boxShadow: active ? "0 1px 3px rgba(15,23,42,0.08)" : "none",
                color: active ? "#0b1020" : "#6b75a3",
                fontSize: 12.5,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={imgRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleImageFile}
      />
      <input
        ref={vidRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg"
        className="hidden"
        onChange={handleVideoFile}
      />

      {/* Upload progress */}
      {isUploading && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ height: 3, background: "#eef0f7", borderRadius: 99, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #3b46e0, #6873ff)",
                width: `${uploadProgress}%`,
                transition: "width 0.2s",
                borderRadius: 99,
              }}
            />
          </div>
          <p style={{ fontSize: 11.5, color: "#6b75a3", marginTop: 5 }}>Uploading…</p>
        </div>
      )}

      {uploadError && (
        <p style={{ fontSize: 12, color: "#e11d48", marginBottom: 12 }}>{uploadError}</p>
      )}

      {/* ── GRADIENT TAB ──────────────────────────────── */}
      {backgroundType === "gradient" && (
        <>
          {/* Solid color row */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
            <label
              style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, flex: 1 }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: solidColor,
                  border: "1px solid rgba(0,0,0,0.1)",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12.5, color: "#0b1020" }}>Solid color</span>
              <input
                type="color"
                value={solidColor}
                onChange={(e) => setSolidColor(e.target.value)}
                onBlur={() => onSolidSelect(solidColor)}
                style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
              />
            </label>
            <button
              type="button"
              onClick={() => onSolidSelect(solidColor)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "5px 10px",
                borderRadius: 7,
                border: "1px solid #eef0f7",
                background: "white",
                color: "#3b46e0",
                cursor: "pointer",
              }}
            >
              Use
            </button>
          </div>

          {/* Gradient swatches — 2-column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {BACKGROUND_GRADIENTS.map((g) => {
              const active = backgroundType === "gradient" && backgroundValue === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onGradientSelect(g.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "8px 10px",
                    border: `1.5px solid ${active ? "#3b46e0" : "#eef0f7"}`,
                    borderRadius: 10,
                    background: active ? "#f0f1ff" : "white",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: g.value,
                      flexShrink: 0,
                      border: "1px solid rgba(0,0,0,0.07)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: active ? 600 : 400,
                      color: active ? "#3b46e0" : "#0b1020",
                      lineHeight: 1.2,
                    }}
                  >
                    {g.name}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── IMAGE TAB ─────────────────────────────────── */}
      {backgroundType === "image" && (
        <>
          {/* Sub-mode toggle */}
          <div
            style={{
              display: "flex",
              background: "#f0f1f7",
              borderRadius: 8,
              padding: 3,
              marginBottom: 14,
              gap: 2,
            }}
          >
            <button type="button" onClick={() => setImageMode("upload")} style={subModePill(imageMode === "upload")}>Upload</button>
            <button type="button" onClick={() => setImageMode("templates")} style={subModePill(imageMode === "templates")}>Templates</button>
          </div>

          {/* Applied badge */}
          {backgroundValue && backgroundValue.startsWith("http") && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 12px",
                background: "#f0f1ff",
                border: "1px solid #c7d0ff",
                borderRadius: 8,
                marginBottom: 12,
                fontSize: 12,
                color: "#3b46e0",
                fontWeight: 500,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Image applied
              <button
                type="button"
                onClick={() => onGradientSelect("midnight")}
                style={{ marginLeft: "auto", fontSize: 11, color: "#6873ff", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 500 }}
              >
                Reset
              </button>
            </div>
          )}

          {imageMode === "upload" ? (
            <button
              type="button"
              onClick={() => imgRef.current?.click()}
              disabled={imgUpload.isUploading}
              style={{
                width: "100%",
                padding: "28px 0",
                border: "2px dashed #d6dae9",
                borderRadius: 12,
                background: "white",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                color: "#6b75a3",
                transition: "border-color 0.15s",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>Click to upload image</span>
              <span style={{ fontSize: 11, color: "#a8aecb" }}>JPG, PNG, WebP, GIF — max 10MB</span>
            </button>
          ) : (
            <TemplateMediaGrid
              type="image"
              items={TEMPLATE_IMAGES.map((img) => ({
                id: img.id,
                name: img.name,
                thumbnailUrl: img.thumb,
              }))}
              activeId={TEMPLATE_IMAGES.find((img) => img.url === backgroundValue)?.id}
              onSelect={(item) => {
                const found = TEMPLATE_IMAGES.find((img) => img.id === item.id);
                if (found) onTemplateImage(found.url);
              }}
            />
          )}
        </>
      )}

      {/* ── VIDEO TAB ─────────────────────────────────── */}
      {backgroundType === "video" && (
        <>
          {/* Sub-mode toggle */}
          <div
            style={{
              display: "flex",
              background: "#f0f1f7",
              borderRadius: 8,
              padding: 3,
              marginBottom: 14,
              gap: 2,
            }}
          >
            <button type="button" onClick={() => setVideoMode("upload")} style={subModePill(videoMode === "upload")}>Upload</button>
            <button type="button" onClick={() => setVideoMode("templates")} style={subModePill(videoMode === "templates")}>Templates</button>
          </div>

          {/* Applied badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 12px",
              background: "#f0f1ff",
              border: "1px solid #c7d0ff",
              borderRadius: 8,
              marginBottom: 12,
              fontSize: 12,
              color: "#3b46e0",
              fontWeight: 500,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Video applied
            <button
              type="button"
              onClick={() => onGradientSelect("midnight")}
              style={{ marginLeft: "auto", fontSize: 11, color: "#6873ff", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 500 }}
            >
              Reset
            </button>
          </div>

          {videoMode === "upload" ? (
            <button
              type="button"
              onClick={() => vidRef.current?.click()}
              disabled={vidUpload.isUploading}
              style={{
                width: "100%",
                padding: "28px 0",
                border: "2px dashed #d6dae9",
                borderRadius: 12,
                background: "white",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                color: "#6b75a3",
                transition: "border-color 0.15s",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>Click to upload video</span>
              <span style={{ fontSize: 11, color: "#a8aecb" }}>MP4, WebM, OGG — max 50MB</span>
            </button>
          ) : (
            <TemplateMediaGrid
              type="video"
              items={TEMPLATE_VIDEOS.map((v) => ({
                id: v.id,
                name: v.name,
                thumbnailUrl: v.thumbnailUrl,
                videoUrl: v.videoUrl,
              }))}
              activeId={TEMPLATE_VIDEOS.find((v) => v.videoUrl === backgroundValue)?.id}
              onSelect={(item) => {
                const found = TEMPLATE_VIDEOS.find((v) => v.id === item.id);
                if (found) onTemplateVideo(found.videoUrl);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
