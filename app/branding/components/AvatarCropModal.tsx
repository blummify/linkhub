"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface AvatarCropModalProps {
  file: File;
  name?: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

type Shape = "circle" | "square" | "rect";
type RectRatio = "16:9" | "4:3" | "3:2";
const CHECKER_BG = "repeating-conic-gradient(#d1d5db 0% 25%, #f9fafb 0% 50%) 0 0 / 20px 20px";

const RECT_ASPECTS: { label: RectRatio; value: number }[] = [
  { label: "16:9", value: 16 / 9 },
  { label: "4:3",  value: 4 / 3  },
  { label: "3:2",  value: 3 / 2  },
];

async function extractBlob(img: HTMLImageElement, crop: PixelCrop, maxDim = 800): Promise<Blob> {
  const scaleX = img.naturalWidth  / img.width;
  const scaleY = img.naturalHeight / img.height;
  const sw = crop.width  * scaleX;
  const sh = crop.height * scaleY;
  const scale = Math.min(maxDim / sw, maxDim / sh, 1);
  const canvas = document.createElement("canvas");
  canvas.width  = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, crop.x * scaleX, crop.y * scaleY, sw, sh, 0, 0, canvas.width, canvas.height);
  return new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.92));
}

function centeredCrop(width: number, height: number, aspect?: number): Crop {
  if (aspect) {
    return centerCrop(
      makeAspectCrop({ unit: "%", width: 80 }, aspect, width, height),
      width, height,
    );
  }
  // Square/circle: 80% of the smaller dimension
  const pct = Math.round(80 * Math.min(width, height) / Math.max(width, height));
  return centerCrop({ unit: "%", width: pct, height: pct }, width, height);
}

export function AvatarCropModal({ file, name, onConfirm, onCancel }: AvatarCropModalProps) {
  const [objectUrl, setObjectUrl]           = useState("");
  const [previewUrl, setPreviewUrl]         = useState("");
  const [crop, setCrop]                     = useState<Crop>();
  const [completedCrop, setCompletedCrop]   = useState<PixelCrop>();
  const [isProcessing, setIsProcessing]     = useState(false);
  const [shape, setShape]                   = useState<Shape>("circle");
  const [rectRatio, setRectRatio]           = useState<RectRatio>("16:9");

  const imgRef      = useRef<HTMLImageElement>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Rebuild initial crop whenever shape / aspect ratio changes
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !img.width) return;
    const aspect = shape === "rect"
      ? RECT_ASPECTS.find((r) => r.label === rectRatio)!.value
      : undefined;
    setCrop(centeredCrop(img.width, img.height, aspect));
  }, [shape, rectRatio]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const aspect = shape === "rect"
      ? RECT_ASPECTS.find((r) => r.label === rectRatio)!.value
      : undefined;
    setCrop(centeredCrop(width, height, aspect));
  }

  // Debounced live preview
  useEffect(() => {
    if (!completedCrop || !imgRef.current) return;
    let cancelled = false;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(async () => {
      try {
        const blob = await extractBlob(imgRef.current!, completedCrop, 96);
        if (!cancelled) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
        }
      } catch { /* ignore */ }
    }, 120);
    return () => { cancelled = true; };
  }, [completedCrop]);

  const onCropChange = useCallback((c: Crop) => setCrop(c), []);
  const onCropComplete = useCallback((c: PixelCrop) => setCompletedCrop(c), []);

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsProcessing(true);
    try {
      const blob = await extractBlob(imgRef.current, completedCrop);
      onConfirm(blob);
    } finally {
      setIsProcessing(false);
    }
  };

  const aspect = shape === "rect"
    ? RECT_ASPECTS.find((r) => r.label === rectRatio)!.value
    : undefined; // free for circle/square — user drags to any size

  if (!objectUrl) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      <div
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: "100%", maxWidth: 680 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {name ? `Edit: ${name}` : "Edit photo"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Drag corners to resize · drag inside to move</p>
          </div>
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

        {/* Crop area */}
        <div
          className="relative overflow-hidden flex items-center justify-center"
          style={{ height: 420, background: CHECKER_BG }}
        >
<ReactCrop
            crop={crop}
            onChange={onCropChange}
            onComplete={onCropComplete}
            aspect={aspect}
            circularCrop={shape === "circle"}
            ruleOfThirds
            keepSelection
            minWidth={60}
            minHeight={60}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={objectUrl}
              alt="Crop source"
              onLoad={onImageLoad}
              style={{ display: "block", maxWidth: "100%", maxHeight: "420px", width: "auto", height: "auto" }}
            />
          </ReactCrop>

          {/* Shape picker — top right */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
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
                    <svg width="17" height="11" viewBox="0 0 28 17" fill="currentColor"><rect x="0" y="0" width="28" height="17" rx="3"/></svg>
                  )}
                </button>
              ))}
            </div>

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

          {/* Live preview card — bottom left */}
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
            disabled={isProcessing || !completedCrop}
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
