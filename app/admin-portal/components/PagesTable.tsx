import { memo } from "react";
import { Avatar } from "./Avatar";
import { formatDate, formatNumber } from "../format";
import type { AdminPageListItem } from "../services/types";
import { PageStatusBadge } from "./PageStatusBadge";

interface PageRowProps {
  page: AdminPageListItem;
  onSelect: (id: string) => void;
}

const PageRow = memo(function PageRow({ page, onSelect }: PageRowProps) {
  const select = () => onSelect(page.id);

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
          <Avatar
            name={page.owner.name}
            tone={page.status === "suspended" ? "roseSoft" : page.status === "flagged" ? "amberSoft" : "indigo"}
          />
          <div>
            <div className="font-medium text-ink-900">{page.handle}</div>
            <div className="text-xs text-ink-400">{page.owner.name}</div>
          </div>
        </div>
      </td>
      <td className="px-[18px] py-[13px] text-[13.5px] text-ink-500">{stripProtocol(page.url)}</td>
      <td className="px-[18px] py-[13px]">
        <PageStatusBadge status={page.status} />
      </td>
      <td className="px-[18px] py-[13px] text-right text-[13.5px] tabular-nums text-ink-700">
        {formatNumber(page.links)}
      </td>
      <td className="px-[18px] py-[13px] text-right text-[13.5px] tabular-nums text-ink-700">
        {formatNumber(page.views30d)}
      </td>
      <td className="px-[18px] py-[13px] text-right text-[13.5px] tabular-nums text-ink-700">
        {formatNumber(page.reports)}
      </td>
      <td className="px-[18px] py-[13px] text-[13.5px] text-ink-700">{formatDate(page.createdAt)}</td>
    </tr>
  );
});

const HEADERS = ["Page", "URL", "Status", "Links", "Views 30d", "Reports", "Created"];

export interface PagesTableProps {
  pages: AdminPageListItem[];
  onSelect: (id: string) => void;
}

export function PagesTable({ pages, onSelect }: PagesTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {HEADERS.map((header, index) => (
            <th key={header} className={headerClass(index)}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {pages.map((page) => (
          <PageRow key={page.id} page={page} onSelect={onSelect} />
        ))}
      </tbody>
    </table>
  );
}

function headerClass(index: number): string {
  const base =
    "border-b border-ink-100 bg-paper px-[18px] py-[13px] text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-400";
  return index >= 3 && index <= 5 ? `${base} text-right` : `${base} text-left`;
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "");
}
