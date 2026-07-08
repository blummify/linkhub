import { memo } from "react";
import { cn } from "@/lib/cn";
import { Avatar } from "./Avatar";
import { PlanBadge, StatusBadge } from "./Badge";
import { formatDate, formatNumber } from "../format";
import type { AdminUser, SortDirection, UserSort } from "../services/types";

interface UserRowProps {
  user: AdminUser;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleRow: (user: AdminUser, selected: boolean) => void;
}

/**
 * Memoized so opening the drawer or toggling another row's checkbox doesn't
 * re-render the whole body. Handlers are stable, so a row only re-renders when
 * its user data or its own `selected` flag changes.
 */
const UserRow = memo(function UserRow({ user, selected, onSelect, onToggleRow }: UserRowProps) {
  const select = () => onSelect(user.id);

  return (
    <tr
      tabIndex={0}
      aria-selected={selected}
      onClick={select}
      onKeyDown={(event) => {
        // Only when the row itself is focused — the checkbox keeps Space for toggling.
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      }}
      className={cn(
        "cursor-pointer border-b border-ink-100 transition-colors last:border-b-0 hover:bg-paper focus:bg-paper focus:outline-none motion-reduce:transition-none",
        selected && "bg-indigo-500/5"
      )}
    >
      <td className="w-[42px] py-[13px] pl-[18px] pr-0" onClick={(event) => event.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onToggleRow(user, event.target.checked)}
          aria-label={`Select ${user.name}`}
          className="block h-4 w-4 accent-indigo-500"
        />
      </td>
      <td className="px-[18px] py-[13px]">
        <div className="flex items-center gap-[11px]">
          <Avatar name={user.name} tone="indigo" />
          <div>
            <div className="font-medium text-ink-900">{user.name}</div>
            <div className="text-xs text-ink-400">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-[18px] py-[13px] text-[13.5px] text-ink-500">{user.handle}</td>
      <td className="px-[18px] py-[13px]">
        <PlanBadge plan={user.plan} />
      </td>
      <td className="px-[18px] py-[13px]">
        <StatusBadge status={user.status} />
      </td>
      <td className="px-[18px] py-[13px] text-right text-[13.5px] tabular-nums text-ink-700">
        {formatNumber(user.links)}
      </td>
      <td className="px-[18px] py-[13px] text-right text-[13.5px] tabular-nums text-ink-700">
        {formatNumber(user.views30d)}
      </td>
      <td className="px-[18px] py-[13px] text-[13.5px] text-ink-700">{formatDate(user.joinedAt)}</td>
      <td className="px-[18px] py-[13px] text-[13.5px] text-ink-700">
        {user.lastActiveAt ? formatDate(user.lastActiveAt) : "—"}
      </td>
    </tr>
  );
});

interface HeaderDef {
  label: string;
  /** Present only on server-sortable columns. */
  sort?: UserSort;
  align?: "right";
}

const HEADERS: HeaderDef[] = [
  { label: "User", sort: "name" },
  { label: "Handle" },
  { label: "Plan" },
  { label: "Status" },
  { label: "Links", sort: "links", align: "right" },
  { label: "Views 30d", sort: "views", align: "right" },
  { label: "Joined", sort: "joined" },
  { label: "Last active" },
];

const HEADER_BASE =
  "border-b border-ink-100 bg-paper px-[18px] py-[13px] text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400";

function HeaderCell({
  header,
  sort,
  dir,
  onSort,
}: {
  header: HeaderDef;
  sort: UserSort;
  dir: SortDirection;
  onSort: (column: UserSort) => void;
}) {
  const align = header.align === "right" ? "text-right" : "text-left";
  if (!header.sort) {
    return (
      <th scope="col" className={cn(HEADER_BASE, align)}>
        {header.label}
      </th>
    );
  }

  const active = sort === header.sort;
  return (
    <th
      scope="col"
      className={cn(HEADER_BASE, align)}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}
    >
      <button
        type="button"
        onClick={() => onSort(header.sort!)}
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors hover:text-ink-700 motion-reduce:transition-none",
          active ? "text-ink-700" : "text-ink-400"
        )}
      >
        {header.label}
        {/* Space is reserved even when inactive so toggling doesn't shift the layout. */}
        <span aria-hidden="true" className={cn("text-[10px] leading-none", !active && "opacity-0")}>
          {active && dir === "desc" ? "↓" : "↑"}
        </span>
      </button>
    </th>
  );
}

export interface UsersTableProps {
  users: AdminUser[];
  onSelect: (id: string) => void;
  sort: UserSort;
  dir: SortDirection;
  onSort: (column: UserSort) => void;
  selectedIds: ReadonlySet<string>;
  onToggleRow: (user: AdminUser, selected: boolean) => void;
  onToggleAll: (users: AdminUser[], selected: boolean) => void;
}

export function UsersTable({
  users,
  onSelect,
  sort,
  dir,
  onSort,
  selectedIds,
  onToggleRow,
  onToggleAll,
}: UsersTableProps) {
  const allSelected = users.length > 0 && users.every((user) => selectedIds.has(user.id));
  const someSelected = users.some((user) => selectedIds.has(user.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse">
        <thead>
          <tr>
            <th scope="col" className={cn(HEADER_BASE, "w-[42px] pl-[18px] pr-0")}>
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={(event) => onToggleAll(users, event.target.checked)}
                aria-label="Select all rows on this page"
                className="block h-4 w-4 accent-indigo-500"
              />
            </th>
            {HEADERS.map((header) => (
              <HeaderCell key={header.label} header={header} sort={sort} dir={dir} onSort={onSort} />
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              selected={selectedIds.has(user.id)}
              onSelect={onSelect}
              onToggleRow={onToggleRow}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
