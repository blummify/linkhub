"use client";

import { DashboardPageHeader } from "../../components/DashboardPageHeader";
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
      <DashboardPageHeader
        title="Manage Links"
        description="Organize and optimize your digital presence."
        actions={
          <button
            type="button"
            onClick={onAddLink}
            className="flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2 rounded-full font-black shadow-lg shadow-secondary/20 hover:scale-105 transition-all text-[11px] active:scale-95 group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">add</span>
            Add New Link
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
          />
        ))}
      </div>
    </div>
  );
}
