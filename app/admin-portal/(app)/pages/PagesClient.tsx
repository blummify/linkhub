"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { Button } from "../../components/Button";
import { FilterTabs } from "../../components/FilterTabs";
import { Icon } from "../../icons";
import { Pager } from "../../components/Pager";
import { SearchInput } from "../../components/SearchInput";
import { PagesTable } from "../../components/PagesTable";
import { formatNumber } from "../../format";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePages } from "../../hooks/usePages";
import type { PageFilter, PageSort } from "../../services/types";

const PageDetailDrawer = dynamic(
  () => import("../../components/drawer/PageDetailDrawer").then((m) => m.PageDetailDrawer),
  { ssr: false }
);

const PAGE_SIZE = 8;

const TABS: { value: PageFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "flagged", label: "Flagged" },
  { value: "suspended", label: "Suspended" },
];

const SORTS: { value: PageSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "views_desc", label: "Most views" },
  { value: "views_asc", label: "Fewest views" },
  { value: "reports_desc", label: "Most reports" },
  { value: "links_desc", label: "Most links" },
];

export function PagesClient() {
  const [filter, setFilter] = useState<PageFilter>("all");
  const [sort, setSort] = useState<PageSort>("newest");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const search = useDebouncedValue(searchInput, 200);
  const { data, loading } = usePages({ search, filter, sort, page, pageSize: PAGE_SIZE });

  useEffect(() => {
    if (data && data.page !== page) {
      setPage(data.page);
    }
  }, [data, page]);

  const handleFilter = useCallback((value: PageFilter) => {
    setFilter(value);
    setPage(1);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const handleSort = useCallback((value: PageSort) => {
    setSort(value);
    setPage(1);
  }, []);

  const handleSelect = useCallback((id: string) => setSelectedPageId(id), []);
  const closeDrawer = useCallback(() => setSelectedPageId(null), []);

  const pages = data?.pages ?? [];
  const total = data?.total ?? 0;
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      <AdminPageHeader
        crumb="Admin / Pages"
        title="Pages."
        subtitle="Browse and manage every public profile page."
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
          placeholder="Search by handle or owner..."
          aria-label="Search pages"
          className="min-w-[220px] max-w-[340px] flex-1"
        />
        <FilterTabs tabs={TABS} active={filter} onChange={handleFilter} aria-label="Filter pages" />
        <div className="relative ml-auto min-w-[180px]">
          <select
            aria-label="Sort pages"
            value={sort}
            onChange={(event) => handleSort(parsePageSort(event.target.value))}
            className="w-full appearance-none rounded-[12px] border border-ink-100 bg-white px-3.5 py-2.5 pr-9 text-[13px] text-ink-700 outline-none transition-colors focus:border-indigo-400"
          >
            {SORTS.map((item) => (
              <option key={item.value} value={item.value}>
                Sort: {item.label}
              </option>
            ))}
          </select>
          <Icon
            name="chevronDown"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-ink-100 bg-white">
        {loading && !data ? (
          <p className="px-[18px] py-10 text-center text-sm text-ink-400">Loading pages...</p>
        ) : pages.length === 0 ? (
          <div className="grid min-h-[260px] place-items-center px-[18px] text-center text-sm text-ink-500">
            No pages match your filters.
          </div>
        ) : (
          <>
            {loading && data && (
              <div className="border-b border-ink-100 px-[18px] py-2 text-xs text-ink-400">
                Updating pages...
              </div>
            )}
            <div className="overflow-x-auto">
              <PagesTable pages={pages} onSelect={handleSelect} />
            </div>
          </>
        )}
        <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-[18px] py-3 text-[12.5px] text-ink-400">
          <span>
            Showing {start}-{end} of {formatNumber(total)}
          </span>
          <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
        </div>
      </div>

      {selectedPageId && <PageDetailDrawer pageId={selectedPageId} onClose={closeDrawer} />}
    </div>
  );
}

function parsePageSort(value: string): PageSort {
  if (
    value === "newest" ||
    value === "oldest" ||
    value === "views_desc" ||
    value === "views_asc" ||
    value === "reports_desc" ||
    value === "links_desc"
  ) {
    return value;
  }
  return "newest";
}
