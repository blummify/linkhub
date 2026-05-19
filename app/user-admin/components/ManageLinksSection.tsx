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
import { DashboardTopBar } from "./DashboardTopBar";
import { DeleteConfirmDialog } from "../../components/DeleteConfirmDialog";
import { CommandPalette } from "../../components/CommandPalette";

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
  const [pendingDelete, setPendingDelete] = useState<{ link: ManagedLink; index: number } | null>(null);
  const [showPalette, setShowPalette] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const filteredLinks = links.filter((link) => {
    if (activeTab === "all") return true;
    const vs = link.status ?? (link.draft ? "unpublished" : "published");
    return vs === activeTab;
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
      {/* Inline topbar — search, menu toggle, notifications */}
      <DashboardTopBar onSearchClick={() => setShowPalette(true)} />

      <CommandPalette
        open={showPalette}
        onClose={() => setShowPalette(false)}
        links={links}
        onAddLink={onAddLink}
      />

      <DeleteConfirmDialog
        open={pendingDelete !== null}
        link={pendingDelete?.link}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) onDeleteLink?.(pendingDelete.link, pendingDelete.index);
          setPendingDelete(null);
        }}
      />

      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1
            className="leading-[1.05]"
            style={{ fontSize: 38, fontWeight: 400, letterSpacing: "-0.02em", color: "#0b1020", fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
          >
            <em style={{ fontStyle: "italic" }}>Your</em>{" "}
            <em style={{ fontStyle: "italic", color: "#3b46e0" }}>links.</em>
          </h1>
          <p className="mt-1.5" style={{ fontSize: 13.5, color: "#6b75a3" }}>
            Manage and organize your digital presence — one click at a time.
          </p>
        </div>
        {onAddLink ? (
          <button
            type="button"
            onClick={onAddLink}
            className="inline-flex shrink-0 items-center gap-2 text-white cursor-pointer transition-all duration-150 active:scale-[0.98]"
            style={{
              borderRadius: 99,
              padding: "11px 18px 11px 14px",
              fontSize: 13.5,
              fontWeight: 600,
              border: 0,
              background: "linear-gradient(180deg, #3b46e0, #2a37c0)",
              boxShadow: "0 6px 18px -6px rgba(59,70,224,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 22px -6px rgba(59,70,224,0.55), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 18px -6px rgba(59,70,224,0.55), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
            </svg>
            Add new link
          </button>
        ) : null}
      </div>

      {/* Analytics cards */}
      <AnalyticsCards />

      {/* Filter tab bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="mr-auto" style={{ fontSize: 12.5, color: "#6b75a3" }}>
          <b style={{ color: "#0b1020", fontWeight: 600 }}>{filteredLinks.length} link{filteredLinks.length !== 1 ? "s" : ""}</b>
          {" · sorted by recent"}
        </span>
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className="shrink-0 cursor-pointer transition-all duration-150"
              style={{
                borderRadius: 99,
                padding: "6px 12px",
                fontSize: 12.5,
                fontWeight: 500,
                border: "1px solid transparent",
                background: activeTab === key ? "#0b1020" : "transparent",
                color: activeTab === key ? "white" : "#3a4474",
              }}
              onMouseEnter={e => {
                if (activeTab !== key) (e.currentTarget as HTMLButtonElement).style.background = "#eef0f7";
              }}
              onMouseLeave={e => {
                if (activeTab !== key) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
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
                  onDelete={onDeleteLink ? () => setPendingDelete({ link, index: originalIndex }) : undefined}
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
