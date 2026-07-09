/**
 * Mock implementation of {@link AdminService}. Filtering, search, and
 * pagination run here (as a real backend would) so components stay
 * presentational. Swap this module for server actions later — callers and the
 * interface stay unchanged.
 */

import { AUDIT_LOG_NOW, MOCK_AUDIT_LOG, MOCK_OVERVIEW, MOCK_REPORTS, MOCK_USERS } from "./mockData";
import type {
  AdminService,
  AdminUser,
  AdminUserDetail,
  AuditLogEntry,
  AuditLogEntryDetail,
  AuditLogPage,
  AuditLogQuery,
  OverviewMetrics,
  Report,
  ReportStatus,
  UserFilter,
  UserPage,
  UserQuery,
} from "./types";

const DEFAULT_PAGE_SIZE = 8;

/** Resolve on the next microtask so hooks exercise real loading states. */
function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function toListRow(user: AdminUserDetail): AdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    handle: user.handle,
    plan: user.plan,
    status: user.status,
    links: user.links,
    views30d: user.views30d,
    country: user.country,
    joinedAt: user.joinedAt,
    lastActiveAt: user.lastActiveAt,
  };
}

function matchesFilter(user: AdminUserDetail, filter: UserFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "pro":
      return user.plan === "pro";
    case "free":
      return user.plan === "free";
    case "suspended":
      return user.status === "suspended";
  }
}

function matchesSearch(user: AdminUserDetail, search: string): boolean {
  if (!search) return true;
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return (
    user.name.toLowerCase().includes(needle) ||
    user.email.toLowerCase().includes(needle) ||
    user.handle.toLowerCase().includes(needle)
  );
}

const AUDIT_DEFAULT_PAGE_SIZE = 10;

const RANGE_WINDOW_MS: Record<Exclude<AuditLogQuery["range"], undefined>, number | null> = {
  "24h": 24 * 3_600_000,
  "7d": 7 * 24 * 3_600_000,
  "30d": 30 * 24 * 3_600_000,
  all: null,
};

function matchesAuditSearch(entry: AuditLogEntryDetail, search: string): boolean {
  if (!search) return true;
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return (
    entry.actor.name.toLowerCase().includes(needle) ||
    entry.actionLabel.toLowerCase().includes(needle) ||
    entry.target.toLowerCase().includes(needle)
  );
}

function matchesAuditFilters(entry: AuditLogEntryDetail, query: AuditLogQuery): boolean {
  if (query.actorId && query.actorId !== "all" && entry.actor.id !== query.actorId) return false;
  if (query.actionType && query.actionType !== "all" && entry.actionType !== query.actionType) {
    return false;
  }
  const windowMs = query.range ? RANGE_WINDOW_MS[query.range] : null;
  if (windowMs !== null && windowMs !== undefined) {
    const age = AUDIT_LOG_NOW.getTime() - new Date(entry.createdAt).getTime();
    if (age > windowMs) return false;
  }
  return matchesAuditSearch(entry, query.search ?? "");
}

/** Newest-first entries matching `query`, before pagination. */
function filterAuditLog(query: AuditLogQuery): AuditLogEntryDetail[] {
  return MOCK_AUDIT_LOG.filter((entry) => matchesAuditFilters(entry, query)).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function toAuditListRow(entry: AuditLogEntryDetail): AuditLogEntry {
  const { id, actor, actionType, actionLabel, target, sensitive, ip, createdAt } = entry;
  return { id, actor, actionType, actionLabel, target, sensitive, ip, createdAt };
}

export const adminService: AdminService = {
  getOverviewMetrics(): Promise<OverviewMetrics> {
    return resolve(MOCK_OVERVIEW);
  },

  listUsers(query: UserQuery = {}): Promise<UserPage> {
    const filter = query.filter ?? "all";
    const search = query.search ?? "";
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

    const matched = MOCK_USERS.filter(
      (user) => matchesFilter(user, filter) && matchesSearch(user, search)
    );

    const total = matched.length;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, query.page ?? 1), lastPage);
    const start = (page - 1) * pageSize;
    const users = matched.slice(start, start + pageSize).map(toListRow);

    return resolve({ users, total, page, pageSize });
  },

  getUser(id: string): Promise<AdminUserDetail | null> {
    return resolve(MOCK_USERS.find((user) => user.id === id) ?? null);
  },

  listReports(status: ReportStatus = "open"): Promise<Report[]> {
    return resolve(MOCK_REPORTS.filter((report) => report.status === status));
  },

  // Mock mutations acknowledge without side effects; a real backend will use the
  // arguments. A no-arg implementation still satisfies the typed signature.
  suspendUser: () => resolve({ ok: true } as const),
  deleteUser: () => resolve({ ok: true } as const),
  impersonateUser: () => resolve({ ok: true } as const),
  changeUserPlan: () => resolve({ ok: true } as const),
  sendPasswordReset: () => resolve({ ok: true } as const),
  actOnReport: () => resolve({ ok: true } as const),

  listAuditLog(query: AuditLogQuery = {}): Promise<AuditLogPage> {
    const pageSize = query.pageSize ?? AUDIT_DEFAULT_PAGE_SIZE;
    const matched = filterAuditLog(query);

    const total = matched.length;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, query.page ?? 1), lastPage);
    const start = (page - 1) * pageSize;
    const entries = matched.slice(start, start + pageSize).map(toAuditListRow);

    return resolve({ entries, total, page, pageSize });
  },

  getAuditLogEntry(id: string): Promise<AuditLogEntryDetail | null> {
    return resolve(MOCK_AUDIT_LOG.find((entry) => entry.id === id) ?? null);
  },

  exportAuditLog(query: AuditLogQuery = {}): Promise<AuditLogEntry[]> {
    return resolve(filterAuditLog(query).map(toAuditListRow));
  },
};
