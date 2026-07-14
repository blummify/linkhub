import type { AdminUser } from "./services/types";

/** CSV export for admin user rows (client-side, from already-loaded data). */

const COLUMNS: { header: string; value: (user: AdminUser) => string }[] = [
  { header: "Name", value: (user) => user.name },
  { header: "Email", value: (user) => user.email },
  { header: "Handle", value: (user) => user.handle },
  { header: "Plan", value: (user) => user.plan },
  { header: "Status", value: (user) => user.status },
  { header: "Links", value: (user) => String(user.links) },
  { header: "Views 30d", value: (user) => String(user.views30d) },
  { header: "Country", value: (user) => user.country },
  { header: "Joined", value: (user) => user.joinedAt },
  { header: "Last active", value: (user) => user.lastActiveAt ?? "" },
];

function escapeCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function usersToCsv(users: AdminUser[]): string {
  const rows = [
    COLUMNS.map((column) => column.header),
    ...users.map((user) => COLUMNS.map((column) => escapeCell(column.value(user)))),
  ];
  return rows.map((row) => row.join(",")).join("\r\n");
}

/** Triggers a browser download. Only call from event handlers (client-side). */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
