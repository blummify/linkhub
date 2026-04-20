"use client";

import { DashboardPageHeader } from "../../components/DashboardPageHeader";
import type { ManagedLink } from "./types";
import { ManagedLinkCard } from "./ManagedLinkCard";

export interface ManageLinksSectionProps {
  links: ManagedLink[];
  onAddLink?: () => void;
  onEditLink?: (link: ManagedLink, index: number) => void;
  onDeleteLink?: (link: ManagedLink, index: number) => void;
  onToggleLink?: (link: ManagedLink, index: number) => void;
  onUpdateLink?: (link: ManagedLink, index: number, updates: Partial<ManagedLink>) => void;
}

export function ManageLinksSection({
  links,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onToggleLink,
  onUpdateLink,
}: ManageLinksSectionProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardPageHeader
        title="Manage Links"
        description="Organize and optimize your digital presence."
        actions={
          <button
            type="button"
            onClick={onAddLink}
            className="group flex items-center gap-2.5 bg-primary text-on-primary px-6 py-3 rounded-2xl font-bold highlight-white/10 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 active:translate-y-0"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">add</span>
            <span className="text-[13px] tracking-tight">Add New Link</span>
          </button>
        }
      />

      <div className="space-y-4">
        {links.map((link, idx) => (
          <ManagedLinkCard
            key={`${link.url}-${idx}`}
            link={link}
            onEdit={onEditLink ? () => onEditLink(link, idx) : undefined}
            onDelete={onDeleteLink ? () => onDeleteLink(link, idx) : undefined}
            onToggle={onToggleLink ? () => onToggleLink(link, idx) : undefined}
            onUpdate={onUpdateLink ? (updates) => onUpdateLink(link, idx, updates) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
