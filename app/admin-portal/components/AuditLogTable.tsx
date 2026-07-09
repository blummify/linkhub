import { memo } from "react";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { formatDateTime } from "../format";
import type { AuditLogEntry } from "../services/types";

interface AuditRowProps {
  entry: AuditLogEntry;
  onSelect: (id: string) => void;
}

/**
 * Memoized so opening the modal (which lives in the parent) doesn't re-render
 * the table body. `onSelect` is stable, so rows only re-render when their
 * entry data changes.
 */
const AuditRow = memo(function AuditRow({ entry, onSelect }: AuditRowProps) {
  const select = () => onSelect(entry.id);

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
      <td className="whitespace-nowrap px-[18px] py-[13px] font-[family-name:var(--font-geist-mono)] text-[13.5px] text-ink-400">
        {formatDateTime(entry.createdAt)}
      </td>
      <td className="px-[18px] py-[13px]">
        <div className="flex items-center gap-[11px]">
          <Avatar name={entry.actor.name} tone="indigo" />
          <span className="font-medium text-ink-900">{entry.actor.name}</span>
        </div>
      </td>
      <td className="px-[18px] py-[13px] text-[13.5px] text-ink-700">
        {entry.actionLabel}
        {entry.sensitive && (
          <Badge tone="rose" className="ml-2">
            Sensitive
          </Badge>
        )}
      </td>
      <td className="px-[18px] py-[13px] text-[13.5px] text-ink-500">{entry.target}</td>
      <td className="whitespace-nowrap px-[18px] py-[13px] font-[family-name:var(--font-geist-mono)] text-[13.5px] text-ink-400">
        {entry.ip}
      </td>
    </tr>
  );
});

const HEADERS = ["Time", "Actor", "Action", "Target", "IP"];

export interface AuditLogTableProps {
  entries: AuditLogEntry[];
  onSelect: (id: string) => void;
}

export function AuditLogTable({ entries, onSelect }: AuditLogTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {HEADERS.map((header) => (
            <th
              key={header}
              className="border-b border-ink-100 bg-paper px-[18px] py-[13px] text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <AuditRow key={entry.id} entry={entry} onSelect={onSelect} />
        ))}
      </tbody>
    </table>
  );
}
