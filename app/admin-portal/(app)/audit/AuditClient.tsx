"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AuditLogTable } from "../../components/AuditLogTable";
import { Button } from "../../components/Button";
import { Icon } from "../../icons";
import { Pager } from "../../components/Pager";
import { SearchInput } from "../../components/SearchInput";
import { Select } from "../../components/Select";
import { formatDateTime, formatNumber } from "../../format";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useAuditLog } from "../../hooks/useAuditLog";
import { adminService } from "../../services/adminService";
import { AUDIT_ACTORS } from "../../services/mockData";
import type { AuditActionType, AuditDateRange, AuditLogEntry } from "../../services/types";

const AuditEntryModal = dynamic(
  () => import("../../components/AuditEntryModal").then((m) => m.AuditEntryModal),
  { ssr: false }
);

const PAGE_SIZE = 10;

const ACTOR_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All actors" },
  ...AUDIT_ACTORS.map((actor) => ({ value: actor.id, label: actor.name })),
];

const ACTION_TYPE_OPTIONS: { value: AuditActionType | "all"; label: string }[] = [
  { value: "all", label: "All actions" },
  { value: "user_suspended", label: "Suspended account" },
  { value: "user_reinstated", label: "Reinstated account" },
  { value: "page_takedown", label: "Took down page" },
  { value: "impersonation", label: "Impersonated user" },
  { value: "password_reset", label: "Sent password reset" },
  { value: "plan_changed", label: "Edited plan" },
  { value: "payment_refunded", label: "Refunded payment" },
  { value: "report_dismissed", label: "Dismissed report" },
  { value: "settings_updated", label: "Updated settings" },
];

const RANGE_OPTIONS: { value: AuditDateRange; label: string }[] = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

function toCsv(rows: AuditLogEntry[]): string {
  const header = ["Time", "Actor", "Role", "Action", "Target", "IP", "Sensitive"];
  const lines = rows.map((row) =>
    [
      formatDateTime(row.createdAt),
      row.actor.name,
      row.actor.role,
      row.actionLabel,
      row.target,
      row.ip,
      row.sensitive ? "yes" : "no",
    ]
      .map((value) => `"${value.replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export function AuditClient() {
  const [searchInput, setSearchInput] = useState("");
  const [actorId, setActorId] = useState("all");
  const [actionType, setActionType] = useState<AuditActionType | "all">("all");
  const [range, setRange] = useState<AuditDateRange>("7d");
  const [page, setPage] = useState(1);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const search = useDebouncedValue(searchInput, 200);
  const query = useMemo(
    () => ({ search, actorId, actionType, range, page, pageSize: PAGE_SIZE }),
    [search, actorId, actionType, range, page]
  );
  const { data, loading } = useAuditLog(query);

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const handleActor = useCallback((value: string) => {
    setActorId(value);
    setPage(1);
  }, []);

  const handleActionType = useCallback((value: AuditActionType | "all") => {
    setActionType(value);
    setPage(1);
  }, []);

  const handleRange = useCallback((value: AuditDateRange) => {
    setRange(value);
    setPage(1);
  }, []);

  const handleSelect = useCallback((id: string) => setSelectedEntryId(id), []);
  const closeModal = useCallback(() => setSelectedEntryId(null), []);

  async function handleExport() {
    setExporting(true);
    try {
      const rows = await adminService.exportAuditLog({ search, actorId, actionType, range });
      const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "audit-log.csv";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      <AdminPageHeader
        crumb="Admin / Audit log"
        title="Audit "
        accent="log."
        subtitle="Every admin action — who, what, and when."
        action={
          <Button onClick={handleExport} disabled={exporting}>
            <Icon name="export" className="h-4 w-4" />
            {exporting ? "Exporting…" : "Export"}
          </Button>
        }
      />

      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchInput}
          onChange={handleSearch}
          placeholder="Search actor, action, or target…"
          aria-label="Search audit log"
          className="min-w-[200px] max-w-[340px] flex-1"
        />
        <Select value={actorId} onChange={handleActor} options={ACTOR_OPTIONS} aria-label="Filter by actor" />
        <Select
          value={actionType}
          onChange={handleActionType}
          options={ACTION_TYPE_OPTIONS}
          aria-label="Filter by action type"
        />
        <span className="flex-1" />
        <Select value={range} onChange={handleRange} options={RANGE_OPTIONS} aria-label="Filter by date range" />
      </div>

      <div className="overflow-hidden rounded-[16px] border border-ink-100 bg-white">
        {loading && !data ? (
          <p className="px-[18px] py-10 text-center text-sm text-ink-400">Loading audit log…</p>
        ) : entries.length === 0 ? (
          <p className="px-[18px] py-10 text-center text-sm text-ink-500">
            No entries match your filters.
          </p>
        ) : (
          <AuditLogTable entries={entries} onSelect={handleSelect} />
        )}
        <div className="flex items-center justify-between border-t border-ink-100 px-[18px] py-3 text-[12.5px] text-ink-400">
          <span>
            Showing {start}–{end} of {formatNumber(total)}
          </span>
          <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
        </div>
      </div>

      {selectedEntryId && <AuditEntryModal entryId={selectedEntryId} onClose={closeModal} />}
    </div>
  );
}
