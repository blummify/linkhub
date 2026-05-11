"use client";

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
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Your Links</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage and organize your digital presence.
          </p>
        </div>
        {onAddLink ? (
          <button
            type="button"
            onClick={onAddLink}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add New Link
          </button>
        ) : null}
      </div>

      <div className="space-y-4">
        {links.map((link, idx) => (
          <ManagedLinkCard
            key={link.id ?? `${link.url}-${idx}`}
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
