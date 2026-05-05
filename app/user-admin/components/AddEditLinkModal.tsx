"use client";

import { useState, useEffect } from "react";
import type { ManagedLink } from "./types";

interface AddEditLinkModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (link: ManagedLink) => void;
  initialLink?: ManagedLink;
}

import { SiInstagram, SiTiktok, SiYoutube, SiSpotify } from "react-icons/si";

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
  { id: "instagram", title: "Instagram", desc: "Display your posts and reels", icon: "camera", iconComponent: SiInstagram, color: "bg-[#E4405F]", urlPrefix: "https://instagram.com/" },
  { id: "tiktok", title: "TikTok", desc: "Share your TikToks on your Linktree", icon: "p2p", iconComponent: SiTiktok, color: "bg-[#000000]", urlPrefix: "https://tiktok.com/@" },
  { id: "youtube", title: "YouTube", desc: "Share YouTube videos on your Linktree", icon: "play_circle", iconComponent: SiYoutube, color: "bg-[#FF0000]", urlPrefix: "https://youtube.com/" },
  { id: "spotify", title: "Spotify", desc: "Share your latest or favorite music", icon: "graphic_eq", iconComponent: SiSpotify, color: "bg-[#1DB954]", urlPrefix: "https://open.spotify.com/" },
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

  // We intentionally mirror incoming edit data into local form state when modal context changes.
  /* eslint-disable react-hooks/set-state-in-effect */
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
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!open) return null;

  const handleSelectPlatform = (p: typeof PLATFORMS[0]) => {
    setTitle(p.title);
    setUrl(p.urlPrefix || "");
    setIcon(p.icon);
    setShowEditor(true);
  };

  const handleQuickAction = (id: string) => {
    if (id === "link") {
      setTitle("");
      setUrl("");
      setIcon("link");
    } else if (id === "collection") {
      setTitle("New Collection");
      setUrl("");
      setIcon("grid_view");
    } else {
      setTitle(`New ${id.charAt(0).toUpperCase() + id.slice(1)}`);
      setUrl("");
      setIcon("add_circle");
    }
    setShowEditor(true);
  };

  const handleSave = () => {
    onSave({
      title: title || "Untitled",
      url: url || "",
      icon,
      clicks: initialLink?.clicks || "0",
      draft: initialLink?.draft || false,
    });
    onClose();
  };

  // Helper to render current icon
  const renderIcon = (size = 32) => {
    const platform = PLATFORMS.find(p => p.icon === icon);
    if (platform?.iconComponent) {
      return <platform.iconComponent size={size} />;
    }
    return <span className="material-symbols-outlined" style={{ fontSize: size }}>{icon || 'link'}</span>;
  };

  // Filter platforms based on category (dynamic mockup)
  const filteredPlatforms = PLATFORMS.filter(p => {
    if (activeCategory === "all") return true;
    if (activeCategory === "social") return ["instagram", "tiktok", "youtube", "spotify"].includes(p.id);
    if (activeCategory === "media") return ["youtube", "spotify"].includes(p.id);
    return true; // Simplified for demo
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative bg-surface rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] shadow-2xl animate-fade-in-up border border-outline-variant/30 overflow-hidden flex flex-col">
        {/* Header content stays same but ensures close button stays */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-outline-variant/10">
          <h2 className="text-xl font-black text-on-surface tracking-tight">
            {showEditor ? (initialLink ? "Edit Link" : "Configure Link") : "Add"}
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {showEditor ? (
          /* Simplified Editor Layout */
          <div className="p-10 overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-10">
              <div className="flex-1 w-full space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant/50 ml-1">Title</label>
                  <input 
                    type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-5 py-4 text-[15px] font-bold text-on-surface focus:border-primary/20 transition-all outline-none"
                    placeholder="e.g. My Website"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant/50 ml-1">URL</label>
                  <input 
                    type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-5 py-4 text-[14px] font-medium text-on-surface-variant focus:border-primary/20 transition-all outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48 flex flex-col items-center gap-4 text-center">
                <div className="w-24 h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                  {renderIcon(40)}
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant/60">Icon Preview</p>
                  <p className="text-[10px] text-on-surface-variant/40 font-medium px-4">This logo will appear on your public profile</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-8 border-t border-outline-variant/10">
              {!initialLink && (
                <button 
                  onClick={() => setShowEditor(false)} 
                  className="px-6 py-4 text-[14px] font-black text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Back
                </button>
              )}
              <button 
                onClick={handleSave} 
                className="flex-1 bg-primary text-on-primary px-8 py-4 rounded-[1.5rem] text-[15px] font-black shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 translate-y-0"
              >
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
                  <button 
                    key={a.id} 
                    onClick={() => handleQuickAction(a.id)}
                    className="p-6 bg-surface-container-low hover:bg-surface-container-high rounded-[2rem] flex flex-col items-start gap-4 transition-all group w-full"
                  >
                    <div className={`p-3 rounded-2xl bg-surface-container-lowest shadow-sm group-hover:scale-110 transition-transform ${a.color}`}>
                      <span className="material-symbols-outlined text-[24px]">{a.icon}</span>
                    </div>
                    <span className="font-bold text-[14px] text-on-surface">{a.title}</span>
                  </button>
                ))}
              </div>

              {/* Suggested Platforms */}
              <div className="space-y-6">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-on-surface-variant/40 ml-1">
                  {CATEGORIES.find(c => c.id === activeCategory)?.label || "Suggested"}
                </h3>
                <div className="space-y-3">
                  {filteredPlatforms.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPlatform(p)}
                      className="w-full p-4 hover:bg-surface-container-low rounded-3xl flex items-center gap-4 transition-all group"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${p.color} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                        {p.iconComponent ? (
                          <p.iconComponent size={20} />
                        ) : (
                          <span className="material-symbols-outlined text-[24px]">{p.icon}</span>
                        )}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-black text-[15px] text-on-surface">{p.title}</p>
                        <p className="text-[12px] text-on-surface-variant font-medium truncate">{p.desc}</p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant/20 group-hover:text-primary transition-colors">chevron_right</span>
                    </button>
                  ))}
                  {filteredPlatforms.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-on-surface-variant text-[14px] font-medium">No results found in this category.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
