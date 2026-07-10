/**
 * Mock implementation of {@link AdminService}. Filtering, search, and
 * pagination run here (as a real backend would) so components stay
 * presentational. Swap this module for server actions later — callers and the
 * interface stay unchanged.
 */

import { MOCK_OVERVIEW, MOCK_PLAN_SNAPSHOT, MOCK_REPORTS, MOCK_USERS } from "./mockData";
import type {
  AdminService,
  AdminUser,
  AdminUserDetail,
  PlanAdminSnapshot,
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

  getPlans(): Promise<PlanAdminSnapshot> {
    return resolve(structuredClone(MOCK_PLAN_SNAPSHOT));
  },

  // Mock mutations acknowledge without side effects; a real backend will use the
  // arguments. A no-arg implementation still satisfies the typed signature.
  suspendUser: () => resolve({ ok: true } as const),
  deleteUser: () => resolve({ ok: true } as const),
  impersonateUser: () => resolve({ ok: true } as const),
  changeUserPlan: () => resolve({ ok: true } as const),
  sendPasswordReset: () => resolve({ ok: true } as const),
  actOnReport: () => resolve({ ok: true } as const),
};
