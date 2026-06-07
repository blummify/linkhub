"use client";

import { useState } from "react";

interface TemplateItem {
  id: string;
  name: string;
  thumbnailUrl: string;
  videoUrl?: string;
  url?: string;
}

interface TemplateMediaGridProps {
  items: TemplateItem[];
  activeId?: string;
  onSelect: (item: TemplateItem) => void;
  type: "image" | "video";
}

const prewarmed = new Set<string>();

function prewarm(url: string) {
  if (prewarmed.has(url)) return;
  prewarmed.add(url);
  fetch(url, { method: "HEAD" }).catch(() => {});
}

export function TemplateMediaGrid({ items, activeId, onSelect, type }: TemplateMediaGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 7,
      }}
    >
      {items.map((item) => {
        const active = activeId === item.thumbnailUrl || activeId === item.id;
        const hovered = hoveredId === item.id && type === "video";

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            onMouseEnter={() => {
              setHoveredId(item.id);
              if (type === "image" && item.url) {
                const img = new Image();
                img.src = item.url;
              }
              if (type === "video" && item.videoUrl) {
                prewarm(item.videoUrl);
              }
            }}
            onMouseLeave={() => setHoveredId(null)}
            title={item.name}
            style={{
              position: "relative",
              aspectRatio: "9/16",
              borderRadius: 10,
              overflow: "hidden",
              border: `2px solid ${active ? "#3b46e0" : "transparent"}`,
              cursor: "pointer",
              padding: 0,
              background: "#1a1f3c",
              boxShadow: active ? "0 0 0 1px #3b46e0" : "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbnailUrl}
              alt={item.name}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                opacity: hovered ? 0 : 1,
                transition: "opacity 0.2s",
              }}
            />

            {type === "video" && item.videoUrl && (
              <video
                src={item.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: hovered ? 1 : 0,
                  transition: "opacity 0.2s",
                }}
              />
            )}

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "16px 6px 5px",
                background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                fontSize: 10,
                fontWeight: 500,
                color: "white",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {item.name}
            </div>

            {active && (
              <div
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#3b46e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
