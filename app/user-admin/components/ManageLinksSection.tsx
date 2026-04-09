"use client";

import type { ManagedLink } from "./types";
import { ManagedLinkCard } from "./ManagedLinkCard";

export interface ManageLinksSectionProps {
  links: ManagedLink[];
  onAddLink?: () => void;
  onEditLink?: (link: ManagedLink, index: number) => void;
  onDeleteLink?: (link: ManagedLink, index: number) => void;
}

export function ManageLinksSection({
  links,
  onAddLink,
  onEditLink,
  onDeleteLink,
}: ManageLinksSectionProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Manage Links</h1>
          <p className="text-[13px] text-on-surface-variant font-medium mt-1">Organize and optimize your digital presence.</p>
        </div>
        <button
          type="button"
          onClick={onAddLink}
          className="flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2 rounded-full font-bold shadow-lg shadow-secondary/20 hover:scale-105 transition-all text-[11px] active:scale-95 group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">add</span>
          Add New Link
        </button>
      </div>

      <div className="space-y-4">
        {links.map((link, idx) => (
          <ManagedLinkCard
            key={`${link.url}-${idx}`}
            link={link}
            onEdit={onEditLink ? () => onEditLink(link, idx) : undefined}
            onDelete={onDeleteLink ? () => onDeleteLink(link, idx) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
