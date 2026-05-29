"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

interface AvatarCropModalProps {
  file: File;
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

async function getCroppedBlob(src: string, crop: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
  const maxDim = 800;
  const scale = Math.min(maxDim / crop.width, maxDim / crop.height, 1);
  const w = Math.round(crop.width * scale);
  const h = Math.round(crop.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, w, h);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92));
}

function ShapeBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
        active
          ? "bg-primary text-white shadow-md shadow-primary/30"
          : "bg-gray-100 dark:bg-surface-container-high text-gray-500 dark:text-on-surface-variant hover:bg-gray-200 dark:hover:bg-surface-container"
      }`}
    >
      {children}
    </button>
  );
}

export function AvatarCropModal({ file, onConfirm, onCancel }: AvatarCropModalProps) {
  const [objectUrl, setObjectUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [shape, setShape] = useState<Shape>("circle");
  const [rectRatio, setRectRatio] = useState<RectRatio>("16:9");
  const [cropSize, setCropSize] = useState(220);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const aspect = shape === "rect"
    ? RECT_ASPECTS.find((r) => r.label === rectRatio)!.value
    : 1;

  const cropShapeProp = shape === "circle" ? "round" : "rect";

  const computedCropSize = shape === "rect"
    ? { width: Math.round(cropSize * aspect), height: cropSize }
    : { width: cropSize, height: cropSize };

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedBlob(objectUrl, croppedAreaPixels);
      onConfirm(blob);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!objectUrl) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onCancel} />

      {/* Card */}
      <div className="relative bg-white dark:bg-[#1a1f2e] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Edit photo</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Drag · scroll to zoom · choose shape</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Crop canvas */}
        <div className="relative bg-gray-950" style={{ height: 320 }}>
          <Cropper
            image={objectUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShapeProp}
            cropSize={computedCropSize}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: {
                border: "2.5px solid rgba(255,255,255,0.9)",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.62)",
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 space-y-4 bg-white dark:bg-[#1a1f2e]">

          {/* Shape picker */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Shape</p>
            <div className="flex gap-2">
              <ShapeBtn active={shape === "circle"} onClick={() => setShape("circle")}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" opacity={0.85}>
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Circle
              </ShapeBtn>
              <ShapeBtn active={shape === "square"} onClick={() => setShape("square")}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" opacity={0.85}>
                  <rect x="2" y="2" width="20" height="20" rx="3" />
                </svg>
                Square
              </ShapeBtn>
              <ShapeBtn active={shape === "rect"} onClick={() => setShape("rect")}>
                <svg width="22" height="16" viewBox="0 0 28 18" fill="currentColor" opacity={0.85}>
                  <rect x="0" y="0" width="28" height="18" rx="3" />
                </svg>
                Rectangle
              </ShapeBtn>
            </div>

            {/* Rect aspect ratio sub-toggle */}
            {shape === "rect" && (
              <div className="flex gap-1.5 mt-2.5">
                {RECT_ASPECTS.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setRectRatio(r.label)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      rectRatio === r.label
                        ? "bg-primary/15 text-primary"
                        : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zoom + Size sliders */}
          <div className="space-y-3">
            {/* Zoom */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 w-8 shrink-0">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-primary cursor-pointer h-1"
                aria-label="Zoom"
              />
              <span className="text-[11px] tabular-nums text-gray-400 dark:text-gray-500 w-8 text-right shrink-0">
                {zoom.toFixed(1)}×
              </span>
            </div>

            {/* Crop size */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 w-8 shrink-0">Size</span>
              <input
                type="range"
                min={120}
                max={290}
                step={1}
                value={cropSize}
                onChange={(e) => setCropSize(Number(e.target.value))}
                className="flex-1 accent-primary cursor-pointer h-1"
                aria-label="Crop size"
              />
              <span className="text-[11px] tabular-nums text-gray-400 dark:text-gray-500 w-8 text-right shrink-0">
                {Math.round((cropSize / 290) * 100)}%
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/12 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/25"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Crop & Apply
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
