"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { FilterTabs } from "../../components/FilterTabs";
import { ReportCard } from "../../components/ReportCard";
import { useModeration } from "../../hooks/useModeration";
import { adminService } from "../../services/adminService";
import type { ReportAction, ReportStatus } from "../../services/types";

const TABS: { value: ReportStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "reviewing", label: "Reviewing" },
  { value: "resolved", label: "Resolved" },
];

const ACTION_TOAST: Record<Exclude<ReportAction, "takedown">, string> = {
  review: "Marked for review",
  warn: "Warning sent",
  dismiss: "Report dismissed",
};

export function ModerationClient() {
  const [status, setStatus] = useState<ReportStatus>("open");
  const [pendingTakedown, setPendingTakedown] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const { data: reports, loading } = useModeration(status);

  const handleAction = useCallback(async (reportId: string, action: ReportAction) => {
    if (action === "takedown") {
      setPendingTakedown(reportId);
      return;
    }
    await adminService.actOnReport(reportId, action);
    toast.success(ACTION_TOAST[action]);
  }, []);

  async function confirmTakedown() {
    if (!pendingTakedown) return;
    setActing(true);
    try {
      await adminService.actOnReport(pendingTakedown, "takedown");
      toast.success("Page taken down");
      setPendingTakedown(null);
    } finally {
      setActing(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        crumb="Admin / Moderation"
        title="Mod"
        accent="eration."
        subtitle="Reported pages and links awaiting review. Act fast on phishing and scams."
        action={
          <FilterTabs tabs={TABS} active={status} onChange={setStatus} aria-label="Filter reports" />
        }
      />

      {loading && !reports ? (
        <p className="py-10 text-center text-sm text-ink-400">Loading reports…</p>
      ) : !reports || reports.length === 0 ? (
        <div className="grid min-h-[260px] place-items-center text-center text-sm text-ink-500">
          No reports in this queue. Nothing needs your attention right now.
        </div>
      ) : (
        reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onAction={(action) => handleAction(report.id, action)}
          />
        ))
      )}

      <ConfirmDialog
        open={pendingTakedown !== null}
        title="Take down page?"
        description="The page goes offline immediately and the owner is notified."
        confirmLabel="Take down"
        confirmVariant="danger"
        loading={acting}
        onConfirm={confirmTakedown}
        onCancel={() => setPendingTakedown(null)}
      />
    </div>
  );
}
