"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { BulkActionBar } from "../../components/BulkActionBar";
import { Button, type ButtonVariant } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { FilterTabs } from "../../components/FilterTabs";
import { Icon } from "../../icons";
import { Pager } from "../../components/Pager";
import { SearchInput } from "../../components/SearchInput";
import { UsersTable } from "../../components/UsersTable";
import { downloadCsv, usersToCsv } from "../../csv";
import { formatNumber } from "../../format";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useUsers } from "../../hooks/useUsers";
import { adminService } from "../../services/adminService";
import type { AdminUser, Plan, SortDirection, UserFilter, UserSort } from "../../services/types";

const UserDetailDrawer = dynamic(
  () => import("../../components/drawer/UserDetailDrawer").then((m) => m.UserDetailDrawer),
  { ssr: false }
);

const PAGE_SIZE = 8;

const TABS: { value: UserFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pro", label: "Pro" },
  { value: "free", label: "Free" },
  { value: "business", label: "Business" },
  { value: "suspended", label: "Suspended" },
  { value: "unverified", label: "Unverified" },
];

/** Numeric and date columns read best largest-/newest-first on the first click. */
const DEFAULT_DIR: Record<UserSort, SortDirection> = {
  name: "asc",
  links: "desc",
  views: "desc",
  joined: "desc",
};

type BulkAction = "suspend" | "delete";

const BULK_CONFIRM: Record<
  BulkAction,
  {
    title: (count: number) => string;
    description: string;
    confirmLabel: string;
    variant: ButtonVariant;
  }
> = {
  suspend: {
    title: (count) => `Suspend ${count} ${count === 1 ? "user" : "users"}?`,
    description:
      "Their pages go offline immediately. This action is logged; you can reinstate them later.",
    confirmLabel: "Suspend",
    variant: "amber",
  },
  delete: {
    title: (count) => `Delete ${count} ${count === 1 ? "user" : "users"}?`,
    description:
      "This permanently removes the accounts and their pages. This action is logged and cannot be undone.",
    confirmLabel: "Delete",
    variant: "danger",
  },
};

export function UsersClient() {
  const [filter, setFilter] = useState<UserFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<UserSort>("joined");
  const [dir, setDir] = useState<SortDirection>("desc");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  // Selection keeps row snapshots (not just ids) so export works across pages.
  const [selected, setSelected] = useState<ReadonlyMap<string, AdminUser>>(new Map());
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
  const [bulkActing, setBulkActing] = useState(false);

  const search = useDebouncedValue(searchInput, 200);
  const { data, loading, error, reload } = useUsers({
    search,
    filter,
    page,
    pageSize: PAGE_SIZE,
    sort,
    dir,
  });

  const handleFilter = useCallback((value: UserFilter) => {
    setFilter(value);
    setPage(1);
    // Rows may leave the result set; never keep hidden rows selected for bulk actions.
    setSelected(new Map());
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
    setSelected(new Map());
  }, []);

  const handleSort = useCallback(
    (column: UserSort) => {
      setPage(1);
      if (column === sort) {
        setDir((current) => (current === "asc" ? "desc" : "asc"));
      } else {
        setSort(column);
        setDir(DEFAULT_DIR[column]);
      }
    },
    [sort]
  );

  const handleSelect = useCallback((id: string) => setSelectedUserId(id), []);
  const closeDrawer = useCallback(() => setSelectedUserId(null), []);

  const toggleRow = useCallback((user: AdminUser, isSelected: boolean) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (isSelected) next.set(user.id, user);
      else next.delete(user.id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((rows: AdminUser[], isSelected: boolean) => {
    setSelected((prev) => {
      const next = new Map(prev);
      for (const row of rows) {
        if (isSelected) next.set(row.id, row);
        else next.delete(row.id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelected(new Map()), []);
  const selectedIds = useMemo(() => new Set(selected.keys()), [selected]);

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  const exportSelected = useCallback(() => {
    downloadCsv("linkhub-users-selected.csv", usersToCsv([...selected.values()]));
    toast.success(`Exported ${selected.size} ${selected.size === 1 ? "user" : "users"}`);
  }, [selected]);

  const exportPage = () => {
    downloadCsv("linkhub-users-page.csv", usersToCsv(users));
    toast.success(`Exported ${users.length} ${users.length === 1 ? "user" : "users"}`);
  };

  /**
   * Runs a mutation per selected id, reporting partial failure (e.g. a staff
   * account in the selection is refused server-side without aborting the rest).
   */
  const runForSelection = useCallback(
    async (
      act: (id: string) => Promise<unknown>,
      labels: { done: string; failed: string }
    ) => {
      const ids = [...selected.keys()];
      const results = await Promise.allSettled(ids.map((id) => act(id)));
      const failures = results.filter(
        (result): result is PromiseRejectedResult => result.status === "rejected"
      );
      if (failures.length > 0) {
        const reason = failures[0].reason;
        const detail = reason instanceof Error ? ` — ${reason.message}` : "";
        toast.error(`${labels.failed} failed for ${failures.length} of ${ids.length}${detail}`);
      } else {
        toast.success(`${labels.done} ${ids.length} ${ids.length === 1 ? "user" : "users"}`);
      }
      setSelected(new Map());
      reload();
    },
    [selected, reload]
  );

  const changePlan = useCallback(
    (plan: Plan) =>
      runForSelection((id) => adminService.changeUserPlan(id, plan), {
        done: "Changed plan for",
        failed: "Plan change",
      }),
    [runForSelection]
  );

  async function runBulkAction() {
    if (!bulkAction) return;
    setBulkActing(true);
    try {
      await runForSelection(
        bulkAction === "suspend" ? adminService.suspendUser : adminService.deleteUser,
        bulkAction === "suspend"
          ? { done: "Suspended", failed: "Suspend" }
          : { done: "Deleted", failed: "Delete" }
      );
      setBulkAction(null);
    } finally {
      setBulkActing(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        crumb="Admin / Users"
        title="Users."
        subtitle="Search, inspect, and manage any user."
        action={
          <Button onClick={exportPage} disabled={users.length === 0}>
            <Icon name="export" className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchInput}
          onChange={handleSearch}
          placeholder="Search by name, email, or handle…"
          aria-label="Search users"
          className="min-w-[200px] max-w-[340px] flex-1"
        />
        <FilterTabs tabs={TABS} active={filter} onChange={handleFilter} aria-label="Filter users" />
      </div>

      {selected.size > 0 && (
        <BulkActionBar
          count={selected.size}
          onChangePlan={changePlan}
          onExport={exportSelected}
          onSuspend={() => setBulkAction("suspend")}
          onDelete={() => setBulkAction("delete")}
          onClear={clearSelection}
        />
      )}

      <div className="overflow-hidden rounded-[16px] border border-ink-100 bg-white">
        {error && (
          <p role="alert" className="border-b border-ink-100 bg-danger-50 px-[18px] py-2.5 text-[13px] text-rose-500">
            Couldn&apos;t load users — {error.message}
          </p>
        )}
        {error && !data ? null : loading && !data ? (
          <p className="px-[18px] py-10 text-center text-sm text-ink-400">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="px-[18px] py-10 text-center text-sm text-ink-500">
            {search || filter !== "all"
              ? "No users match your filters."
              : "No users yet. New signups will appear here."}
          </p>
        ) : (
          <div
            aria-busy={loading}
            className={cn(
              "transition-opacity motion-reduce:transition-none",
              loading && "pointer-events-none opacity-60"
            )}
          >
            <UsersTable
              users={users}
              onSelect={handleSelect}
              sort={sort}
              dir={dir}
              onSort={handleSort}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
            />
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 px-[18px] py-3 text-[12.5px] text-ink-400">
          <span aria-live="polite">
            Showing {start}–{end} of {formatNumber(total)}
          </span>
          <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
        </div>
      </div>

      {/* Keyed so opening a different user remounts with fresh tab and fetch state. */}
      {selectedUserId && (
        <UserDetailDrawer
          key={selectedUserId}
          userId={selectedUserId}
          onClose={closeDrawer}
          onMutated={reload}
        />
      )}

      {bulkAction && (
        <ConfirmDialog
          open
          title={BULK_CONFIRM[bulkAction].title(selected.size)}
          description={BULK_CONFIRM[bulkAction].description}
          confirmLabel={BULK_CONFIRM[bulkAction].confirmLabel}
          confirmVariant={BULK_CONFIRM[bulkAction].variant}
          loading={bulkActing}
          onConfirm={runBulkAction}
          onCancel={() => setBulkAction(null)}
        />
      )}
    </div>
  );
}
