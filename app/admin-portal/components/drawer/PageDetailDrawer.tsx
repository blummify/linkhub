"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import FocusTrap from "focus-trap-react";
import Link from "next/link";
import { toast } from "sonner";
import { adminService } from "../../services/adminService";
import { formatDate, formatNumber } from "../../format";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { ConfirmDialog } from "../ConfirmDialog";
import { DrawerSection } from "./DrawerSection";
import { Icon } from "../../icons";
import { PageStatusBadge } from "../PageStatusBadge";
import { RowItem } from "../RowItem";
import { usePageDetail } from "../../hooks/usePageDetail";
import type { ButtonVariant } from "../Button";

type ActionKind = "suspend" | "takedown";

const CONFIRM_COPY: Record<
  ActionKind,
  { title: string; description: string; confirmLabel: string; variant: ButtonVariant }
> = {
  suspend: {
    title: "Suspend this page?",
    description: "The page is hidden until reinstated. This action is logged.",
    confirmLabel: "Suspend",
    variant: "amber",
  },
  takedown: {
    title: "Take down this page?",
    description: "The public page goes offline immediately. This action is logged.",
    confirmLabel: "Take down",
    variant: "danger",
  },
};

export function PageDetailDrawer({ pageId, onClose }: { pageId: string; onClose: () => void }) {
  const { data: page, loading } = usePageDetail(pageId);
  const [pending, setPending] = useState<ActionKind | null>(null);
  const [acting, setActing] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (pending) setPending(null);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, onClose]);

  async function runPendingAction() {
    if (!pending) return;
    setActing(true);
    try {
      if (pending === "suspend") {
        await adminService.suspendPage(pageId);
        toast.success("Page suspended");
      } else {
        await adminService.takeDownPage(pageId);
        toast.success("Page taken down");
      }
      setPending(null);
      onClose();
    } finally {
      setActing(false);
    }
  }

  function openLivePage() {
    if (!page) return;
    window.open(page.url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-ink-900/50" aria-hidden="true" onClick={onClose} />
      <FocusTrap>
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Page detail"
          className="fixed right-0 top-0 z-[91] flex h-screen w-[430px] max-w-[94vw] flex-col bg-white shadow-2xl"
        >
          <header className="border-b border-ink-100 p-[22px]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <Avatar name={page?.owner.name} size="lg" tone="indigo" />
                <div>
                  <div className="text-[17px] font-semibold text-ink-900">{page?.handle ?? "Loading..."}</div>
                  <div className="text-[13px] text-ink-400">{page?.owner.name}</div>
                  {page && <div className="mt-0.5 text-[12.5px] text-indigo-500">{page.owner.handle}</div>}
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-[34px] w-[34px] place-items-center rounded-full bg-ink-100 text-ink-500 hover:text-ink-700"
              >
                <Icon name="close" className="h-[15px] w-[15px]" />
              </button>
            </div>
            {page && (
              <div className="mt-3.5 flex gap-2">
                <PageStatusBadge status={page.status} />
                <span className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-semibold text-ink-500">
                  {page.theme}
                </span>
              </div>
            )}
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto p-[22px]">
            {loading && !page ? (
              <p className="text-sm text-ink-400">Loading page...</p>
            ) : !page ? (
              <p className="text-sm text-ink-500">This page could not be found.</p>
            ) : (
              <>
                <DrawerSection title="Page">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <Fact label="URL" value={stripProtocol(page.url)} mono />
                    <Fact label="Theme" value={page.theme} />
                      <Fact
                        label="Owner"
                        value={
                        <Link href="/users" className="text-indigo-500 hover:underline">
                          {page.owner.name}
                        </Link>
                      }
                    />
                    <Fact label="Created" value={formatDate(page.createdAt)} />
                  </dl>
                </DrawerSection>

                <DrawerSection title={`Published links (${page.publishedLinks.length})`}>
                  {page.publishedLinks.length === 0 ? (
                    <p className="text-sm text-ink-400">No published links on this page.</p>
                  ) : (
                    page.publishedLinks.map((link) => (
                      <RowItem
                        key={link.id}
                        title={link.title}
                        subtitle={stripProtocol(link.url)}
                        trailing={<span className="text-xs text-ink-400">{formatNumber(link.clicks)} clicks</span>}
                      />
                    ))
                  )}
                </DrawerSection>

                <DrawerSection title={`Report history (${page.reportHistory.length})`}>
                  {page.reportHistory.length === 0 ? (
                    <p className="text-sm text-ink-400">No reports on this page.</p>
                  ) : (
                    page.reportHistory.map((report) => (
                      <RowItem
                        key={report.id}
                        title={capitalize(report.reason)}
                        subtitle={`${report.reporter} - ${formatDate(report.reportedAt)}`}
                        trailing={<span className="text-xs text-ink-400">{report.status}</span>}
                      />
                    ))
                  )}
                </DrawerSection>
              </>
            )}
          </div>

          <footer className="flex flex-wrap gap-2 border-t border-ink-100 p-[18px]">
            <Button className="w-full" disabled={!page} onClick={openLivePage}>
              <Icon name="export" className="h-4 w-4" />
              View live
            </Button>
            <Button variant="amber" className="flex-1" disabled={!page} onClick={() => setPending("suspend")}>
              Suspend page
            </Button>
            <Button variant="danger" className="flex-1" disabled={!page} onClick={() => setPending("takedown")}>
              Take down
            </Button>
          </footer>
        </aside>
      </FocusTrap>

      {pending && (
        <ConfirmDialog
          open
          title={CONFIRM_COPY[pending].title}
          description={CONFIRM_COPY[pending].description}
          confirmLabel={CONFIRM_COPY[pending].confirmLabel}
          confirmVariant={CONFIRM_COPY[pending].variant}
          loading={acting}
          onConfirm={runPendingAction}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}

function Fact({ label, value, mono = false }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11.5px] text-ink-400">{label}</dt>
      <dd className={mono ? "mt-0.5 font-[family-name:var(--font-geist-mono)] text-[13px] font-medium text-ink-900" : "mt-0.5 text-sm font-medium text-ink-900"}>
        {value}
      </dd>
    </div>
  );
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
