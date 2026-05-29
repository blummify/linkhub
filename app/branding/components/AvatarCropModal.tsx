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

export function AvatarCropModal({ file, name, onConfirm, onCancel }: AvatarCropModalProps) {
  const [objectUrl, setObjectUrl]           = useState("");
  const [previewUrl, setPreviewUrl]         = useState("");
  const [crop, setCrop]                     = useState({ x: 0, y: 0 });
  const [zoom, setZoom]                     = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing]     = useState(false);
  const [shape, setShape]                   = useState<Shape>("circle");
  const [rectRatio, setRectRatio]           = useState<RectRatio>("16:9");
  const [cropSize, setCropSize]             = useState(240);
  const previewTimer                        = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Debounced live preview
  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(async () => {
      if (!pixels) return;
      try {
        const blob = await cropToBlob(pixels ? /* objectUrl will be closed over */ "" : "", pixels, 96);
        void blob; // placeholder — we'll use the objectUrl from closure below
      } catch { /* ignore */ }
    }, 120);
  }, []);

  // Simpler live preview using the closure correctly
  useEffect(() => {
    if (!objectUrl || !croppedAreaPixels) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const blob = await cropToBlob(objectUrl, croppedAreaPixels, 96);
        if (!cancelled) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
        }
      } catch { /* ignore preview errors */ }
    }, 120);
    return () => { cancelled = true; clearTimeout(t); };
  }, [objectUrl, croppedAreaPixels]);

  const aspect = shape === "rect"
    ? RECT_ASPECTS.find((r) => r.label === rectRatio)!.value
    : 1;

  const computedCropSize = shape === "rect"
    ? { width: Math.round(cropSize * aspect), height: cropSize }
    : { width: cropSize, height: cropSize };

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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
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

        {/* Crop canvas */}
        <div className="relative bg-gray-200" style={{ height: 420 }}>
          <Cropper
            image={objectUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={shape === "circle" ? "round" : "rect"}
            cropSize={computedCropSize}
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 0 },
              mediaStyle: { borderRadius: 0 },
              cropAreaStyle: {
                border: "2px solid white",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
              },
            }}
          />

          {/* Live preview card — bottom-left */}
          <div
            className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3"
            style={{ minWidth: 180 }}
          >
            {/* Circular preview */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-white shadow-sm">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{name ?? "Your photo"}</p>
              <p className="text-xs text-gray-400">Preview</p>
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="px-7 pt-4 pb-2 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            {/* Shape toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {(["circle", "square", "rect"] as Shape[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShape(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize ${
                    shape === s
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {s === "circle" ? "⬤ Circle" : s === "square" ? "■ Square" : "▬ Rect"}
                </button>
              ))}
            </div>

            {/* Rect aspect ratios */}
            {shape === "rect" && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                {RECT_ASPECTS.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setRectRatio(r.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      rectRatio === r.label
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}

            {/* Zoom slider */}
            <div className="flex items-center gap-2 flex-1 min-w-[140px]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 shrink-0">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
              </svg>
              <input
                type="range" min={1} max={3} step={0.01} value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-primary cursor-pointer h-1"
                aria-label="Zoom"
              />
              <span className="text-xs tabular-nums text-gray-400 w-8 shrink-0">{zoom.toFixed(1)}×</span>
            </div>

            {/* Size slider */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 shrink-0">
                <path strokeLinecap="round" d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
              <input
                type="range" min={120} max={300} step={1} value={cropSize}
                onChange={(e) => setCropSize(Number(e.target.value))}
                className="flex-1 accent-primary cursor-pointer h-1"
                aria-label="Crop size"
              />
            </div>
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
