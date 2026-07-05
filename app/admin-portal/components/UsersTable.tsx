import { memo } from "react";
import { Avatar } from "./Avatar";
import { PlanBadge, StatusBadge } from "./Badge";
import { formatDate, formatNumber } from "../format";
import type { AdminUser } from "../services/types";

interface UserRowProps {
  user: AdminUser;
  onSelect: (id: string) => void;
}

/**
 * Memoized so opening the drawer (which lives in the parent) doesn't re-render
 * the table body. `onSelect` is stable, so rows only re-render when their user
 * data changes.
 */
const UserRow = memo(function UserRow({ user, onSelect }: UserRowProps) {
  const select = () => onSelect(user.id);

  return (
    <tr
      tabIndex={0}
      onClick={select}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      }}
      className="cursor-pointer border-b border-ink-100 transition-colors last:border-b-0 hover:bg-paper focus:bg-paper focus:outline-none motion-reduce:transition-none"
    >
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

const HEADERS = ["User", "Handle", "Plan", "Status", "Links", "Views 30d", "Joined", "Last active"];

export interface UsersTableProps {
  users: AdminUser[];
  onSelect: (id: string) => void;
}

export function UsersTable({ users, onSelect }: UsersTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {HEADERS.map((header, index) => (
            <th
              key={header}
              className={cnHeader(index)}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <UserRow key={user.id} user={user} onSelect={onSelect} />
        ))}
      </tbody>
    </table>
  );
}

/** Numeric columns (Links, Views 30d) are right-aligned. */
function cnHeader(index: number): string {
  const base =
    "border-b border-ink-100 bg-paper px-[18px] py-[13px] text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400";
  return index === 4 || index === 5 ? `${base} text-right` : `${base} text-left`;
}
