"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useUIStore } from "@/store/uiStore";
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ManagedLink } from "./types";
import { ManagedLinkCard, type ManagedLinkCardProps } from "./ManagedLinkCard";
import { AnalyticsCards, DEFAULT_CARDS, type StatCardData } from "./AnalyticsCards";
import { DashboardTopBar } from "./DashboardTopBar";
import { sumClicks, formatClicks, buildClicksSeries } from "@/lib/clicks";

const DESKTOP_PAGE_SIZE = 8;
const MOBILE_PAGE_SIZE = 5;
const MOBILE_BREAKPOINT = 640;

function useResponsivePageSize(): number {
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window === "undefined") return DESKTOP_PAGE_SIZE;
    return window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`).matches
      ? DESKTOP_PAGE_SIZE
      : MOBILE_PAGE_SIZE;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => {
      setPageSize(e.matches ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return pageSize;
}

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
        <div className="relative w-40 h-32 mb-8 mx-auto">
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

          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className="absolute"
            style={{ top: -4, right: 4, animation: "twinkle 2.2s ease-in-out 0.3s infinite" }}
          >
            <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5Z" fill="#f59e0b"/>
          </svg>
          <svg
            width="11" height="11" viewBox="0 0 16 16" fill="none"
            className="absolute"
            style={{ top: 14, left: -2, animation: "twinkle 2.2s ease-in-out 0.9s infinite" }}
          >
            <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5Z" fill="#6366f1"/>
          </svg>
          <svg
            width="9" height="9" viewBox="0 0 16 16" fill="none"
            className="absolute"
            style={{ bottom: 8, right: 0, animation: "twinkle 2.2s ease-in-out 1.5s infinite" }}
          >
            <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5Z" fill="#818cf8"/>
          </svg>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 500, color: "#0b1020", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          Your page is empty{" "}
          <em style={{ fontStyle: "italic", color: "#6366f1" }}>for now</em>.
        </h2>
        <p className="mt-2 max-w-xs mx-auto" style={{ fontSize: 13.5, color: "#6b75a3", lineHeight: 1.6 }}>
          Add a link to start showing the world what you&apos;re working on. It takes about ten seconds.
        </p>

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
  deletingId?: string | null;
  onAddLink?: () => void;
  onEditLink?: (link: ManagedLink, index: number) => void;
  onDeleteLink?: (link: ManagedLink, index: number) => void;
  onRequestDelete?: (link: ManagedLink, index: number) => void;
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
  isLoadingLinks = false,
  deletingId = null,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onRequestDelete,
  onToggleLink,
  onUpdateLink,
  onReorderLinks,
}: ManageLinksSectionProps) {
  const openPalette = useUIStore((s) => s.openPalette);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const prevLinksLengthRef = useRef(links.length);

  // Responsive page size — desktop shows 8, mobile shows 5
const pageSize = useResponsivePageSize();

  // New link added will jump to page 1 so user sees it
  useEffect(() => {
    const prev = prevLinksLengthRef.current;
    prevLinksLengthRef.current = links.length;
    if (links.length === prev + 1) {
      setCurrentPage(1);
      setShowAll(false);
    }
  }, [links.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const totalClicks = useMemo(() => sumClicks(links), [links]);

  // Mirror the analytics page on the dashboard: the Total Clicks card shows the
  // real summed total (and links through to the full analytics page), while the
  // remaining metrics (profile views, CTR, region) have no data source yet and
  // render an honest "coming soon" state instead of mock numbers. The card's
  // sparkline is a decorative shape derived from the total — the real per-day
  // time series lives on the dedicated /user-analytics chart.
  const analyticsCards = useMemo<StatCardData[]>(() => {
    const [, ...rest] = DEFAULT_CARDS;
    return [
      {
        label: "TOTAL CLICKS",
        value: formatClicks(totalClicks),
        changeType: "green",
        sparkData: totalClicks > 0 ? buildClicksSeries(totalClicks, 10) : undefined,
        href: "/user-analytics",
      },
      ...rest.map((card) => ({ label: card.label, comingSoon: true })),
    ];
  }, [totalClicks]);

  const filteredLinks = useMemo(() => links.filter((link) => {
    if (activeTab === "all") return true;
    const status = link.status ?? 0;
    if (activeTab === "published") return status === 1;
    if (activeTab === "unpublished") return status === 2;
    if (activeTab === "draft") return status === 0;
    return true;
  }), [links, activeTab]);

  const linkIndexMap = useMemo(() => {
  const map = new Map<string, number>();
  links.forEach((l, i) => map.set(getLinkId(l), i));
  return map;
  }, [links]);

  const paginationState = useMemo ( () => {
    const totalPages = Math.max(1, Math.ceil(filteredLinks.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const visibleLinkSlides = showAll
    ? filteredLinks : filteredLinks.slice(startIdx, startIdx + pageSize);
    const showControls = !showAll && filteredLinks.length > pageSize;
    return { totalPages, safePage, startIdx, visibleLinkSlides, showControls };
  }, [filteredLinks, currentPage, pageSize, showAll]);

  const { totalPages, safePage, visibleLinkSlides, showControls } = paginationState;

  const activeLink = useMemo(() => {
  if (!activeId) return null;
  const idx = linkIndexMap.get(activeId);
  return idx !== undefined ? links[idx] : null;
  }, [activeId, linkIndexMap, links]);

  const goToPage = useCallback((nextPage: number) => {
    setCurrentPage(Math.max(1, Math.min(nextPage, totalPages)));
  }, [totalPages]);

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
      <DashboardTopBar onSearchClick={openPalette} />

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

      <AnalyticsCards cards={analyticsCards} />

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
              onClick={() => { setActiveTab(key); setCurrentPage(1); setShowAll(false); }}
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
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        >
          <SortableContext
            items={filteredLinks.map(getLinkId)}
            strategy={verticalListSortingStrategy}
          >
            <div
              className="space-y-3 lg:pb-0"
              style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom, 0px))" }}
            >
              {visibleLinkSlides.map((link) => {
                const originalIndex = linkIndexMap.get(getLinkId(link)) ?? -1
                return (
                  <SortableCardWrapper
                    key={getLinkId(link)}
                    link={link}
                    isDeleting={deletingId === getLinkId(link)}
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

          {showControls && (
              <div
                className="flex justify-center pt-2"
                style={{ marginTop: 8 }}
              >
                <div className="flex items-center gap-3">
                {/* Show all */}
                <button
                  type="button"
                  aria-label={`Show all ${filteredLinks.length} links`}
                  onClick={() => setShowAll(true)}
                  className="cursor-pointer transition-all duration-150"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#3a4474",
                    background: "none",
                    border: "none",
                    padding: "7px 12px",
                    borderRadius: 99,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#eef0f7";
                    (e.currentTarget as HTMLButtonElement).style.color = "#0b1020";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "none";
                    (e.currentTarget as HTMLButtonElement).style.color = "#3a4474";
                  }}
                >
                  Show all
                </button>
                
                {/* Pager */}
                <div
                  className="inline-flex items-center"
                  style={{
                    background: "white",
                    border: "1px solid #eef0f7",
                    borderRadius: 99,
                    padding: "4px 6px",
                    gap: 4,
                    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                  }}
                >
                  {/* Previous */}
                  <button
                    type="button"
                    aria-label="Show previous page"
                    disabled={safePage <= 1}
                    onClick={() => goToPage(safePage - 1)}
                    className="flex items-center justify-center transition-all duration-150"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 99,
                      border: 0,
                      background: "transparent",
                      color: safePage <= 1 ? "#c5c9e8" : "#3a4474",
                      cursor: safePage <= 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  
                  {/* Page indicator */}
                  <span style={{ fontSize: 13, color: "#0b1020", padding: "0 8px" }}>
                    <b style={{ fontWeight: 600 }}>{safePage}</b>
                    <span style={{ color: "#6b75a3", margin: "0 6px" }}>of</span>
                    <b style={{ fontWeight: 600 }}>{totalPages}</b>
                  </span>
                  
                  {/* Next */}
                  <button
                    type="button"
                    aria-label="Show next page"
                    disabled={safePage >= totalPages}
                    onClick={() => goToPage(safePage + 1)}
                    className="flex items-center justify-center transition-all duration-150"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 99,
                      border: 0,
                      background: "transparent",
                      color: safePage >= totalPages ? "#c5c9e8" : "#3a4474",
                      cursor: safePage >= totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

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
