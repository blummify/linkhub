"use client";

import { useState, useEffect } from "react";
import type { ManagedLink } from "./types";

interface AddEditLinkModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (link: ManagedLink) => void;
  initialLink?: ManagedLink;
}

const CATEGORIES = [
  { id: "suggested", label: "Suggested", icon: "lightbulb" },
  { id: "commerce", label: "Commerce", icon: "storefront" },
  { id: "social", label: "Social", icon: "favorite" },
  { id: "media", label: "Media", icon: "play_circle" },
  { id: "contact", label: "Contact", icon: "person_pin" },
  { id: "events", label: "Events", icon: "calendar_month" },
  { id: "text", label: "Text", icon: "notes" },
  { id: "all", label: "View all", icon: "more_horiz" },
];

const PLATFORMS = [
  { id: "instagram", title: "Instagram", desc: "Display your posts and reels", icon: "camera", color: "bg-pink-500", urlPrefix: "https://instagram.com/" },
  { id: "tiktok", title: "TikTok", desc: "Share your TikToks on your Linktree", icon: "p2p", color: "bg-black", urlPrefix: "https://tiktok.com/@" },
  { id: "youtube", title: "YouTube", desc: "Share YouTube videos on your Linktree", icon: "play_circle", color: "bg-red-600", urlPrefix: "https://youtube.com/" },
  { id: "spotify", title: "Spotify", desc: "Share your latest or favorite music", icon: "graphic_eq", color: "bg-green-500", urlPrefix: "https://open.spotify.com/" },
  { id: "files", title: "File downloads", desc: "Share PDFs, docs, and more", icon: "download", color: "bg-orange-500" },
];

const QUICK_ACTIONS = [
  { id: "collection", title: "Collection", icon: "grid_view", color: "text-purple-600" },
  { id: "link", title: "Link", icon: "link", color: "text-blue-600" },
  { id: "product", title: "Product", icon: "sell", color: "text-fuchsia-600" },
  { id: "form", title: "Form", icon: "chat_bubble", color: "text-violet-600" },
];

export function AddEditLinkModal({ open, onClose, onSave, initialLink }: AddEditLinkModalProps) {
  const [activeCategory, setActiveCategory] = useState("suggested");
  const [search, setSearch] = useState("");
  
  // These are for the actual "Edit" or "Final Step" of creation
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (initialLink) {
      setTitle(initialLink.title);
      setUrl(initialLink.url);
      setIcon(initialLink.icon);
      setShowEditor(true);
    } else {
      setTitle("");
      setUrl("");
      setIcon(undefined);
      setShowEditor(false);
    }
  }, [initialLink, open]);

  if (!open) return null;

  const handleSelectPlatform = (p: typeof PLATFORMS[0]) => {
    setTitle(p.title);
    setUrl(p.urlPrefix || "");
    setIcon(p.icon);
    setShowEditor(true);
  };

  const handleSave = () => {
    onSave({
      title,
      url,
      icon,
      clicks: initialLink?.clicks || "0",
      draft: initialLink?.draft || false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative bg-surface rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] shadow-2xl animate-fade-in-up border border-outline-variant/30 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-outline-variant/10">
          <h2 className="text-xl font-black text-on-surface tracking-tight">
            {showEditor ? (initialLink ? "Edit Link" : "Configure Link") : "Add"}
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {showEditor ? (
          /* Editor Layout */
          <div className="p-10 space-y-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Title</label>
                  <input 
                    type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-4 text-[14px] text-on-surface focus:border-primary/20 transition-all outline-none"
                    placeholder="e.g. My Website"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant ml-1">URL</label>
                  <input 
                    type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-4 text-[14px] text-on-surface focus:border-primary/20 transition-all outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Icon Preview</label>
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[40px]">{icon || 'link'}</span>
                </div>
                <p className="text-[12px] text-on-surface-variant font-medium leading-relaxed">
                  Customize how this link appears on your public profile.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-outline-variant/10">
              {!initialLink && (
                <button onClick={() => setShowEditor(false)} className="px-6 py-4 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container-low">Back</button>
              )}
              <button onClick={handleSave} className="flex-1 bg-primary text-on-primary px-6 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">
                {initialLink ? "Save Changes" : "Create Link"}
              </button>
            </div>
          </div>
        ) : (
          /* Explorer Layout */
          <div className="flex flex-1 min-h-0">
            {/* Sidebar */}
            <div className="w-64 border-r border-outline-variant/10 py-6 overflow-y-auto">
              <div className="px-4 space-y-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-bold transition-all ${
                      activeCategory === c.id ? "bg-surface-container-high text-primary" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* Search Bar */}
              <div className="relative mb-8">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40">search</span>
                <input
                  type="text"
                  placeholder="Paste or search a link"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-[1.5rem] pl-14 pr-6 py-4 text-[14px] font-medium transition-all focus:border-primary/20 outline-none"
                />
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {QUICK_ACTIONS.map((a) => (
                  <button key={a.id} className="p-6 bg-surface-container-low hover:bg-surface-container-high rounded-[2rem] flex flex-col items-start gap-4 transition-all group">
                    <div className={`p-3 rounded-2xl bg-surface-container-lowest shadow-sm group-hover:scale-110 transition-transform ${a.color}`}>
                      <span className="material-symbols-outlined text-[24px]">{a.icon}</span>
                    </div>
                    <span className="font-bold text-[14px] text-on-surface">{a.title}</span>
                  </button>
                ))}
              </div>

              {/* Suggested Platforms */}
              <div className="space-y-6">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-on-surface-variant/40 ml-1">Suggested</h3>
                <div className="space-y-3">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPlatform(p)}
                      className="w-full p-4 hover:bg-surface-container-low rounded-3xl flex items-center gap-4 transition-all group group-hover:scale-[1.01]"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${p.color} flex items-center justify-center text-white shadow-lg`}>
                        <span className="material-symbols-outlined text-[24px]">{p.icon}</span>
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-black text-[15px] text-on-surface">{p.title}</p>
                        <p className="text-[12px] text-on-surface-variant font-medium truncate">{p.desc}</p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant/20 group-hover:text-primary transition-colors">chevron_right</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
