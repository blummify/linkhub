"use client";

import { useState, useEffect } from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import type { ManagedLink } from "./types";
export interface ManagedLinkCardProps {
  link: ManagedLink;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
  onUpdate?: (updates: Partial<ManagedLink>) => void;
  dragHandleListeners?: DraggableSyntheticListeners;
  dragHandleAttributes?: DraggableAttributes;
  isOverlay?: boolean;
}

function IconGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
    </svg>
  );
}
function IconYoutube() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12z"/>
    </svg>
  );
}
function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
function IconSpotify() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}
function IconBehance() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.506 1.86-.337.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.49.35-1.05.6-1.697.76-.645.16-1.3.24-1.97.24H0V4.503h6.938zm-.485 5.38H3.351V6.636h2.72c.5 0 .912.1 1.23.305.32.2.48.53.48 1 0 .496-.165.828-.494 1.002-.33.174-.762.26-1.293.26l-.54-.004v.003zm-3.1 1.485v2.996H6.46c.448 0 .84-.065 1.182-.2.34-.13.625-.3.854-.51.23-.21.4-.46.513-.745.112-.285.17-.596.17-.936 0-.356-.052-.68-.162-.97a2.023 2.023 0 00-.474-.75 2.088 2.088 0 00-.764-.48c-.3-.114-.64-.172-1.02-.172H3.353zm12.32 4.5c.448 0 .838-.09 1.17-.27.335-.18.59-.436.764-.77h2.43c-.316 1.12-1.006 1.954-2.067 2.498-1.06.543-2.196.815-3.406.815-.95 0-1.82-.157-2.607-.47-.79-.312-1.47-.754-2.04-1.323-.57-.57-1.01-1.25-1.32-2.042-.308-.79-.463-1.663-.463-2.617 0-.925.16-1.79.48-2.593.32-.8.764-1.5 1.335-2.093.57-.593 1.25-1.058 2.04-1.394.79-.336 1.65-.504 2.578-.504.97 0 1.85.178 2.63.536.78.358 1.442.843 1.985 1.455.542.612.956 1.333 1.243 2.16.287.83.41 1.72.37 2.676h-8.09c.046 1.004.322 1.75.83 2.242.507.49 1.14.736 1.9.736zm1.934-5.004c-.072-.93-.34-1.65-.81-2.163-.47-.513-1.1-.77-1.886-.77-.825 0-1.474.267-1.95.8-.475.535-.73 1.243-.76 2.13h5.406zM14.8 3.75h5.407v1.25H14.8V3.75z"/>
    </svg>
  );
}

const ICON_MAP: Record<string, { Icon: () => React.ReactElement; bgColor: string; textColor: string }> = {
  website:   { Icon: IconGlobe,     bgColor: "#eff6ff", textColor: "#3b82f6" },
  instagram: { Icon: IconInstagram, bgColor: "#fdf2f8", textColor: "#ec4899" },
  youtube:   { Icon: IconYoutube,   bgColor: "#fef2f2", textColor: "#ef4444" },
  twitter:   { Icon: IconX,         bgColor: "#f3f4f6", textColor: "#374151" },
  spotify:   { Icon: IconSpotify,   bgColor: "#f0fdf4", textColor: "#16a34a" },
  behance:   { Icon: IconBehance,   bgColor: "#e9f3ff", textColor: "#1565d8" },
};

type IconKey = keyof typeof ICON_MAP;

function detectIconKey(url: string): IconKey | undefined {
  if (/instagram\.com/i.test(url)) return "instagram";
  if (/behance\.net/i.test(url)) return "behance";
  if (/youtube\.com/i.test(url)) return "youtube";
  if (/x\.com|twitter\.com/i.test(url)) return "twitter";
  if (/spotify\.com/i.test(url)) return "spotify";
  return undefined;
}

function RowBtn({
  children,
  title,
  danger,
  onClick,
}: {
  children: React.ReactNode;
  title?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="flex items-center justify-center cursor-pointer transition-all duration-150"
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: 0,
        background: hovered ? (danger ? "#fde8ec" : "#eef0f7") : "transparent",
        color: hovered ? (danger ? "#e11d48" : "#0b1020") : "#6b75a3",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

export function ManagedLinkCard({
  link,
  onEdit,
  onDelete,
  onToggle,
  onUpdate,
  dragHandleListeners,
  dragHandleAttributes,
  isOverlay = false,
}: ManagedLinkCardProps) {
  const { title, url, clicks, trendLabel, createdAt } = link;
  const visualStatus = link.status === 1 ? "published" 
                      : link.status === 0 ? "draft" 
                      : "unpublished";
  const [editingField, setEditingField] = useState<"title" | "url" | null>(null);
  const [tempTitle, setTempTitle] = useState(title);
  const [tempUrl, setTempUrl] = useState(url);
  const [isHovered, setIsHovered] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTempTitle(title);
    setTempUrl(url);
  }, [title, url]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleTitleSubmit = () => {
    if (tempTitle !== title && tempTitle.trim()) {
      onUpdate?.({ title: tempTitle });
    } else {
      setTempTitle(title);
    }
    setEditingField(null);
  };

  const handleUrlSubmit = () => {
    if (tempUrl !== url && tempUrl.trim()) {
      onUpdate?.({ url: tempUrl });
    } else {
      setTempUrl(url);
    }
    setEditingField(null);
  };

  const showStats = link.status !== 0 || Number(String(clicks).replace(/,/g, "")) > 0;
  const iconKey = (link.icon && link.icon in ICON_MAP)
    ? (link.icon as IconKey)
    : detectIconKey(link.url);
  const iconEntry = iconKey ? ICON_MAP[iconKey] : undefined;

  const accentColor = visualStatus === "published" ? "#3b46e0" : "#d6dae9";
  const cardBoxShadow = isOverlay
    ? "0 20px 40px -8px rgba(15,23,42,0.18)"
    : `inset 3px 0 0 ${accentColor}`;
  const hoverBoxShadow = `inset 3px 0 0 ${accentColor}, 0 4px 14px -4px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)`;

  return (
    <div
      className={`group relative flex transition-all duration-200 ${isOverlay ? "rotate-[0.5deg] scale-[1.01]" : ""}`}
      style={{
        background: "white",
        border: `1px solid ${isHovered ? "#d6dae9" : "#eef0f7"}`,
        borderRadius: 16,
        padding: "16px 16px 16px 14px",
        boxShadow: isOverlay ? "0 20px 40px -8px rgba(15,23,42,0.18)" : isHovered ? hoverBoxShadow : cardBoxShadow,
        transform: isHovered && !isOverlay ? "translateY(-1px)" : "translateY(0)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex min-w-0 flex-1 gap-3 sm:gap-[14px]">
        {/* Drag handle */}
        <div
          {...dragHandleListeners}
          {...dragHandleAttributes}
          className={`flex shrink-0 items-start justify-center pt-1 transition-colors ${
            isOverlay ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ color: isHovered ? "#6b75a3" : "#a8aecb" }}
          aria-label="Drag to reorder"
        >
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
            <circle cx="2" cy="2" r="1.2" fill="currentColor"/>
            <circle cx="8" cy="2" r="1.2" fill="currentColor"/>
            <circle cx="2" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="8" cy="7" r="1.2" fill="currentColor"/>
            <circle cx="2" cy="12" r="1.2" fill="currentColor"/>
            <circle cx="8" cy="12" r="1.2" fill="currentColor"/>
          </svg>
        </div>

        {/* Platform icon / thumbnail */}
        <div
          className="shrink-0 flex items-center justify-center mt-0.5"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            overflow: "hidden",
            background: link.thumbnailUrl
              ? "transparent"
              : iconEntry ? iconEntry.bgColor : "linear-gradient(135deg,#eef1ff,#dbe2ff)",
            color: iconEntry ? iconEntry.textColor : "#2a37c0",
          }}
        >
          {link.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={link.thumbnailUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : iconEntry ? (
            <iconEntry.Icon />
          ) : (
            <IconGlobe />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {/* Title + status tag */}
              <div className="flex items-center gap-2 min-w-0">
                {editingField === "title" ? (
                  <input
                    autoFocus
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                    className="min-w-0 flex-1 border-b bg-transparent outline-none font-semibold"
                    style={{ fontSize: 15, color: "#0b1020", borderBottomColor: "#6873ff" }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingField("title")}
                    className="min-w-0 shrink truncate text-left"
                    style={{ fontSize: 15, fontWeight: 600, color: "#0b1020", letterSpacing: "-0.01em" }}
                  >
                    {title}
                  </button>
                )}

                {visualStatus === "published" && (
                  <span
                    className="shrink-0 uppercase"
                    style={{
                      fontSize: 9.5,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      padding: "2.5px 7px",
                      borderRadius: 5,
                      background: "#e8f6ee",
                      color: "#16a34a",
                    }}
                  >
                    Published
                  </span>
                )}
                {visualStatus === "unpublished" && (
                  <span
                    className="shrink-0 uppercase"
                    style={{
                      fontSize: 9.5,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      padding: "2.5px 7px",
                      borderRadius: 5,
                      background: "#f1f3ff",
                      color: "#3a4474",
                    }}
                  >
                    Unpublished
                  </span>
                )}
              </div>

              {/* URL */}
              {editingField === "url" ? (
                <input
                  autoFocus
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  onBlur={handleUrlSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                  className="w-full bg-transparent outline-none border-b"
                  style={{ fontSize: 13, color: "#3b46e0", borderBottomColor: "#6873ff", fontFamily: "monospace" }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingField("url")}
                  className="block max-w-full truncate text-left hover:underline underline-offset-2"
                  style={{
                    fontSize: 13,
                    color: "#6b75a3",
                    fontFamily: "monospace",
                  }}
                >
                  {url.replace(/^https?:\/\//, "")}
                </button>
              )}
            </div>

            {/* Right actions */}
            <div className="flex shrink-0 items-center gap-1">
              {/* Toggle / Draft pill */}
              {onToggle ? (
                visualStatus === "draft" ? (
                  <button
                    type="button"
                    onClick={onToggle}
                    title="Click to publish"
                    className="cursor-pointer transition-all duration-150 mr-2 uppercase hover:opacity-80"
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      padding: "4px 10px",
                      borderRadius: 99,
                      background: "#eef0f7",
                      color: "#3a4474",
                      border: 0,
                    }}
                  >
                    Draft
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onToggle}
                    title={visualStatus === "published" ? "Unpublish" : "Publish"}
                    className="relative shrink-0 cursor-pointer outline-none transition-colors duration-200 mr-2"
                    style={{
                      width: 38,
                      height: 22,
                      borderRadius: 99,
                      background: visualStatus === "published" ? "#3b46e0" : "#d6dae9",
                      border: 0,
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
                        transform: visualStatus === "published" ? "translateX(16px)" : "translateX(0)",
                      }}
                    />
                  </button>
                )
              ) : null}

              <RowBtn
                title="Edit"
                onClick={() => (onEdit ? onEdit() : setEditingField("title"))}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4z"/>
                </svg>
              </RowBtn>

              <RowBtn
                title={`Delete ${title}`}
                danger
                onClick={() => onDelete?.()}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </RowBtn>
            </div>
          </div>

          {/* Stats row */}
          {showStats && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2" style={{ fontSize: 12, color: "#6b75a3" }}>
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {clicks} clicks
              </span>
              {trendLabel ? (
                <span className="flex items-center gap-1.5 font-medium" style={{ color: "#16a34a" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l5-5 4 4 6-7"/>
                  </svg>
                  {trendLabel}
                </span>
              ) : null}
              {createdAt ? (
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  {visualStatus === "draft" ? "Created" : "Added"} {createdAt}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
