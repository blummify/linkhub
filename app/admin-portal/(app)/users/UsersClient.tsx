"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { Button } from "../../components/Button";
import { FilterTabs } from "../../components/FilterTabs";
import { Icon } from "../../icons";
import { Pager } from "../../components/Pager";
import { SearchInput } from "../../components/SearchInput";
import { UsersTable } from "../../components/UsersTable";
import { formatNumber } from "../../format";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useUsers } from "../../hooks/useUsers";
import type { UserFilter } from "../../services/types";

const UserDetailDrawer = dynamic(
  () => import("../../components/drawer/UserDetailDrawer").then((m) => m.UserDetailDrawer),
  { ssr: false }
);

const PAGE_SIZE = 8;

const TABS: { value: UserFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pro", label: "Pro" },
  { value: "free", label: "Free" },
  { value: "suspended", label: "Suspended" },
];

export function UsersClient() {
  const [filter, setFilter] = useState<UserFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const search = useDebouncedValue(searchInput, 200);
  const { data, loading } = useUsers({ search, filter, page, pageSize: PAGE_SIZE });

  const handleFilter = useCallback((value: UserFilter) => {
    setFilter(value);
    setPage(1);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const handleSelect = useCallback((id: string) => setSelectedUserId(id), []);
  const closeDrawer = useCallback(() => setSelectedUserId(null), []);

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      <AdminPageHeader
        crumb="Admin / Users"
        title="Users."
        subtitle="Search, inspect, and manage any user."
        action={
          <Button>
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

      <div className="overflow-hidden rounded-[16px] border border-ink-100 bg-white">
        {loading && !data ? (
          <p className="px-[18px] py-10 text-center text-sm text-ink-400">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="px-[18px] py-10 text-center text-sm text-ink-500">
            No users match your filters.
          </p>
        ) : (
          <UsersTable users={users} onSelect={handleSelect} />
        )}
        <div className="flex items-center justify-between border-t border-ink-100 px-[18px] py-3 text-[12.5px] text-ink-400">
          <span>
            Showing {start}–{end} of {formatNumber(total)}
          </span>
          <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
        </div>
      </div>

      {selectedUserId && <UserDetailDrawer userId={selectedUserId} onClose={closeDrawer} />}
    </div>
  );
}
