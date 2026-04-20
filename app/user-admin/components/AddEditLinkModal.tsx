"use client";

import { useState, useEffect } from "react";
import type { ManagedLink } from "./types";

interface AddEditLinkModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (link: ManagedLink) => void;
  initialLink?: ManagedLink;
}

export function AddEditLinkModal({ open, onClose, onSave, initialLink }: AddEditLinkModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (initialLink) {
      setTitle(initialLink.title);
      setUrl(initialLink.url);
    } else {
      setTitle("");
      setUrl("");
    }
  }, [initialLink, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-surface rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-fade-in-up border border-outline-variant/30">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-on-surface tracking-tight">
            {initialLink ? "Edit Link" : "Add New Link"}
          </h2>
          <p className="text-[13px] text-on-surface-variant font-medium mt-1">
            Fill in the details for your custom link.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Link Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-4 text-[14px] text-on-surface placeholder:text-on-surface-variant focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all outline-none font-medium"
              placeholder="e.g. My Awesome Portfolio"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Destination URL</label>
            <input 
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-4 text-[14px] text-on-surface placeholder:text-on-surface-variant focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all outline-none font-medium"
              placeholder="https://yourlink.com"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-10">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({
                title,
                url,
                clicks: initialLink?.clicks || "0",
                draft: initialLink?.draft || false,
              });
              onClose();
            }}
            className="flex-1 bg-primary text-on-primary px-6 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
          >
            {initialLink ? "Update Link" : "Add Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
