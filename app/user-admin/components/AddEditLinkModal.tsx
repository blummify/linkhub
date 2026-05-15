"use client";

import { useState } from "react";
import type { ManagedLink } from "./types";
import { SiInstagram, SiYoutube, SiSpotify, SiX } from "react-icons/si";
import { TbWorld } from "react-icons/tb";

interface AddEditLinkModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (link: ManagedLink) => void;
  initialLink?: ManagedLink;
}

const PRESETS = [
  { id: "website",   title: "Website",   urlPrefix: "https://",                    Icon: TbWorld      },
  { id: "instagram", title: "Instagram", urlPrefix: "https://instagram.com/",      Icon: SiInstagram  },
  { id: "youtube",   title: "YouTube",   urlPrefix: "https://youtube.com/",         Icon: SiYoutube    },
  { id: "twitter",   title: "Twitter",   urlPrefix: "https://x.com/",              Icon: SiX          },
  { id: "spotify",   title: "Spotify",   urlPrefix: "https://open.spotify.com/",   Icon: SiSpotify    },
];

export function AddEditLinkModal({ open, onClose, onSave, initialLink }: AddEditLinkModalProps) {
  const [title, setTitle]               = useState(() => initialLink?.title ?? "");
  const [url, setUrl]                   = useState(() => initialLink?.url ?? "");
  const [icon, setIcon]                 = useState<string | undefined>(() => initialLink?.icon);
  const [draft, setDraft]               = useState(() => initialLink?.draft ?? false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  if (!open) return null;

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset.id);
    setTitle(preset.title);
    setUrl(preset.urlPrefix);
    setIcon(preset.id);
  };

  const handleSave = () => {
    onSave({
      title: title || "Untitled",
      url: url || "",
      icon,
      clicks: initialLink?.clicks || "0",
      draft,
    });
    onClose();
  };

  const isEdit = !!initialLink;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface rounded-[2rem] w-full max-w-lg shadow-2xl border border-outline-variant/20 animate-fade-in-up overflow-hidden">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
        </button>

        <div className="px-10 pt-10 pb-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[28px] text-indigo-500">
                {isEdit ? "edit" : "add"}
              </span>
            </div>
            <h2 className="text-2xl font-black text-on-surface">
              {isEdit ? "Edit link" : "Add a new link"}
            </h2>
            {!isEdit && (
              <p className="text-sm text-on-surface-variant mt-1.5">
                Pick a preset or enter your own. It&apos;ll appear instantly on your Linkhub page.
              </p>
            )}
          </div>

          {/* Platform presets */}
          {!isEdit && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-3 rounded-2xl border transition-all min-w-[72px] shrink-0 ${
                    selectedPreset === p.id
                      ? "border-indigo-400 bg-indigo-50 text-indigo-600"
                      : "border-outline-variant/40 hover:border-outline-variant hover:bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  <p.Icon size={20} />
                  <span className="text-[11px] font-semibold leading-none">{p.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Title field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant ml-1">Title</label>
            <div className={`flex items-center border rounded-2xl overflow-hidden transition-colors focus-within:border-indigo-400 ${
              title ? "border-outline-variant/60" : "border-outline-variant/30"
            }`}>
              <span className="self-stretch flex items-center px-4 text-sm font-black text-on-surface-variant border-r border-outline-variant/30 select-none bg-surface-container-lowest">
                T
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Website"
                className="flex-1 px-4 py-2.5 text-sm font-medium text-on-surface bg-surface outline-none placeholder:text-on-surface-variant/40"
              />
            </div>
          </div>

          {/* URL field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant ml-1">URL</label>
            <div className={`flex items-center border rounded-2xl overflow-hidden transition-colors focus-within:border-indigo-400 ${
              url ? "border-outline-variant/60" : "border-outline-variant/30"
            }`}>
              <span className="self-stretch flex items-center px-4 border-r border-outline-variant/30 bg-surface-container-lowest">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">link</span>
              </span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
                className="flex-1 px-4 py-2.5 text-sm font-medium text-on-surface bg-surface outline-none placeholder:text-on-surface-variant/40"
              />
            </div>
          </div>

          {/* Status toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant ml-1">Status</label>
            <div className="flex p-1 rounded-2xl bg-surface-container-low gap-1">
              <button
                type="button"
                onClick={() => setDraft(false)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  !draft
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                    : "text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                ACTIVE
              </button>
              <button
                type="button"
                onClick={() => setDraft(true)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  draft
                    ? "bg-white text-on-surface shadow-sm ring-1 ring-black/5"
                    : "text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                DRAFT
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!title.trim() || !url.trim()}
              className="flex-1 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isEdit ? (
                "Save changes"
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
