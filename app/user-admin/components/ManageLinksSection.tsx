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

function EmptyLinksState({ onAddLink }: { onAddLink?: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-16 px-8 rounded-2xl"
        style={{
          border: "1.5px dashed #c5c9e8",
          background: "radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.07) 0%, transparent 70%), #f7f8fc",
          minHeight: 400,
        }}
      >
        {/* Illustration */}
        <div className="relative w-40 h-32 mb-8 mx-auto">
          {/* Card 1 — back */}
          <div
            className="absolute inset-0"
            style={{
              "--r": "-6deg",
              width: 120,
              height: 68,
              left: 10,
              top: 20,
              background: "white",
              borderRadius: 12,
              border: "1.5px solid #e2e4f0",
              boxShadow: "0 2px 8px rgba(59,70,224,0.06)",
              animation: "floatIn 0.55s cubic-bezier(.22,.68,0,1.2) 0.05s both",
            } as React.CSSProperties}
          />
          {/* Card 2 — mid */}
          <div
            className="absolute"
            style={{
              "--r": "3deg",
              width: 120,
              height: 68,
              left: 10,
              top: 10,
              background: "white",
              borderRadius: 12,
              border: "1.5px solid #e2e4f0",
              boxShadow: "0 2px 10px rgba(59,70,224,0.08)",
              animation: "floatIn 0.55s cubic-bezier(.22,.68,0,1.2) 0.15s both",
            } as React.CSSProperties}
          />
          {/* Card 3 — front */}
          <div
            className="absolute flex items-center gap-2 px-3"
            style={{
              "--r": "-1deg",
              width: 120,
              height: 68,
              left: 10,
              top: 0,
              background: "white",
              borderRadius: 12,
              border: "1.5px solid #e2e4f0",
              boxShadow: "0 4px 16px rgba(59,70,224,0.12)",
              animation: "floatIn 0.55s cubic-bezier(.22,.68,0,1.2) 0.25s both",
            } as React.CSSProperties}
          >
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#818cf8)", flexShrink: 0 }} />
            <div className="flex flex-col gap-1.5 flex-1">
              <div style={{ height: 7, borderRadius: 4, background: "#e8eaf5", width: "80%" }} />
              <div style={{ height: 5, borderRadius: 4, background: "#f0f1f9", width: "55%" }} />
            </div>
          </div>

          {/* Sparkle 1 — top right, amber */}
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className="absolute"
            style={{ top: -4, right: 4, animation: "twinkle 2.2s ease-in-out 0.3s infinite" }}
          >
            <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5Z" fill="#f59e0b"/>
          </svg>
          {/* Sparkle 2 — left, indigo */}
          <svg
            width="11" height="11" viewBox="0 0 16 16" fill="none"
            className="absolute"
            style={{ top: 14, left: -2, animation: "twinkle 2.2s ease-in-out 0.9s infinite" }}
          >
            <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5Z" fill="#6366f1"/>
          </svg>
          {/* Sparkle 3 — bottom right, soft indigo */}
          <svg
            width="9" height="9" viewBox="0 0 16 16" fill="none"
            className="absolute"
            style={{ bottom: 8, right: 0, animation: "twinkle 2.2s ease-in-out 1.5s infinite" }}
          >
            <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5Z" fill="#818cf8"/>
          </svg>
        </div>

        {/* Text */}
        <h2 style={{ fontSize: 22, fontWeight: 500, color: "#0b1020", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          Your page is empty{" "}
          <em style={{ fontStyle: "italic", color: "#6366f1" }}>for now</em>.
        </h2>
        <p className="mt-2 max-w-xs mx-auto" style={{ fontSize: 13.5, color: "#6b75a3", lineHeight: 1.6 }}>
          Add a link to start showing the world what you&apos;re working on. It takes about ten seconds.
        </p>

        {/* CTA */}
        {onAddLink ? (
          <button
            type="button"
            onClick={onAddLink}
            className="mt-6 inline-flex items-center gap-2 text-white cursor-pointer transition-all duration-150 active:scale-[0.98]"
            style={{
              borderRadius: 99,
              padding: "11px 20px 11px 16px",
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
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 18px -6px rgba(59,70,224,0.55), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
            </svg>
            Add your first link
          </button>
        ) : null}

        {/* Keyboard hint */}
        <p className="mt-4" style={{ fontSize: 12, color: "#9399b8" }}>
          Press{" "}
          <kbd style={{ display: "inline-block", padding: "1px 6px", background: "#eef0f9", borderRadius: 5, border: "1px solid #dde0ef", fontSize: 11, fontFamily: "monospace", color: "#4a5080" }}>
            N
          </kbd>{" "}
          to add a link, or use the button above
        </p>
      </div>
  );
}

function NoFilterResultsState({ tab, onClearFilter }: { tab: string; onClearFilter: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-12 px-8 rounded-xl"
      style={{ border: "1px solid #e8eaf5", background: "white", minHeight: 200 }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f0f1f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b75a3" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
        </svg>
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#0b1020" }}>No <span style={{ textTransform: "lowercase" }}>{tab}</span> links</p>
      <p className="mt-1" style={{ fontSize: 13, color: "#6b75a3" }}>Try a different filter or add a new link.</p>
      <button
        type="button"
        onClick={onClearFilter}
        className="mt-4 cursor-pointer transition-colors duration-150"
        style={{ fontSize: 13, color: "#3b46e0", fontWeight: 500, background: "none", border: "none", padding: 0 }}
      >
        Clear filter
      </button>
    </div>
  );
}

const LH_SHIMMER = [
  "linear-gradient(100deg,",
  "#edeeff 0%, #edeeff 35%,",
  "#c8ccff 44%, rgba(255,255,255,0.92) 50%, #c8ccff 56%,",
  "#edeeff 65%, #edeeff 100%",
  ")",
].join(" ");

const shimmerBase: React.CSSProperties = {
  background: LH_SHIMMER,
  backgroundSize: "300% 100%",
  animation: "lhShimmer 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
  borderRadius: 6,
};

function SkeletonLinkCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(99,102,241,0.1)",
        borderRadius: 16,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ ...shimmerBase, width: 40, height: 40, borderRadius: 10, flexShrink: 0, animationDelay: `${delay}ms` }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ ...shimmerBase, height: 13, width: "52%", animationDelay: `${delay + 60}ms` }} />
        <div style={{ ...shimmerBase, height: 11, width: "33%", animationDelay: `${delay + 120}ms` }} />
      </div>
      <div style={{ ...shimmerBase, width: 58, height: 22, borderRadius: 99, flexShrink: 0, animationDelay: `${delay + 30}ms` }} />
    </div>
  );
}

export interface ManageLinksSectionProps {
  links: ManagedLink[];
  isLoadingLinks?: boolean;
  onAddLink?: () => void;
  onEditLink?: (link: ManagedLink, index: number) => void;
  onDeleteLink?: (link: ManagedLink, index: number) => void;
  onRequestDelete?: (link: ManagedLink, index: number) => void;
  onToggleLink?: (link: ManagedLink, index: number) => void;
  onUpdateLink?: (link: ManagedLink, index: number, updates: Partial<ManagedLink>) => void;
  onReorderLinks?: (newLinks: ManagedLink[]) => void;
  onSearchOpen?: () => void;
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
  isLoadingLinks = false,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onRequestDelete,
  onToggleLink,
  onUpdateLink,
  onReorderLinks,
  onSearchOpen,
}: ManageLinksSectionProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const filteredLinks = links.filter((link) => {
    if (activeTab === "all") return true;
    const status = link.status ?? 0;
    if (activeTab === "published") return status === 1;
    if (activeTab === "unpublished") return status === 2;
    if (activeTab === "draft") return status === 0;
    return true;
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
    <div className="space-y-6">
      {/* Inline topbar — search, menu toggle, notifications */}
      <DashboardTopBar onSearchClick={onSearchOpen} />

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

      {/* Filter tab bar — hidden when there are no links */}
      {links.length === 0 ? null : <div className="flex items-center gap-2 flex-wrap">
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
      </div>}

      {/* Link list / empty states */}
      {isLoadingLinks && links.length === 0 ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => <SkeletonLinkCard key={i} delay={i * 70} />)}
        </div>
      ) : links.length === 0 ? (
        <EmptyLinksState onAddLink={onAddLink} />
      ) : filteredLinks.length === 0 ? (
        <NoFilterResultsState tab={activeTab} onClearFilter={() => setActiveTab("all")} />
      ) : (
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
                    onDelete={onRequestDelete ? () => onRequestDelete(link, originalIndex) : (onDeleteLink ? () => onDeleteLink(link, originalIndex) : undefined)}
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
      )}
    </div>
  );
}
