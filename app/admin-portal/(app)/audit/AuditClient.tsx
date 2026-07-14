"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { Pager } from "../../components/Pager";
import { Icon } from "../../icons";
import { formatDateTime, formatNumber } from "../../format";
import { useAuditLog } from "../../hooks/useAuditLog";
import type { AuditEntry } from "../../services/types";

const PAGE_SIZE = 15;

/** Human labels for the namespaced action ids; unknown ids render as-is. */
const ACTION_LABELS: Record<string, string> = {
  "user.suspend": "Suspended user",
  "user.unsuspend": "Reinstated user",
  "user.delete": "Deleted user",
  "user.changePlan": "Changed plan",
  "user.sendReset": "Sent password reset",
};

function describeDetails(entry: AuditEntry): string {
  if (!entry.metadata) return "—";
  const parts = Object.entries(entry.metadata)
    .filter(([, value]) => value !== "")
    .map(([key, value]) => `${key}: ${value}`);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

const HEADERS = ["When", "Action", "Target", "Actor", "Details"];

const CELL = "px-[18px] py-[13px] text-[13.5px]";

export function AuditClient() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useAuditLog({ page, pageSize: PAGE_SIZE });

  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      <AdminPageHeader
        crumb="Admin / Audit"
        title="Audit."
        subtitle="Every admin action, who did it, and when."
      />

      <div className="overflow-hidden rounded-[16px] border border-ink-100 bg-white">
        {error && (
          <p role="alert" className="border-b border-ink-100 bg-danger-50 px-[18px] py-2.5 text-[13px] text-rose-500">
            Couldn&apos;t load the audit log — {error.message}
          </p>
        )}
        {error && !data ? null : loading && !data ? (
          <p className="px-[18px] py-10 text-center text-sm text-ink-400">Loading audit log…</p>
        ) : entries.length === 0 ? (
          <div className="grid min-h-[280px] place-items-center text-center text-ink-400">
            <div>
              <div className="mx-auto mb-3.5 grid h-[54px] w-[54px] place-items-center rounded-[12px] border border-ink-100 bg-white text-ink-300">
                <Icon name="audit" className="h-[26px] w-[26px]" />
              </div>
              <p className="text-sm text-ink-500">No audit entries yet.</p>
              <p className="mt-1 text-[13px]">Actions taken on users will appear here.</p>
            </div>
          </div>
        ) : (
          <div
            aria-busy={loading}
            className={cn(
              "overflow-x-auto transition-opacity motion-reduce:transition-none",
              loading && "pointer-events-none opacity-60"
            )}
          >
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  {HEADERS.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="border-b border-ink-100 bg-paper px-[18px] py-[13px] text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-ink-100 last:border-b-0">
                    <td className={cn(CELL, "whitespace-nowrap tabular-nums text-ink-700")}>
                      {formatDateTime(entry.at)}
                    </td>
                    <td className={cn(CELL, "font-medium text-ink-900")}>
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </td>
                    <td className={cn(CELL, "text-ink-700")}>
                      {entry.targetEmail ?? entry.targetUserId ?? "—"}
                    </td>
                    <td className={cn(CELL, "text-ink-500")}>{entry.actorEmail ?? "—"}</td>
                    <td className={cn(CELL, "text-ink-500")}>{describeDetails(entry)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 px-[18px] py-3 text-[12.5px] text-ink-400">
          <span aria-live="polite">
            Showing {start}–{end} of {formatNumber(total)}
          </span>
          <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
        </div>
      </div>
    </div>
  );
}
