"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

interface AvatarCropModalProps {
  file: File;
  name?: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

type Shape = "circle" | "square" | "rect";
type RectRatio = "16:9" | "4:3" | "3:2";

const RECT_ASPECTS: { label: RectRatio; value: number }[] = [
  { label: "16:9", value: 16 / 9 },
  { label: "4:3",  value: 4 / 3  },
  { label: "3:2",  value: 3 / 2  },
];

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;

async function cropToBlob(src: string, crop: Area, maxDim = 800): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
  const scale = Math.min(maxDim / crop.width, maxDim / crop.height, 1);
  const w = Math.round(crop.width * scale);
  const h = Math.round(crop.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, w, h);
  return new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.92));
}

// Small icon-only button for the canvas overlay
function CanvasIconBtn({
  onClick,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
    >
      {children}
    </button>
  );
}

export function AvatarCropModal({ file, name, onConfirm, onCancel }: AvatarCropModalProps) {
  const [objectUrl, setObjectUrl]                 = useState("");
  const [previewUrl, setPreviewUrl]               = useState("");
  const [crop, setCrop]                           = useState({ x: 0, y: 0 });
  const [zoom, setZoom]                           = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing]           = useState(false);
  const [shape, setShape]                         = useState<Shape>("circle");
  const [rectRatio, setRectRatio]                 = useState<RectRatio>("16:9");

  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Debounced live preview thumbnail
  useEffect(() => {
    if (!objectUrl || !croppedAreaPixels) return;
    let cancelled = false;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(async () => {
      try {
        const blob = await cropToBlob(objectUrl, croppedAreaPixels, 96);
        if (!cancelled) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
        }
      } catch { /* ignore */ }
    }, 120);
    return () => { cancelled = true; };
  }, [objectUrl, croppedAreaPixels]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const zoomIn  = () => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));

  const aspect = shape === "rect"
    ? RECT_ASPECTS.find((r) => r.label === rectRatio)!.value
    : 1;

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const blob = await cropToBlob(objectUrl, croppedAreaPixels);
      onConfirm(blob);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!objectUrl) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      <div
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: "100%", maxWidth: 680 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {name ? `Edit: ${name}` : "Edit photo"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Crop canvas with all icon overlays ── */}
        <div className="relative bg-gray-200 select-none" style={{ height: 420 }}>
          <Cropper
            image={objectUrl}
            crop={crop}
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            aspect={aspect}
            cropShape={shape === "circle" ? "round" : "rect"}
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: {
                border: "2px solid rgba(255,255,255,0.9)",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
              },
            }}
          />

          {/* ── Shape pills — top right ── */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            {/* Shape row */}
            <div className="flex gap-1 bg-black/50 backdrop-blur-sm rounded-full p-1">
              {(["circle", "square", "rect"] as Shape[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShape(s)}
                  title={s.charAt(0).toUpperCase() + s.slice(1)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    shape === s
                      ? "bg-white text-gray-900"
                      : "text-white/70 hover:text-white hover:bg-white/20"
                  }`}
                >
                  {s === "circle" ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                  ) : s === "square" ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="3"/></svg>
                  ) : (
                    <svg width="16" height="11" viewBox="0 0 24 16" fill="currentColor"><rect x="0" y="0" width="24" height="16" rx="3"/></svg>
                  )}
                </button>
              ))}
            </div>

            {/* Rect aspect ratio pills */}
            {shape === "rect" && (
              <div className="flex gap-1 bg-black/50 backdrop-blur-sm rounded-full p-1">
                {RECT_ASPECTS.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setRectRatio(r.label)}
                    className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                      rectRatio === r.label
                        ? "bg-white text-gray-900"
                        : "text-white/70 hover:text-white hover:bg-white/20"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Zoom controls — bottom right ── */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-10">
            <CanvasIconBtn onClick={zoomIn} title="Zoom in" disabled={zoom >= MAX_ZOOM}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/>
                <path strokeLinecap="round" d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
              </svg>
            </CanvasIconBtn>

            {/* Zoom percentage badge */}
            <div className="flex items-center justify-center h-7 bg-black/50 backdrop-blur-sm rounded-full px-2">
              <span className="text-[10px] font-bold text-white tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <CanvasIconBtn onClick={zoomOut} title="Zoom out" disabled={zoom <= MIN_ZOOM}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/>
                <path strokeLinecap="round" d="M21 21l-4.35-4.35M8 11h6"/>
              </svg>
            </CanvasIconBtn>
          </div>

          {/* ── Live preview card — bottom left ── */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 z-10" style={{ minWidth: 170 }}>
            <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-white/80 shadow">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                  {name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">{name ?? "Your photo"}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Preview</p>
            </div>
          </div>

          {/* ── Scroll hint — bottom center ── */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
            <span className="text-[10px] text-white/60 select-none">Scroll to zoom · Drag to move</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 py-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#1e2d6b] text-white hover:bg-[#162259] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              "Save image"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
