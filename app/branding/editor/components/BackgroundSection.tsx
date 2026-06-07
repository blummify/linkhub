"use client";

import { useRef, useState, useEffect } from "react";
import { BACKGROUND_GRADIENTS } from "@/app/constants/editorBackgroundGradients";
import { TEMPLATE_IMAGES } from "@/app/constants/editorTemplateImages";
import { TEMPLATE_VIDEOS } from "@/app/constants/editorTemplateVideos";
import { TemplateMediaGrid } from "./TemplateMediaGrid";
import { useFileUpload } from "@/lib/hooks/useFileUpload";

type SearchItem = { id: string; name: string; thumbnailUrl: string; url?: string; videoUrl?: string };

type BgType = "gradient" | "image" | "video";
type ImageMode = "upload" | "templates";
type VideoMode = "upload" | "templates";

interface BackgroundSectionProps {
  backgroundType: BgType;
  backgroundValue: string;
  onTabSwitch: (type: BgType) => void;
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

function MediaSearchInput({
  value,
  onChange,
  loading,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  placeholder: string;
}) {
  return (
    <div style={{ position: "relative", marginBottom: 8 }}>
      <svg
        aria-hidden
        width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="#6b75a3" strokeWidth="2"
        style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
      >
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box",
          paddingLeft: 28, paddingRight: loading ? 28 : 8,
          height: 32, borderRadius: 8,
          border: "1px solid #eef0f7", fontSize: 12.5,
          color: "#0b1020", background: "#f7f8fc",
          outline: "none", fontFamily: "inherit",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "#6873ff"; e.currentTarget.style.background = "white"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "#eef0f7"; e.currentTarget.style.background = "#f7f8fc"; }}
      />
      {loading && (
        <svg
          aria-label="Searching…"
          width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="#6b75a3" strokeWidth="2"
          style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", animation: "spin 0.8s linear infinite" }}
        >
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
        </svg>
      )}
    </div>
  );
}

export function BackgroundSection({
  backgroundType,
  backgroundValue,
  onTabSwitch,
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

  const [imageQuery, setImageQuery] = useState("");
  const [imageResults, setImageResults] = useState<SearchItem[] | null>(null);
  const [imageSearching, setImageSearching] = useState(false);

  const [videoQuery, setVideoQuery] = useState("");
  const [videoResults, setVideoResults] = useState<SearchItem[] | null>(null);
  const [videoSearching, setVideoSearching] = useState(false);

  useEffect(() => {
    if (!imageQuery.trim()) { setImageResults(null); return; }
    const t = setTimeout(async () => {
      setImageSearching(true);
      try {
        const res = await fetch(`/api/unsplash-search?q=${encodeURIComponent(imageQuery)}`);
        const data = await res.json() as { photos?: SearchItem[]; error?: string };
        setImageResults(data.photos ?? []);
      } catch { setImageResults([]); }
      finally { setImageSearching(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [imageQuery]);

  useEffect(() => {
    if (!videoQuery.trim()) { setVideoResults(null); return; }
    const t = setTimeout(async () => {
      setVideoSearching(true);
      try {
        const res = await fetch(`/api/pexels-video-search?q=${encodeURIComponent(videoQuery)}`);
        const data = await res.json() as { videos?: SearchItem[] };
        setVideoResults(data.videos ?? []);
      } catch { setVideoResults([]); }
      finally { setVideoSearching(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [videoQuery]);

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
                if (tab === backgroundType) return;
                onTabSwitch(tab);
                if (tab === "image") setImageMode("upload");
                if (tab === "video") setVideoMode("upload");
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

      {backgroundType === "gradient" && (
        <>
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

      {backgroundType === "image" && (
        <>
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
            <>
              <MediaSearchInput
                value={imageQuery}
                onChange={setImageQuery}
                loading={imageSearching}
                placeholder="Search Unsplash…"
              />
              {imageResults?.length === 0 && !imageSearching ? (
                <div style={{ textAlign: "center", fontSize: 12, color: "#a8aecb", padding: "16px 0" }}>
                  No results for &ldquo;{imageQuery}&rdquo;
                </div>
              ) : (
                <TemplateMediaGrid
                  type="image"
                  items={(imageResults ?? TEMPLATE_IMAGES.map((img) => ({
                    id: img.id,
                    name: img.name,
                    thumbnailUrl: img.thumb,
                    url: img.url,
                  })))}
                  activeId={
                    imageResults
                      ? imageResults.find((i) => i.url === backgroundValue)?.id
                      : TEMPLATE_IMAGES.find((img) => img.url === backgroundValue)?.id
                  }
                  onSelect={(item) => {
                    const url = item.url ?? TEMPLATE_IMAGES.find((img) => img.id === item.id)?.url;
                    if (url) onTemplateImage(url);
                  }}
                />
              )}
            </>
          )}
        </>
      )}

      {backgroundType === "video" && (
        <>
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
            <>
              <MediaSearchInput
                value={videoQuery}
                onChange={setVideoQuery}
                loading={videoSearching}
                placeholder="Search Pexels…"
              />
              {videoResults?.length === 0 && !videoSearching ? (
                <div style={{ textAlign: "center", fontSize: 12, color: "#a8aecb", padding: "16px 0" }}>
                  No results for &ldquo;{videoQuery}&rdquo;
                </div>
              ) : (
                <TemplateMediaGrid
                  type="video"
                  items={(videoResults ?? TEMPLATE_VIDEOS.map((v) => ({
                    id: v.id,
                    name: v.name,
                    thumbnailUrl: v.thumbnailUrl,
                    videoUrl: v.videoUrl,
                  })))}
                  activeId={
                    videoResults
                      ? videoResults.find((v) => v.videoUrl === backgroundValue)?.id
                      : TEMPLATE_VIDEOS.find((v) => v.videoUrl === backgroundValue)?.id
                  }
                  onSelect={(item) => {
                    const url = item.videoUrl ?? TEMPLATE_VIDEOS.find((v) => v.id === item.id)?.videoUrl;
                    if (url) onTemplateVideo(url);
                  }}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
