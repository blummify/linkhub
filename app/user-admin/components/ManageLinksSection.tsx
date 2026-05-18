"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ManagedLink } from "./types";
import { ManagedLinkCard, type ManagedLinkCardProps } from "./ManagedLinkCard";
import { AnalyticsCards } from "./AnalyticsCards";

export interface ManageLinksSectionProps {
  links: ManagedLink[];
  onAddLink?: () => void;
  onEditLink?: (link: ManagedLink, index: number) => void;
  onDeleteLink?: (link: ManagedLink, index: number) => void;
  onToggleLink?: (link: ManagedLink, index: number) => void;
  onUpdateLink?: (link: ManagedLink, index: number, updates: Partial<ManagedLink>) => void;
  onReorderLinks?: (newLinks: ManagedLink[]) => void;
}

type TabKey = "all" | "published" | "unpublished" | "draft";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "unpublished", label: "Unpublished" },
  { key: "draft", label: "Draft" },
];

function getLinkId(link: ManagedLink): string {
  return link.id ?? link.url;
}

type CardPassthroughProps = Omit<ManagedLinkCardProps, "link" | "dragHandleListeners" | "dragHandleAttributes" | "isOverlay">;

function SortableCardWrapper({
  link,
  ...cardProps
}: { link: ManagedLink } & CardPassthroughProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: getLinkId(link) });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ManagedLinkCard
        link={link}
        dragHandleListeners={listeners}
        dragHandleAttributes={attributes}
        {...cardProps}
      />
    </div>
  );
}

export function ManageLinksSection({
  links,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onToggleLink,
  onUpdateLink,
  onReorderLinks,
}: ManageLinksSectionProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const filteredLinks = links.filter((link) => {
    if (activeTab === "all") return true;
    if (activeTab === "published") return !link.draft;
    return !!link.draft;
  });

  const activeLink = activeId
    ? filteredLinks.find((l) => getLinkId(l) === activeId) ?? null
    : null;

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id || !onReorderLinks) return;

    const oldIdx = filteredLinks.findIndex((l) => getLinkId(l) === active.id);
    const newIdx = filteredLinks.findIndex((l) => getLinkId(l) === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const newFilteredOrder = arrayMove(filteredLinks, oldIdx, newIdx);

    // Rebuild full links array, slotting the reordered filtered items back in
    const filteredIdSet = new Set(filteredLinks.map(getLinkId));
    const result = [...links];
    const slots = links
      .map((l, i) => (filteredIdSet.has(getLinkId(l)) ? i : -1))
      .filter((i) => i !== -1);

    newFilteredOrder.forEach((link, idx) => {
      result[slots[idx]] = link;
    });

    onReorderLinks(result);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">
            <em style={{ fontStyle: "italic", fontFamily: "Georgia, serif" }}>Your</em>{" "}
            <span className="text-primary">links.</span>
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage and organize your digital presence — one click at a time.
          </p>
        </div>
        {onAddLink ? (
          <button
            type="button"
            onClick={onAddLink}
            className="inline-flex shrink-0 items-center rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 cursor-pointer active:scale-[0.98]"
            style={{ backgroundColor: "#5B4FF5" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4A3EE0")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#5B4FF5")}
          >
            + Add new link
          </button>
        ) : null}
      </div>

      {/* Analytics cards */}
      <AnalyticsCards />

      {/* Filter tab bar */}
      <div className="flex items-center justify-between gap-4">
        <span className="shrink-0 text-sm text-on-surface-variant">
          {filteredLinks.length} link{filteredLinks.length !== 1 ? "s" : ""} · sorted by recent
        </span>
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                activeTab === key
                  ? "bg-[#1a1a2e] text-white"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sortable link list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredLinks.map(getLinkId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {filteredLinks.map((link, idx) => {
              const originalIndex = links.indexOf(link);
              return (
                <SortableCardWrapper
                  key={getLinkId(link) + idx}
                  link={link}
                  onEdit={onEditLink ? () => onEditLink(link, originalIndex) : undefined}
                  onDelete={onDeleteLink ? () => onDeleteLink(link, originalIndex) : undefined}
                  onToggle={onToggleLink ? () => onToggleLink(link, originalIndex) : undefined}
                  onUpdate={
                    onUpdateLink
                      ? (updates) => onUpdateLink(link, originalIndex, updates)
                      : undefined
                  }
                />
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeLink ? (
            <ManagedLinkCard link={activeLink} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
